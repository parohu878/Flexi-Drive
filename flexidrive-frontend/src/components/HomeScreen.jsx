import { useState, useEffect, useContext } from 'react';
import './HomeScreen.css';
import CarMiniature from './CarMiniature';
import Icon from './Icon';
import { useFavorites } from '../context/FavoritesContext';
import CustomSelect from './CustomSelect';
import CustomDatePicker from './CustomDatePicker';
import { LanguageContext } from '../context/LanguageContext';

export default function HomeScreen({ navigate, cars, loading }) {
  const { t } = useContext(LanguageContext);
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
          <div className="hero-badge"><Icon name="car" size={14} color="#c47dff" /> {t('tagline')}</div>
          <h1 className="hero-title">FLEXI<span className="hero-accent">DRIVE</span></h1>
          <p className="hero-sub">{t('hero_subtitle')}</p>
          <div className="hero-actions">
            <button className="btn-primary hero-btn" onClick={() => navigate('search')}>{t('find_car')}</button>
            <button className="btn-ghost hero-btn" onClick={() => navigate('publish')}>{t('publish_mine')}</button>
          </div>
          <div className="hero-stats">
            <div className="stat"><span className="stat-n">1.200+</span><span className="stat-l">{t('active_cars')}</span></div>
            <div className="stat-sep" />
            <div className="stat"><span className="stat-n">4.9<Icon name="star" size={12} color="#f5c518" style={{marginLeft:2}} /></span><span className="stat-l">{t('average_rating')}</span></div>
            <div className="stat-sep" />
            <div className="stat"><span className="stat-n">24/7</span><span className="stat-l">{t('availability')}</span></div>
            <div className="stat-sep" />
            <div className="stat"><span className="stat-n">8.400+</span><span className="stat-l">{t('users')}</span></div>
          </div>
        </div>
        <div className="hero-car-scene">
          <div className="scene-glow" />
          <img src="/hero-bg.png" alt="FlexiDrive coche" className="hero-ai-img" />
        </div>
      </section>

      {/* ── SEARCH BAR ── */}
      <section className="search-section">
        <div className="search-container">
          <div className="search-widget">
            <div className="sw-field">
              <label className="sw-label"><Icon name="pin" size={12} color="#c47dff" /> {t('location_label')}</label>
              <input className="sw-input" type="text" placeholder={t('search_placeholder')}
                value={searchLoc} onChange={e => setSearchLoc(e.target.value)} />
            </div>
            <div className="sw-divider" />
            <div className="sw-field sw-field-date">
              <span className="sw-label"><Icon name="calendar" size={12} color="#c47dff" /> {t('start_date')}</span>
              <CustomDatePicker value={searchDate} onChange={e => setSearchDate(e.target.value)} />
            </div>
            <div className="sw-divider" />
            <div className="sw-field">
              <label className="sw-label"><Icon name="clock" size={12} color="#c47dff" /> {t('hours_label')}</label>
              <CustomSelect value={searchHours} onChange={e => setSearchHours(e.target.value)} options={[`1 ${t('hours_singular')}`, `2 ${t('hours_plural')}`, `4 ${t('hours_plural')}`, t('all_day')]} />
            </div>
            <div className="sw-divider" />
            <div className="sw-field">
              <label className="sw-label"><Icon name="fuel" size={12} color="#c47dff" /> {t('combustible')}</label>
              <CustomSelect value={searchFuel} onChange={e => setSearchFuel(e.target.value)} options={[t('all_fuels'), t('fuel_gasoline'), t('fuel_diesel'), t('fuel_electric'), t('fuel_hybrid')]} />
            </div>
            <button className="sw-btn" onClick={() => navigate('search')}>
              <Icon name="search" size={16} />
              {t('search')}
            </button>
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES ── */}
      <section className="trust-section" data-section="trust">
        <div className="section-inner">
          <div className={`trust-grid ${isVisible('trust') ? 'stagger-children' : ''}`}>
            {[
              { icon: 'lock', title: t('secure_payment'), desc: t('secure_payment_desc') },
              { icon: 'check', title: t('verified_owners'), desc: t('verified_owners_desc') },
              { icon: 'shield', title: t('insurance_included'), desc: t('insurance_desc') },
              { icon: 'star', title: t('real_reviews'), desc: t('real_reviews_desc') },
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
              <h2 className="section-title">{t('featured_cars')}</h2>
              <p className="section-sub">{t('available_near_you')}</p>
            </div>
            <button className="btn-ghost-sm" onClick={() => navigate('search')}>{t('view_all')} <Icon name="arrowRight" size={12} /></button>
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
                <CarCard key={car.id} car={car} onClick={() => navigate('detail', car)} t={t} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how-section" data-section="how">
        <div className="section-inner">
          <h2 className="section-title center">{t('how_it_works')}</h2>
          <p className="section-sub center" style={{ marginBottom: 48 }}>{t('three_steps')}</p>
          <div className={`steps-grid ${isVisible('how') ? 'stagger-children' : ''}`}>
            {[
              { n: '01', icon: 'search', title: t('step_search'), desc: t('step_search_desc') },
              { n: '02', icon: 'calendar', title: t('step_reserve'), desc: t('step_reserve_desc') },
              { n: '03', icon: 'car', title: t('step_drive'), desc: t('step_drive_desc') },
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
          <h2 className="section-title center">{t('testimonials_title')}</h2>
          <p className="section-sub center" style={{ marginBottom: 48 }}>{t('testimonials_subtitle')}</p>
          <div className={`testimonials-grid ${isVisible('testimonials') ? 'stagger-children' : ''}`}>
            {[
              { name: t('test1_name'), avatar: 'JD', city: t('test1_city'), rating: 5, text: t('test1_text') },
              { name: t('test2_name'), avatar: 'SM', city: t('test2_city'), rating: 5, text: t('test2_text') },
              { name: t('test3_name'), avatar: 'PV', city: t('test3_city'), rating: 5, text: t('test3_text') },
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
          <h2 className="section-title center">{t('explore_categories')}</h2>
          <p className="section-sub center" style={{ marginBottom: 40 }}>{t('explore_categories_subtitle')}</p>
          <div className={`categories-grid ${isVisible('categories') ? 'stagger-children' : ''}`}>
            {[
              { icon: 'bolt', label: t('cat_electrics'), count: '48', color: '#5dcaa5' },
              { icon: 'leaf', label: t('cat_hybrids'), count: '92', color: '#4db8ff' },
              { icon: 'suv', label: t('cat_suv'), count: '134', color: '#ff8c42' },
              { icon: 'premium', label: t('cat_premium'), count: '67', color: '#e040fb' },
              { icon: 'car', label: t('cat_economy'), count: '210', color: '#c47dff' },
              { icon: 'van', label: t('cat_vans'), count: '31', color: '#9b4dca' },
            ].map(c => (
              <button key={c.label} className="cat-card" onClick={() => navigate('search')}
                style={{ '--cat-color': c.color }}>
                <div className="cat-icon"><Icon name={c.icon} size={24} color={c.color} /></div>
                <div className="cat-label">{c.label}</div>
                <div className="cat-count">{c.count} {t('cat_available')}</div>
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
              <h2 className="cta-title">{t('cta_title')}</h2>
              <p className="cta-desc">{t('cta_desc')}</p>
              <div className="cta-features">
                <span><Icon name="check" size={13} color="#5dcaa5" /> {t('cta_feat1')}</span>
                <span><Icon name="shield" size={13} color="#5dcaa5" /> {t('cta_feat2')}</span>
                <span><Icon name="money" size={13} color="#5dcaa5" /> {t('cta_feat3')}</span>
              </div>
              <button className="btn-primary" onClick={() => navigate('publish')}>{t('publish_mine_btn')}</button>
            </div>
            <div className="cta-visual">
              <img src="/cta-car.png" alt="Publica el teu cotxe" className="cta-ai-img" />
              <div className="cta-earnings">
                <div className="ce-label">{t('estimated_earnings')}</div>
                <div className="ce-amount">+ 350€ <span>/{t('per_month')}</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function CarCard({ car, onClick, t }) {
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
        {car.images && car.images.length > 0 ? (
          <img src={car.images[0]} alt={car.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
        ) : (
          <CarMiniature size="small" color={car.color} />
        )}
        <div className="cc-overlay" />
        <div className="cc-price">{price}€<span>/h</span></div>
        <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 6, zIndex: 2 }}>
          <div className="cc-avail" style={{ position: 'static', margin: 0 }}>{t('available')}</div>
          {rating >= 4.9 && <div className="cc-top" style={{ position: 'static', margin: 0 }}><Icon name="star" size={10} color="#000" /> Top</div>}
        </div>
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
