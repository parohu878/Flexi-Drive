const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

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

// ── Mappers ────────────────────────────────────────────────────────
const mapVehicleToCar = (v) => ({
  id: v.id,
  name: `${v.marca} ${v.modelo}`,
  make: v.marca,
  model: v.modelo,
  year: 2024,
  location: v.direccion || 'Ubicación no especificada',
  city: v.direccion || 'Desconocido',
  lat: v.latitud || 41.3879,
  lng: v.longitud || 2.1699,
  pricePerHour: v.precio_dia, // Mostramos precio por día como precio general
  seats: v.plazas,
  fuel: v.combustible,
  transmission: v.transmision,
  color: ['#9b4dca', '#e040fb', '#4db8ff', '#5dcaa5', '#ff8c42', '#c47dff'][Math.floor(Math.random() * 6)],
  rating: 5.0,
  totalReviews: 0,
  features: [],
  description: v.descripcion,
  owner: v.users ? {
    name: v.users.nombre,
    avatar: v.users.foto_perfil || (v.users.nombre ? v.users.nombre.substring(0, 2).toUpperCase() : 'FD'),
    rating: 5
  } : null,
  availableFrom: '00:00',
  availableTo: '23:59',
  dist: v.radio_km || 0
});

// ── Auth ───────────────────────────────────────────────────────────
export const authService = {
  login: async (email, password) => {
    const data = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    // El backend devuelve { message, session: { access_token, user: {...} } }
    return {
      token: data.session.access_token,
      user: {
        id: data.session.user.id,
        email: data.session.user.email,
        name: data.session.user.email.split('@')[0],
        avatar: data.session.user.email.substring(0, 2).toUpperCase()
      }
    };
  },

  register: async (name, email, password) => {
    const data = await request('/auth/register', { 
      method: 'POST', 
      body: JSON.stringify({ nombre: name, email, password, rol: 'inquilino' }) 
    });
    // Hacemos login automático después del registro para obtener el token
    return authService.login(email, password);
  },

  getMe: async () => {
    const data = await request('/users/profile');
    return {
      id: data.id_auth,
      name: data.nombre,
      email: data.email,
      avatar: data.foto_perfil || (data.nombre ? data.nombre.substring(0, 2).toUpperCase() : 'FD'),
      phone: data.telefono,
      city: data.ciudad
    };
  },
};

// ── Cars ───────────────────────────────────────────────────────────
export const carsService = {
  getCars: async (params = {}) => {
    const data = await request('/vehicles');
    let cars = data.map(mapVehicleToCar);
    
    // Filtrado básico en frontend ya que el backend devuelve todos los activos
    if (params.q) {
      const q = params.q.toLowerCase();
      cars = cars.filter(c => c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q));
    }
    if (params.maxPrice && params.maxPrice < 100) cars = cars.filter(c => c.pricePerHour <= params.maxPrice);
    if (params.fuel && params.fuel !== 'Tots') cars = cars.filter(c => c.fuel === params.fuel);
    if (params.transmission && params.transmission !== 'Tots') cars = cars.filter(c => c.transmission === params.transmission);
    
    return { data: cars };
  },

  getCarById: async (id) => {
    const data = await request('/vehicles');
    const vehicle = data.find(v => v.id === id || v.id.toString() === id);
    if (!vehicle) throw new Error('Vehículo no encontrado');
    return mapVehicleToCar(vehicle);
  },

  createCar: async (data) => {
    const payload = {
      marca: data.make,
      modelo: data.model,
      matricula: '0000XXX', // Default ya que frontend no lo pide
      tipo: 'turismo',
      combustible: data.fuel,
      plazas: data.seats || 5,
      transmision: data.transmission,
      descripcion: data.description || '',
      precio_dia: data.pricePerHour, // Frontend price is used as day price
      latitud: 41.38,
      longitud: 2.15,
      direccion: 'Barcelona',
      radio_km: 10
    };
    const res = await request('/vehicles', { method: 'POST', body: JSON.stringify(payload) });
    return mapVehicleToCar(res.vehicle);
  },

  updateCar: (id, data) => Promise.reject(new Error('No implementado en backend')),
  deleteCar: (id) => Promise.reject(new Error('No implementado en backend')),

  getCarsByOwner: async (userId) => {
    const data = await request('/vehicles/my-vehicles');
    return data.map(mapVehicleToCar);
  },
};

