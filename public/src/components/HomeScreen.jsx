import './HomeScreen.css';
import CarMiniature from './CarMiniature';

export default function HomeScreen({ navigate, cars }) {
  const topCars = cars.slice(0, 4);

  return (
    <div className="home">
      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-content fade-in">
          <div className="hero-badge">🚗 Plataforma P2P de coches · Barcelona</div>
          <h1 className="hero-title">FLEXI<span className="hero-accent">DRIVE</span></h1>
          <p className="hero-sub">
            Reserva un coche al instante, donde estés.<br />
            De particulares para particulares.
          </p>
          <div className="hero-actions">
            <button className="btn-primary hero-btn" onClick={() => navigate('search')}>Buscar un coche</button>
            <button className="btn-ghost hero-btn" onClick={() => navigate('publish')}>Publicar el meu</button>
          </div>
          <div className="hero-stats">
            <div className="stat"><span className="stat-n">1.200+</span><span className="stat-l">Coches activos</span></div>
            <div className="stat-sep" />
            <div className="stat"><span className="stat-n">4.9★</span><span className="stat-l">Valoració mitjana</span></div>
            <div className="stat-sep" />
            <div className="stat"><span className="stat-n">24/7</span><span className="stat-l">Disponibilitat</span></div>
            <div className="stat-sep" />
            <div className="stat"><span className="stat-n">8.400+</span><span className="stat-l">Usuaris</span></div>
          </div>
        </div>
        <div className="hero-car-scene">
          <div className="scene-glow" />
          <CarMiniature size="large" />
        </div>
      </section>

      {/* ── SEARCH BAR ── */}
      <section className="search-section">
        <div className="search-container">
          <div className="search-widget">
            <div className="sw-field">
              <label className="sw-label">📍 Ubicació</label>
              <input className="sw-input" type="text" placeholder="Zona, carrer o ciutat…" />
            </div>
            <div className="sw-divider" />
            <div className="sw-field">
              <label className="sw-label">📅 Data d'inici</label>
              <input className="sw-input" type="date" />
            </div>
            <div className="sw-divider" />
            <div className="sw-field">
              <label className="sw-label">🕐 Hores</label>
              <select className="sw-input sw-select">
                <option>1 hora</option><option>2 hores</option>
                <option>4 hores</option><option>Tot el dia</option>
              </select>
            </div>
            <div className="sw-divider" />
            <div className="sw-field">
              <label className="sw-label">⛽ Combustible</label>
              <select className="sw-input sw-select">
                <option>Tots</option><option>Gasolina</option>
                <option>Diésel</option><option>Eléctrico</option><option>Híbrido</option>
              </select>
            </div>
            <button className="sw-btn" onClick={() => navigate('search')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              Buscar
            </button>
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES ── */}
      <section className="trust-section">
        <div className="section-inner">
          <div className="trust-grid">
            {[
              { icon: '🔒', title: 'Pagament segur', desc: 'Transaccions protegides amb encriptació SSL' },
              { icon: '✅', title: 'Propietaris verificats', desc: 'Identitat i vehicle comprovats per FlexiDrive' },
              { icon: '🛡️', title: 'Assegurança inclosa', desc: 'Cobertura d\'accidents durant el lloguer' },
              { icon: '⭐', title: 'Valoracions reals', desc: 'Opinions verificades d\'usuaris reals' },
            ].map(b => (
              <div className="trust-card" key={b.title}>
                <div className="trust-icon">{b.icon}</div>
                <div className="trust-text">
                  <div className="trust-title">{b.title}</div>
                  <div className="trust-desc">{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED CARS ── */}
      <section className="featured-section">
        <div className="section-inner">
          <div className="section-header">
            <div>
              <h2 className="section-title">Coches destacats</h2>
              <p className="section-sub">Disponibles ara prop de tu</p>
            </div>
            <button className="btn-ghost-sm" onClick={() => navigate('search')}>Veure tots →</button>
          </div>
          <div className="cars-grid">
            {topCars.map(car => (
              <CarCard key={car.id} car={car} onClick={() => navigate('detail', car)} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how-section">
        <div className="section-inner">
          <h2 className="section-title center">Com funciona</h2>
          <p className="section-sub center" style={{ marginBottom: 48 }}>Tres passos per tenir el coche</p>
          <div className="steps-grid">
            {[
              { n: '01', icon: '🔍', title: 'Busca', desc: 'Troba coches disponibles a la teva zona al preu que vulguis. Filtra per combustible, transmissió i més.' },
              { n: '02', icon: '📅', title: 'Reserva', desc: 'Tria la franja horària i confirma la reserva en segons. Pagament segur integrat.' },
              { n: '03', icon: '🚗', title: 'Condueix', desc: "Recull el cotxe, gaudeix i torna'l. Sense paperassa. L'assegurança va inclosa." },
            ].map(s => (
              <div className="step-card" key={s.n}>
                <div className="step-num">{s.n}</div>
                <div className="step-icon">{s.icon}</div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="testimonials-section">
        <div className="section-inner">
          <h2 className="section-title center">El que diuen els usuaris</h2>
          <p className="section-sub center" style={{ marginBottom: 48 }}>Més de 8.400 persones ja confien en FlexiDrive</p>
          <div className="testimonials-grid">
            {[
              { name: 'Joan Duran', avatar: 'JD', city: 'Barcelona', rating: 5, text: 'Increïble! En 5 minuts tenia el cotxe reservat. El propietari era super amable i el vehicle estava impecable. Totalment recomanat!' },
              { name: 'Sara Martí', avatar: 'SM', city: 'Gràcia', rating: 5, text: "He llogat 3 cotxes diferents i sempre ha estat perfecte. Els preus són molt millors que les empreses tradicionals. FlexiDrive és el futur!" },
              { name: 'Pau Vidal', avatar: 'PV', city: 'Eixample', rating: 5, text: 'Publico el meu cotxe des de fa 6 mesos i guanyo uns 300€ al mes extra. El procés és molt senzill i l\'equip de suport excel·lent.' },
            ].map(t => (
              <div className="testimonial-card" key={t.name}>
                <div className="tc-header">
                  <div className="tc-avatar">{t.avatar}</div>
                  <div>
                    <div className="tc-name">{t.name}</div>
                    <div className="tc-city">📍 {t.city}</div>
                  </div>
                  <div className="tc-stars">{'⭐'.repeat(t.rating)}</div>
                </div>
                <p className="tc-text">"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="categories-section">
        <div className="section-inner">
          <h2 className="section-title center">Explora per categoria</h2>
          <p className="section-sub center" style={{ marginBottom: 40 }}>Troba el cotxe que s'adapta a les teves necessitats</p>
          <div className="categories-grid">
            {[
              { icon: '⚡', label: 'Elèctrics', count: '48', color: '#5dcaa5' },
              { icon: '🌿', label: 'Híbrids', count: '92', color: '#4db8ff' },
              { icon: '🚙', label: 'SUV / Familiars', count: '134', color: '#ff8c42' },
              { icon: '🏎️', label: 'Premium', count: '67', color: '#e040fb' },
              { icon: '🚗', label: 'Econòmics', count: '210', color: '#c47dff' },
              { icon: '🚐', label: 'Furgonetes', count: '31', color: '#9b4dca' },
            ].map(c => (
              <button key={c.label} className="cat-card" onClick={() => navigate('search')}
                style={{ '--cat-color': c.color }}>
                <div className="cat-icon">{c.icon}</div>
                <div className="cat-label">{c.label}</div>
                <div className="cat-count">{c.count} disponibles</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── PUBLISH CTA ── */}
      <section className="publish-cta">
        <div className="section-inner">
          <div className="cta-card">
            <div className="cta-glow" />
            <div className="cta-content">
              <h2 className="cta-title">Tens un cotxe aparcat?</h2>
              <p className="cta-desc">Guanya diners deixant-lo quan no el fas servir. Fixes tu el preu i la disponibilitat. Sense comissions amagades.</p>
              <div className="cta-features">
                <span>✅ Configuració en 5 min</span>
                <span>✅ Assegurança inclosa</span>
                <span>✅ Pagament garantit</span>
              </div>
              <button className="btn-primary" onClick={() => navigate('publish')}>Publicar el meu coche</button>
            </div>
            <div className="cta-visual">
              <CarMiniature size="medium" />
              <div className="cta-earnings">
                <div className="ce-label">Guanys estimats</div>
                <div className="ce-amount">+ 350€ <span>/mes</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── APP CTA ── */}
      <section className="app-cta-section">
        <div className="section-inner">
          <div className="app-cta">
            <div className="ac-content">
              <h2 className="ac-title">Descarrega l'app</h2>
              <p className="ac-desc">Reserva des del mòbil, rebuda notificacions en temps real i gestiona tot des de la palma de la mà.</p>
              <div className="ac-buttons">
                <button className="ac-btn">
                  <span className="ac-btn-icon">🍎</span>
                  <div><div className="ac-btn-sub">Disponible a</div><div className="ac-btn-store">App Store</div></div>
                </button>
                <button className="ac-btn">
                  <span className="ac-btn-icon">▶</span>
                  <div><div className="ac-btn-sub">Disponible a</div><div className="ac-btn-store">Google Play</div></div>
                </button>
              </div>
            </div>
            <div className="ac-badge">
              <div className="ac-qr">
                <div className="qr-inner">QR</div>
              </div>
              <div className="ac-qr-label">Escaneja per baixar</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function CarCard({ car, onClick }) {
  return (
    <div className="car-card" onClick={onClick}>
      <div className="cc-img">
        <CarMiniature size="small" color={car.color} />
        <div className="cc-overlay" />
        <div className="cc-price">{car.price}€<span>/h</span></div>
        <div className="cc-avail">Disponible</div>
        {car.rating >= 4.9 && <div className="cc-top">⭐ Top</div>}
      </div>
      <div className="cc-body">
        <h3 className="cc-name">{car.name}</h3>
        <div className="cc-meta">
          <span className="cc-location">📍 {car.location}</span>
          <span className="cc-dist">{car.dist} km</span>
        </div>
        <div className="cc-features">
          {car.features.slice(0,3).map(f => <span key={f} className="cc-feat">{f}</span>)}
        </div>
        <div className="cc-footer">
          <div className="cc-owner">
            <div className="owner-av">{car.avatar}</div>
            <span>{car.user}</span>
          </div>
          <div className="cc-rating">⭐ {car.rating} <span className="cc-rev">({car.reviews})</span></div>
        </div>
      </div>
    </div>
  );
}
