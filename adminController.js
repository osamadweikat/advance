// controllers/adminController.js

const db = require('../config/db');

// View Users
exports.viewUsers = async (req, res, next) => {
    try {
        const [users] = await db.query("SELECT * FROM users");
        res.json(users);
    } catch (error) {
        next(error);
    }
};

// View Owners
exports.viewOwners = async (req, res, next) => {
    try {
        const [owners] = await db.query("SELECT * FROM owners JOIN users ON owners.user_id = users.user_id");
        res.json(owners);
    } catch (error) {
        next(error);
    }
};

// View Deliveries
exports.viewDeliveries = async (req, res, next) => {
    try {
        const [deliveries] = await db.query("SELECT * FROM delivery JOIN users ON delivery.user_id = users.user_id");
        res.json(deliveries);
    } catch (error) {
        next(error);
    }
};

// View Items
exports.viewItems = async (req, res, next) => {
    try {
        const [items] = await db.query("SELECT * FROM items");
        res.json(items);
    } catch (error) {
        next(error);
    }
};

// View Rentals
exports.viewRentals = async (req, res, next) => {
    try {
        const [rentals] = await db.query("SELECT * FROM rentals");
        res.json(rentals);
    } catch (error) {
        next(error);
    }
};

// View Reviews
exports.viewReviews = async (req, res, next) => {
    try {
        const [reviews] = await db.query("SELECT * FROM reviews");
        res.json(reviews);
    } catch (error) {
        next(error);
    }
};

// Delete User
exports.deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM users WHERE user_id = ?", [id]);
        res.json({ message: 'User deleted successfully.' });
    } catch (error) {
        next(error);
    }
};

// Delete Owner
exports.deleteOwner = async (req, res, next) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM owners WHERE owner_id = ?", [id]);
        res.json({ message: 'Owner deleted successfully.' });
    } catch (error) {
        next(error);
    }
};

// Delete Delivery
exports.deleteDelivery = async (req, res, next) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM delivery WHERE delivery_id = ?", [id]);
        res.json({ message: 'Delivery agent deleted successfully.' });
    } catch (error) {
        next(error);
    }
};

// Delete Item
exports.deleteItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM items WHERE item_id = ?", [id]);
        res.json({ message: 'Item deleted successfully.' });
    } catch (error) {
        next(error);
    }
};

// View Profit
exports.viewProfit = async (req, res, next) => {
    try {
        const [profitData] = await db.query("SELECT SUM(total_price) * 0.1 AS profit FROM rentals");
        res.json(profitData[0]);
    } catch (error) {
        next(error);
    }
};