// ── Reservations ───────────────────────────────────────────────────
export const reservationsService = {
  getMyReservations: async () => {
    const data = await request('/bookings/my-bookings');
    return data.map(b => ({
      id: b.id,
      carId: b.vehicle_id,
      car: b.vehicles ? mapVehicleToCar(b.vehicles) : null,
      date: new Date(b.fecha_inicio).toLocaleDateString(),
      startTime: new Date(b.fecha_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hours: Math.round((new Date(b.fecha_fin) - new Date(b.fecha_inicio)) / 3600000) || 24,
      price: b.precio_total,
      fee: b.precio_total * 0.1,
      total: b.precio_total * 1.1,
      status: b.estado === 'confirmada' ? 'active' : b.estado,
      createdAt: b.fecha_creacion
    }));
  },

  getReservationById: async (id) => {
    const reservations = await reservationsService.getMyReservations();
    return reservations.find(r => r.id === id);
  },

  createReservation: async (carId, startTime, hours) => {
    // 1. Crear una Request (solicitud)
    const fecha_inicio = new Date().toISOString();
    const fecha_fin = new Date(Date.now() + hours * 3600000).toISOString();
    
    const reqRes = await request('/requests', {
      method: 'POST',
      body: JSON.stringify({
        fecha_inicio,
        fecha_fin,
        latitud: 41.38,
        longitud: 2.15,
        radio_km: 50,
        tipo_vehiculo: 'cualquiera',
        precio_max_dia: 99999
      })
    });

    // 2. Buscar si el coche hizo match
    const matches = await request(`/requests/${reqRes.request.id}/matches`);
    const match = matches.find(m => m.vehicle_id === carId || m.vehicle_id.toString() === carId.toString());

    if (!match) {
      throw new Error('El vehículo no está disponible para estas fechas según el backend.');
    }

    // 3. Crear Booking a partir del match
    const bookingRes = await request('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        match_id: match.id,
        fecha_inicio,
        fecha_fin,
        precio_total: match.precio * (hours/24) || match.precio
      })
    });

    return bookingRes.booking;
  },

  cancelReservation: (id) => Promise.reject(new Error('Cancelar no implementado en backend')),
  getReservationsByCar: () => Promise.resolve([]),
};

// ── Reviews ────────────────────────────────────────────────────────
export const reviewsService = {
  getCarReviews: async (carId) => {
    const data = await request(`/reviews?type=vehicle&id=${carId}`);
    return data.map(r => ({
      avatar: r.users?.foto_perfil || 'FD',
      author: r.users?.nombre || 'Anónimo',
      rating: r.puntuacion,
      date: new Date(r.fecha_creacion).toLocaleDateString(),
      comment: r.comentario
    }));
  },

  createReview: (carId, rating, comment, reservationId) =>
    request('/reviews', {
      method: 'POST',
      body: JSON.stringify({
        booking_id: reservationId,
        destinatario_id: null, // Asumimos que no requiere ID de propietario aquí directamente
        puntuacion: rating,
        comentario: comment,
        tipo: 'inquilino_a_vehiculo'
      }),
    }),
};

// ── Users ──────────────────────────────────────────────────────────
export const usersService = {
  getProfile: () => request('/users/profile'),
  updateProfile: (data) =>
    request('/users/profile', { 
      method: 'PUT', 
      body: JSON.stringify({
        nombre: data.name,
        telefono: data.phone,
        ciudad: data.city,
        foto_perfil: data.avatar
      }) 
    }),
  getMyStats: () => Promise.resolve({ totalRentals: 0, rating: 5 }),
};
