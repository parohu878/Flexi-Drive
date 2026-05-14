const { v4: uuidv4 } = require('uuid');
const { reviews, cars, users, reservations } = require('../config/db');

// GET /api/cars/:carId/reviews
exports.getCarReviews = (req, res) => {
  const carReviews = reviews
    .filter(r => r.carId === req.params.carId)
    .map(r => {
      const user = users.find(u => u.id === r.userId);
      return { ...r, user: user ? { name: user.name, avatar: user.avatar } : null };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(carReviews);
};

// POST /api/cars/:carId/reviews  (protected)
exports.createReview = (req, res) => {
  const { rating, comment, reservationId } = req.body;

  if (!rating || rating < 1 || rating > 5)
    return res.status(400).json({ error: 'La valoració ha de ser entre 1 i 5' });

  const car = cars.find(c => c.id === req.params.carId);
  if (!car) return res.status(404).json({ error: 'Cotxe no trobat' });

  // Verify the user has a completed reservation for this car
  if (reservationId) {
    const res_ = reservations.find(r => r.id === reservationId && r.userId === req.user.id && r.carId === car.id);
    if (!res_) return res.status(403).json({ error: 'Necessites una reserva completada per valorar' });
  }

  // Prevent duplicate reviews per reservation
  if (reservationId) {
    const dup = reviews.find(r => r.reservationId === reservationId);
    if (dup) return res.status(409).json({ error: 'Ja has valorat aquesta reserva' });
  }

  const newReview = {
    id: uuidv4(),
    carId: car.id,
    userId: req.user.id,
    reservationId: reservationId || null,
    rating: Number(rating),
    comment: comment || '',
    createdAt: new Date().toISOString(),
  };

  reviews.push(newReview);

  // Recalculate car rating
  const carReviews = reviews.filter(r => r.carId === car.id);
  const avg = carReviews.reduce((sum, r) => sum + r.rating, 0) / carReviews.length;
  const carIdx = cars.findIndex(c => c.id === car.id);
  cars[carIdx].rating = Math.round(avg * 10) / 10;
  cars[carIdx].totalReviews = carReviews.length;

  const user = users.find(u => u.id === req.user.id);
  res.status(201).json({ ...newReview, user: user ? { name: user.name, avatar: user.avatar } : null });
};
