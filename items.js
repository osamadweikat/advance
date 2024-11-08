const express = require('express');
const connection = require('../config/database');
const router = express.Router();

// Route to display the item list
router.get('/items', (req, res) => {
  const query = `
    SELECT i.*, 
           (SELECT COUNT(*) FROM Rentals r WHERE r.item_id = i.item_id AND r.end_date > NOW()) AS active_rentals 
    FROM Items i
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error retrieving items:', err.stack);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const items = results.map(item => ({
      item_id: item.item_id,
      title: item.title,
      category: item.category,
      price_per_day: item.price_per_day,
      available: item.active_rentals === 0
    }));

    res.json({ items });
  });
});

// Route to handle renting an item and storing details in the session
router.post('/rent/:item_id', (req, res) => {
  const item_id = req.params.item_id;
  const { number_of_days, delivery_method } = req.body;

  if (!number_of_days || !delivery_method) {
    return res.status(400).json({ error: 'Bad Request: number_of_days and delivery_method are required.' });
  }

  // Check if the item is available
  const availabilityQuery = `
    SELECT COUNT(*) AS active_rentals 
    FROM Rentals 
    WHERE item_id = ? AND end_date > NOW()
  `;

  connection.query(availabilityQuery, [item_id], (err, results) => {
    if (err) {
      console.error('Error checking item availability:', err.stack);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const isAvailable = results[0].active_rentals === 0;
    if (!isAvailable) {
      return res.status(400).json({ error: 'Item is currently rented and not available.' });
    }

    // Retrieve item details if available
    const itemQuery = 'SELECT * FROM Items WHERE item_id = ?';
    connection.query(itemQuery, [item_id], (err, results) => {
      if (err) {
        console.error('Error retrieving item:', err.stack);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }

      const item = results[0];
      let total_price = item.price_per_day * number_of_days;
      if (delivery_method === "Delivery") {
        total_price += 10;
      }

      req.session.rentalInfo = {
        item_id,
        total_price,
        number_of_days,
        delivery_method
      };

      res.json({
        message: 'Rental information stored successfully. Proceed to checkout.'
      });
    });
  });
});

// Route to handle completing the rental
router.post('/complete-rent/:item_id', (req, res) => {
  const { credit_card_number, expiry_date, cvc } = req.body;
  const rentalInfo = req.session.rentalInfo;

  if (!rentalInfo || rentalInfo.item_id !== req.params.item_id) {
    return res.status(400).json({ error: 'Rental information not found or mismatched item. Please rent the item first.' });
  }

  const { total_price, number_of_days, delivery_method } = rentalInfo;
  const item_id = rentalInfo.item_id;
  const renterId = 1;

  const verifyCardQuery = `
    SELECT amount FROM cards 
    WHERE credit_card_num = ? AND credit_card_expiry = ? AND cvc = ?
  `;

  connection.query(verifyCardQuery, [credit_card_number, expiry_date, cvc], (err, cardResults) => {
    if (err) {
      console.error('Error verifying credit card:', err.stack);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (cardResults.length === 0) {
      return res.status(400).json({ error: 'Invalid credit card information.' });
    }

    const availableAmount = cardResults[0].amount;

    if (availableAmount < total_price) {
      return res.status(400).json({ error: 'Insufficient funds on the credit card.' });
    }

    if (delivery_method === "Delivery") {
      const findLowestDeliveryQuery = `
        SELECT delivery_id 
        FROM Delivery 
        ORDER BY num ASC, delivery_id ASC 
        LIMIT 1
      `;

      connection.query(findLowestDeliveryQuery, (err, deliveryResults) => {
        if (err) {
          console.error('Error retrieving delivery with lowest num:', err.stack);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (deliveryResults.length === 0) {
          return res.status(500).json({ error: 'No available delivery found' });
        }

        const deliveryId = deliveryResults[0].delivery_id;
        completeRental(req, res, connection, item_id, renterId, deliveryId, number_of_days, total_price, credit_card_number, availableAmount);
      });
    } else {
      completeRental(req, res, connection, item_id, renterId, null, number_of_days, total_price, credit_card_number, availableAmount);
    }
  });
});

// Helper function to complete rental
function completeRental(req, res, connection, item_id, renterId, deliveryId, number_of_days, total_price, credit_card_number, availableAmount) {
  const insertRentalQuery = `
    INSERT INTO Rentals (item_id, renter_id, delivery_id, start_date, end_date, total_price, rental_status) 
    VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? DAY), ?, 'Confirmed')
  `;

  connection.query(insertRentalQuery, [item_id, renterId, deliveryId, number_of_days, total_price], (err) => {
    if (err) {
      console.error('Error inserting rental:', err.stack);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (deliveryId) {
      const updateDeliveryNumQuery = `
        UPDATE Delivery 
        SET num = num + 1 
        WHERE delivery_id = ?
      `;

      connection.query(updateDeliveryNumQuery, [deliveryId], (err) => {
        if (err) {
          console.error('Error updating delivery num:', err.stack);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        finalizeRental(req, res, connection, credit_card_number, availableAmount, total_price);
      });
    } else {
      finalizeRental(req, res, connection, credit_card_number, availableAmount, total_price);
    }
  });
}

// Helper function to finalize rental
function finalizeRental(req, res, connection, credit_card_number, availableAmount, total_price) {
  const newAmount = availableAmount - total_price;
  const updateCardAmountQuery = `
    UPDATE cards 
    SET amount = ? 
    WHERE credit_card_num = ?
  `;

  connection.query(updateCardAmountQuery, [newAmount, credit_card_number], (err) => {
    if (err) {
      console.error('Error updating card amount:', err.stack);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    req.session.rentalInfo = null;

    res.json({ message: 'Item rented successfully!' });
  });
}

module.exports = router;
