import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { ReservationsProvider } from './context/ReservationsContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <FavoritesProvider>
        <ReservationsProvider>
          <App />
        </ReservationsProvider>
      </FavoritesProvider>
    </AuthProvider>
  </React.StrictMode>
);
