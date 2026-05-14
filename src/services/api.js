import { DEMO_CARS, DEMO_RESERVATIONS, filterCars } from './demoData';

const API_BASE = 'http://localhost:3001/api';

// ── Helper ─────────────────────────────────────────────────────────
function getToken() {
  return localStorage.getItem('fd_token');
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.error || 'Error del servidor');
    error.status = res.status;
    throw error;
  }
  return data;
}

// Wrapper that falls back to demo data if API is unreachable
async function requestWithFallback(endpoint, options = {}, fallbackFn = null) {
  try {
    return await request(endpoint, options);
  } catch (err) {
    if ((err.message === 'Failed to fetch' || err.name === 'TypeError') && fallbackFn) {
      return fallbackFn();
    }
    throw err;
  }
}

// ── Auth ───────────────────────────────────────────────────────────
export const authService = {
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  register: (name, email, password) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),

  getMe: () => request('/auth/me'),
};

// ── Cars ───────────────────────────────────────────────────────────
export const carsService = {
  getCars: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, v);
    });
    const q = qs.toString();
    return requestWithFallback(
      `/cars${q ? `?${q}` : ''}`,
      {},
      () => {
        // Use demo data with filtering
        const filtered = filterCars(DEMO_CARS, {
          query: params.q,
          maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
          fuel: params.fuel,
          transmission: params.transmission,
          sortBy: params.sortBy,
          userLat: params.userLat ? Number(params.userLat) : undefined,
          userLng: params.userLng ? Number(params.userLng) : undefined,
        });
        return { data: filtered };
      }
    );
  },

  getCarById: (id) => requestWithFallback(
    `/cars/${id}`,
    {},
    () => DEMO_CARS.find(c => c.id === id) || null
  ),

  createCar: (data) => {
    // Try API first, fallback to localStorage
    return requestWithFallback(
      '/cars',
      { method: 'POST', body: JSON.stringify(data) },
      () => {
        const newCar = {
          ...data,
          id: 'c' + Date.now(),
          name: `${data.make} ${data.model} ${data.year}`,
          rating: 0,
          totalReviews: 0,
          available: true,
          dist: Math.round(Math.random() * 50) / 10,
          color: ['#9b4dca', '#e040fb', '#4db8ff', '#5dcaa5', '#ff8c42', '#c47dff'][Math.floor(Math.random() * 6)],
          owner: JSON.parse(localStorage.getItem('fd_user') || '{}'),
        };
        // Save to localStorage published cars
        const published = JSON.parse(localStorage.getItem('fd_published_cars') || '[]');
        published.push(newCar);
        localStorage.setItem('fd_published_cars', JSON.stringify(published));
        return newCar;
      }
    );
  },

  updateCar: (id, data) =>
    request(`/cars/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteCar: (id) =>
    request(`/cars/${id}`, { method: 'DELETE' }),

  getCarsByOwner: (userId) => requestWithFallback(
    `/cars/owner/${userId}`,
    {},
    () => {
      const published = JSON.parse(localStorage.getItem('fd_published_cars') || '[]');
      return published;
    }
  ),
};

// ── Reservations ───────────────────────────────────────────────────
export const reservationsService = {
  getMyReservations: () => requestWithFallback(
    '/reservations',
    {},
    () => DEMO_RESERVATIONS
  ),

  getReservationById: (id) => requestWithFallback(
    `/reservations/${id}`,
    {},
    () => DEMO_RESERVATIONS.find(r => r.id === id) || null
  ),

  createReservation: (carId, startTime, hours) =>
    requestWithFallback(
      '/reservations',
      { method: 'POST', body: JSON.stringify({ carId, startTime, hours }) },
      () => {
        const car = DEMO_CARS.find(c => c.id === carId);
        const price = car ? car.pricePerHour * hours : 0;
        return {
          id: 'r' + Date.now(),
          carId,
          car,
          startTime,
          hours,
          price,
          fee: Math.round(price * 0.1),
          total: price + Math.round(price * 0.1),
          status: 'active',
        };
      }
    ),

  cancelReservation: (id) =>
    requestWithFallback(
      `/reservations/${id}/cancel`,
      { method: 'PATCH' },
      () => ({ id, status: 'cancelled' })
    ),

  getReservationsByCar: (carId) => requestWithFallback(
    `/reservations/car/${carId}`,
    {},
    () => DEMO_RESERVATIONS.filter(r => r.carId === carId)
  ),
};

// ── Reviews ────────────────────────────────────────────────────────
export const reviewsService = {
  getCarReviews: (carId) => requestWithFallback(
    `/cars/${carId}/reviews`,
    {},
    () => {
      const car = DEMO_CARS.find(c => c.id === carId);
      return car?.reviewList || [];
    }
  ),

  createReview: (carId, rating, comment, reservationId) =>
    request(`/cars/${carId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment, reservationId }),
    }),
};

// ── Users ──────────────────────────────────────────────────────────
export const usersService = {
  getProfile: (id) => request(`/users/${id}`),

  updateProfile: (data) =>
    request('/users/me', { method: 'PUT', body: JSON.stringify(data) }),

  getMyStats: () => request('/users/me/stats'),
};
