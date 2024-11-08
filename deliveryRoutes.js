const express = require('express');
const deliveryController = require('../controllers/deliveryController');
const { authenticateDelivery } = require('../middlewares/auth');

const router = express.Router();


router.get('/orders', authenticateDelivery, deliveryController.viewOrders);
router.patch('/orders/:rentalId/status', authenticateDelivery, deliveryController.updateOrderStatus);
router.get('/profits', authenticateDelivery, deliveryController.viewProfits);

module.exports = router;
