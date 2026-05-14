import { useState } from 'react';
import Navbar from './components/Navbar';
import HomeScreen from './components/HomeScreen';
import SearchScreen from './components/SearchScreen';
import CarDetail from './components/CarDetail';
import PublishScreen from './components/PublishScreen';
import ProfileScreen from './components/ProfileScreen';
import Footer from './components/Footer';

const CARS = [
  {
    id: 1, name: 'Seat León 2021', make: 'Seat', model: 'León',
    location: 'Eixample', user: 'Marc R.', ownerName: 'Marc Roca', avatar: 'MR',
    price: 18, dist: 0.4, seats: 5, rating: 4.9, reviews: 47,
    fuel: 'Gasolina', transmission: 'Manual', year: 2021, minHours: 1, color: '#9b4dca',
    features: ['Bluetooth', 'A/C', 'USB', 'Parktronic'],
    description: 'Cotxe en perfecte estat. Climatitzador, Bluetooth, aparcament fàcil a la zona.',
    availableFrom: '08:00', availableTo: '22:00',
    reviewList: [
      { author: 'Joan D.', avatar: 'JD', rating: 5, comment: 'Cotxe perfecte, Marc molt amable!', date: '20 Abr 2026' },
      { author: 'Sara M.', avatar: 'SM', rating: 5, comment: 'Tot molt bé, puntual i net.', date: '14 Abr 2026' },
      { author: 'Pau V.',  avatar: 'PV', rating: 4, comment: 'Bona experiència, repetiré.',   date: '5 Abr 2026' },
    ],
  },
  {
    id: 2, name: 'BMW Serie 3 2022', make: 'BMW', model: 'Serie 3',
    location: 'Gràcia', user: 'Laura P.', ownerName: 'Laura Puig', avatar: 'LP',
    price: 22, dist: 0.8, seats: 5, rating: 4.8, reviews: 31,
    fuel: 'Diésel', transmission: 'Automático', year: 2022, minHours: 2, color: '#e040fb',
    features: ['GPS', 'A/C', 'Bluetooth', 'Carregador wireless'],
    description: 'BMW premium, molt còmode per viatges llargs. Navegador integrat.',
    availableFrom: '09:00', availableTo: '20:00',
    reviewList: [
      { author: 'Marta K.', avatar: 'MK', rating: 5, comment: 'Increïble cotxe, molt còmode.', date: '22 Abr 2026' },
      { author: 'Alex R.',  avatar: 'AR', rating: 4, comment: 'Laura molt atenta.',           date: '10 Abr 2026' },
    ],
  },
  {
    id: 3, name: 'Renault Clio 2020', make: 'Renault', model: 'Clio',
    location: 'Sagrada Família', user: 'Ana G.', ownerName: 'Ana García', avatar: 'AG',
    price: 15, dist: 1.2, seats: 5, rating: 5.0, reviews: 63,
    fuel: 'Gasolina', transmission: 'Manual', year: 2020, minHours: 1, color: '#c47dff',
    features: ['A/C', 'Bluetooth', 'USB'],
    description: "Molt econòmic i fàcil d'aparcar. Ideal per la ciutat.",
    availableFrom: '07:00', availableTo: '23:00',
    reviewList: [
      { author: 'Núria F.', avatar: 'NF', rating: 5, comment: '5 estrelles sense dubte!',          date: '25 Abr 2026' },
      { author: 'Joan D.',  avatar: 'JD', rating: 5, comment: 'El millor per moure pel centre.', date: '18 Abr 2026' },
    ],
  },
  {
    id: 4, name: 'Tesla Model 3 2023', make: 'Tesla', model: 'Model 3',
    location: 'Sant Antoni', user: 'Jordi M.', ownerName: 'Jordi Mas', avatar: 'JM',
    price: 28, dist: 1.5, seats: 5, rating: 4.7, reviews: 19,
    fuel: 'Eléctrico', transmission: 'Automático', year: 2023, minHours: 1, color: '#5dcaa5',
    features: ['Autopilot', 'Supercharger', 'A/C', 'Pantalla 15"'],
    description: "100% elèctric. Autopilot, pantalla gran, molt silenciós.",
    availableFrom: '06:00', availableTo: '23:59',
    reviewList: [
      { author: 'Clara B.',  avatar: 'CB', rating: 5, comment: 'Semblava ciència ficció!', date: '26 Abr 2026' },
      { author: 'Miquel S.', avatar: 'MS', rating: 4, comment: 'Molt bo però esperava més autonomia.', date: '15 Abr 2026' },
    ],
  },
  {
    id: 5, name: 'Volkswagen Golf 2021', make: 'Volkswagen', model: 'Golf',
    location: 'Poblenou', user: 'Carles N.', ownerName: 'Carles Nogués', avatar: 'CN',
    price: 17, dist: 2.1, seats: 5, rating: 4.6, reviews: 28,
    fuel: 'Gasolina', transmission: 'Manual', year: 2021, minHours: 1, color: '#4db8ff',
    features: ['Bluetooth', 'A/C', 'Càmera marxa enrere'],
    description: 'Golf clàssic en molt bon estat. Molt versàtil per qualsevol ús.',
    availableFrom: '08:00', availableTo: '21:00',
    reviewList: [
      { author: 'Isabel T.', avatar: 'IT', rating: 5, comment: "Perfecte per moure's pel 22@!", date: '21 Abr 2026' },
    ],
  },
  {
    id: 6, name: 'Toyota RAV4 Híbrid 2022', make: 'Toyota', model: 'RAV4',
    location: 'Les Corts', user: 'Rosa V.', ownerName: 'Rosa Vila', avatar: 'RV',
    price: 25, dist: 3.0, seats: 5, rating: 4.9, reviews: 35,
    fuel: 'Híbrido', transmission: 'Automático', year: 2022, minHours: 2, color: '#ff8c42',
    features: ['GPS', 'A/C', 'Bluetooth', 'Tracció total', 'Mode eco'],
    description: 'SUV híbrida ampla i eficient. Ideal per families o viatjar fora de la ciutat.',
    availableFrom: '07:00', availableTo: '22:00',
    reviewList: [
      { author: 'Ferran A.', avatar: 'FA', rating: 5, comment: 'Perfecta per un cap de setmana a la muntanya!', date: '24 Abr 2026' },
      { author: 'Laia C.',   avatar: 'LC', rating: 5, comment: 'Molt còmoda i espaciosa. Repetiré.',           date: '17 Abr 2026' },
    ],
  },
];

