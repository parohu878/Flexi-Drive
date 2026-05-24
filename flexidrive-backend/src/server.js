require('dotenv').config();
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

const app = express();

// --- Middlewares ---
app.use(helmet()); // Seguridad de cabeceras HTTP

const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: corsOrigin === '*' ? '*' : corsOrigin.split(','),
  credentials: true
})); // Permite que el frontend se comunique con el backend

app.use(morgan('dev')); // Registro de peticiones en consola
app.use(express.json()); // Permite leer cuerpos JSON en las peticiones

// --- Rutas de la API ---
app.use('/api/auth', authRoutes); // Todas las rutas de auth empezarán por /api/auth
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/bookings', bookingRoutes);
app.get('/api/notifications', authMiddleware, notificationController.getNotifications);
app.use('/api/reviews', reviewRoutes);

// Ruta base de bienvenida
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API de FlexiDrive SL' });
});

// Manejador de rutas 404
app.use((req, res, next) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejador global de errores
app.use((err, req, res, next) => {
  console.error('Error global:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor'
  });
});

// --- Background Scheduler ---
// Check and update booking statuses every 60 seconds using the Supabase RPC function
setInterval(async () => {
  try {
    const { error } = await supabase.supabase.rpc('update_booking_statuses');
    if (error) {
      if (error.message && (error.message.includes('does not exist') || error.code === '42883')) {
        // Safe warning if the migration has not been applied to the live database
        console.warn('Background check: database function "update_booking_statuses" not found. Falling back to application-layer real-time updates.');
      } else {
        console.error('Error in background status scheduler:', error);
      }
    }
  } catch (err) {
    console.error('Failed to run background status scheduler:', err);
  }
}, 60000);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}` );
});

