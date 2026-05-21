// ── Demo data: 14 coches con coordenadas reales de Barcelona ──────────────
// Allows the app to work fully standalone without the backend running

export const DEMO_OWNERS = [
  { id: 'o1', name: 'Marc Puig',     avatar: 'MP', email: 'marc@email.com',   rating: 4.9, totalRentals: 47 },
  { id: 'o2', name: 'Laia Torres',   avatar: 'LT', email: 'laia@email.com',   rating: 4.8, totalRentals: 32 },
  { id: 'o3', name: 'Oriol Vidal',   avatar: 'OV', email: 'oriol@email.com',  rating: 5.0, totalRentals: 61 },
  { id: 'o4', name: 'Marta Solé',    avatar: 'MS', email: 'marta@email.com',  rating: 4.7, totalRentals: 28 },
  { id: 'o5', name: 'Arnau Ferrer',  avatar: 'AF', email: 'arnau@email.com',  rating: 4.9, totalRentals: 55 },
  { id: 'o6', name: 'Nuria Costa',   avatar: 'NC', email: 'nuria@email.com',  rating: 4.6, totalRentals: 19 },
  { id: 'o7', name: 'Joan Duran',    avatar: 'JD', email: 'joan@email.com',   rating: 4.8, totalRentals: 42 },
];

