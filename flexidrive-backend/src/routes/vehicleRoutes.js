const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const authMiddleware = require('../middlewares/authMiddleware');
const photoController = require('../controllers/photoController');



// Rutas públicas (para que los inquilinos vean coches)
router.get('/', vehicleController.getAllVehicles);

// Rutas protegidas (requieren login)
router.post('/', authMiddleware, vehicleController.createVehicle);
router.get('/my-vehicles', authMiddleware, vehicleController.getMyVehicles);
router.post('/:vehicle_id/photos', 
  authMiddleware, 
  photoController.uploadMiddleware, 
  photoController.uploadVehiclePhoto
);
module.exports = router;
