const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/usersController');

router.get('/me/stats', auth,  c.getMyStats);
router.put('/me',       auth,  c.updateProfile);
router.get('/:id',             c.getProfile);

module.exports = router;
