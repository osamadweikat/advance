const express = require('express');
const connection = require('../config/database');
const router = express.Router();

// Route to display the rent page
router.get('/rent', (req, res) => {
  const itemId = req.query.item_id;

  if (!itemId) {
    return res.status(400).send('Bad Request: item_id is required');
  }

  // Here you might want to fetch item details if necessary
  const itemQuery = 'SELECT * FROM Items WHERE item_id = ?';
  
  connection.query(itemQuery, [itemId], (err, results) => {
    if (err || results.length === 0) {
      console.error('Error retrieving item:', err.stack);
      return res.status(500).send('Internal Server Error');
    }

    const item = results[0]; // Assuming there is only one item

    // Render rent page
    res.send(`
      <h1>Rent an Item</h1>
      <h2>${item.title} - Price per Day: ${item.price_per_day}</h2>
      <form action="/checkout" method="POST">
        <label>Choose Delivery Method:</label><br>
        <input type="radio" name="delivery_method" value="Delivery" checked> Delivery<br>
        <input type="radio" name="delivery_method" value="In-Person Pickup"> In-Person Pickup<br><br>
        
        <label>Number of Days:</label><br>
        <input type="number" name="number_of_days" min="1" required><br><br>
        
        <input type="hidden" name="item_id" value="${item.item_id}">
        <input type="hidden" name="price_per_day" value="${item.price_per_day}">
        <button type="submit">Proceed to Checkout</button>
      </form>
    `);
  });
});

// Route to handle checkout
router.post('/checkout', (req, res) => {
  const { item_id, price_per_day, number_of_days, delivery_method } = req.body;

  const total_price = price_per_day * number_of_days;

  // You would handle payment processing here...

  res.send(`
    <h1>Checkout</h1>
    <p>Item ID: ${item_id}</p>
    <p>Delivery Method: ${delivery_method}</p>
    <p>Number of Days: ${number_of_days}</p>
    <p>Total Price: $${total_price.toFixed(2)}</p>
    <p>Enter your credit card information:</p>
    <form action="/complete-rent" method="POST">
      <input type="text" name="credit_card_info" placeholder="Credit Card Info" required>
      <button type="submit">Complete Rent</button>
    </form>
  `);
});

// Route to handle completing the rental
router.post('/complete-rent', (req, res) => {
  // Handle the completion of the rental here (store in database, etc.)
  res.send('Item rented successfully! Go back to items.');
});

module.exports = router;
