const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const supabase = require('./config/supabase');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const requestRoutes = require('./routes/requestRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const notificationController = require('./controllers/notificationController');
const authMiddleware = require('./middlewares/authMiddleware');
const reviewRoutes = require('./routes/reviewRoutes');
require('dotenv').config();

const app = express();

// --- Middlewares ---
app.use(helmet()); // Seguridad de cabeceras HTTP
app.use(cors());   // Permite que el frontend se comunique con el backend
app.use(morgan('dev')); // Registro de peticiones en consola
app.use(express.json()); // Permite leer cuerpos JSON en las peticiones

// --- Rutas de la API ---
app.use('/api/auth', authRoutes); // Todas las rutas de auth empezarán por /api/auth
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('api/requests', requestRoutes);
app.use('/api/bookings', bookingRoutes);
app.get('/api/notifications', authMiddleware, notificationController.getNotifications);
app.use('/api/reviews', reviewRoutes);
// Ruta de prueba de conexión (la mantenemos por ahora)
app.get('/test-db', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error) throw error;

    res.json({
      status: 'Conexión exitosa',
      message: 'Hemos podido conectar con Supabase',
      data: data
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error de conexión',
      message: error.message
    });
  }
});

// Ruta base de bienvenida
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API de FlexiDrive SL' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}` );
});
