import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import CarMiniature from './CarMiniature';
import Icon from './Icon';
import { carsService } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import { useFavorites } from '../context/FavoritesContext';
import CustomSelect from './CustomSelect';
import './SearchScreen.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const carIcon = (color = '#9b4dca', isHovered = false) => L.divIcon({
  className: 'custom-marker',
  html: `<div style="
    background: ${color}; color: #fff;
    width: ${isHovered ? '38px' : '32px'}; height: ${isHovered ? '38px' : '32px'};
    border-radius: 50% 50% 50% 0; transform: rotate(-45deg);
    display: flex; align-items: center; justify-content: center;
    border: 2px solid rgba(255,255,255,${isHovered ? '0.6' : '0.3'});
    box-shadow: 0 3px ${isHovered ? '16px' : '12px'} rgba(0,0,0,${isHovered ? '0.6' : '0.4'});
    transition: all .2s;
  "><svg xmlns="http://www.w3.org/2000/svg" width="${isHovered?16:14}" height="${isHovered?16:14}" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform:rotate(45deg)"><path d="M2 13h2a2.5 2.5 0 0 1 5 0h6a2.5 2.5 0 0 1 5 0h2"/><path d="M2 13v-2.5c0-.8.5-1.5 1.2-1.8l3.3-1.4A3 3 0 0 1 9.8 7H14.2a3 3 0 0 1 2.1.8l3.3 1.4c.7.3 1.2 1 1.2 1.8V13"/><path d="M12 7v6" opacity="0.5"/><circle cx="6.5" cy="13" r="2.5"/><circle cx="6.5" cy="13" r="0.8" fill="#fff"/><circle cx="17.5" cy="13" r="2.5"/><circle cx="17.5" cy="13" r="0.8" fill="#fff"/></svg></div>`,
  iconSize: [isHovered ? 38 : 32, isHovered ? 38 : 32],
  iconAnchor: [isHovered ? 19 : 16, isHovered ? 38 : 32],
  popupAnchor: [0, isHovered ? -38 : -32],
});

const userIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="background:#4db8ff;width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 12px rgba(77,184,255,0.6);"></div>`,
  iconSize: [16, 16], iconAnchor: [8, 8],
});

const FUEL_OPTS  = ['Tots', 'Gasolina', 'Diésel', 'Eléctrico', 'Híbrido'];
const TRANS_OPTS = ['Tots', 'Manual', 'Automático'];

function MapUpdater({ center, viewMode, mapExpanded }) {
  const map = useMap();
  useEffect(() => { if (center) map.setView(center, map.getZoom()); }, [center, map]);
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 320); // wait for CSS transitions to finish
    return () => clearTimeout(timer);
  }, [viewMode, mapExpanded, map]);
  return null;
}

export default function SearchScreen({ navigate, cars: initialCars, loadCars, loading: parentLoading }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [query, setQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState(100);
  const [fuel, setFuel] = useState('Tots');
  const [trans, setTrans] = useState('Tots');
  const [sortBy, setSortBy] = useState('dist');
  const [hovered, setHovered] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [cars, setCars] = useState(initialCars || []);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('both'); // 'both' | 'map' | 'list'
  const [mapExpanded, setMapExpanded] = useState(false);
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
        () => setUserPos([41.3874, 2.1686])
      );
    } else { setUserPos([41.3874, 2.1686]); }
  }, []);

  const fetchCars = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 50, available: 'true' };
      if (debouncedQuery) params.q = debouncedQuery;
      if (maxPrice < 100) params.maxPrice = maxPrice;
      if (fuel !== 'Tots') params.fuel = fuel;
      if (trans !== 'Tots') params.transmission = trans;
      if (userPos) { params.userLat = userPos[0]; params.userLng = userPos[1]; }
      if (sortBy === 'price') params.sortBy = 'price_asc';
      else if (sortBy === 'rating') params.sortBy = 'rating';
      const res = await carsService.getCars(params);
      setCars(res.data || []);
    } catch (err) { console.error('Error fetching cars:', err); }
    finally { setLoading(false); }
  }, [debouncedQuery, maxPrice, fuel, trans, sortBy, userPos]);

  useEffect(() => { fetchCars(); }, [fetchCars]);

  const sorted = [...cars].sort((a, b) => {
    if (sortBy === 'dist') return (a.dist || 999) - (b.dist || 999);
    if (sortBy === 'price') return (a.pricePerHour || 0) - (b.pricePerHour || 0);
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  const mapCenter = userPos || [41.3874, 2.1686];
  const carsWithCoords = sorted.filter(c => c.lat && c.lng);
  const resetFilters = () => { setQuery(''); setMaxPrice(100); setFuel('Tots'); setTrans('Tots'); };
  const activeFilters = (fuel !== 'Tots' ? 1 : 0) + (trans !== 'Tots' ? 1 : 0) + (maxPrice < 100 ? 1 : 0) + (query ? 1 : 0);

  return (
    <div className="search-page">
      <button className="mobile-filter-toggle" onClick={() => setSidebarOpen(v => !v)}>
        <Icon name="filter" size={14} /> Filtres
        {activeFilters > 0 && <span className="filter-count">{activeFilters}</span>}
      </button>

      <aside className={`search-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Filtres</h2>
          <button className="sidebar-reset" onClick={resetFilters}>Reiniciar</button>
        </div>
        <div className="sf-group">
          <label className="sf-label">Cerca</label>
          <div className="sf-input-wrap">
            <Icon name="search" size={13} color="var(--td)" className="sf-search-icon" />
            <input className="sf-input" type="text" placeholder="Zona, cotxe, propietari…" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
        </div>
        <div className="sf-group">
          <label className="sf-label">Preu màxim: <span className="sf-val">{maxPrice}€/h</span></label>
          <input className="sf-range" type="range" min="5" max="100" value={maxPrice} onChange={e => setMaxPrice(+e.target.value)} />
          <div className="sf-range-labels"><span>5€</span><span>100€</span></div>
        </div>
        <div className="sf-group">
          <label className="sf-label">Combustible</label>
          <div className="sf-chips">{FUEL_OPTS.map(o => (<button key={o} className={`sf-chip ${fuel === o ? 'active' : ''}`} onClick={() => setFuel(o)}>{o}</button>))}</div>
        </div>
        <div className="sf-group">
          <label className="sf-label">Canvi</label>
          <div className="sf-chips">{TRANS_OPTS.map(o => (<button key={o} className={`sf-chip ${trans === o ? 'active' : ''}`} onClick={() => setTrans(o)}>{o}</button>))}</div>
        </div>
        <div className="sf-group sf-summary">
          <div className="sf-summary-text"><strong>{sorted.length}</strong> cotxes disponibles</div>
        </div>
      </aside>

      <div className="search-main">
        {viewMode !== 'list' && (
        <div className={`map-area ${viewMode === 'map' ? 'map-area-full' : ''} ${mapExpanded && viewMode === 'both' ? 'expanded' : ''}`}>
          <MapContainer center={mapCenter} zoom={13} style={{ width: '100%', height: '100%', borderRadius: 'inherit' }} scrollWheelZoom={true}>
            <TileLayer attribution='&copy; Google Maps' url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />
            <MapUpdater center={mapCenter} viewMode={viewMode} mapExpanded={mapExpanded} />
            {userPos && <Marker position={userPos} icon={userIcon}><Popup><strong>La teva posició</strong></Popup></Marker>}
            {carsWithCoords.map(car => (
              <Marker key={car.id} position={[car.lat, car.lng]} icon={carIcon(car.color || '#9b4dca', hovered === car.id)}
                eventHandlers={{ mouseover: () => setHovered(car.id), mouseout: () => setHovered(null) }}>
                <Popup>
                  <div style={{ minWidth: 180, fontFamily: 'Rajdhani, sans-serif' }}>
                    <strong style={{ fontSize: 14, color: '#e8e8f2' }}>{car.name}</strong><br/>
                    <span style={{ color: '#aaa', fontSize: 12 }}>{car.location}</span><br/>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0' }}>
                      <span style={{ color: '#9b4dca', fontWeight: 700, fontSize: 18, fontFamily: 'Orbitron' }}>{car.pricePerHour}€</span>
                      <span style={{ color: '#aaa', fontSize: 12 }}>/hora</span>
                      <span style={{ marginLeft: 'auto', color: '#f5c518', fontSize: 12 }}>{car.rating}</span>
                    </div>
                    <button onClick={() => navigate('detail', car)} style={{ width: '100%', padding: '6px 12px', background: 'linear-gradient(135deg, #9b4dca, #e040fb)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'Rajdhani', letterSpacing: '.05em', textTransform: 'uppercase' }}>Reservar</button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          
          {viewMode === 'both' && (
            <button className="map-expand-btn" onClick={() => setMapExpanded(v => !v)} title={mapExpanded ? "Reduir mapa" : "Ampliar mapa"}>
              <Icon name={mapExpanded ? 'collapse' : 'expand'} size={14} />
            </button>
          )}
          
          <div className="map-badge">{sorted.length} cotxes disponibles</div>
        </div>
        )}

        <div className="results-header">
          <span className="results-count">{loading ? <span style={{ color: 'var(--td)' }}>Cercant...</span> : <><strong>{sorted.length}</strong> cotxe{sorted.length !== 1 ? 's' : ''} trobat{sorted.length !== 1 ? 's' : ''}</>}</span>
          <div className="view-toggle">
            <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="Vista llista">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              Llista
            </button>
            <button className={`view-btn ${viewMode === 'both' ? 'active' : ''}`} onClick={() => setViewMode('both')} title="Vista mixta (Ambdós)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="12" x2="21" y2="12"/></svg>
              Ambdós
            </button>
            <button className={`view-btn ${viewMode === 'map' ? 'active' : ''}`} onClick={() => setViewMode('map')} title="Vista mapa complet">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
              Mapa
            </button>
          </div>
          <div className="sort-wrap">
            <span className="sort-label">Ordenar per:</span>
            <CustomSelect
              className={`sort-select-custom ${viewMode === 'map' ? 'open-upwards' : ''}`}
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              options={[
                { value: 'dist', label: 'Distància' },
                { value: 'price', label: 'Preu' },
                { value: 'rating', label: 'Valoració' }
              ]}
            />
          </div>
        </div>

        {viewMode !== 'map' && (
          <div className="results-list">
            {!loading && sorted.length === 0 && (
              <div className="empty-state"><div className="empty-icon"><Icon name="search" size={36} color="var(--td)" /></div><p>Cap cotxe coincideix amb els filtres</p><button className="btn-ghost-sm" onClick={resetFilters}>Reiniciar filtres</button></div>
            )}
            {loading && <div style={{ textAlign: 'center', padding: 40, color: 'var(--td)' }}><div className="app-loader" style={{ width: 28, height: 28, borderWidth: 2 }} /><div style={{ marginTop: 10 }}>Cercant cotxes...</div></div>}
            {!loading && sorted.map(car => {
            const price = car.pricePerHour || car.price;
            const ownerName = car.owner?.name || car.user || '';
            const dist = car.dist != null ? car.dist : '?';
            const rating = car.rating || 0;
            const reviews = car.totalReviews || car.reviews || 0;
            const fav = isFavorite(car.id);
            return (
              <div key={car.id} className={`car-row ${hovered === car.id ? 'highlighted' : ''}`} onClick={() => navigate('detail', car)} onMouseEnter={() => setHovered(car.id)} onMouseLeave={() => setHovered(null)}>
                <div className="cr-img">
                  {car.images && car.images.length > 0 ? (
                    <img src={car.images[0]} alt={car.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                  ) : (
                    <CarMiniature size="small" color={car.color} />
                  )}
                </div>
                <div className="cr-info">
                  <div className="cr-name">{car.name}</div>
                  <div className="cr-badges">
                    <span className="badge badge-avail">Disponible</span>
                    <span className="badge badge-dist">{dist} km</span>
                    <span className="badge badge-fuel">{car.fuel}</span>
                    <span className="badge badge-trans">{car.transmission}</span>
                  </div>
                  <div className="cr-location"><Icon name="pin" size={11} color="var(--td)" /> {car.location} · Propietari: {ownerName}</div>
                </div>
                <div className="cr-right">
                  <div className="cr-price">{price}€<span>/h</span></div>
                  <div className="cr-rating"><Icon name="star" size={11} color="#f5c518" /> {rating} ({reviews})</div>
                  <div className="cr-actions">
                    <button className={`fav-btn fav-sm ${fav ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggleFavorite(car.id); }}>
                      <Icon name={fav ? 'heart' : 'heartOutline'} size={12} color={fav ? '#e040fb' : 'rgba(255,255,255,.5)'} fill={fav ? '#e040fb' : 'none'} />
                    </button>
                    <button className="btn-primary cr-btn">Veure <Icon name="arrowRight" size={11} /></button>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
}