export const DEMO_CARS = [
  {
    id: 'c1',
    name: 'Seat León 2021',
    make: 'Seat', model: 'León', year: 2021,
    location: 'Eixample Esquerra', city: 'Barcelona',
    lat: 41.3870, lng: 2.1548,
    pricePerHour: 14, seats: 5,
    fuel: 'Gasolina', transmission: 'Manual',
    color: '#9b4dca',
    rating: 4.8, totalReviews: 23,
    minHours: 1, available: true,
    features: ['A/C', 'Bluetooth', 'USB', 'GPS', 'Càmera enrere'],
    description: 'Seat León en perfecte estat. Ideal per a desplaçaments per la ciutat i voltants. Motor 1.5 TSI amb baix consum.',
    owner: DEMO_OWNERS[0],
    availableFrom: '07:00', availableTo: '22:00',
    dist: 1.2,
    reviewList: [
      { avatar: 'SM', author: 'Sara Martí', rating: 5, date: '10 Mai 2026', comment: 'Cotxe impecable, molt net i el Marc super amable. Repetiré segur!' },
      { avatar: 'PV', author: 'Pau Vidal', rating: 5, date: '3 Mai 2026', comment: 'Tot perfecte, el cotxe anava genial i sense cap problema.' },
      { avatar: 'AG', author: 'Anna García', rating: 4, date: '28 Abr 2026', comment: 'Bona experiència en general, el cotxe tenia una mica de brutícia al darrere.' },
    ],
  },
  {
    id: 'c2',
    name: 'Tesla Model 3 2023',
    make: 'Tesla', model: 'Model 3', year: 2023,
    location: 'Vila Olímpica', city: 'Barcelona',
    lat: 41.3895, lng: 2.1972,
    pricePerHour: 28, seats: 5,
    fuel: 'Eléctrico', transmission: 'Automático',
    color: '#e040fb',
    rating: 4.9, totalReviews: 41,
    minHours: 2, available: true,
    features: ['Autopilot', 'Pantalla tàctil', 'Supercharger', 'A/C', 'Bluetooth', 'USB-C', 'Càmera 360°'],
    description: 'Tesla Model 3 Long Range amb Autopilot. Experiència de conducció premium 100% elèctric. Autonomia 580km.',
    owner: DEMO_OWNERS[1],
    availableFrom: '08:00', availableTo: '21:00',
    dist: 2.8,
    reviewList: [
      { avatar: 'JR', author: 'Jordi Roca', rating: 5, date: '12 Mai 2026', comment: 'Increïble conduir un Tesla! L\'Autopilot és una passada. La Laia molt atenta.' },
      { avatar: 'CF', author: 'Clara Font', rating: 5, date: '8 Mai 2026', comment: 'Primera vegada en un elèctric i ha estat una experiència brutal.' },
    ],
  },
  {
    id: 'c3',
    name: 'BMW Serie 3 2022',
    make: 'BMW', model: 'Serie 3', year: 2022,
    location: 'Sarrià-Sant Gervasi', city: 'Barcelona',
    lat: 41.3985, lng: 2.1359,
    pricePerHour: 25, seats: 5,
    fuel: 'Diésel', transmission: 'Automático',
    color: '#4db8ff',
    rating: 4.7, totalReviews: 18,
    minHours: 2, available: true,
    features: ['Seients pell', 'GPS', 'A/C bizona', 'Bluetooth', 'Càmera enrere', 'Sensors aparcament'],
    description: 'BMW 320d M Sport en perfecte estat. Interior de pell, acabats premium. Ideal per a ocasions especials o viatges de negocis.',
    owner: DEMO_OWNERS[2],
    availableFrom: '09:00', availableTo: '20:00',
    dist: 3.5,
    reviewList: [
      { avatar: 'MP', author: 'Marc Puig', rating: 5, date: '5 Mai 2026', comment: 'Cotxe espectacular, l\'Oriol és un gran amfitrió. Tot perfecte.' },
    ],
  },
  {
    id: 'c4',
    name: 'Renault Clio 2020',
    make: 'Renault', model: 'Clio', year: 2020,
    location: 'Gràcia', city: 'Barcelona',
    lat: 41.4037, lng: 2.1567,
    pricePerHour: 9, seats: 5,
    fuel: 'Gasolina', transmission: 'Manual',
    color: '#5dcaa5',
    rating: 4.5, totalReviews: 35,
    minHours: 1, available: true,
    features: ['A/C', 'Bluetooth', 'USB', 'Radi FM'],
    description: 'Renault Clio econòmic i fàcil de conduir. Perfecte per a la ciutat. Consum molt baix.',
    owner: DEMO_OWNERS[3],
    availableFrom: '07:00', availableTo: '23:00',
    dist: 0.8,
    reviewList: [
      { avatar: 'LT', author: 'Laia Torres', rating: 4, date: '1 Mai 2026', comment: 'Perfecte per anar per Barcelona. Petit, àgil i fàcil d\'aparcar.' },
      { avatar: 'RB', author: 'Ricard Bosch', rating: 5, date: '25 Abr 2026', comment: 'Molt bona relació qualitat-preu. La Marta molt amable.' },
    ],
  },
  {
    id: 'c5',
    name: 'VW Golf 2021',
    make: 'Volkswagen', model: 'Golf', year: 2021,
    location: 'Sant Martí', city: 'Barcelona',
    lat: 41.4116, lng: 2.1921,
    pricePerHour: 16, seats: 5,
    fuel: 'Gasolina', transmission: 'Automático',
    color: '#ff8c42',
    rating: 4.9, totalReviews: 52,
    minHours: 1, available: true,
    features: ['A/C', 'Bluetooth', 'USB', 'GPS', 'Sensors aparcament', 'Llums LED'],
    description: 'VW Golf GTI Line amb canvi automàtic DSG. Motor 1.5 eTSI amb tecnologia mild hybrid. Molt equipat.',
    owner: DEMO_OWNERS[4],
    availableFrom: '06:00', availableTo: '22:00',
    dist: 1.9,
    reviewList: [
      { avatar: 'MS', author: 'Marta Solé', rating: 5, date: '11 Mai 2026', comment: 'El millor cotxe que he llogat! L\'Arnau és genial, el cotxe impecable.' },
      { avatar: 'DL', author: 'David López', rating: 5, date: '6 Mai 2026', comment: 'Golf automàtic, perfecte. Tot molt net i ben cuidat.' },
    ],
  },
  {
    id: 'c6',
    name: 'Toyota Yaris Hybrid 2022',
    make: 'Toyota', model: 'Yaris', year: 2022,
    location: 'Poble Sec', city: 'Barcelona',
    lat: 41.3725, lng: 2.1642,
    pricePerHour: 11, seats: 5,
    fuel: 'Híbrido', transmission: 'Automático',
    color: '#c47dff',
    rating: 4.6, totalReviews: 19,
    minHours: 1, available: true,
    features: ['A/C', 'Bluetooth', 'Mode ECO', 'Càmera enrere', 'USB'],
    description: 'Toyota Yaris Hybrid amb consum extremadament baix (3.5L/100km). Ideal per a conducció urbana silenciosa.',
    owner: DEMO_OWNERS[5],
    availableFrom: '08:00', availableTo: '20:00',
    dist: 2.1,
    reviewList: [],
  },
  {
    id: 'c7',
    name: 'Audi A3 Sportback 2021',
    make: 'Audi', model: 'A3', year: 2021,
    location: 'Les Corts', city: 'Barcelona',
    lat: 41.3826, lng: 2.1285,
    pricePerHour: 22, seats: 5,
    fuel: 'Gasolina', transmission: 'Automático',
    color: '#9b4dca',
    rating: 4.8, totalReviews: 27,
    minHours: 2, available: true,
    features: ['MMI Touch', 'A/C bizona', 'Bluetooth', 'USB-C', 'GPS', 'Faros LED Matrix', 'Sensors'],
    description: 'Audi A3 Sportback 35 TFSI S-Tronic. Interior Virtual Cockpit, acabats premium.',
    owner: DEMO_OWNERS[6],
    availableFrom: '08:00', availableTo: '21:00',
    dist: 3.1,
    reviewList: [
      { avatar: 'NC', author: 'Nuria Costa', rating: 5, date: '9 Mai 2026', comment: 'Cotxe fantàstic, molt còmode i ben equipat. En Joan molt amable.' },
    ],
  },
  {
    id: 'c8',
    name: 'Citroën C3 2020',
    make: 'Citroën', model: 'C3', year: 2020,
    location: 'Sants', city: 'Barcelona',
    lat: 41.3741, lng: 2.1335,
    pricePerHour: 8, seats: 5,
    fuel: 'Gasolina', transmission: 'Manual',
    color: '#e040fb',
    rating: 4.3, totalReviews: 14,
    minHours: 1, available: true,
    features: ['A/C', 'Bluetooth', 'USB'],
    description: 'Citroën C3 econòmic i divertit. Suspensió molt còmoda. Perfecte per a escapades.',
    owner: DEMO_OWNERS[0],
    availableFrom: '07:00', availableTo: '22:00',
    dist: 2.4,
    reviewList: [],
  },
  {
    id: 'c9',
    name: 'Mercedes CLA 2023',
    make: 'Mercedes', model: 'CLA', year: 2023,
    location: 'Diagonal Mar', city: 'Barcelona',
    lat: 41.4098, lng: 2.2163,
    pricePerHour: 32, seats: 5,
    fuel: 'Gasolina', transmission: 'Automático',
    color: '#4db8ff',
    rating: 5.0, totalReviews: 8,
    minHours: 3, available: true,
    features: ['MBUX', 'Seients pell', 'A/C bizona', 'GPS', 'Càmera 360°', 'Ambient Lighting', 'Keyless Go'],
    description: 'Mercedes CLA 200 AMG Line. Cotxe premium amb tot l\'equipament. Perfecte per a ocasions especials.',
    owner: DEMO_OWNERS[2],
    availableFrom: '09:00', availableTo: '19:00',
    dist: 4.2,
    reviewList: [
      { avatar: 'EM', author: 'Elena Moreno', rating: 5, date: '13 Mai 2026', comment: 'WOW! Cotxe espectacular. El millor lloguer que he fet mai.' },
    ],
  },
  {
    id: 'c10',
    name: 'FIAT 500 Elèctric 2022',
    make: 'FIAT', model: '500e', year: 2022,
    location: 'El Born', city: 'Barcelona',
    lat: 41.3854, lng: 2.1835,
    pricePerHour: 13, seats: 4,
    fuel: 'Eléctrico', transmission: 'Automático',
    color: '#5dcaa5',
    rating: 4.7, totalReviews: 22,
    minHours: 1, available: true,
    features: ['Pantalla tàctil 10"', 'A/C', 'Bluetooth', 'Apple CarPlay', 'Càmera enrere', 'Conducció amb un pedal'],
    description: 'FIAT 500e elèctric, perfecte per a la ciutat! Molt divertit de conduir. Autonomia 320km.',
    owner: DEMO_OWNERS[3],
    availableFrom: '08:00', availableTo: '21:00',
    dist: 1.6,
    reviewList: [
      { avatar: 'AF', author: 'Arnau Ferrer', rating: 5, date: '7 Mai 2026', comment: 'Adorable! Petit, àgil i elèctric. Perfecte per passejar per Barcelona.' },
    ],
  },
  {
    id: 'c11',
    name: 'Hyundai Tucson 2022',
    make: 'Hyundai', model: 'Tucson', year: 2022,
    location: 'Poblenou', city: 'Barcelona',
    lat: 41.4016, lng: 2.2004,
    pricePerHour: 19, seats: 5,
    fuel: 'Híbrido', transmission: 'Automático',
    color: '#ff8c42',
    rating: 4.6, totalReviews: 15,
    minHours: 2, available: true,
    features: ['A/C bizona', 'Bluetooth', 'GPS', 'Càmera 360°', 'Sensors aparcament', 'Seients calefactables'],
    description: 'Hyundai Tucson Hybrid amb molt d\'espai. Ideal per a families o excursions fora de la ciutat.',
    owner: DEMO_OWNERS[4],
    availableFrom: '07:00', availableTo: '22:00',
    dist: 2.7,
    reviewList: [],
  },
  {
    id: 'c12',
    name: 'Peugeot 208 2021',
    make: 'Peugeot', model: '208', year: 2021,
    location: 'Raval', city: 'Barcelona',
    lat: 41.3797, lng: 2.1688,
    pricePerHour: 10, seats: 5,
    fuel: 'Diésel', transmission: 'Manual',
    color: '#c47dff',
    rating: 4.4, totalReviews: 31,
    minHours: 1, available: true,
    features: ['A/C', 'Bluetooth', 'USB', 'i-Cockpit'],
    description: 'Peugeot 208 amb disseny modern i econòmic. Interior i-Cockpit innovador. Baix consum.',
    owner: DEMO_OWNERS[5],
    availableFrom: '06:00', availableTo: '23:00',
    dist: 0.5,
    reviewList: [
      { avatar: 'JD', author: 'Joan Duran', rating: 4, date: '2 Mai 2026', comment: 'Bona opció econòmica. El cotxe està bé, còmode i pràctic.' },
    ],
  },
  {
    id: 'c13',
    name: 'Ford Mustang Mach-E 2023',
    make: 'Ford', model: 'Mustang Mach-E', year: 2023,
    location: 'Pedralbes', city: 'Barcelona',
    lat: 41.3882, lng: 2.1136,
    pricePerHour: 35, seats: 5,
    fuel: 'Eléctrico', transmission: 'Automático',
    color: '#e040fb',
    rating: 4.9, totalReviews: 11,
    minHours: 3, available: true,
    features: ['SYNC 4A 15.5"', 'A/C', 'Bluetooth', 'Apple CarPlay', 'Conducció assistida', 'So B&O', 'Portó elèctric'],
    description: 'Ford Mustang Mach-E Premium AWD. Potència i tecnologia elèctrica en format SUV. Autonomia 540km.',
    owner: DEMO_OWNERS[1],
    availableFrom: '09:00', availableTo: '20:00',
    dist: 5.1,
    reviewList: [
      { avatar: 'OV', author: 'Oriol Vidal', rating: 5, date: '11 Mai 2026', comment: 'Espectacular! La potència és increïble i el disseny brutal.' },
    ],
  },
  {
    id: 'c14',
    name: 'CUPRA Formentor 2022',
    make: 'CUPRA', model: 'Formentor', year: 2022,
    location: 'Horta-Guinardó', city: 'Barcelona',
    lat: 41.4197, lng: 2.1655,
    pricePerHour: 24, seats: 5,
    fuel: 'Gasolina', transmission: 'Automático',
    color: '#9b4dca',
    rating: 4.8, totalReviews: 20,
    minHours: 2, available: true,
    features: ['A/C bizona', 'GPS', 'Bluetooth', 'Seients esportius', 'Mode CUPRA', 'Càmera enrere', 'Matrix LED'],
    description: 'CUPRA Formentor VZ 2.0 TSI 310CV. Esportiu i pràctic a la vegada. Acabats premium.',
    owner: DEMO_OWNERS[6],
    availableFrom: '08:00', availableTo: '21:00',
    dist: 3.8,
    reviewList: [
      { avatar: 'LT', author: 'Laia Torres', rating: 5, date: '10 Mai 2026', comment: 'El cotxe dels somnis! Potent, còmode i amb un disseny brutal.' },
      { avatar: 'MS', author: 'Marta Solé', rating: 5, date: '4 Mai 2026', comment: 'M\'encanta el mode CUPRA, brutal experiència de conducció.' },
    ],
  },
];

