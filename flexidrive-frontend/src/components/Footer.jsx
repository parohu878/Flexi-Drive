import './Footer.css';
import Icon from './Icon';

export default function Footer({ navigate, screen }) {
  const links = [
    { id: 'home',    icon: 'home',   label: 'Inicio' },
    { id: 'search',  icon: 'search', label: 'Buscar' },
    { id: 'publish', icon: 'plus',   label: 'Publicar' },
    { id: 'profile', icon: 'user',   label: 'Perfil' },
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
            <span className="mn-icon">
              <Icon name={l.icon} size={18} color={screen === l.id ? '#c47dff' : 'var(--td)'} />
            </span>
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
          <span>Fet a Barcelona</span>
        </div>
      </div>
    </footer>
  );
}
