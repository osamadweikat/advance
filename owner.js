// Import required packages
const express = require('express');
const mysql = require('mysql2');

// Create an Express application
const app = express();
const PORT = 4000; // Change this if needed

// Middleware to parse JSON bodies
app.use(express.json());  // Parsing JSON bodies

// Create a MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'O0568204007k', // Use your MySQL password
  database: 'database_advance', // Your database name
  port: 3306
});

// Connect to the MySQL database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database: ', err.stack);
    return;
  }
  console.log('Connected to the database.');
});

// Main menu route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Menu',
    routes: [
      { method: 'GET', path: '/owner-items/:owner_id', description: 'View My Items' },
      { method: 'POST', path: '/add-item', description: 'Add Item' },
      { method: 'POST', path: '/update-item', description: 'Update Item' },
      { method: 'GET', path: '/wallet', description: 'Wallet' },
      { method: 'GET', path: '/logout', description: 'Log Out' }
    ]
  });
});

// Route to display items for a specific owner
app.get('/owner-items/:owner_id', (req, res) => {
  const ownerId = req.params.owner_id; // Retrieve owner_id from URL parameter
  const query = 'SELECT * FROM Items WHERE owner_id = ?';
  
  connection.query(query, [ownerId], (err, results) => {
    if (err) {
      console.error('Error retrieving items: ', err.stack);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    res.json({
      message: `Items for Owner ID: ${ownerId}`,
      items: results
    });
  });
});

// Route to handle item addition
app.post('/add-item', (req, res) => {
  const { owner_id, title, category, price_per_day } = req.body;

  const query = 'INSERT INTO Items (title, category, price_per_day, owner_id, is_available) VALUES (?, ?, ?, ?, 1)';
  connection.query(query, [title, category, price_per_day, owner_id], (err, result) => {
    if (err) {
      console.error('Error adding item: ', err.stack);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    res.json({
      message: 'Item added successfully!',
      itemId: result.insertId
    });
  });
});

// Route to handle item update with ownership check
app.post('/update-item', (req, res) => {
  const { owner_id, item_id, title, category, price_per_day } = req.body;

  const checkQuery = 'SELECT * FROM Items WHERE item_id = ? AND owner_id = ?';
  connection.query(checkQuery, [item_id, owner_id], (err, results) => {
    if (err) {
      console.error('Error checking item ownership: ', err.stack);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (results.length === 0) {
      res.status(403).json({ error: 'You cannot update this item because you do not own it.' });
    } else {
      const updates = [];
      const params = [];

      if (title) {
        updates.push("title = ?");
        params.push(title);
      }
      if (category) {
        updates.push("category = ?");
        params.push(category);
      }
      if (price_per_day) {
        updates.push("price_per_day = ?");
        params.push(price_per_day);
      }

      if (updates.length === 0) {
        res.status(400).json({ error: 'No fields to update.' });
        return;
      }

      params.push(item_id);

      const updateQuery = `UPDATE Items SET ${updates.join(", ")} WHERE item_id = ?`;
      connection.query(updateQuery, params, (err, result) => {
        if (err) {
          console.error('Error updating item: ', err.stack);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }

        res.json({ message: 'Item updated successfully!' });
      });
    }
  });
});

// Route to handle item deletion
app.delete('/delete-item', (req, res) => {
  const { owner_id, item_id } = req.body;

  console.log("Delete request received for item_id:", item_id, "and owner_id:", owner_id);

  const checkQuery = 'SELECT * FROM Items WHERE item_id = ? AND owner_id = ?';
  connection.query(checkQuery, [item_id, owner_id], (err, results) => {
    if (err) {
      console.error('Error checking item ownership: ', err.stack);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (results.length === 0) {
      console.log("Item not found or does not belong to owner");
      res.status(403).json({ error: 'You cannot delete this item because you do not own it.' });
    } else {
      const deleteQuery = 'DELETE FROM Items WHERE item_id = ?';
      connection.query(deleteQuery, [item_id], (err, result) => {
        if (err) {
          console.error('Error deleting item: ', err.stack);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }

        console.log("Item deleted successfully");
        res.json({ message: 'Item deleted successfully!' });
      });
    }
  });
});

// Wallet route
app.get('/wallet', (req, res) => {
  res.json({ message: 'Wallet feature coming soon!' });
});

// Log out route
app.get('/logout', (req, res) => {
  res.json({ message: 'You have logged out successfully.' });
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
