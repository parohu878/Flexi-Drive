const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/reservationsController');

router.get('/',                     auth, c.getMyReservations);
router.get('/:id',                  auth, c.getReservationById);
router.post('/',                    auth, c.createReservation);
router.patch('/:id/cancel',         auth, c.cancelReservation);
router.get('/car/:carId',           auth, c.getReservationsByCar);

module.exports = router;
