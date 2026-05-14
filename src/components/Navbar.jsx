import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Icon from './Icon';
import './Navbar.css';

export default function Navbar({ screen, navigate, user, isAuthenticated, onLogin }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useAuth();

  const links = [
    { id: 'home', label: 'Inicio', icon: 'home' },
    { id: 'search', label: 'Buscar', icon: 'search' },
    { id: 'publish', label: 'Publicar', icon: 'plus' },
    { id: 'profile', label: 'Perfil', icon: 'user' },
  ];

  const handleLogout = () => {
    logout();
    navigate('home');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <div className="navbar-logo" onClick={() => navigate('home')}>
          <div className="logo-orb">FD</div>
          <span className="logo-text">FLEXI<span className="logo-accent">DRIVE</span></span>
        </div>

        {/* Desktop links */}
        <div className="navbar-links">
          {links.map(l => (
            <button
              key={l.id}
              className={`nav-link ${screen === l.id ? 'active' : ''}`}
              onClick={() => navigate(l.id)}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="navbar-cta">
          {isAuthenticated ? (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '6px 14px', borderRadius: 10,
                background: 'rgba(155,77,202,0.1)',
                border: '1px solid rgba(155,77,202,0.2)',
                cursor: 'pointer',
              }} onClick={() => navigate('profile')}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: 'linear-gradient(135deg, #9b4dca, #e040fb)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: '#fff',
                }}>{user?.avatar || '??'}</div>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#e8e8f2' }}>{user?.name?.split(' ')[0]}</span>
              </div>
              <button className="btn-login" onClick={handleLogout}>Sortir</button>
            </>
          ) : (
            <>
              <button className="btn-login" onClick={onLogin}>Entrar</button>
              <button className="btn-register" onClick={() => navigate('publish')}>
                Publicar coche
              </button>
            </>
          )}
          {/* Hamburger */}
          <button
            className="hamburger"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Menu"
          >
            <span className={menuOpen ? 'hb-line open' : 'hb-line'} />
            <span className={menuOpen ? 'hb-line open mid' : 'hb-line mid'} />
            <span className={menuOpen ? 'hb-line open' : 'hb-line'} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="mobile-menu">
          {links.map(l => (
            <button
              key={l.id}
              className={`mobile-link ${screen === l.id ? 'active' : ''}`}
              onClick={() => { navigate(l.id); setMenuOpen(false); }}
            >
              <Icon name={l.icon} size={16} color="var(--pg)" />
              {l.label}
            </button>
          ))}
          {isAuthenticated ? (
            <button className="mobile-link" onClick={() => { handleLogout(); setMenuOpen(false); }}>
              <Icon name="logout" size={16} color="var(--pg)" />
              Sortir ({user?.name?.split(' ')[0]})
            </button>
          ) : (
            <button className="mobile-link" onClick={() => { onLogin(); setMenuOpen(false); }}>
              <Icon name="login" size={16} color="var(--pg)" />
              Entrar
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
