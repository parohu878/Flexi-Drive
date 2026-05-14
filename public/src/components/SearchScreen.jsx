import { useState } from 'react';
import CarMiniature from './CarMiniature';
import './SearchScreen.css';

const FUEL_OPTS   = ['Tots', 'Gasolina', 'Diésel', 'Eléctrico', 'Híbrido'];
const TRANS_OPTS  = ["Tots", "Manual", "Automático"];
const SEATS_OPTS  = ["Tots", "2+", "4+", "5", "7+"];

export default function SearchScreen({ navigate, cars }) {
  const [query,    setQuery]    = useState('');
  const [maxPrice, setMaxPrice] = useState(100);
  const [fuel,     setFuel]     = useState('Tots');
  const [trans,    setTrans]    = useState("Tots");
  const [seats,    setSeats]    = useState("Tots");
  const [sortBy,   setSortBy]   = useState('dist');
  const [hovered,  setHovered]  = useState(null);

  const filtered = cars
    .filter(c => {
      if (query && !c.name.toLowerCase().includes(query.toLowerCase()) &&
          !c.location.toLowerCase().includes(query.toLowerCase())) return false;
      if (c.price > maxPrice) return false;
      if (fuel !== 'Tots' && c.fuel !== fuel) return false;
      if (trans !== 'Tots' && c.transmission !== trans) return false;
      return true;
    })
    .sort((a, b) =>
      sortBy === 'dist'   ? a.dist  - b.dist  :
      sortBy === 'price'  ? a.price - b.price  :
      sortBy === 'rating' ? b.rating - a.rating : 0
    );

  return (
    <div className="search-page">
      {/* ── SIDEBAR ── */}
      <aside className="search-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Filtres</h2>
          <button className="sidebar-reset" onClick={() => {
            setQuery(''); setMaxPrice(100); setFuel('Tots'); setTrans('Tots');
          }}>Reiniciar</button>
        </div>

        <div className="sf-group">
          <label className="sf-label">Cerca</label>
          <div className="sf-input-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="sf-search-icon">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className="sf-input"
              type="text"
              placeholder="Zona, cotxe, propietari…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="sf-group">
          <label className="sf-label">Preu màxim: <span className="sf-val">{maxPrice}€/h</span></label>
          <input
            className="sf-range"
            type="range"
            min="10" max="100"
            value={maxPrice}
            onChange={e => setMaxPrice(+e.target.value)}
          />
          <div className="sf-range-labels"><span>10€</span><span>100€</span></div>
        </div>

        <div className="sf-group">
          <label className="sf-label">Combustible</label>
          <div className="sf-chips">
            {FUEL_OPTS.map(o => (
              <button
                key={o}
                className={`sf-chip ${fuel === o ? 'active' : ''}`}
                onClick={() => setFuel(o)}
              >{o}</button>
            ))}
          </div>
        </div>

        <div className="sf-group">
          <label className="sf-label">Canvi</label>
          <div className="sf-chips">
            {TRANS_OPTS.map(o => (
              <button
                key={o}
                className={`sf-chip ${trans === o ? 'active' : ''}`}
                onClick={() => setTrans(o)}
              >{o}</button>
            ))}
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="search-main">
        {/* Map */}
        <div className="map-area">
          <div className="map-bg" />
          <div className="map-grid-overlay">
            {[30, 55, 78].map(t => <div key={t} className="map-road-h" style={{ top: `${t}%` }} />)}
            {[25, 55, 80].map(l => <div key={l} className="map-road-v" style={{ left: `${l}%` }} />)}
          </div>
          <div className="map-label" style={{ top: 10, left: 14 }}>Eixample</div>
          <div className="map-label" style={{ top: 10, right: 14 }}>Gràcia</div>
          <div className="map-label" style={{ bottom: 30, left: 14 }}>Sant Antoni</div>
          <div className="map-label" style={{ bottom: 30, right: 14 }}>Sagrada Família</div>

          {/* Pins */}
          {[
            { id: 1, x: '22%', y: '45%', price: '18€' },
            { id: 2, x: '60%', y: '28%', price: '22€' },
            { id: 3, x: '72%', y: '62%', price: '15€' },
            { id: 4, x: '40%', y: '72%', price: '28€' },
          ].map(p => {
            const car = cars.find(c => c.id === p.id);
            if (!car) return null;
            const inFilter = filtered.some(c => c.id === p.id);
            return (
              <div
                key={p.id}
                className={`map-pin ${hovered === p.id ? 'hovered' : ''} ${!inFilter ? 'dimmed' : ''}`}
                style={{ left: p.x, top: p.y }}
                onClick={() => navigate('detail', car)}
                onMouseEnter={() => setHovered(p.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <div className="pin-price">{p.price}</div>
                <div className="pin-dot">
                  <span className="pin-icon">🚗</span>
                  <div className="pin-ring" />
                </div>
              </div>
            );
          })}

          {/* User pin */}
          <div className="user-pin" style={{ left: '48%', top: '50%' }} />
          <div className="map-badge">{filtered.length} cotxes disponibles</div>
        </div>

        {/* Results header */}
        <div className="results-header">
          <span className="results-count">
            <strong>{filtered.length}</strong> cotxe{filtered.length !== 1 ? 's' : ''} trobat{filtered.length !== 1 ? 's' : ''}
          </span>
          <div className="sort-wrap">
            <span className="sort-label">Ordenar per:</span>
            <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="dist">Distància</option>
              <option value="price">Preu</option>
              <option value="rating">Valoració</option>
            </select>
          </div>
        </div>

        {/* Cars list */}
        <div className="results-list">
          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <p>Cap cotxe coincideix amb els filtres</p>
              <button className="btn-ghost-sm" onClick={() => {
                setQuery(''); setMaxPrice(100); setFuel('Tots'); setTrans('Tots');
              }}>Reiniciar filtres</button>
            </div>
          )}
          {filtered.map(car => (
            <div
              key={car.id}
              className={`car-row ${hovered === car.id ? 'highlighted' : ''}`}
              onClick={() => navigate('detail', car)}
              onMouseEnter={() => setHovered(car.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="cr-img">
                <CarMiniature size="small" color={car.color} />
              </div>
              <div className="cr-info">
                <div className="cr-name">{car.name}</div>
                <div className="cr-badges">
                  <span className="badge badge-avail">Disponible</span>
                  <span className="badge badge-dist">{car.dist} km</span>
                  <span className="badge badge-fuel">{car.fuel}</span>
                  <span className="badge badge-trans">{car.transmission}</span>
                </div>
                <div className="cr-location">📍 {car.location} · Propietari: {car.user}</div>
              </div>
              <div className="cr-right">
                <div className="cr-price">{car.price}€<span>/h</span></div>
                <div className="cr-rating">⭐ {car.rating} ({car.reviews})</div>
                <button className="btn-primary cr-btn">Veure →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
