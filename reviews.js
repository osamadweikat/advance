const express = require('express');
const connection = require('../config/database');
const router = express.Router();

// Variable to store renter_id in memory (for demonstration; consider a more persistent solution for production)
let currentRenterId = null;

// Route to display all rented items for a specific renter
router.get('/rate-items', (req, res) => {
  const renterId = req.query.renter_id;

  // Save the renter_id for future use
  if (renterId) {
    currentRenterId = renterId;
  }

  if (!currentRenterId) {
    return res.status(400).json({ error: 'Bad Request: renter_id is required' });
  }

  const query = `
    SELECT r.rental_id, i.item_id, i.title, i.category, i.price_per_day, i.is_available, 
           r.delivery_id, r.start_date, r.end_date, r.total_price
    FROM Items i
    JOIN Rentals r ON i.item_id = r.item_id
    WHERE r.renter_id = ?
  `;

  connection.query(query, [currentRenterId], (err, results) => {
    if (err) {
      console.error('Error retrieving rented items:', err.stack);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    res.json({
      message: 'Rented items retrieved successfully',
      items: results.map(item => ({
        rental_id: item.rental_id,
        item_id: item.item_id,
        title: item.title,
        category: item.category,
        price_per_day: item.price_per_day,
        is_available: item.is_available,
        start_date: item.start_date,
        end_date: item.end_date,
        total_price: item.total_price
      }))
    });
  });
});

// Route to handle review submission
router.post('/submit-review', (req, res) => {
  const { rental_id, rating_owner, rating_delivery, review_text } = req.body;

  if (!rental_id || currentRenterId === null || rating_owner == null || rating_delivery == null) {
    return res.status(400).json({ error: 'Bad Request: rental_id, renter_id, rating_owner, and rating_delivery are required' });
  }

  const existingReviewQuery = 'SELECT * FROM Reviews WHERE rental_id = ?';
  connection.query(existingReviewQuery, [rental_id], (err, results) => {
    if (err) {
      console.error('Error checking existing review:', err.stack);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length > 0) {
      // Update existing review
      const updateQuery = `
        UPDATE Reviews 
        SET rating_owner = ?, rating_delivery = ?, review_text = ?
        WHERE rental_id = ? AND reviewer_id = ?
      `;
      connection.query(updateQuery, [rating_owner, rating_delivery, review_text, rental_id, currentRenterId], (err) => {
        if (err) {
          console.error('Error updating review:', err.stack);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json({ message: 'Review updated successfully!' });
      });
    } else {
      // Insert new review
      const insertQuery = `
        INSERT INTO Reviews (rental_id, reviewer_id, rating_owner, rating_delivery, review_text)
        VALUES (?, ?, ?, ?, ?)
      `;
      connection.query(insertQuery, [rental_id, currentRenterId, rating_owner, rating_delivery, review_text], (err) => {
        if (err) {
          console.error('Error inserting review:', err.stack);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json({ message: 'Review submitted successfully!' });
      });
    }
  });
});

module.exports = router;
