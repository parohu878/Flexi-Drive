const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');
const authMiddleware = require('../middlewares/authMiddleware');

// Ver disponibilidad (Público)
router.get('/:vehicle_id', availabilityController.getVehicleAvailability);

// Añadir disponibilidad (Privado - Solo dueños)
router.post('/', authMiddleware, availabilityController.addAvailability);

module.exports = router;
