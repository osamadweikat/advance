const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});


(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to the database.');
        connection.release(); 
    } catch (error) {
        console.error('Database connection error:', error.stack);
    }
})();

module.exports = pool;
