const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const authController = require("../controllers/authController"); 
const { authenticateToken } = require("../middlewares/auth");

router.post(
    "/register",
    [
        body("username").isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),
        body("email").isEmail().withMessage("Please provide a valid email"),
        body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
        body("user_type").isIn(['Admin', 'Owner', 'Renter', 'Delivery']).withMessage("Invalid user type"),
    ],
    authController.register 
);


router.post(
    "/login",
    [
        body("email").isEmail().withMessage("Please provide a valid email"),
        body("password").notEmpty().withMessage("Password cannot be empty"),
    ],
    authController.login 
);


router.get("/profile", authenticateToken, (req, res) => {
    res.status(200).json({ message: `Welcome, user with ID: ${req.user.id}` });
});

module.exports = router;
