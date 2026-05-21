const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, requestController.createRequest);
router.get('/:request_id/matches', authMiddleware, requestController.getMatches);

module.exports = router;
