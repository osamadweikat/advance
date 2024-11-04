const bcrypt = require('bcrypt');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

async function hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds); 
}


async function register(req, res) {
    const { username, email, password_hash, user_type } = req.body;

    try {
        
        const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ status: 'error', message: 'User already exists' });
        }

        
        if (!password_hash) {
            return res.status(400).json({ status: 'error', message: 'Password is required' });
        }

        
        const hashedPassword = await hashPassword(password_hash);

        
        const result = await pool.query('INSERT INTO users (username, email, password_hash, user_type) VALUES (?, ?, ?, ?)', 
            [username, email, hashedPassword, user_type]);

            

        
        res.status(201).json({ status: 'success', message: 'User registered successfully', userId: result.insertId });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ status: 'error', message: 'Error registering user', error: error.message });
    }
}


async function login(req, res) {
    const { email, password_hash } = req.body;

    try {
        
        console.log('Attempting to log in user with email:', email);
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        
        console.log('User retrieved from database:', user);

        
        if (!user) {
            return res.status(401).json({ status: 'error', statusCode: 401, message: 'Invalid email or password' });
        }

        
        if (!password_hash) {
            console.error('Password is undefined');
            return res.status(400).json({ status: 'error', statusCode: 400, message: 'Password is required' });
        }

        
        const match = await bcrypt.compare(password_hash, user.password_hash);
        if (!match) {
            return res.status(401).json({ status: 'error', statusCode: 401, message: 'Invalid email or password' });
        }

        
        const token = jwt.sign({ user_id: user.user_id, user_type: user.user_type }, process.env.JWT_SECRET, { expiresIn: '1h' });


        res.status(200).json({ status: 'success', message: 'Login successful', userId: user.id ,token: token });
    } catch (error) {
        console.error('Login error:', error); 
        res.status(500).json({ status: 'error', statusCode: 500, message: 'Error logging in', error: error.message });
    }
}



module.exports = {
    register,
    login,
    
};
