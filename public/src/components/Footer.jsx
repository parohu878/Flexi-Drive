import './Footer.css';

export default function Footer({ navigate, screen }) {
  const links = [
    { id: 'home',    icon: '🏠', label: 'Inicio' },
    { id: 'search',  icon: '🔍', label: 'Buscar' },
    { id: 'publish', icon: '＋', label: 'Publicar' },
    { id: 'profile', icon: '👤', label: 'Perfil' },
  ];

  return (
    <footer className="footer">
      {/* Mobile bottom nav */}
      <div className="mobile-nav">
        {links.map(l => (
          <button
            key={l.id}
            className={`mn-item ${screen === l.id ? 'active' : ''}`}
            onClick={() => navigate(l.id)}
          >
            <span className="mn-icon">{l.icon}</span>
            <span className="mn-label">{l.label}</span>
          </button>
        ))}
      </div>

      {/* Desktop footer */}
      <div className="desktop-footer">
        <div className="df-inner">
          <div className="df-brand">
            <div className="df-logo">FD</div>
            <div>
              <div className="df-name">FLEXI DRIVE</div>
              <div className="df-tagline">Reserva un coche al instante</div>
            </div>
          </div>
          <div className="df-links">
            <div className="dfl-col">
              <div className="dfl-title">Plataforma</div>
              <button onClick={() => navigate('search')}>Buscar cotxe</button>
              <button onClick={() => navigate('publish')}>Publicar cotxe</button>
              <button onClick={() => navigate('profile')}>El meu perfil</button>
            </div>
            <div className="dfl-col">
              <div className="dfl-title">Informació</div>
              <button>Com funciona</button>
              <button>Seguretat</button>
              <button>Preguntes freqüents</button>
            </div>
            <div className="dfl-col">
              <div className="dfl-title">Legal</div>
              <button>Termes d'ús</button>
              <button>Privacitat</button>
              <button>Cookies</button>
            </div>
          </div>
        </div>
        <div className="df-bottom">
          <span>© 2026 Flexi Drive. Tots els drets reservats.</span>
          <span>Fet a Barcelona 🇪🇸</span>
        </div>
      </div>
    </footer>
  );
}
