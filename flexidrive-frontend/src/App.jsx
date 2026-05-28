import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { carsService } from './services/api';
import { getDistance } from './utils/distance';
// 
// Fallback to empty list if API fails
// setCars([]);

import Navbar from './components/Navbar';
import HomeScreen from './components/HomeScreen';
import SearchScreen from './components/SearchScreen';
import CarDetail from './components/CarDetail';
import PublishScreen from './components/PublishScreen';
import ProfileScreen from './components/ProfileScreen';
import ChatScreen from './components/ChatScreen';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import Icon from './components/Icon';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [screen, setScreen] = useState('home');
  const [prevScreen, setPrevScreen] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);
  const [toast, setToast] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [cars, setCars] = useState([]);
  const [carsLoading, setCarsLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [userPos, setUserPos] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
        () => setUserPos([41.3874, 2.1686])
      );
    } else {
      setUserPos([41.3874, 2.1686]);
    }
  }, []);

  const carsWithDistance = cars.map(car => {
    if (userPos && car.lat && car.lng) {
      return {
        ...car,
        dist: getDistance(userPos[0], userPos[1], car.lat, car.lng)
      };
    }
    return car;
  });

  const selectedCarWithDistance = selectedCar && userPos && selectedCar.lat && selectedCar.lng ? {
    ...selectedCar,
    dist: getDistance(userPos[0], userPos[1], selectedCar.lat, selectedCar.lng)
  } : selectedCar;

  // Load cars from API on mount (with demo fallback)
  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async (params = {}) => {
    setCarsLoading(true);
    try {
      const res = await carsService.getCars({ available: 'true', limit: 50, ...params });
      setCars(res.data || []);
    } catch (err) {
      console.error('Error loading cars:', err);
      setCars([]);
    } finally {
      setCarsLoading(false);
    }
  };

  const navigate = (s, car = null) => {
    // Protected routes
    if ((s === 'publish' || s === 'profile') && !isAuthenticated) {
      setShowAuth(true);
      return;
    }
    if (s === 'admin' && (!isAuthenticated || user?.role !== 'admin')) {
      s = 'home';
    }
    if (car) setSelectedCar(car);

    // Screen transition
    setTransitioning(true);
    setPrevScreen(screen);
    setTimeout(() => {
      setScreen(s);
      setTransitioning(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 150);
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 3500);
  };

  // Show loading spinner while auth initializes
  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="app-loader" />
          <div style={{ color: 'var(--td)', fontSize: 14, marginTop: 16 }}>Carregant FlexiDrive...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar
        screen={screen}
        navigate={navigate}
        user={user}
        isAuthenticated={isAuthenticated}
        onLogin={() => setShowAuth(true)}
      />
      <main style={{ flex: 1 }} className={transitioning ? 'screen-exit' : 'screen-enter'}>
        {screen === 'home'    && <HomeScreen navigate={navigate} cars={carsWithDistance} loading={carsLoading} />}
        {screen === 'search'  && <SearchScreen navigate={navigate} cars={carsWithDistance} loadCars={loadCars} loading={carsLoading} userPos={userPos} />}
        {screen === 'detail'  && <CarDetail car={selectedCarWithDistance} navigate={navigate} showToast={showToast} onRequireAuth={() => setShowAuth(true)} userPos={userPos} />}
        {screen === 'publish' && <PublishScreen showToast={showToast} navigate={navigate} onCarCreated={loadCars} />}
        {screen === 'profile' && <ProfileScreen navigate={navigate} showToast={showToast} cars={cars} onRequireAuth={() => setShowAuth(true)} />}
        {screen === 'chat'    && <ChatScreen navigate={navigate} />}
        {screen === 'admin'   && <AdminDashboard navigate={navigate} showToast={showToast} />}
      </main>
      <Footer navigate={navigate} screen={screen} showToast={showToast} />

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {toast && (
        <div className="toast-notification" data-type={toast.type} key={toast.id}>
          <div className="toast-icon">
            <Icon name={toast.type === 'success' ? 'check' : 'warning'} size={13} color="#fff" />
          </div>
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
