const { v4: uuidv4 } = require('uuid');
const { reservations, cars, users } = require('../config/db');

const SERVICE_FEE_RATE = 0.1;

const withDetails = (r) => {
  const car  = cars.find(c => c.id === r.carId);
  const user = users.find(u => u.id === r.userId);
  return {
    ...r,
    car:  car  ? { id: car.id,  name: car.name,  location: car.location, pricePerHour: car.pricePerHour } : null,
    user: user ? { id: user.id, name: user.name, avatar: user.avatar } : null,
  };
};

// GET /api/reservations  (protected — user's own reservations)
exports.getMyReservations = (req, res) => {
  const myRes = reservations
    .filter(r => r.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(withDetails);
  res.json(myRes);
};

// GET /api/reservations/:id  (protected)
exports.getReservationById = (req, res) => {
  const r = reservations.find(r => r.id === req.params.id);
  if (!r) return res.status(404).json({ error: 'Reserva no trobada' });
  if (r.userId !== req.user.id) {
    const car = cars.find(c => c.id === r.carId);
    if (!car || car.ownerId !== req.user.id)
      return res.status(403).json({ error: 'No tens permís' });
  }
  res.json(withDetails(r));
};

// POST /api/reservations  (protected)
exports.createReservation = (req, res) => {
  const { carId, startTime, hours } = req.body;

  if (!carId || !startTime || !hours)
    return res.status(400).json({ error: 'carId, startTime i hours són obligatoris' });

  const car = cars.find(c => c.id === carId);
  if (!car) return res.status(404).json({ error: 'Cotxe no trobat' });
  if (!car.available) return res.status(409).json({ error: 'El cotxe no està disponible' });
  if (car.ownerId === req.user.id)
    return res.status(400).json({ error: 'No pots reservar el teu propi cotxe' });

  const numHours = Number(hours);
  if (numHours < car.minHours)
    return res.status(400).json({ error: `Mínim ${car.minHours} hora/es per aquest cotxe` });

  const subtotal   = car.pricePerHour * numHours;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const totalPrice = subtotal + serviceFee;

  const newRes = {
    id: uuidv4(),
    carId,
    userId: req.user.id,
    startTime,
    hours: numHours,
    subtotal,
    serviceFee,
    totalPrice,
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  reservations.push(newRes);
  res.status(201).json(withDetails(newRes));
};

// PATCH /api/reservations/:id/cancel  (protected)
exports.cancelReservation = (req, res) => {
  const idx = reservations.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Reserva no trobada' });

  const r = reservations[idx];
  if (r.userId !== req.user.id) return res.status(403).json({ error: 'No tens permís' });
  if (r.status === 'completed') return res.status(400).json({ error: 'No es pot cancel·lar una reserva completada' });

  reservations[idx] = { ...r, status: 'cancelled' };
  res.json(withDetails(reservations[idx]));
};

// GET /api/reservations/car/:carId  (protected — only car owner)
exports.getReservationsByCar = (req, res) => {
  const car = cars.find(c => c.id === req.params.carId);
  if (!car) return res.status(404).json({ error: 'Cotxe no trobat' });
  if (car.ownerId !== req.user.id) return res.status(403).json({ error: 'No tens permís' });

  const carRes = reservations
    .filter(r => r.carId === req.params.carId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(withDetails);
  res.json(carRes);
};
