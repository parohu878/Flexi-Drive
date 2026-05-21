import { useState } from 'react';
import './Navbar.css';

export default function Navbar({ screen, navigate }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { id: 'home', label: 'Inicio' },
    { id: 'search', label: 'Buscar' },
    { id: 'publish', label: 'Publicar' },
    { id: 'profile', label: 'Perfil' },
  ];

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
          <button className="btn-login">Entrar</button>
          <button className="btn-register" onClick={() => navigate('publish')}>
            Publicar coche
          </button>
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
              {l.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
