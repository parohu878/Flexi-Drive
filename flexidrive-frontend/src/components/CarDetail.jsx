import { useState, useEffect, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import { useReservations } from '../context/ReservationsContext';
import { useFavorites } from '../context/FavoritesContext';
import { LanguageContext } from '../context/LanguageContext';
import { reviewsService } from '../services/api';
import CarMiniature from './CarMiniature';
import Icon from './Icon';
import './CarDetail.css';

const SLOTS = ['Ara mateix', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

const carPinIcon = (color = '#9b4dca') => L.divIcon({
  className: 'custom-marker',
  html: `<div style="
    background: ${color}; color: #fff;
    width: 40px; height: 40px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    display: flex; align-items: center; justify-content: center;
    border: 2px solid rgba(255,255,255,0.4);
    box-shadow: 0 4px 16px rgba(0,0,0,0.5), 0 0 20px ${color}44;
  "><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform:rotate(45deg)"><path d="M2 13h2a2.5 2.5 0 0 1 5 0h6a2.5 2.5 0 0 1 5 0h2"/><path d="M2 13v-2.5c0-.8.5-1.5 1.2-1.8l3.3-1.4A3 3 0 0 1 9.8 7H14.2a3 3 0 0 1 2.1.8l3.3 1.4c.7.3 1.2 1 1.2 1.8V13"/><path d="M12 7v6" opacity="0.5"/><circle cx="6.5" cy="13" r="2.5"/><circle cx="6.5" cy="13" r="0.8" fill="#fff"/><circle cx="17.5" cy="13" r="2.5"/><circle cx="17.5" cy="13" r="0.8" fill="#fff"/></svg></div>`,
  iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40],
});

export default function CarDetail({ car, navigate, showToast, onRequireAuth }) {
  const { t } = useContext(LanguageContext);
  const { isAuthenticated } = useAuth();
  const { addReservation } = useReservations();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [hours, setHours] = useState(1);
  const [activeTab, setActiveTab] = useState('info');
  const [reserving, setReserving] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  useEffect(() => {
    setActiveImgIndex(0);
  }, [car.id]);

  // Payment states
  const [payMethod, setPayMethod] = useState('cash');
  const [savedCard, setSavedCard] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('fd_stripe_card')) || null;
    } catch {
      return null;
    }
  });
  const [cardForm, setCardForm] = useState({ number: '', expiry: '', cvc: '', name: '' });

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    let formatted = '';
    for (let i = 0; i < value.length && i < 16; i++) {
      if (i > 0 && i % 4 === 0) formatted += ' ';
      formatted += value[i];
    }
    setCardForm(prev => ({ ...prev, number: formatted }));
  };

  const handleCardExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    let formatted = '';
    if (value.length > 0) {
      formatted = value.substring(0, 2);
      if (value.length > 2) {
        formatted += '/' + value.substring(2, 4);
      }
    }
    setCardForm(prev => ({ ...prev, expiry: formatted }));
  };

  const handleCardCVCChange = (e) => {
    let value = e.target.value.replace(/\D/g, '').substring(0, 4);
    setCardForm(prev => ({ ...prev, cvc: value }));
  };

  if (!car) return null;

  const price = car.pricePerHour || car.price || 0;
  const ownerName = car.owner?.name || car.ownerName || '';
  const ownerAvatar = car.owner?.avatar || car.avatar || '??';
  
  // Calculate dynamically if reviews are loaded, otherwise fallback to car values
  const reviewCount = reviews.length > 0 ? reviews.length : (car.totalReviews || car.reviews || (car.reviewList ? car.reviewList.length : 0) || 0);
  const rating = reviews.length > 0 
    ? parseFloat((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1))
    : (car.rating || 5.0);

  const dist = car.dist != null ? car.dist : '?';
  const minH = car.minHours || 1;
  const fav = isFavorite(car.id);
  const total = price * hours;
  const fee = Math.round(total * 0.1);

  useEffect(() => {
    if (car.id) {
      setReviewsLoading(true);
      reviewsService.getCarReviews(car.id)
        .then(data => setReviews(data || []))
        .catch(() => {})
        .finally(() => setReviewsLoading(false));
    }
  }, [car.id]);

  const handleReserve = async () => {
    if (!isAuthenticated) { onRequireAuth(); return; }
    if (!selectedSlot) { showToast('Selecciona una franja horària primer', 'error'); return; }
    
    // Stripe validation if chosen
    if (payMethod === 'stripe' && !savedCard) {
      const { number, expiry, cvc, name } = cardForm;
      if (!number || !expiry || !cvc || !name) {
        showToast('Completa tots els camps de la targeta', 'error');
        return;
      }
      if (number.replace(/\s/g, '').length < 16) {
        showToast('Número de targeta invàlid', 'error');
        return;
      }
      const cleanNumber = number.replace(/\s/g, '');
      const cardData = {
        last4: cleanNumber.substring(cleanNumber.length - 4),
        brand: cleanNumber.startsWith('4') ? 'Visa' : cleanNumber.startsWith('5') ? 'Mastercard' : 'Amex',
        name
      };
      localStorage.setItem('fd_stripe_card', JSON.stringify(cardData));
      setSavedCard(cardData);
    }

    setReserving(true);
    
    // Calcular fechas de inicio y fin
    const start = new Date();
    if (selectedSlot !== 'Ara mateix') {
      const [h, m] = selectedSlot.split(':').map(Number);
      start.setHours(h, m, 0, 0);
      if (start < new Date()) {
        start.setDate(start.getDate() + 1);
      }
    }
    const end = new Date(start.getTime() + hours * 60 * 60 * 1000);

    try {
      await addReservation(car.id, start, end, payMethod);
      showToast(`Reserva confirmada! ${car.name} a les ${selectedSlot}`);
      setTimeout(() => navigate('profile'), 1200);
    } catch (err) { 
      showToast(`${err.message || 'Error al reservar'}`, 'error'); 
    } finally { 
      setReserving(false); 
    }
  };

  const handleContactOwner = () => {
    if (!isAuthenticated) {
      onRequireAuth();
      return;
    }
    const chats = JSON.parse(localStorage.getItem('fd_chats') || '[]');
    let chat = chats.find(c => c.name === ownerName);
    if (!chat) {
      chat = {
        id: 'chat_' + Date.now().toString(),
        name: ownerName,
        messages: [
          { sender: 'them', text: `Hola! Estàs interessat en el meu vehicle (${car.name})? Pregunta'm el que vulguis!`, ts: Date.now() }
        ]
      };
      chats.push(chat);
      localStorage.setItem('fd_chats', JSON.stringify(chats));
    }
    localStorage.setItem('fd_active_chat_id', chat.id);
    navigate('chat');
  };

  const allReviews = reviews.length > 0 ? reviews : (car.reviewList || []);

  return (
    <div className="detail-page fade-in">
      <div className="detail-hero">
        <div className="dh-bg" />
        <div className="dh-inner">
          <button className="detail-back" onClick={() => navigate('search')}><Icon name="arrowLeft" size={14} /> Tornar</button>
          <button className={`fav-btn detail-fav ${fav ? 'active' : ''}`} onClick={() => toggleFavorite(car.id)}>
            <Icon name={fav ? 'heart' : 'heartOutline'} size={18} color={fav ? '#e040fb' : 'rgba(255,255,255,.6)'} fill={fav ? '#e040fb' : 'none'} />
          </button>
          <div className="dh-car">
            {car.images && car.images.length > 0 ? (
              <div className="detail-carousel">
                <img
                  src={car.images[activeImgIndex]}
                  alt={`${car.name} - ${activeImgIndex + 1}`}
                  className="carousel-img"
                />
                {car.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="carousel-btn prev"
                      onClick={() => setActiveImgIndex(prev => (prev === 0 ? car.images.length - 1 : prev - 1))}
                      aria-label="Anterior"
                    >
                      <Icon name="arrowLeft" size={16} color="#fff" />
                    </button>
                    <button
                      type="button"
                      className="carousel-btn next"
                      onClick={() => setActiveImgIndex(prev => (prev === car.images.length - 1 ? 0 : prev + 1))}
                      aria-label="Següent"
                    >
                      <Icon name="arrowRight" size={16} color="#fff" />
                    </button>
                    <div className="carousel-dots">
                      {car.images.map((_, index) => (
                        <button
                          type="button"
                          key={index}
                          className={`carousel-dot ${index === activeImgIndex ? 'active' : ''}`}
                          onClick={() => setActiveImgIndex(index)}
                          aria-label={`Imatge ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <CarMiniature size="large" color={car.color} />
            )}
          </div>
        </div>
      </div>

      <div className="detail-body">
        <div className="detail-main">
          <div className="detail-header">
            <div>
              <h1 className="detail-name">{car.name}</h1>
              <div className="detail-location"><Icon name="pin" size={12} color="var(--td)" /> {car.location} · {dist} km de tu</div>
            </div>
            <div className="detail-price-block">
              <div className="dp-amount">{price}€</div>
              <div className="dp-unit">per hora</div>
            </div>
          </div>

          <div className="detail-badges">
            <span className="badge badge-avail"><Icon name="check" size={11} /> Disponible ara</span>
            <span className="badge badge-dist">{dist} km</span>
            <span className="badge" style={{ background:'rgba(245,197,24,.1)', color:'#f5c518', border:'1px solid rgba(245,197,24,.25)' }}><Icon name="star" size={11} color="#f5c518" /> {rating}</span>
            <span className="badge badge-fuel"><Icon name="fuel" size={11} /> {car.fuel}</span>
            <span className="badge badge-trans"><Icon name="transmission" size={11} /> {car.transmission}</span>
          </div>

          <div className="detail-tabs">
            {['info', 'features', 'reviews'].map(t => (
              <button key={t} className={`dt-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                {t === 'info' && <><Icon name="info" size={13} /> Informació</>}
                {t === 'features' && <><Icon name="gear" size={13} /> Equipament</>}
                {t === 'reviews' && <><Icon name="message" size={13} /> Opinions ({reviewCount})</>}
              </button>
            ))}
          </div>

          {activeTab === 'info' && (
            <div className="tab-content fade-in">
              <div className="info-grid">
                {[
                  { icon: 'calendar', label: 'Any', val: car.year },
                  { icon: 'seats', label: 'Places', val: `${car.seats} places` },
                  { icon: 'fuel', label: 'Combustible', val: car.fuel },
                  { icon: 'transmission', label: 'Transmissió', val: car.transmission },
                  { icon: 'clock', label: 'Mín. reserva', val: `${minH} ${minH === 1 ? t('hours_singular') : t('hours_plural')}` },
                  { icon: 'clipboard', label: 'Alquileres', val: reviewCount },
                  { icon: 'clock', label: 'Disponible', val: `${car.availableFrom || '08:00'} – ${car.availableTo || '20:00'}` },
                  { icon: 'star', label: 'Valoració', val: `${rating} / 5` },
                ].map(({ icon, label, val }) => (
                  <div className="info-cell" key={label}>
                    <div className="ic-label"><Icon name={icon} size={10} color="var(--pg)" style={{marginRight:4}} />{label}</div>
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

              <div className="owner-card">
                <div className="oc-avatar">{ownerAvatar}</div>
                <div className="oc-info">
                  <div className="oc-name">{ownerName}</div>
                  <div className="oc-sub">Propietari verificat · {reviewCount} alquileres</div>
                </div>
                <div className="oc-rating"><Icon name="star" size={12} color="#f5c518" /> {rating}</div>
              </div>

              {car.lat && car.lng && (
                <div className="detail-map-container">
                  <h3 className="desc-title" style={{ marginBottom: 12 }}><Icon name="pin" size={14} color="#c47dff" /> Ubicació del vehicle</h3>
                  <div className="detail-map">
                    <MapContainer center={[car.lat, car.lng]} zoom={15} style={{ width: '100%', height: '100%', borderRadius: 12 }} scrollWheelZoom={false} dragging={true} zoomControl={true}>
                      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                      <Marker position={[car.lat, car.lng]} icon={carPinIcon(car.color || '#9b4dca')}>
                        <Popup><div style={{ fontFamily: 'Rajdhani', minWidth: 120 }}><strong>{car.name}</strong><br/><span style={{ color: '#aaa' }}>{car.location}</span></div></Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                  <div className="map-location-label"><Icon name="pin" size={11} color="var(--td)" /> {car.location}, {car.city || 'Barcelona'}</div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'features' && (
            <div className="tab-content fade-in">
              <div className="features-grid">
                {(car.features || []).map(f => (
                  <div className="feature-item" key={f}>
                    <span className="fi-check"><Icon name="check" size={14} color="#22aa7a" /></span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <div className="safety-note">
                <div className="sn-icon"><Icon name="shield" size={22} color="#22aa7a" /></div>
                <div>
                  <div className="sn-title">Assegurança inclosa</div>
                  <div className="sn-text">Totes les reserves inclouen assegurança d'accidents i responsabilitat civil.</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="tab-content fade-in">
              <div className="reviews-summary">
                <div className="rs-big">{rating}</div>
                <div className="rs-right">
                  <div className="rs-stars">{Array.from({length:Math.round(rating)}).map((_,i)=><Icon key={i} name="star" size={14} color="#f5c518" />)}</div>
                  <div className="rs-count">{reviewCount} valoracions</div>
                  {reviews.length > 0 && (
                    <div className="rs-bars">
                      {[5,4,3,2,1].map(n => {
                        const countForStar = reviews.filter(r => Math.round(r.rating) === n).length;
                        const percent = (countForStar / reviews.length) * 100;
                        return (
                          <div key={n} className="rs-bar-row">
                            <span className="rs-bar-n">{n}<Icon name="star" size={8} color="var(--td)" /></span>
                            <div className="rs-bar-track"><div className="rs-bar-fill" style={{ width: `${percent}%` }} /></div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className="reviews-list">
                {reviewsLoading && <div style={{ textAlign: 'center', padding: 30, color: 'var(--td)' }}><div className="app-loader" style={{ width: 24, height: 24, borderWidth: 2 }} /></div>}
                {!reviewsLoading && allReviews.length === 0 && <div style={{ textAlign: 'center', padding: 30, color: 'var(--td)', fontSize: 14 }}>Encara no hi ha valoracions per aquest cotxe</div>}
                {!reviewsLoading && allReviews.map((r, i) => (
                  <div className="review-item" key={r.id || i}>
                    <div className="ri-header">
                      <div className="ri-avatar">{r.user?.avatar || r.avatar || '??'}</div>
                      <div className="ri-meta">
                        <div className="ri-author">{r.user?.name || r.author || 'Anònim'}</div>
                        <div className="ri-date">{r.createdAt ? new Date(r.createdAt).toLocaleDateString('ca-ES') : r.date || ''}</div>
                      </div>
                      <div className="ri-stars">{Array.from({length:r.rating||0}).map((_,j)=><Icon key={j} name="star" size={12} color="#f5c518" />)}</div>
                    </div>
                    <p className="ri-comment">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="booking-panel">
          <div className="bp-header">
            <span className="bp-price">{price}€</span>
            <span className="bp-unit">/hora</span>
          </div>
          <div className="bp-section">
            <div className="bp-label"><Icon name="clock" size={12} color="var(--pg)" /> Hora de recollida</div>
            <div className="slots-grid">
              {SLOTS.map(s => (<button key={s} className={`slot-btn ${selectedSlot === s ? 'selected' : ''}`} onClick={() => setSelectedSlot(s)}>{s}</button>))}
            </div>
          </div>
          <div className="bp-section">
            <div className="bp-label"><Icon name="clock" size={12} color="var(--pg)" /> Durada</div>
            <div className="hours-picker">
              <button className="hp-btn" onClick={() => setHours(h => Math.max(minH, h - 1))}>−</button>
              <span className="hp-val">{hours} {hours === 1 ? t('hours_singular') : t('hours_plural')}</span>
              <button className="hp-btn" onClick={() => setHours(h => Math.min(24, h + 1))}>+</button>
            </div>
            {minH > 1 && <div className="bp-hint">Mín. {minH} {t('hours_plural')} per aquest vehicle</div>}
          </div>
          <div className="bp-section">
            <div className="bp-label"><Icon name="card" size={12} color="var(--pg)" /> Mètode de pagament</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', padding: '10px 12px', background: payMethod === 'cash' ? 'rgba(197, 130, 255, 0.08)' : 'rgba(255,255,255,0.03)', border: payMethod === 'cash' ? '1px solid rgba(197, 130, 255, 0.5)' : '1px solid rgba(197, 130, 255, 0.15)', borderRadius: 8, transition: 'all 0.2s', color: 'var(--t)' }}>
                <input type="radio" name="payMethod" checked={payMethod === 'cash'} onChange={() => setPayMethod('cash')} style={{ accentColor: 'var(--p)' }} />
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="money" size={14} color="#5dcaa5" /> Pagar en mà</span>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', padding: '10px 12px', background: payMethod === 'stripe' ? 'rgba(197, 130, 255, 0.08)' : 'rgba(255,255,255,0.03)', border: payMethod === 'stripe' ? '1px solid rgba(197, 130, 255, 0.5)' : '1px solid rgba(197, 130, 255, 0.15)', borderRadius: 8, transition: 'all 0.2s', color: 'var(--t)' }}>
                <input type="radio" name="payMethod" checked={payMethod === 'stripe'} onChange={() => setPayMethod('stripe')} style={{ accentColor: 'var(--p)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="card" size={14} color="#c47dff" /> Pagar amb Stripe (Targeta)</span>
                  {savedCard && <span style={{ fontSize: 11, color: 'var(--td)', marginLeft: 20 }}>{savedCard.brand} ···· {savedCard.last4}</span>}
                </div>
              </label>

              {payMethod === 'stripe' && !savedCard && (
                <div className="fade-in" style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(197, 130, 255, 0.3)', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                  <input className="field-input" style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', fontSize: 12, outline: 'none' }} type="text" placeholder="Número de targeta (ex: 4242...)" value={cardForm.number} onChange={handleCardNumberChange} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="field-input" style={{ flex: 1, padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', fontSize: 12, outline: 'none' }} type="text" placeholder="MM/YY" value={cardForm.expiry} onChange={handleCardExpiryChange} />
                    <input className="field-input" style={{ flex: 1, padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', fontSize: 12, outline: 'none' }} type="password" placeholder="CVC" value={cardForm.cvc} onChange={handleCardCVCChange} maxLength={4} />
                  </div>
                  <input className="field-input" style={{ width: '100%', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#fff', fontSize: 12, outline: 'none' }} type="text" placeholder="Nom del titular" value={cardForm.name} onChange={e => setCardForm(prev => ({ ...prev, name: e.target.value }))} />
                </div>
              )}
            </div>
          </div>
          <div className="bp-summary">
            <div className="bps-row"><span>{price}€ × {hours} {hours === 1 ? t('hours_singular') : t('hours_plural')}</span><span>{total}€</span></div>
            <div className="bps-row"><span>Taxa de servei (10%)</span><span>{fee}€</span></div>
            <div className="bps-divider" />
            <div className="bps-row total"><span>Total</span><span>{total + fee}€</span></div>
          </div>
          <button className="btn-reserve" onClick={handleReserve} disabled={reserving}>
            {reserving ? 'RESERVANT...' : isAuthenticated ? 'RESERVAR ARA' : 'INICIA SESSIÓ PER RESERVAR'}
          </button>
          <p className="bp-note">No se't cobrarà res fins a la confirmació</p>
          <div className="bp-trust">
            <span><Icon name="lock" size={11} color="var(--tm)" /> Pagament segur</span>
            <span><Icon name="shield" size={11} color="var(--tm)" /> Assegurança inclosa</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
