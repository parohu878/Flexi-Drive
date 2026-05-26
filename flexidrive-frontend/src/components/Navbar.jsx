import { useState, useContext } from 'react';
import { useAuth } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import Icon from './Icon';
import './Navbar.css';

export default function Navbar({ screen, navigate, user, isAuthenticated, onLogin }) {
  const { t } = useContext(LanguageContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useAuth();

  const links = [
    { id: 'home', label: t('home'), icon: 'home' },
    { id: 'search', label: t('search'), icon: 'search' },
    { id: 'publish', label: t('publish'), icon: 'plus' },
    { id: 'profile', label: t('profile'), icon: 'user' },
  ];

  if (user?.role === 'admin') {
    links.push({ id: 'admin', label: 'Admin', icon: 'gear' });
  }

  const handleLogout = () => {
    logout();
    navigate('home');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <div className="navbar-logo" onClick={() => navigate('home')}>
          <img src="/logo.png" alt="FlexiDrive" className="logo-img" />
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
              <div className="navbar-user-card" onClick={() => navigate('profile')}>
                <div className="navbar-user-avatar">{user?.avatar || '??'}</div>
                <span className="navbar-user-name">{user?.name?.split(' ')[0]}</span>
              </div>
              <button className="btn-login" onClick={handleLogout}>{t('logout')}</button>
            </>
          ) : (
            <>
              <button className="btn-login" onClick={onLogin}>{t('login')}</button>
              <button className="btn-register" onClick={() => navigate('publish')}>
                {t('publish_car')}
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
              {t('logout')} ({user?.name?.split(' ')[0]})
            </button>
          ) : (
            <button className="mobile-link" onClick={() => { onLogin(); setMenuOpen(false); }}>
              <Icon name="login" size={16} color="var(--pg)" />
              {t('login')}
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
