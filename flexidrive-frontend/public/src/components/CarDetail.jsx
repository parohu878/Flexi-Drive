import { useState } from 'react';
import CarMiniature from './CarMiniature';
import './CarDetail.css';

const SLOTS = ['Ara mateix', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

export default function CarDetail({ car, navigate, showToast }) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [hours, setHours] = useState(1);
  const [activeTab, setActiveTab] = useState('info');

  if (!car) return null;

  const total = car.price * hours;
  const fee   = Math.round(total * 0.1);

  const handleReserve = () => {
    if (!selectedSlot) { showToast('⚠️ Selecciona una franja horària primer', 'error'); return; }
    showToast(`✅ Reserva confirmada! ${car.name} a les ${selectedSlot}`);
    setTimeout(() => navigate('search'), 1200);
  };

  return (
    <div className="detail-page fade-in">
      {/* ── HERO ── */}
      <div className="detail-hero">
        <div className="dh-bg" />
        <div className="dh-inner">
          <button className="detail-back" onClick={() => navigate('search')}>← Tornar</button>
          <div className="dh-car"><CarMiniature size="large" color={car.color} /></div>
        </div>
      </div>

      <div className="detail-body">
        {/* ── LEFT ── */}
        <div className="detail-main">
          {/* Header */}
          <div className="detail-header">
            <div>
              <h1 className="detail-name">{car.name}</h1>
              <div className="detail-location">📍 {car.location} · {car.dist} km de tu</div>
            </div>
            <div className="detail-price-block">
              <div className="dp-amount">{car.price}€</div>
              <div className="dp-unit">per hora</div>
            </div>
          </div>

          {/* Badges */}
          <div className="detail-badges">
            <span className="badge badge-avail">Disponible ara</span>
            <span className="badge badge-dist">{car.dist} km</span>
            <span className="badge" style={{ background:'rgba(245,197,24,.1)', color:'#f5c518', border:'1px solid rgba(245,197,24,.25)' }}>⭐ {car.rating}</span>
            <span className="badge badge-fuel">{car.fuel}</span>
            <span className="badge badge-trans">{car.transmission}</span>
          </div>

          {/* TABS */}
          <div className="detail-tabs">
            {['info', 'features', 'reviews'].map(t => (
              <button key={t} className={`dt-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                {t === 'info' && '📋 Informació'}
                {t === 'features' && '⚙️ Equipament'}
                {t === 'reviews' && `💬 Opinions (${car.reviews})`}
              </button>
            ))}
          </div>

          {/* TAB: INFO */}
          {activeTab === 'info' && (
            <div className="tab-content fade-in">
              <div className="info-grid">
                {[
                  { label: 'Any',          val: car.year },
                  { label: 'Places',       val: `${car.seats} places` },
                  { label: 'Combustible',  val: car.fuel },
                  { label: 'Transmissió',  val: car.transmission },
                  { label: 'Mín. reserva', val: `${car.minHours} hora` },
                  { label: 'Alquileres',   val: car.reviews },
                  { label: 'Disponible',   val: `${car.availableFrom} – ${car.availableTo}` },
                  { label: 'Valoració',    val: `⭐ ${car.rating} / 5` },
                ].map(({ label, val }) => (
                  <div className="info-cell" key={label}>
                    <div className="ic-label">{label}</div>
                    <div className="ic-val">{val}</div>
                  </div>
                ))}
              </div>

              {car.description && (
                <div className="detail-description">
                  <h3 className="desc-title">Descripció</h3>
                  <p className="desc-text">{car.description}</p>
                </div>
              )}

              {/* Owner */}
              <div className="owner-card">
                <div className="oc-avatar">{car.avatar}</div>
                <div className="oc-info">
                  <div className="oc-name">{car.ownerName}</div>
                  <div className="oc-sub">Propietari verificat · {car.reviews} alquileres</div>
                </div>
                <div className="oc-rating">⭐ {car.rating}</div>
                <button className="btn-ghost-sm oc-msg">Contactar</button>
              </div>

              {/* Map mini */}
              <div className="map-mini">
                <div className="mm-pin" /><div className="mm-ring" />
                <div className="mm-label">📍 Veure a Google Maps</div>
                <div className="mm-grid">
                  {[30,60].map(t => <div key={t} className="mm-h" style={{ top:`${t}%` }} />)}
                  {[33,66].map(l => <div key={l} className="mm-v" style={{ left:`${l}%` }} />)}
                </div>
              </div>
            </div>
          )}

          {/* TAB: FEATURES */}
          {activeTab === 'features' && (
            <div className="tab-content fade-in">
              <div className="features-grid">
                {(car.features || []).map(f => (
                  <div className="feature-item" key={f}>
                    <span className="fi-check">✓</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <div className="safety-note">
                <div className="sn-icon">🛡️</div>
                <div>
                  <div className="sn-title">Assegurança inclosa</div>
                  <div className="sn-text">Totes les reserves inclouen assegurança d'accidents i responsabilitat civil.</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="tab-content fade-in">
              <div className="reviews-summary">
                <div className="rs-big">{car.rating}</div>
                <div className="rs-right">
                  <div className="rs-stars">{'⭐'.repeat(Math.round(car.rating))}</div>
                  <div className="rs-count">{car.reviews} valoracions</div>
                  <div className="rs-bars">
                    {[5,4,3,2,1].map(n => (
                      <div key={n} className="rs-bar-row">
                        <span className="rs-bar-n">{n}★</span>
                        <div className="rs-bar-track"><div className="rs-bar-fill" style={{ width: n >= 4 ? `${n*16}%` : `${n*8}%` }} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="reviews-list">
                {(car.reviewList || []).map((r, i) => (
                  <div className="review-item" key={i}>
                    <div className="ri-header">
                      <div className="ri-avatar">{r.avatar}</div>
                      <div className="ri-meta">
                        <div className="ri-author">{r.author}</div>
                        <div className="ri-date">{r.date}</div>
                      </div>
                      <div className="ri-stars">{'⭐'.repeat(r.rating)}</div>
                    </div>
                    <p className="ri-comment">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT BOOKING PANEL ── */}
        <aside className="booking-panel">
          <div className="bp-header">
            <span className="bp-price">{car.price}€</span>
            <span className="bp-unit">/hora</span>
          </div>

          <div className="bp-section">
            <div className="bp-label">Hora de recollida</div>
            <div className="slots-grid">
              {SLOTS.map(s => (
                <button key={s} className={`slot-btn ${selectedSlot === s ? 'selected' : ''}`}
                  onClick={() => setSelectedSlot(s)}>{s}</button>
              ))}
            </div>
          </div>

          <div className="bp-section">
            <div className="bp-label">Durada</div>
            <div className="hours-picker">
              <button className="hp-btn" onClick={() => setHours(h => Math.max(car.minHours, h - 1))}>−</button>
              <span className="hp-val">{hours} hora{hours !== 1 ? 'es' : ''}</span>
              <button className="hp-btn" onClick={() => setHours(h => Math.min(24, h + 1))}>+</button>
            </div>
            {car.minHours > 1 && <div className="bp-hint">Mín. {car.minHours} hores per aquest vehicle</div>}
          </div>

          <div className="bp-summary">
            <div className="bps-row"><span>{car.price}€ × {hours} hora{hours !== 1 ? 'es' : ''}</span><span>{total}€</span></div>
            <div className="bps-row"><span>Taxa de servei (10%)</span><span>{fee}€</span></div>
            <div className="bps-divider" />
            <div className="bps-row total"><span>Total</span><span>{total + fee}€</span></div>
          </div>

          <button className="btn-reserve" onClick={handleReserve}>RESERVAR ARA</button>
          <p className="bp-note">No se't cobrarà res fins a la confirmació</p>

          <div className="bp-trust">
            <span>🔒 Pagament segur</span>
            <span>🛡️ Assegurança inclosa</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
