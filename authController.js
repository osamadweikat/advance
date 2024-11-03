const bcrypt = require('bcrypt');
const pool = require('../config/db');

// Function to hash passwords
async function hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds); // Hashing the password with salt rounds
}

// User Registration Function
async function register(req, res) {
    const { username, email, password_hash, user_type } = req.body;

    try {
        // Check if user already exists
        const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ status: 'error', message: 'User already exists' });
        }

        // Ensure password is provided
        if (!password_hash) {
            return res.status(400).json({ status: 'error', message: 'Password is required' });
        }

        // Hash the password using the hashPassword function
        const hashedPassword = await hashPassword(password_hash);

        // Insert user into the database
        const result = await pool.query('INSERT INTO users (username, email, password_hash, user_type) VALUES (?, ?, ?, ?)', 
            [username, email, hashedPassword, user_type]);

        // Respond with success
        res.status(201).json({ status: 'success', message: 'User registered successfully', userId: result.insertId });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ status: 'error', message: 'Error registering user', error: error.message });
    }
}

// User Login Function
async function login(req, res) {
    const { email, password_hash } = req.body;

    try {
        // Fetch user from the database
        console.log('Attempting to log in user with email:', email);
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        // Log user data for debugging
        console.log('User retrieved from database:', user);

        // Check if user exists
        if (!user) {
            return res.status(401).json({ status: 'error', statusCode: 401, message: 'Invalid email or password' });
        }

        // Ensure password is provided
        if (!password_hash) {
            console.error('Password is undefined');
            return res.status(400).json({ status: 'error', statusCode: 400, message: 'Password is required' });
        }

        // Compare passwords
        const match = await bcrypt.compare(password_hash, user.password_hash);
        if (!match) {
            return res.status(401).json({ status: 'error', statusCode: 401, message: 'Invalid email or password' });
        }

        // Token generation logic can be implemented here

        res.status(200).json({ status: 'success', message: 'Login successful', userId: user.id });
    } catch (error) {
        console.error('Login error:', error); // Log the full error stack
        res.status(500).json({ status: 'error', statusCode: 500, message: 'Error logging in', error: error.message });
    }
}



module.exports = {
    register,
    login,
    
};
