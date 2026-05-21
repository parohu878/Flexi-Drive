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
        <div className="df-top-bar" />
        <div className="df-inner">
          {/* Brand */}
          <div className="df-brand-col">
            <div className="df-brand">
              <div className="df-logo">
                <span className="df-logo-text">FD</span>
                <div className="df-logo-ring" />
              </div>
              <div>
                <div className="df-name">FLEXI<span className="df-name-accent">DRIVE</span></div>
                <div className="df-tagline">La plataforma P2P de cotxes · Barcelona</div>
              </div>
            </div>
            <p className="df-about">
              Connectem propietaris de vehicles amb conductors de confiança. Sense intermediaris, sense comissions ocultes. Lloguer entre particulars fàcil, segur i a bon preu.
            </p>
            <div className="df-socials">
              <button className="social-btn" title="Instagram" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg>
              </button>
              <button className="social-btn" title="Twitter/X" aria-label="Twitter">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L2.25 2.25h5.02l4.26 5.636 5.714-5.636zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
              </button>
              <button className="social-btn" title="LinkedIn" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
              </button>
              <button className="social-btn" title="TikTok" aria-label="TikTok">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.25 8.25 0 004.83 1.54V6.77a4.85 4.85 0 01-1.06-.08z"/></svg>
              </button>
            </div>
          </div>

          {/* Links */}
          <div className="df-links">
            <div className="dfl-col">
              <div className="dfl-title">Plataforma</div>
              <button onClick={() => navigate('search')}>Buscar cotxe</button>
              <button onClick={() => navigate('publish')}>Publicar cotxe</button>
              <button onClick={() => navigate('profile')}>El meu perfil</button>
              <button onClick={() => navigate('search')}>Mapa de cotxes</button>
            </div>
            <div className="dfl-col">
              <div className="dfl-title">Informació</div>
              <button>Com funciona</button>
              <button>Seguretat</button>
              <button>Assegurança</button>
              <button>Preguntes freqüents</button>
            </div>
            <div className="dfl-col">
              <div className="dfl-title">Legal</div>
              <button>Termes d'ús</button>
              <button>Privacitat</button>
              <button>Cookies</button>
              <button>Contacte</button>
            </div>
          </div>

          {/* Newsletter */}
          <div className="df-newsletter">
            <div className="dfl-title">Novetats</div>
            <p className="df-nl-desc">Rep ofertes exclusives i novetats de FlexiDrive directament al teu correu.</p>
            <div className="df-nl-form">
              <input className="df-nl-input" type="email" placeholder="el.teu@email.com" aria-label="Email newsletter" />
              <button className="df-nl-btn">Subscriure's</button>
            </div>
            <div className="df-trust-badges">
              <span className="df-trust-item"><Icon name="lock" size={11} color="#5dcaa5" /> Sense spam</span>
              <span className="df-trust-item"><Icon name="shield" size={11} color="#5dcaa5" /> Dades protegides</span>
            </div>
          </div>
        </div>

        <div className="df-bottom">
          <div className="df-bottom-left">
            <span>© 2026 Flexi Drive. Tots els drets reservats.</span>
            <span className="df-sep">·</span>
            <span>Fet amb ❤️ a Barcelona</span>
          </div>
          <div className="df-bottom-right">
            <span className="df-bottom-badge"><Icon name="check" size={10} color="#5dcaa5" /> Verificat SSL</span>
            <span className="df-bottom-badge"><Icon name="shield" size={10} color="#c47dff" /> RGPD compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
