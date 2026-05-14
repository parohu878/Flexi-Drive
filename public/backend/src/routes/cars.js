const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/carsController');
const rev = require('../controllers/reviewsController');

router.get('/',                      c.getCars);
router.get('/owner/:userId',         c.getCarsByOwner);
router.get('/:id',                   c.getCarById);
router.post('/',            auth,    c.createCar);
router.put('/:id',          auth,    c.updateCar);
router.delete('/:id',       auth,    c.deleteCar);

// Reviews nested under cars
router.get('/:carId/reviews',        rev.getCarReviews);
router.post('/:carId/reviews', auth, rev.createReview);

module.exports = router;
