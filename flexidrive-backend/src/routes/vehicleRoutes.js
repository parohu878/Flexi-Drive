const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const photoController = require('../controllers/photoController');

// Rutas estáticas y protegidas (definidas antes de las dinámicas)
router.get('/my-vehicles', authMiddleware, vehicleController.getMyVehicles);
router.get('/admin/all', authMiddleware, adminMiddleware, vehicleController.getAllVehiclesAdmin);

// Rutas públicas
router.get('/', vehicleController.getAllVehicles);
router.get('/:id', vehicleController.getVehicleById);

// Rutas protegidas (requieren login)
router.post('/', authMiddleware, vehicleController.createVehicle);
router.put('/:id', authMiddleware, vehicleController.updateVehicle);
router.delete('/:id', authMiddleware, vehicleController.deleteVehicle);
router.post('/:vehicle_id/photos', 
  authMiddleware, 
  photoController.uploadMiddleware, 
  photoController.uploadVehiclePhoto
);

module.exports = router;
