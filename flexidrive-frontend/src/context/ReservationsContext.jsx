import { createContext, useContext, useState, useEffect, useCallback } from 'react';


const ReservationsContext = createContext(null);
const STORAGE_KEY = 'fd_reservations';

export function ReservationsProvider({ children }) {
  const [reservations, setReservations] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return stored && stored.length > 0 ? stored : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
  }, [reservations]);

  const addReservation = useCallback((reservation) => {
    const newRes = {
      ...reservation,
      id: 'r' + Date.now(),
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    setReservations(prev => [newRes, ...prev]);
    return newRes;
  }, []);

  const cancelReservation = useCallback((id) => {
    setReservations(prev =>
      prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r)
    );
  }, []);

  const completeReservation = useCallback((id) => {
    setReservations(prev =>
      prev.map(r => r.id === id ? { ...r, status: 'completed' } : r)
    );
  }, []);

  const getByStatus = useCallback((status) => {
    if (!status || status === 'all') return reservations;
    return reservations.filter(r => r.status === status);
  }, [reservations]);

  const stats = {
    total: reservations.length,
    active: reservations.filter(r => r.status === 'active').length,
    completed: reservations.filter(r => r.status === 'completed').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
    totalSpent: reservations.filter(r => r.status === 'completed').reduce((s, r) => s + (r.total || r.price || 0), 0),
  };

  return (
    <ReservationsContext.Provider value={{ reservations, addReservation, cancelReservation, completeReservation, getByStatus, stats }}>
      {children}
    </ReservationsContext.Provider>
  );
}

export function useReservations() {
  const ctx = useContext(ReservationsContext);
  if (!ctx) throw new Error('useReservations must be used within ReservationsProvider');
  return ctx;
}
