import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { reservationsService } from '../services/api';

const ReservationsContext = createContext(null);

export function ReservationsProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadReservations = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setReservations([]);
      return;
    }
    setLoading(true);
    try {
      const data = await reservationsService.getMyReservations();
      const updated = data.map(r => {
        const now = new Date();
        const start = new Date(r.startDate);
        const end = new Date(r.endDate);

        if (r.status === 'active' || r.status === 'en_curs') {
          if (now >= end) {
            return { ...r, status: 'completed' };
          } else if (now >= start) {
            return { ...r, status: 'en_curs' };
          }
        }
        return r;
      });
      setReservations(updated);
    } catch (e) {
      console.error('Error loading reservations:', e);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const addReservation = useCallback(async (carId, startDate, endDate, paymentMethod) => {
    try {
      const newRes = await reservationsService.createReservation(carId, startDate, endDate, paymentMethod);
      await loadReservations();
      return newRes;
    } catch (error) {
      throw error;
    }
  }, [loadReservations]);

  const cancelReservation = useCallback(async (id) => {
    try {
      await reservationsService.cancelReservation(id);
      await loadReservations();
    } catch (error) {
      throw error;
    }
  }, [loadReservations]);

  const completeReservation = useCallback(async (id) => {
    try {
      await reservationsService.completeReservation(id);
      await loadReservations();
    } catch (error) {
      throw error;
    }
  }, [loadReservations]);

  const getByStatus = useCallback((status) => {
    if (!status || status === 'all') return reservations;
    return reservations.filter(r => r.status === status);
  }, [reservations]);

  const stats = {
    total: reservations.length,
    active: reservations.filter(r => r.status === 'active' || r.status === 'en_curs').length,
    completed: reservations.filter(r => r.status === 'completed').length,
    cancelled: reservations.filter(r => r.status === 'cancelada' || r.status === 'cancelled').length,
    totalSpent: Math.round(reservations.filter(r => r.status === 'completed').reduce((s, r) => s + (r.total || r.price || 0), 0) * 100) / 100,
  };

  return (
    <ReservationsContext.Provider value={{ reservations, loading, addReservation, cancelReservation, completeReservation, getByStatus, stats, loadReservations }}>
      {children}
    </ReservationsContext.Provider>
  );
}

export function useReservations() {
  const ctx = useContext(ReservationsContext);
  if (!ctx) throw new Error('useReservations must be used within ReservationsProvider');
  return ctx;
}

