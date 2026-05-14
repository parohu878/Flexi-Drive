const { users, cars, reservations } = require('../config/db');

// GET /api/users/:id  (public profile)
exports.getProfile = (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'Usuari no trobat' });

  const { passwordHash: _, email: __, ...publicProfile } = user;
  const userCars = cars.filter(c => c.ownerId === user.id).length;
  res.json({ ...publicProfile, totalCars: userCars });
};

// PUT /api/users/me  (protected — update own profile)
exports.updateProfile = (req, res) => {
  const idx = users.findIndex(u => u.id === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Usuari no trobat' });

  const allowed = ['name', 'phone', 'bio'];
  const updates = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  users[idx] = { ...users[idx], ...updates };
  const { passwordHash: _, ...userPublic } = users[idx];
  res.json(userPublic);
};

// GET /api/users/me/stats  (protected)
exports.getMyStats = (req, res) => {
  const userId = req.user.id;
  const myCars = cars.filter(c => c.ownerId === userId);
  const myReservations = reservations.filter(r => r.userId === userId);

  const earnings = reservations
    .filter(r => myCars.some(c => c.id === r.carId) && r.status === 'completed')
    .reduce((sum, r) => sum + r.totalPrice, 0);

  res.json({
    totalCars: myCars.length,
    activeCars: myCars.filter(c => c.available).length,
    totalReservations: myReservations.length,
    completedReservations: myReservations.filter(r => r.status === 'completed').length,
    totalEarnings: earnings,
  });
};
