require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

// ── MIDDLEWARE ─────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: 'Massa sol·licituds, torna a intentar-ho en uns minuts.' });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Massa intents d\'autenticació.' });

app.use('/api/', limiter);
app.use('/api/auth', authLimiter);

// ── ROUTES ─────────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/cars',         require('./routes/cars'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/users',        require('./routes/users'));

// ── HEALTH CHECK ───────────────────────────────────────────────────
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', service: 'flexi-drive-api', ts: new Date().toISOString() })
);

// ── 404 ────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: `Ruta no trobada: ${req.method} ${req.path}` }));

// ── ERROR HANDLER ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error intern del servidor' });
});

// ── START ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚗  Flexi Drive API running → http://localhost:${PORT}`);
  console.log(`📋  Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔑  Auth: POST /api/auth/login  |  POST /api/auth/register`);
  console.log(`🚙  Cars: GET  /api/cars\n`);
});