// ── Demo user for offline login ──
export const DEMO_USER = {
  id: 'demo-user',
  name: 'Joan Duran',
  email: 'joan@example.com',
  avatar: 'JD',
  phone: '+34 612 345 678',
  city: 'Barcelona',
  memberSince: '2025',
  rating: 4.8,
  verified: true,
};

// ── Demo reservations ──
export const DEMO_RESERVATIONS = [
  { id: 'r1', carId: 'c1', car: DEMO_CARS[0], date: '28 Abr 2026', startTime: '10:00', hours: 3, price: 42,  fee: 4,  total: 46,  status: 'active',    createdAt: '2026-04-28T08:00:00Z' },
  { id: 'r2', carId: 'c2', car: DEMO_CARS[1], date: '20 Abr 2026', startTime: '14:00', hours: 2, price: 56,  fee: 6,  total: 62,  status: 'completed', createdAt: '2026-04-20T12:00:00Z' },
  { id: 'r3', carId: 'c3', car: DEMO_CARS[2], date: '12 Abr 2026', startTime: '09:00', hours: 4, price: 100, fee: 10, total: 110, status: 'completed', createdAt: '2026-04-12T07:00:00Z' },
  { id: 'r4', carId: 'c4', car: DEMO_CARS[3], date: '2 Abr 2026',  startTime: '16:00', hours: 5, price: 45,  fee: 5,  total: 50,  status: 'completed', createdAt: '2026-04-02T14:00:00Z' },
  { id: 'r5', carId: 'c5', car: DEMO_CARS[4], date: '18 Mar 2026', startTime: '11:00', hours: 3, price: 48,  fee: 5,  total: 53,  status: 'cancelled', createdAt: '2026-03-18T09:00:00Z' },
];

// ── Helper functions ──
export function filterCars(cars, { query, maxPrice, fuel, transmission, sortBy, userLat, userLng } = {}) {
  let filtered = [...cars];

  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.make.toLowerCase().includes(q) ||
      c.model.toLowerCase().includes(q) ||
      c.owner?.name?.toLowerCase().includes(q)
    );
  }

  if (maxPrice && maxPrice < 100) {
    filtered = filtered.filter(c => c.pricePerHour <= maxPrice);
  }

  if (fuel && fuel !== 'Tots') {
    filtered = filtered.filter(c => c.fuel === fuel);
  }

  if (transmission && transmission !== 'Tots') {
    filtered = filtered.filter(c => c.transmission === transmission);
  }

  // Recalculate distances if user position provided
  if (userLat && userLng) {
    filtered = filtered.map(c => ({
      ...c,
      dist: haversine(userLat, userLng, c.lat, c.lng),
    }));
  }

  // Sort
  if (sortBy === 'price_asc' || sortBy === 'price') {
    filtered.sort((a, b) => a.pricePerHour - b.pricePerHour);
  } else if (sortBy === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else {
    filtered.sort((a, b) => (a.dist || 999) - (b.dist || 999));
  }

  return filtered;
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 10) / 10;
}
