const jwt = require("jsonwebtoken");
require("dotenv").config();


const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; 
        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid token." });
    }
};


const authenticateAdmin = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Access Denied. No token provided.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.user_type !== 'Admin') {
            return res.status(403).json({ message: 'Access forbidden: Admins only.' });
        }
        req.user = decoded; 
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};


module.exports = { authenticateToken, authenticateAdmin };
