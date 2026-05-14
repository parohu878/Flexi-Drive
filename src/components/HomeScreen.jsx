import { useState, useEffect } from 'react';
import './HomeScreen.css';
import CarMiniature from './CarMiniature';
import Icon from './Icon';
import { useFavorites } from '../context/FavoritesContext';

export default function HomeScreen({ navigate, cars, loading }) {
  const [searchLoc, setSearchLoc] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchHours, setSearchHours] = useState('1 hora');
  const [searchFuel, setSearchFuel] = useState('Tots');
  const [visibleSections, setVisibleSections] = useState(new Set());

  const topCars = (cars || []).slice(0, 4);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set([...prev, entry.target.dataset.section]));
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );
    document.querySelectorAll('[data-section]').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const isVisible = (name) => visibleSections.has(name);

  return (
    <div className="home">
      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-content fade-in">
          <div className="hero-badge"><Icon name="car" size={14} color="#c47dff" /> Plataforma P2P de coches · Barcelona</div>
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
            <div className="stat"><span className="stat-n">4.9<Icon name="star" size={12} color="#f5c518" style={{marginLeft:2}} /></span><span className="stat-l">Valoració mitjana</span></div>
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
              <label className="sw-label"><Icon name="pin" size={12} color="#c47dff" /> Ubicació</label>
              <input className="sw-input" type="text" placeholder="Zona, carrer o ciutat…"
                value={searchLoc} onChange={e => setSearchLoc(e.target.value)} />
            </div>
            <div className="sw-divider" />
            <div className="sw-field">
              <label className="sw-label"><Icon name="calendar" size={12} color="#c47dff" /> Data d'inici</label>
              <input className="sw-input" type="date"
                value={searchDate} onChange={e => setSearchDate(e.target.value)} />
            </div>
            <div className="sw-divider" />
            <div className="sw-field">
              <label className="sw-label"><Icon name="clock" size={12} color="#c47dff" /> Hores</label>
              <select className="sw-input sw-select"
                value={searchHours} onChange={e => setSearchHours(e.target.value)}>
                <option>1 hora</option><option>2 hores</option>
                <option>4 hores</option><option>Tot el dia</option>
              </select>
            </div>
            <div className="sw-divider" />
            <div className="sw-field">
              <label className="sw-label"><Icon name="fuel" size={12} color="#c47dff" /> Combustible</label>
              <select className="sw-input sw-select"
                value={searchFuel} onChange={e => setSearchFuel(e.target.value)}>
                <option>Tots</option><option>Gasolina</option>
                <option>Diésel</option><option>Eléctrico</option><option>Híbrido</option>
              </select>
            </div>
            <button className="sw-btn" onClick={() => navigate('search')}>
              <Icon name="search" size={16} />
              Buscar
            </button>
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES ── */}
      <section className="trust-section" data-section="trust">
        <div className="section-inner">
          <div className={`trust-grid ${isVisible('trust') ? 'stagger-children' : ''}`}>
            {[
              { icon: 'lock', title: 'Pagament segur', desc: 'Transaccions protegides amb encriptació SSL' },
              { icon: 'check', title: 'Propietaris verificats', desc: 'Identitat i vehicle comprovats per FlexiDrive' },
              { icon: 'shield', title: 'Assegurança inclosa', desc: "Cobertura d'accidents durant el lloguer" },
              { icon: 'star', title: 'Valoracions reals', desc: "Opinions verificades d'usuaris reals" },
            ].map(b => (
              <div className="trust-card" key={b.title}>
                <div className="trust-icon"><Icon name={b.icon} size={22} color="#c47dff" /></div>
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
      <section className="featured-section" data-section="featured">
        <div className="section-inner">
          <div className="section-header">
            <div>
              <h2 className="section-title">Coches destacats</h2>
              <p className="section-sub">Disponibles ara prop de tu</p>
            </div>
            <button className="btn-ghost-sm" onClick={() => navigate('search')}>Veure tots <Icon name="arrowRight" size={12} /></button>
          </div>
          {loading ? (
            <div className="cars-grid">
              {[1,2,3,4].map(i => (
                <div key={i} className="car-card-skeleton">
                  <div className="skeleton" style={{ height: 140 }} />
                  <div style={{ padding: 14 }}>
                    <div className="skeleton" style={{ height: 14, width: '70%', marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 12, width: '50%', marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 12, width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`cars-grid ${isVisible('featured') ? 'stagger-children' : ''}`}>
              {topCars.map(car => (
                <CarCard key={car.id} car={car} onClick={() => navigate('detail', car)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how-section" data-section="how">
        <div className="section-inner">
          <h2 className="section-title center">Com funciona</h2>
          <p className="section-sub center" style={{ marginBottom: 48 }}>Tres passos per tenir el coche</p>
          <div className={`steps-grid ${isVisible('how') ? 'stagger-children' : ''}`}>
            {[
              { n: '01', icon: 'search', title: 'Busca', desc: 'Troba coches disponibles a la teva zona al preu que vulguis. Filtra per combustible, transmissió i més.' },
              { n: '02', icon: 'calendar', title: 'Reserva', desc: 'Tria la franja horària i confirma la reserva en segons. Pagament segur integrat.' },
              { n: '03', icon: 'car', title: 'Condueix', desc: "Recull el cotxe, gaudeix i torna'l. Sense paperassa. L'assegurança va inclosa." },
            ].map(s => (
              <div className="step-card" key={s.n}>
                <div className="step-num">{s.n}</div>
                <div className="step-icon"><Icon name={s.icon} size={28} color="#c47dff" /></div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="testimonials-section" data-section="testimonials">
        <div className="section-inner">
          <h2 className="section-title center">El que diuen els usuaris</h2>
          <p className="section-sub center" style={{ marginBottom: 48 }}>Més de 8.400 persones ja confien en FlexiDrive</p>
          <div className={`testimonials-grid ${isVisible('testimonials') ? 'stagger-children' : ''}`}>
            {[
              { name: 'Joan Duran', avatar: 'JD', city: 'Barcelona', rating: 5, text: 'Increïble! En 5 minuts tenia el cotxe reservat. El propietari era super amable i el vehicle estava impecable. Totalment recomanat!' },
              { name: 'Sara Martí', avatar: 'SM', city: 'Gràcia', rating: 5, text: "He llogat 3 cotxes diferents i sempre ha estat perfecte. Els preus són molt millors que les empreses tradicionals. FlexiDrive és el futur!" },
              { name: 'Pau Vidal', avatar: 'PV', city: 'Eixample', rating: 5, text: "Publico el meu cotxe des de fa 6 mesos i guanyo uns 300€ al mes extra. El procés és molt senzill i l'equip de suport excel·lent." },
            ].map(t => (
              <div className="testimonial-card" key={t.name}>
                <div className="tc-header">
                  <div className="tc-avatar">{t.avatar}</div>
                  <div>
                    <div className="tc-name">{t.name}</div>
                    <div className="tc-city"><Icon name="pin" size={10} color="var(--td)" /> {t.city}</div>
                  </div>
                  <div className="tc-stars">{Array.from({length:t.rating}).map((_,i) => <Icon key={i} name="star" size={13} color="#f5c518" />)}</div>
                </div>
                <p className="tc-text">"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="categories-section" data-section="categories">
        <div className="section-inner">
          <h2 className="section-title center">Explora per categoria</h2>
          <p className="section-sub center" style={{ marginBottom: 40 }}>Troba el cotxe que s'adapta a les teves necessitats</p>
          <div className={`categories-grid ${isVisible('categories') ? 'stagger-children' : ''}`}>
            {[
              { icon: 'bolt', label: 'Elèctrics', count: '48', color: '#5dcaa5' },
              { icon: 'leaf', label: 'Híbrids', count: '92', color: '#4db8ff' },
              { icon: 'suv', label: 'SUV / Familiars', count: '134', color: '#ff8c42' },
              { icon: 'premium', label: 'Premium', count: '67', color: '#e040fb' },
              { icon: 'car', label: 'Econòmics', count: '210', color: '#c47dff' },
              { icon: 'van', label: 'Furgonetes', count: '31', color: '#9b4dca' },
            ].map(c => (
              <button key={c.label} className="cat-card" onClick={() => navigate('search')}
                style={{ '--cat-color': c.color }}>
                <div className="cat-icon"><Icon name={c.icon} size={24} color={c.color} /></div>
                <div className="cat-label">{c.label}</div>
                <div className="cat-count">{c.count} disponibles</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── PUBLISH CTA ── */}
      <section className="publish-cta" data-section="cta">
        <div className="section-inner">
          <div className={`cta-card ${isVisible('cta') ? 'fade-in' : ''}`}>
            <div className="cta-glow" />
            <div className="cta-content">
              <h2 className="cta-title">Tens un cotxe aparcat?</h2>
              <p className="cta-desc">Guanya diners deixant-lo quan no el fas servir. Fixes tu el preu i la disponibilitat. Sense comissions amagades.</p>
              <div className="cta-features">
                <span><Icon name="check" size={13} color="#5dcaa5" /> Configuració en 5 min</span>
                <span><Icon name="shield" size={13} color="#5dcaa5" /> Assegurança inclosa</span>
                <span><Icon name="money" size={13} color="#5dcaa5" /> Pagament garantit</span>
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
                  <span className="ac-btn-icon"><Icon name="apple" size={18} /></span>
                  <div><div className="ac-btn-sub">Disponible a</div><div className="ac-btn-store">App Store</div></div>
                </button>
                <button className="ac-btn">
                  <span className="ac-btn-icon"><Icon name="play" size={14} color="#c47dff" /></span>
                  <div><div className="ac-btn-sub">Disponible a</div><div className="ac-btn-store">Google Play</div></div>
                </button>
              </div>
            </div>
            <div className="ac-badge">
              <div className="ac-qr">
                <div className="qr-inner"><Icon name="qr" size={32} color="#c47dff" /></div>
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
  const { isFavorite, toggleFavorite } = useFavorites();
  const price = car.pricePerHour || car.price;
  const ownerName = car.owner?.name || car.user || '';
  const avatar = car.owner?.avatar || car.avatar || '??';
  const rating = car.rating || 0;
  const reviews = car.totalReviews || car.reviews || 0;
  const dist = car.dist != null ? car.dist : '?';
  const fav = isFavorite(car.id);

  return (
    <div className="car-card" onClick={onClick}>
      <div className="cc-img">
        <CarMiniature size="small" color={car.color} />
        <div className="cc-overlay" />
        <div className="cc-price">{price}€<span>/h</span></div>
        <div className="cc-avail">Disponible</div>
        {rating >= 4.9 && <div className="cc-top"><Icon name="star" size={10} color="#000" /> Top</div>}
        <button
          className={`fav-btn cc-fav ${fav ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); toggleFavorite(car.id); }}
          title={fav ? 'Treure de favorits' : 'Afegir a favorits'}
        >
          <Icon name={fav ? 'heart' : 'heartOutline'} size={14} color={fav ? '#e040fb' : 'rgba(255,255,255,.6)'} fill={fav ? '#e040fb' : 'none'} />
        </button>
      </div>
      <div className="cc-body">
        <h3 className="cc-name">{car.name}</h3>
        <div className="cc-meta">
          <span className="cc-location"><Icon name="pin" size={11} color="var(--td)" /> {car.location}</span>
          <span className="cc-dist">{dist} km</span>
        </div>
        <div className="cc-features">
          {(car.features || []).slice(0,3).map(f => <span key={f} className="cc-feat">{f}</span>)}
        </div>
        <div className="cc-footer">
          <div className="cc-owner">
            <div className="owner-av">{avatar}</div>
            <span>{ownerName}</span>
          </div>
          <div className="cc-rating"><Icon name="star" size={11} color="#f5c518" /> {rating} <span className="cc-rev">({reviews})</span></div>
        </div>
      </div>
    </div>
  );
}
