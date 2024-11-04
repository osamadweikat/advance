const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticateAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/users', authenticateAdmin, adminController.viewUsers);
router.get('/owners', authenticateAdmin, adminController.viewOwners);
router.get('/deliveries', authenticateAdmin, adminController.viewDeliveries);
router.get('/items', authenticateAdmin, adminController.viewItems);
router.get('/rentals', authenticateAdmin, adminController.viewRentals);
router.get('/reviews', authenticateAdmin, adminController.viewReviews);

router.delete('/user/:id', authenticateAdmin, adminController.deleteUser);
router.delete('/owner/:id', authenticateAdmin, adminController.deleteOwner);
router.delete('/delivery/:id', authenticateAdmin, adminController.deleteDelivery);
router.delete('/item/:id', authenticateAdmin, adminController.deleteItem);


router.get('/profit', authenticateAdmin, adminController.viewProfit);

module.exports = router;