export default function App() {
  const [screen, setScreen] = useState('home');
  const [selectedCar, setSelectedCar] = useState(null);
  const [toast, setToast] = useState(null);

  const navigate = (s, car = null) => {
    if (car) setSelectedCar(car);
    setScreen(s);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar screen={screen} navigate={navigate} />
      <main style={{ flex: 1 }}>
        {screen === 'home'    && <HomeScreen navigate={navigate} cars={CARS} />}
        {screen === 'search'  && <SearchScreen navigate={navigate} cars={CARS} />}
        {screen === 'detail'  && <CarDetail car={selectedCar} navigate={navigate} showToast={showToast} />}
        {screen === 'publish' && <PublishScreen showToast={showToast} navigate={navigate} />}
        {screen === 'profile' && <ProfileScreen navigate={navigate} cars={CARS} />}
      </main>
      <Footer navigate={navigate} screen={screen} />

      {toast && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          background: toast.type === 'success'
            ? 'linear-gradient(135deg, #1e7a5c, #22aa7a)'
            : 'linear-gradient(135deg, #7a1e1e, #aa2222)',
          color: '#fff', padding: '12px 28px', borderRadius: 12,
          fontSize: 15, fontWeight: 600, zIndex: 9999,
          boxShadow: '0 8px 32px rgba(0,0,0,.5)',
          animation: 'fadeInUp .3s ease', whiteSpace: 'nowrap', letterSpacing: '.3px',
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
