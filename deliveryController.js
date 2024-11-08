const db = require('../config/db');


exports.viewOrders = async (req, res, next) => {
    try {
        const deliveryId = req.user.delivery_id;
        const [orders] = await db.query("SELECT * FROM rentals WHERE delivery_id = ?", [deliveryId]);
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

exports.updateOrderStatus = async (req, res, next) => {
    try {
        const deliveryId = req.user.delivery_id;
        const { rentalId } = req.params;
        const { status } = req.body;

        console.log('Request body:', req.body);  
        console.log('Delivery ID from token:', deliveryId);
        console.log('Rental ID:', rentalId);
        console.log('Requested status:', status);

        
        const validStatuses = ['Pending', 'Confirmed', 'Returned', 'Canceled', 'Done'];
        if (!status || !validStatuses.includes(status)) {
            console.error('Invalid or missing status:', status);
            return res.status(400).json({ message: 'Invalid or missing status.' });
        }

        
        const [orderResult] = await db.query("SELECT * FROM rentals WHERE rental_id = ? AND delivery_id = ?", [rentalId, deliveryId]);
        const order = orderResult[0];
        if (!order) {
            console.error('Order not found or does not belong to this delivery:', rentalId, deliveryId);
            return res.status(404).json({ message: 'Order not found or does not belong to this delivery.' });
        }
        
        await db.query("UPDATE rentals SET rental_status = ? WHERE rental_id = ?", [status, rentalId]);

        
        if (status === 'Done') {
            const [deliveryResult] = await db.query("UPDATE delivery SET num = num - 1 WHERE delivery_id = ? AND num > 0", [deliveryId]);

            if (deliveryResult.affectedRows === 0) {
                console.warn(`Could not decrement num for delivery ID ${deliveryId}: num may already be 0.`);
            }
        }

        res.json({ message: 'Order status updated successfully.' });
    } catch (error) {
        console.error('Error updating order status:', error);
        next(error);
    }
};

exports.viewProfits = async (req, res, next) => {
    try {
        const deliveryId = req.user.delivery_id;
        const [result] = await db.query("SELECT num * 10 AS profits FROM delivery WHERE delivery_id = ?", [deliveryId]);
        res.json(result[0]);
    } catch (error) {
        next(error);
    }
};
