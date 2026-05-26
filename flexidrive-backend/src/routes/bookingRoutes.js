const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

router.get('/admin/all', authMiddleware, adminMiddleware, bookingController.getAllBookingsAdmin);
router.put('/admin/:id', authMiddleware, adminMiddleware, bookingController.updateBookingAdmin);

router.post('/', authMiddleware, bookingController.createBooking);
router.get('/my-bookings', authMiddleware, bookingController.getMyBookings);
router.put('/:id/cancel', authMiddleware, bookingController.cancelBooking);
router.put('/:id/complete', authMiddleware, bookingController.completeBooking);

module.exports = router;
