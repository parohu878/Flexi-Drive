import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { ReservationsProvider } from './context/ReservationsContext';
import { LanguageProvider } from './context/LanguageContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <LanguageProvider>
        <FavoritesProvider>
          <ReservationsProvider>
            <App />
          </ReservationsProvider>
        </FavoritesProvider>
      </LanguageProvider>
    </AuthProvider>
  </React.StrictMode>
);
