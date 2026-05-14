const { v4: uuidv4 } = require('uuid');
const { cars, users } = require('../config/db');

// ── Haversine ──────────────────────────────────────────────────────
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371; // km
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const withOwner = (car, userLat, userLng) => {
  const owner = users.find(u => u.id === car.ownerId);
  let dist = null;
  if (userLat && userLng && car.lat && car.lng) {
    dist = parseFloat(haversine(userLat, userLng, car.lat, car.lng).toFixed(1));
  } else {
    dist = parseFloat((Math.random() * 2.5 + 0.1).toFixed(1));
  }
  return {
    ...car,
    owner: owner
      ? { id: owner.id, name: owner.name, avatar: owner.avatar, rating: owner.rating, verified: owner.verified }
      : null,
    dist,
  };
};

// GET /api/cars
exports.getCars = (req, res) => {
  const {
    q, fuel, transmission, maxPrice, minPrice,
    seats, location, sortBy, available, page = 1, limit = 20,
    userLat, userLng, radius,
  } = req.query;

  let results = [...cars];

  // Filters
  if (q) {
    const ql = q.toLowerCase();
    results = results.filter(c =>
      c.name.toLowerCase().includes(ql) ||
      c.location.toLowerCase().includes(ql) ||
      c.make.toLowerCase().includes(ql) ||
      c.model.toLowerCase().includes(ql)
    );
  }
  if (fuel && fuel !== 'Tots') results = results.filter(c => c.fuel === fuel);
  if (transmission && transmission !== 'Tots') results = results.filter(c => c.transmission === transmission);
  if (maxPrice) results = results.filter(c => c.pricePerHour <= Number(maxPrice));
  if (minPrice) results = results.filter(c => c.pricePerHour >= Number(minPrice));
  if (seats) results = results.filter(c => c.seats >= Number(seats));
  if (location) results = results.filter(c => c.location.toLowerCase().includes(location.toLowerCase()));
  if (available === 'true') results = results.filter(c => c.available);

  // Radius filter (km)
  const uLat = userLat ? Number(userLat) : null;
  const uLng = userLng ? Number(userLng) : null;
  if (radius && uLat && uLng) {
    const r = Number(radius);
    results = results.filter(c => {
      if (!c.lat || !c.lng) return true;
      return haversine(uLat, uLng, c.lat, c.lng) <= r;
    });
  }

  // Sort
  switch (sortBy) {
    case 'price_asc': results.sort((a, b) => a.pricePerHour - b.pricePerHour); break;
    case 'price_desc': results.sort((a, b) => b.pricePerHour - a.pricePerHour); break;
    case 'rating': results.sort((a, b) => b.rating - a.rating); break;
    case 'newest': results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
    default:
      // Sort by distance if user position available
      if (uLat && uLng) {
        results.sort((a, b) => {
          const dA = (a.lat && a.lng) ? haversine(uLat, uLng, a.lat, a.lng) : 999;
          const dB = (b.lat && b.lng) ? haversine(uLat, uLng, b.lat, b.lng) : 999;
          return dA - dB;
        });
      }
      break;
  }

  // Paginate
  const total = results.length;
  const start = (Number(page) - 1) * Number(limit);
  const paginated = results.slice(start, start + Number(limit)).map(c => withOwner(c, uLat, uLng));

  res.json({
    data: paginated,
    meta: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  });
};

// GET /api/cars/:id
exports.getCarById = (req, res) => {
  const car = cars.find(c => c.id === req.params.id);
  if (!car) return res.status(404).json({ error: 'Cotxe no trobat' });
  const uLat = req.query.userLat ? Number(req.query.userLat) : null;
  const uLng = req.query.userLng ? Number(req.query.userLng) : null;
  res.json(withOwner(car, uLat, uLng));
};

// POST /api/cars  (protected)
exports.createCar = (req, res) => {
  const {
    make, model, year, location, city, lat, lng,
    pricePerHour, seats, fuel, transmission, minHours,
    description, features, availableDays, availableFrom, availableTo,
  } = req.body;

  if (!make || !model || !year || !pricePerHour || !location)
    return res.status(400).json({ error: 'Falten camps obligatoris' });

  const newCar = {
    id: uuidv4(),
    ownerId: req.user.id,
    make, model,
    year: Number(year),
    name: `${make} ${model} ${year}`,
    location, city: city || 'Barcelona',
    lat: lat ? Number(lat) : null,
    lng: lng ? Number(lng) : null,
    pricePerHour: Number(pricePerHour),
    seats: Number(seats) || 5,
    fuel: fuel || 'Gasolina',
    transmission: transmission || 'Manual',
    minHours: Number(minHours) || 1,
    color: '#9b4dca',
    rating: 0,
    totalReviews: 0,
    available: true,
    images: [],
    description: description || '',
    features: features || [],
    availableDays: availableDays || [1, 2, 3, 4, 5],
    availableFrom: availableFrom || '08:00',
    availableTo: availableTo || '20:00',
    createdAt: new Date().toISOString(),
  };

  cars.push(newCar);
  res.status(201).json(withOwner(newCar, null, null));
};

// PUT /api/cars/:id  (protected — only owner)
exports.updateCar = (req, res) => {
  const idx = cars.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Cotxe no trobat' });

  const car = cars[idx];
  if (car.ownerId !== req.user.id)
    return res.status(403).json({ error: 'No tens permís per editar aquest cotxe' });

  const allowed = [
    'location', 'city', 'lat', 'lng', 'pricePerHour', 'minHours',
    'description', 'features', 'availableDays', 'availableFrom', 'availableTo',
    'available', 'seats', 'fuel', 'transmission',
  ];
  const updates = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  cars[idx] = { ...car, ...updates };
  res.json(withOwner(cars[idx], null, null));
};

// DELETE /api/cars/:id  (protected — only owner)
exports.deleteCar = (req, res) => {
  const idx = cars.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Cotxe no trobat' });

  if (cars[idx].ownerId !== req.user.id)
    return res.status(403).json({ error: 'No tens permís' });

  cars.splice(idx, 1);
  res.json({ message: 'Cotxe eliminat correctament' });
};

// GET /api/cars/owner/:userId
exports.getCarsByOwner = (req, res) => {
  const ownerCars = cars.filter(c => c.ownerId === req.params.userId).map(c => withOwner(c, null, null));
  res.json(ownerCars);
};
