const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

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
const fuelMapToFrontend = {
  'gasolina': 'Gasolina',
  'diesel': 'Diésel',
  'electrico': 'Eléctrico',
  'hibrido': 'Híbrido',
  'glp': 'GLP'
};

const transMapToFrontend = {
  'manual': 'Manual',
  'automatico': 'Automático'
};

  const mapVehicleToCar = (v) => ({
    id: v.id,
    name: `${v.marca} ${v.modelo}`,
    make: v.marca,
    model: v.modelo,
    year: v.año || v.year || 2024,
    location: v.direccion || 'Ubicación no especificada',
    city: v.direccion ? v.direccion.split(',')[1]?.trim() || v.direccion : 'Barcelona',
    lat: v.latitud || 41.3879,
    lng: v.longitud || 2.1699,
    pricePerHour: v.precio_dia || 0,
    seats: v.plazas || 5,
    fuel: fuelMapToFrontend[v.combustible] || v.combustible || 'Gasolina',
    transmission: transMapToFrontend[v.transmision] || v.transmision || 'Manual',
    color: ['#9b4dca', '#e040fb', '#4db8ff', '#5dcaa5', '#ff8c42', '#c47dff'][Math.floor(Math.random() * 6)],
    rating: 5.0,
    totalReviews: 0,
    features: v.caracteristicas || v.features || [],
    description: v.descripcion || '',
    owner: v.users ? {
      id: v.users.id,
      name: v.users.nombre,
      avatar: v.users.foto_perfil || (v.users.nombre ? v.users.nombre.substring(0, 2).toUpperCase() : 'FD'),
      rating: 5
    } : null,
    availableFrom: v.disponible_desde || v.availableFrom || '08:00',
    availableTo: v.disponible_hasta || v.availableTo || '20:00',
    dist: v.radio_km || 0,
    images: v.vehicle_photos ? v.vehicle_photos.map(p => p.url_foto) : []
  });

// ── Auth ───────────────────────────────────────────────────────────
export const authService = {
  login: async (email, password) => {
    const data = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    return {
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.nombre || data.user.email.split('@')[0],
        avatar: data.user.foto_perfil || (data.user.nombre ? data.user.nombre.substring(0, 2).toUpperCase() : 'FD')
      }
    };
  },

  register: async (name, email, password) => {
    const data = await request('/auth/register', { 
      method: 'POST', 
      body: JSON.stringify({ nombre: name, email, password }) 
    });
    return authService.login(email, password);
  },

  getMe: async () => {
    const data = await request('/users/profile');
    return {
      id: data.id,
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
    const data = await request(`/vehicles/${id}`);
    if (!data) throw new Error('Vehículo no encontrado');
    return mapVehicleToCar(data);
  },

  createCar: async (data) => {
    const fuelMapToDb = {
      'Gasolina': 'gasolina',
      'Diésel': 'diesel',
      'Eléctrico': 'electrico',
      'Híbrido': 'hibrido',
      'GLP': 'glp'
    };
    const transmissionMapToDb = {
      'Manual': 'manual',
      'Automático': 'automatico'
    };
    const payload = {
      ...data,
      fuel: fuelMapToDb[data.fuel] || data.fuel,
      transmission: transmissionMapToDb[data.transmission] || data.transmission
    };
    const res = await request('/vehicles', { method: 'POST', body: JSON.stringify(payload) });
    return mapVehicleToCar(res.vehicle);
  },

  updateCar: async (id, data) => {
    const fuelMapToDb = {
      'Gasolina': 'gasolina',
      'Diésel': 'diesel',
      'Eléctrico': 'electrico',
      'Híbrido': 'hibrido',
      'GLP': 'glp'
    };
    const transmissionMapToDb = {
      'Manual': 'manual',
      'Automático': 'automatico'
    };
    const payload = {
      ...data,
      fuel: fuelMapToDb[data.fuel] || data.fuel,
      transmission: transmissionMapToDb[data.transmission] || data.transmission
    };
    const res = await request(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    return mapVehicleToCar(res.vehicle);
  },

  deleteCar: async (id) => {
    return request(`/vehicles/${id}`, { method: 'DELETE' });
  },

  getCarsByOwner: async () => {
    const data = await request('/vehicles/my-vehicles');
    return data.map(mapVehicleToCar);
  },

  uploadPhoto: async (carId, photoBlob, fileName, isPrincipal) => {
    const formData = new FormData();
    formData.append('image', photoBlob, fileName);
    formData.append('es_principal', isPrincipal);

    const token = getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/vehicles/${carId}/photos`, {
      method: 'POST',
      headers,
      body: formData
    });
    
    const resData = await res.json();
    if (!res.ok) {
      throw new Error(resData.error || 'Error al subir foto');
    }
    return resData.photo;
  }
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
      fee: Math.round(b.precio_total * 0.1 * 100) / 100,
      total: Math.round(b.precio_total * 1.1 * 100) / 100,
      status: b.estado === 'confirmada' ? 'active' : b.estado === 'en curs' ? 'en_curs' : b.estado === 'cancelada' ? 'cancelled' : b.estado === 'completada' ? 'completed' : b.estado,
      createdAt: b.created_at,
      startDate: b.fecha_inicio,
      endDate: b.fecha_fin,
      propietarioId: b.propietario_id,
      metodo_pago: b.metodo_pago || 'mano'
    }));
  },

  getReservationById: async (id) => {
    const reservations = await reservationsService.getMyReservations();
    return reservations.find(r => r.id === id);
  },

  createReservation: async (carId, startDate, endDate, paymentMethod) => {
    const bookingRes = await request('/bookings', {
      method: 'POST',
      body: JSON.stringify({
        vehicle_id: carId,
        fecha_inicio: new Date(startDate).toISOString(),
        fecha_fin: new Date(endDate).toISOString(),
        metodo_pago: paymentMethod || 'mano'
      })
    });
    return bookingRes.booking;
  },

  cancelReservation: async (id) => {
    return request(`/bookings/${id}/cancel`, { method: 'PUT' });
  },

  completeReservation: async (id) => {
    return request(`/bookings/${id}/complete`, { method: 'PUT' });
  },

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
      date: new Date(r.created_at).toLocaleDateString(),
      comment: r.comentario
    }));
  },

  createReview: (carId, rating, comment, reservationId, ownerId) =>
    request('/reviews', {
      method: 'POST',
      body: JSON.stringify({
        booking_id: reservationId,
        destinatario_id: ownerId,
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
  getMyStats: () => request('/users/stats'),
};

