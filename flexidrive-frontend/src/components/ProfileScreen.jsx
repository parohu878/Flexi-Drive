import { useState, useEffect, useContext } from 'react';
import { useAuth } from '../context/AuthContext';
import { carsService, usersService, reviewsService } from '../services/api';
import { useReservations } from '../context/ReservationsContext';
import { useFavorites } from '../context/FavoritesContext';
import { LanguageContext } from '../context/LanguageContext';
import Icon from './Icon';
import './ProfileScreen.css';

const TAB_ICONS = ['clipboard', 'car', 'heart', 'chart', 'gear'];

export default function ProfileScreen({ navigate, showToast, cars }) {
  const { language, setLanguage, t } = useContext(LanguageContext);
  const { user, updateUser, logout } = useAuth();
  const { reservations, cancelReservation, completeReservation, stats } = useReservations();
  const { favorites } = useFavorites();
  
  const TABS = [
    t('tab_reservations'),
    t('tab_my_cars'),
    t('tab_favorites'),
    t('tab_stats'),
    t('tab_settings')
  ];

  const [activeTab, setActiveTab] = useState(0);
  const [resFilter, setResFilter] = useState('active');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '', city: '' });
  const [ownedBackendCars, setOwnedBackendCars] = useState([]);
  const [userStats, setUserStats] = useState({ totalRentals: 0, rating: 5.0, earnings: 0, reviewsCount: 0 });
  const [confirmModal, setConfirmModal] = useState(null); // { title, message, onConfirm }
  
  // Edit vehicle states
  const [editingCar, setEditingCar] = useState(null);
  const [editCarForm, setEditCarForm] = useState({
    pricePerHour: '',
    mileage: '',
    availableFrom: '',
    availableTo: '',
    description: '',
    features: []
  });

  // Stripe states
  const [editingPayment, setEditingPayment] = useState(false);
  const [cardForm, setCardForm] = useState({ number: '', expiry: '', cvc: '', name: '' });
  const [savedCard, setSavedCard] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('fd_stripe_card')) || null;
    } catch {
      return null;
    }
  });

  const [notifications, setNotifications] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fd_notifications')) || { email: true, push: true, sms: false }; }
    catch { return { email: true, push: true, sms: false }; }
  });

  const [reviewedBookings, setReviewedBookings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('fd_reviewed_bookings') || '[]');
    } catch {
      return [];
    }
  });
  const [reviewingReservation, setReviewingReservation] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const allCars = cars || [];

  const loadOwned = async () => {
    if (!user) return;
    try {
      const ownedCars = await carsService.getCarsByOwner();
      setOwnedBackendCars(ownedCars);
    } catch (e) {
      console.error('Error loading owned cars', e);
    }
  };

  const loadStats = async () => {
    if (!user) return;
    try {
      const data = await usersService.getMyStats();
      setUserStats(data);
    } catch (e) {
      console.error('Error loading stats', e);
    }
  };

  // Fetch cars and stats owned by the logged‑in user from backend
  useEffect(() => {
    loadOwned();
    loadStats();
  }, [user, reservations]);

  const myCars = ownedBackendCars;
  const favCars = favorites.map(id => allCars.find(c => c.id === id)).filter(Boolean);
  const uniqueFavCars = favCars.filter((car, idx, arr) => arr.findIndex(c => c.id === car.id) === idx);
  const filteredRes = resFilter === 'all' ? reservations : resFilter === 'active' ? reservations.filter(r => r.status === 'active' || r.status === 'en_curs') : reservations.filter(r => r.status === resFilter);
  const validReservations = filteredRes;

  useEffect(() => { 
    if (user) {
      setProfileForm({ 
        name: user.name || '', 
        email: user.email || '', 
        phone: user.phone || '',
        city: user.city || ''
      }); 
    } 
  }, [user]);

  const handleProfileSave = async () => {
    try {
      const res = await usersService.updateProfile(profileForm);
      updateUser(res.user);
      setEditingProfile(false);
      showToast('Perfil actualitzat correctament');
    } catch (e) {
      showToast(e.message || 'Error al actualitzar perfil', 'error');
    }
  };

  const handleNotificationToggle = (key) => { 
    const u = { ...notifications, [key]: !notifications[key] }; 
    setNotifications(u); 
    localStorage.setItem('fd_notifications', JSON.stringify(u)); 
    showToast(`Notificacions ${key} ${u[key] ? 'activades' : 'desactivades'}`); 
  };

  const handleCancelReservation = (id) => {
    setConfirmModal({
      title: 'Cancel·lar reserva',
      message: 'Estàs segur que vols cancel·lar aquesta reserva? Aquesta acció no es pot desfer.',
      confirmLabel: 'Sí, cancel·lar',
      danger: true,
      onConfirm: async () => {
        try {
          await cancelReservation(id);
          showToast('Reserva cancel·lada');
          loadStats();
        } catch (e) {
          showToast(e.message || 'Error al cancel·lar reserva', 'error');
        }
        setConfirmModal(null);
      },
    });
  };

  const handleRemoveCar = (carId) => {
    setConfirmModal({
      title: 'Retirar anunci',
      message: 'Estàs segur que vols retirar aquest anunci? El cotxe deixarà de ser visible per als usuaris.',
      confirmLabel: 'Sí, retirar anunci',
      danger: true,
      onConfirm: async () => {
        try {
          await carsService.deleteCar(carId);
          showToast('Anunci retirat correctament');
          await loadOwned();
        } catch (e) {
          showToast(e.message || 'Error al retirar cotxe', 'error');
        }
        setConfirmModal(null);
      },
    });
  };

  const handleCompleteReservation = (reservation) => {
    setConfirmModal({
      title: t('complete_booking'),
      message: t('complete_booking') + '?',
      confirmLabel: t('complete_booking'),
      onConfirm: async () => {
        try {
          await completeReservation(reservation.id);
          showToast('Reserva completada! Valora el servei.');
          loadStats();
          setTimeout(() => {
            handleOpenReview(reservation);
          }, 600);
        } catch (e) {
          showToast(e.message || 'Error', 'error');
        }
        setConfirmModal(null);
      }
    });
  };

  const handleEditCarClick = (car) => {
    setEditingCar(car);
    setEditCarForm({
      pricePerHour: car.pricePerHour || '',
      mileage: car.mileage || car.km || '',
      availableFrom: car.availableFrom || '08:00',
      availableTo: car.availableTo || '20:00',
      description: car.description || '',
      features: car.features || []
    });
  };

  const handleEditCarSave = async () => {
    try {
      if (!editCarForm.pricePerHour) {
        showToast('El preu per hora és obligatori', 'error');
        return;
      }
      await carsService.updateCar(editingCar.id, {
        pricePerHour: parseFloat(editCarForm.pricePerHour),
        mileage: parseInt(editCarForm.mileage) || 0,
        availableFrom: editCarForm.availableFrom,
        availableTo: editCarForm.availableTo,
        description: editCarForm.description,
        features: editCarForm.features
      });
      showToast(t('edit_success'));
      setEditingCar(null);
      await loadOwned();
    } catch (e) {
      showToast(e.message || 'Error', 'error');
    }
  };

  const handleSaveCard = () => {
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
    setEditingPayment(false);
    showToast(t('stripe_success'));
  };

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

  const handleOpenReview = (reservation) => {
    setReviewingReservation(reservation);
    setReviewRating(5);
    setReviewComment('');
  };

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) {
      showToast('Escriu un comentari si us plau', 'error');
      return;
    }
    setSubmittingReview(true);
    try {
      const carId = reviewingReservation.carId || reviewingReservation.car?.id;
      const ownerId = reviewingReservation.propietarioId;
      await reviewsService.createReview(carId, reviewRating, reviewComment, reviewingReservation.id, ownerId);
      showToast('Valoració enviada correctament');
      const updated = [...reviewedBookings, reviewingReservation.id];
      setReviewedBookings(updated);
      localStorage.setItem('fd_reviewed_bookings', JSON.stringify(updated));
      setReviewingReservation(null);
    } catch (e) {
      showToast(e.message || 'Error al enviar la valoració', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleLogout = () => { logout(); navigate('home'); };

  if (!user) return null;
  const userName = user.name || 'Usuari';
  const userAvatar = user.avatar || userName.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);

  return (
    <div className="profile-page fade-in">
      {/* Confirm Modal */}
      {confirmModal && (
        <div className="confirm-overlay" onClick={() => setConfirmModal(null)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <div className={`confirm-icon ${confirmModal.danger ? 'danger' : ''}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="28" height="28"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/></svg>
            </div>
            <h3 className="confirm-title">{confirmModal.title}</h3>
            <p className="confirm-message">{confirmModal.message}</p>
            <div className="confirm-actions">
              <button className="btn-ghost confirm-cancel-btn" onClick={() => setConfirmModal(null)}>{t('back')}</button>
              <button className={`confirm-ok-btn ${confirmModal.danger ? 'danger' : ''}`} onClick={confirmModal.onConfirm}>{confirmModal.confirmLabel || 'Confirmar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {editingCar && (
        <div className="confirm-overlay" onClick={() => setEditingCar(null)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500, padding: '30px 24px' }}>
            <h3 className="confirm-title">{t('edit_vehicle')}</h3>
            <p style={{ fontSize: 13, color: 'var(--td)', marginBottom: 16 }}>{editingCar.name}</p>
            
            <div className="settings-form" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none', textAlign: 'left' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="sf-row">
                  <label className="sf-lbl">Preu/hora (€)</label>
                  <input className="sf-inp" type="number" value={editCarForm.pricePerHour} onChange={e => setEditCarForm(prev => ({ ...prev, pricePerHour: e.target.value }))} />
                </div>
                <div className="sf-row">
                  <label className="sf-lbl">Kilometratge (km)</label>
                  <input className="sf-inp" type="number" value={editCarForm.mileage} onChange={e => setEditCarForm(prev => ({ ...prev, mileage: e.target.value }))} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="sf-row">
                  <label className="sf-lbl">Disponible des de</label>
                  <input className="sf-inp" type="time" value={editCarForm.availableFrom} onChange={e => setEditCarForm(prev => ({ ...prev, availableFrom: e.target.value }))} />
                </div>
                <div className="sf-row">
                  <label className="sf-lbl">Disponible fins a</label>
                  <input className="sf-inp" type="time" value={editCarForm.availableTo} onChange={e => setEditCarForm(prev => ({ ...prev, availableTo: e.target.value }))} />
                </div>
              </div>

              <div className="sf-row">
                <label className="sf-lbl">{t('descripcio')}</label>
                <textarea className="sf-inp" rows="3" style={{ resize: 'vertical' }} value={editCarForm.description} onChange={e => setEditCarForm(prev => ({ ...prev, description: e.target.value }))} />
              </div>

              <div className="sf-row">
                <label className="sf-lbl">{t('tab_features')}</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', marginTop: 6 }}>
                  {['Aire condicionat', 'Bluetooth', 'GPS', 'Càmera del darrere', 'Sostre solar', 'Pet friendly'].map(feat => {
                    const checked = editCarForm.features.includes(feat);
                    return (
                      <label key={feat} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer', color: 'var(--t)' }}>
                        <input type="checkbox" checked={checked} onChange={() => {
                          const nextFeatures = checked 
                            ? editCarForm.features.filter(f => f !== feat)
                            : [...editCarForm.features, feat];
                          setEditCarForm(prev => ({ ...prev, features: nextFeatures }));
                        }} />
                        {feat}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="confirm-actions" style={{ marginTop: 24 }}>
              <button className="btn-ghost confirm-cancel-btn" onClick={() => setEditingCar(null)}>{t('cancel')}</button>
              <button className="confirm-ok-btn" onClick={handleEditCarSave}>{t('save_changes')}</button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewingReservation && (
        <div className="confirm-overlay" onClick={() => setReviewingReservation(null)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 450, padding: '32px 28px' }}>
            <div className="confirm-icon">
              <Icon name="star" size={28} color="#f5c518" />
            </div>
            <h3 className="confirm-title">Valorar vehicle</h3>
            <p style={{ fontSize: 13, color: 'var(--td)', marginBottom: 20 }}>
              {reviewingReservation.car?.name || reviewingReservation.car || 'Vehicle'}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, textAlign: 'left' }}>
              {/* Star Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--td)', fontWeight: 600 }}>Puntuació</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 3, 4, 5].map(star => {
                    const active = star <= reviewRating;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 4,
                          transition: 'transform 0.15s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <Icon 
                          name="star" 
                          size={28} 
                          color={active ? '#f5c518' : 'rgba(255,255,255,0.15)'} 
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comment text area */}
              <div className="sf-row">
                <label className="sf-lbl">El teu comentari</label>
                <textarea 
                  className="sf-inp" 
                  rows="4" 
                  style={{ resize: 'vertical', width: '100%' }} 
                  placeholder="Explica la teva experiència amb el vehicle..."
                  value={reviewComment} 
                  onChange={e => setReviewComment(e.target.value)} 
                />
              </div>
            </div>

            <div className="confirm-actions" style={{ marginTop: 28 }}>
              <button 
                className="btn-ghost confirm-cancel-btn" 
                onClick={() => setReviewingReservation(null)}
                disabled={submittingReview}
              >
                {t('cancel')}
              </button>
              <button 
                className="confirm-ok-btn" 
                onClick={handleSubmitReview}
                disabled={submittingReview}
              >
                {submittingReview ? 'Enviant...' : 'Enviar valoració'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="profile-inner">
        <aside className="profile-sidebar">
          <div className="profile-card">
            <div className="profile-avatar">{userAvatar}</div>
            <div className="profile-name">{userName}</div>
            <div className="profile-email">{user.email}</div>
            <div className="profile-stats">
              <div className="pstat"><span className="pstat-n">{stats.active}</span><span className="pstat-l">Reserves</span></div>
              <div className="pstat-sep" />
              <div className="pstat"><span className="pstat-n">{user.rating || '4.8'}<Icon name="star" size={10} color="#f5c518" /></span><span className="pstat-l">Valoració</span></div>
              <div className="pstat-sep" />
              <div className="pstat">
                <span className="pstat-n">{myCars.length}</span>
                <span className="pstat-l">Cotxes</span>
              </div>
            </div>
            <div className="profile-badge">
              <Icon name="check" size={12} color="#5dcaa5" />
              {user.verified ? 'Verificat' : 'Membre'} · Membre des de {user.memberSince ?? new Date().toLocaleDateString('es-ES')}
            </div>
          </div>
          <nav className="profile-nav">
            {TABS.map((label, i) => (
              <button key={label} className={`pnav-item ${activeTab === i ? 'active' : ''}`} onClick={() => setActiveTab(i)}>
                <span className="pnav-icon"><Icon name={TAB_ICONS[i]} size={16} color={activeTab === i ? '#c47dff' : 'var(--td)'} /></span>
                <span>{label}</span>
                {i===0 && stats.active > 0 && <span className="pnav-badge">{stats.active}</span>}
                {i===2 && favorites.length > 0 && <span className="pnav-badge">{favorites.length}</span>}
              </button>
            ))}
            <button className="pnav-item pnav-logout" onClick={handleLogout}>
              <span className="pnav-icon"><Icon name="logout" size={16} color="rgba(255,100,100,.7)" /></span>
              <span>Tancar sessió</span>
            </button>
          </nav>
        </aside>

        <div className="profile-main">
          {/* TAB 0: RESERVES */}
          {activeTab === 0 && (
            <div className="fade-in">
              <div className="pm-header">
                <h2 className="profile-section-title">Les meves reserves</h2>
                <button className="btn-primary" onClick={() => navigate('search')}><Icon name="plus" size={13} /> Nova reserva</button>
              </div>
              <div className="res-filter">
                {[
                  { key: 'active', label: t('actives'), count: stats.active },
                  { key: 'completed', label: t('completed'), count: stats.completed },
                  { key: 'cancelled', label: t('cancelled'), count: stats.cancelled },
                ].map(f => (<button key={f.key} className={`res-filter-btn ${resFilter === f.key ? 'active' : ''}`} onClick={() => setResFilter(f.key)}>{f.label} ({f.count})</button>))}
              </div>
              <div className="reservations-list">
                {validReservations.length === 0 && (
                  <div className="empty-res"><Icon name="clipboard" size={36} color="var(--td)" style={{marginBottom:12}} /><p>{t('any')} {t('tab_reservations').toLowerCase()} {resFilter !== 'all' ? `(${resFilter})` : ''}</p><button className="btn-ghost-sm" onClick={() => navigate('search')}>{t('explore_cars')}</button></div>
                )}
                {validReservations.map(r => (
                  <div className="reservation-card" key={r.id}>
                    <div className="rc-car-icon"><Icon name="car" size={22} color="#c47dff" /></div>
                    <div className="rc-info">
                      <div className="rc-name">{r.car?.name || r.car || t('car')}</div>
                      <div className="rc-date"><Icon name="calendar" size={10} color="var(--td)" /> {r.date} · {r.startTime || ''} · {r.hours} {r.hours === 1 ? t('hours_singular') : t('hours_plural')}</div>
                      <div className="rc-date" style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {r.metodo_pago === 'stripe' ? (
                          <><Icon name="card" size={10} color="#5dcaa5" /> Pagat amb Stripe</>
                        ) : (
                          <><Icon name="money" size={10} color="#ff9f43" /> Pagar en mà</>
                        )}
                      </div>
                    </div>
                    <div className="rc-right">
                      <div className="rc-price">{Number(r.total || r.price || 0).toFixed(2)}€</div>
                      <span className={`rc-status ${r.status}`}>
                        {r.status==='active' && <><Icon name="active" size={8} color="#5dcaa5" /> {t('actives')}</>}
                        {r.status==='en_curs' && <><Icon name="play" size={8} color="#ff9f43" /> {t('en_curs')}</>}
                        {r.status==='completed' && <><Icon name="check" size={10} color="#c47dff" /> {t('completed')}</>}
                        {r.status==='cancelled' && <><Icon name="x" size={10} color="#ff6b6b" /> {t('cancelled')}</>}
                      </span>
                      {(r.status === 'active' || r.status === 'en_curs') && (
                        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                          <button className="btn-ghost-sm rc-cancel" onClick={() => handleCancelReservation(r.id)}>{t('cancel')}</button>
                          <button className="btn-primary rc-complete" style={{ padding: '4px 8px', fontSize: 11, background: 'linear-gradient(135deg, #5dcaa5, #3eb088)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', transition: 'all .25s' }} onClick={() => handleCompleteReservation(r)}>{t('complete_booking')}</button>
                        </div>
                      )}
                      {r.status==='completed' && (
                        reviewedBookings.includes(r.id) ? (
                          <span style={{ fontSize: 11, color: '#5dcaa5', display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                            <Icon name="check" size={10} color="#5dcaa5" /> Valorat
                          </span>
                        ) : (
                          <button className="btn-ghost-sm rc-review" onClick={() => handleOpenReview(r)}>
                            <Icon name="star" size={10} /> Valorar
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 1: COTXES */}
          {activeTab === 1 && (
            <div className="fade-in">
              <div className="pm-header">
                <h2 className="profile-section-title">{t('my_cars')}</h2>
                <button className="btn-primary" onClick={() => navigate('publish')}><Icon name="plus" size={13} /> {t('publish_car')}</button>
              </div>
              {myCars.length === 0 && (
                <div className="empty-res">
                  <Icon name="car" size={36} color="var(--td)" style={{marginBottom:12}} />
                  <p>Encara no has publicat cap cotxe</p>
                  <button className="btn-primary" onClick={() => navigate('publish')}>{t('publish_first')}</button>
                </div>
              )}
              {myCars.map(c => (
                <div className="my-car-card expanded" key={c.id}>
                  <div className="mcc-icon" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
                    {c.images && c.images.length > 0 ? (
                      <img src={c.images[0]} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Icon name="car" size={22} color="#c47dff" />
                    )}
                  </div>
                  <div className="mcc-info">
                    <div className="mcc-name">{c.name}</div>
                    <div className="mcc-meta"><Icon name="pin" size={10} color="var(--td)" /> {c.location} · {c.pricePerHour}€/hora</div>
                    <div className="mcc-stats"><span><Icon name="fuel" size={10} /> {c.fuel}</span><span><Icon name="transmission" size={10} /> {c.transmission}</span>{c.mileage ? <span><Icon name="gauge" size={10} /> {c.mileage.toLocaleString()} km</span> : null}</div>
                  </div>
                  <div className="mcc-actions">
                    <span className="mcc-status active"><Icon name="active" size={8} color="#5dcaa5" /> Actiu</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-ghost-sm mcc-edit" style={{ border: '1px solid rgba(155,77,202,.3)', color: '#c47dff' }} onClick={() => handleEditCarClick(c)}>{t('edit')}</button>
                      <button className="btn-ghost-sm mcc-remove" onClick={() => handleRemoveCar(c.id)}>Retirar</button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="add-car-cta" onClick={() => navigate('publish')}>
                <div className="acc-icon"><Icon name="plus" size={24} color="#c47dff" /></div>
                <div className="acc-text">{t('publish_another')}</div>
                <div className="acc-hint">{t('earn_up_to')}</div>
              </div>
            </div>
          )}

          {/* TAB 2: FAVORITS */}
          {activeTab === 2 && (
            <div className="fade-in">
              <div className="pm-header">
                <h2 className="profile-section-title">Els meus favorits</h2>
                <span className="pm-count">{uniqueFavCars.length} cotxes guardats</span>
              </div>
              {uniqueFavCars.length === 0 && (
                <div className="empty-res"><Icon name="heart" size={36} color="var(--td)" style={{marginBottom:12}} /><p>Encara no tens cotxes a favorits</p><button className="btn-ghost-sm" onClick={() => navigate('search')}>Explorar cotxes</button></div>
              )}
              <div className="favorites-grid">
                {uniqueFavCars.map(car => (
                  <div className="fav-card" key={car.id} onClick={() => navigate('detail', car)}>
                    <div className="fav-card-img" style={{ overflow: 'hidden', position: 'relative' }}>
                      {car.images && car.images.length > 0 ? (
                        <img src={car.images[0]} alt={car.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                      ) : (
                        <>
                          <div className="fav-card-color" style={{ background: car.color || '#9b4dca' }} />
                          <span className="fav-card-emoji"><Icon name="car" size={32} color={car.color || '#c47dff'} /></span>
                        </>
                      )}
                    </div>
                    <div className="fav-card-body">
                      <div className="fav-card-name">{car.name}</div>
                      <div className="fav-card-loc"><Icon name="pin" size={10} color="var(--td)" /> {car.location}</div>
                      <div className="fav-card-bottom"><span className="fav-card-price">{car.pricePerHour}€/h</span><span className="fav-card-rating"><Icon name="star" size={11} color="#f5c518" /> {car.rating}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: ESTADÍSTIQUES */}
          {activeTab === 3 && (
            <div className="fade-in">
              <h2 className="profile-section-title">Estadístiques</h2>
              <div className="stats-grid">
                {[
                  { label: 'Total gastat',    value: `${Number(stats.totalSpent || 0).toFixed(2)}€`,     icon: 'card', color: '#e040fb' },
                  { label: 'Total guanyat',   value: `${Number(userStats.earnings || 0).toFixed(2)}€`,   icon: 'money', color: '#5dcaa5' },
                  { label: 'Reserves totals', value: stats.total,                icon: 'calendar', color: '#9b4dca' },
                  { label: 'Cotxes publicats',value: myCars.length,              icon: 'car', color: '#4db8ff' },
                  { label: 'Favorits',        value: favorites.length,           icon: 'heart', color: '#ff6b6b' },
                  { label: 'Reserves actives',value: stats.active,               icon: 'active', color: '#5dcaa5' },
                ].map(s => (
                  <div className="stat-card" key={s.label} style={{ '--sc-color': s.color }}>
                    <div className="sc-icon"><Icon name={s.icon} size={22} color={s.color} /></div>
                    <div className="sc-value">{s.value}</div>
                    <div className="sc-label">{s.label}</div>
                  </div>
                ))}
              </div>
              <h3 className="stats-subtitle">Activitat recent</h3>
              <div className="activity-chart">
                {['Gen','Feb','Mar','Abr','Mai','Jun'].map((m, i) => {
                  const h = [20,45,30,70,55,80][i];
                  return (<div key={m} className="ac-col"><div className="ac-bar-wrap"><div className="ac-bar" style={{ '--bar-height': `${h}%`, animationDelay: `${i * 0.1}s` }} /></div><div className="ac-month">{m}</div></div>);
                })}
              </div>
              <div className="ac-legend"><span style={{ color:'var(--p)' }}>■</span> Reserves per mes (2026)</div>
            </div>
          )}

          {/* TAB 4: CONFIGURACIÓ */}
          {activeTab === 4 && (
            <div className="fade-in">
              <h2 className="profile-section-title">{t('tab_settings')}</h2>
              <div className="settings-section">
                <div className="settings-section-header">
                  <div className="ssh-icon"><Icon name="user" size={20} color="#c47dff" /></div>
                  <div><div className="ssh-title">{t('personal_data')}</div><div className="ssh-desc">{t('personal_desc')}</div></div>
                  <button className="btn-ghost-sm" onClick={() => setEditingProfile(!editingProfile)}>{editingProfile ? t('cancel') : t('edit')}</button>
                </div>
                {editingProfile && (
                  <div className="settings-form fade-in">
                    <div className="sf-row"><label className="sf-lbl">{t('full_name')}</label><input className="sf-inp" type="text" value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} /></div>
                    <div className="sf-row"><label className="sf-lbl">Email</label><input className="sf-inp" type="email" value={profileForm.email} onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))} /></div>
                    <div className="sf-row"><label className="sf-lbl">{t('phone')}</label><input className="sf-inp" type="tel" value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} placeholder="+34 612 345 678" /></div>
                    <button className="btn-primary" onClick={handleProfileSave}>{t('save_changes')}</button>
                  </div>
                )}
              </div>
              <div className="settings-section">
                <div className="settings-section-header">
                  <div className="ssh-icon"><Icon name="bell" size={20} color="#c47dff" /></div>
                  <div><div className="ssh-title">{t('notifications')}</div><div className="ssh-desc">{t('notif_desc')}</div></div>
                </div>
                <div className="notification-toggles">
                  {[
                    { key: 'email', label: 'Email', desc: t('email_desc'), icon: 'mail' },
                    { key: 'push', label: 'Push', desc: t('push_desc'), icon: 'bell' },
                    { key: 'sms', label: 'SMS', desc: t('sms_desc'), icon: 'phone' },
                  ].map(n => (
                    <div className="notif-row" key={n.key}>
                      <div className="notif-info"><div className="notif-label"><Icon name={n.icon} size={13} color="var(--td)" style={{marginRight:6}} />{n.label}</div><div className="notif-desc">{n.desc}</div></div>
                      <button className={`toggle-switch ${notifications[n.key] ? 'on' : ''}`} onClick={() => handleNotificationToggle(n.key)}><div className="toggle-knob" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mètodes de pagament (Stripe Element Simulation) */}
              <div className="settings-section">
                <div className="settings-section-header">
                  <div className="ssh-icon"><Icon name="card" size={20} color="#c47dff" /></div>
                  <div style={{ flex: 1 }}>
                    <div className="ssh-title">{t('payments')}</div>
                    <div className="ssh-desc">{t('payments_desc')}</div>
                  </div>
                  {!savedCard && !editingPayment && (
                    <button className="btn-ghost-sm" onClick={() => setEditingPayment(true)}>{t('edit')}</button>
                  )}
                  {savedCard && !editingPayment && (
                    <button className="btn-ghost-sm" onClick={() => setEditingPayment(true)}>{t('edit')}</button>
                  )}
                  {editingPayment && (
                    <button className="btn-ghost-sm" onClick={() => setEditingPayment(false)}>{t('cancel')}</button>
                  )}
                </div>

                {/* Card input form */}
                {editingPayment && (
                  <div className="settings-form fade-in">
                    <p style={{ fontSize: 12, color: 'var(--td)', marginBottom: 8 }}>{t('stripe_card_desc')}</p>
                    
                    {/* Simulated card preview */}
                    <div className="stripe-card-preview" style={{
                      background: 'linear-gradient(135deg, #1d1b36 0%, #0d0c18 100%)',
                      border: '1px solid rgba(155,77,202,0.3)',
                      borderRadius: 12,
                      padding: 20,
                      marginBottom: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      height: 150,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>{t('stripe_payment_method')}</div>
                        <div style={{ fontSize: 20, fontWeight: 'bold', color: '#c47dff', fontFamily: 'Orbitron' }}>
                          {cardForm.number.startsWith('4') ? 'Visa' : cardForm.number.startsWith('5') ? 'Mastercard' : cardForm.number.startsWith('3') ? 'Amex' : 'Stripe'}
                        </div>
                      </div>
                      
                      <div style={{ fontSize: 'clamp(14px, 4.5vw, 18px)', fontFamily: 'Orbitron', letterSpacing: 2, color: '#fff', textAlign: 'center', margin: '14px 0' }}>
                        {cardForm.number || '•••• •••• •••• ••••'}
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--td)' }}>
                        <div>
                          <div style={{ fontSize: 8, textTransform: 'uppercase', opacity: 0.6 }}>Cardholder</div>
                          <div style={{ color: '#fff' }}>{cardForm.name.toUpperCase() || 'YOUR NAME'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 8, textTransform: 'uppercase', opacity: 0.6 }}>Expires</div>
                          <div style={{ color: '#fff' }}>{cardForm.expiry || 'MM/YY'}</div>
                        </div>
                      </div>
                    </div>

                    <div className="sf-row">
                      <label className="sf-lbl">{t('stripe_card_number')}</label>
                      <input className="sf-inp" type="text" placeholder="4242 4242 4242 4242" value={cardForm.number} onChange={handleCardNumberChange} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div className="sf-row">
                        <label className="sf-lbl">{t('stripe_expiry')}</label>
                        <input className="sf-inp" type="text" placeholder="MM/YY" value={cardForm.expiry} onChange={handleCardExpiryChange} />
                      </div>
                      <div className="sf-row">
                        <label className="sf-lbl">{t('stripe_cvc')}</label>
                        <input className="sf-inp" type="password" placeholder="CVC" value={cardForm.cvc} onChange={handleCardCVCChange} maxLength={4} />
                      </div>
                    </div>
                    <div className="sf-row">
                      <label className="sf-lbl">Cardholder Name</label>
                      <input className="sf-inp" type="text" placeholder="Joan Duran" value={cardForm.name} onChange={e => setCardForm(prev => ({ ...prev, name: e.target.value }))} />
                    </div>
                    <button className="btn-primary" onClick={handleSaveCard}>{t('stripe_save')}</button>
                  </div>
                )}

                {/* Saved Card details view */}
                {savedCard && !editingPayment && (
                  <div className="fade-in" style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--cb)', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 50, height: 35, borderRadius: 6,
                      background: 'linear-gradient(135deg, #1d1b36 0%, #0c0b17 100%)',
                      border: '1px solid rgba(155,77,202,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Orbitron', fontSize: 10, fontWeight: 'bold', color: '#c47dff'
                    }}>
                      {savedCard.brand}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{savedCard.brand} •••• {savedCard.last4}</div>
                      <div style={{ fontSize: 11, color: 'var(--td)' }}>{savedCard.name}</div>
                    </div>
                    <button className="btn-ghost-sm" style={{ marginLeft: 'auto', color: '#ff6b6b', borderColor: 'rgba(255,107,107,0.3)' }} onClick={() => {
                      localStorage.removeItem('fd_stripe_card');
                      setSavedCard(null);
                      showToast('Targeta eliminada');
                    }}>Eliminar</button>
                  </div>
                )}
              </div>

              {/* Idioma i regió */}
              <div className="settings-section">
                <div className="settings-section-header">
                  <div className="ssh-icon"><Icon name="globe" size={20} color="#c47dff" /></div>
                  <div style={{ flex: 1 }}>
                    <div className="ssh-title">{t('lang_region')}</div>
                    <div className="ssh-desc">Català · Spanish · English</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--cb)' }}>
                  {[
                    { code: 'ca', label: 'Català' },
                    { code: 'es', label: 'Español' },
                    { code: 'en', label: 'English' }
                  ].map(l => (
                    <button
                      key={l.code}
                      className={`res-filter-btn ${language === l.code ? 'active' : ''}`}
                      onClick={() => {
                        setLanguage(l.code);
                        showToast(`Idioma canviat a: ${l.label}`);
                      }}
                      style={{ fontSize: 11, padding: '5px 12px' }}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="settings-list">
                <div className="settings-item danger" onClick={() => showToast('Funció no disponible en mode demo', 'error')}>
                  <div className="si-icon"><Icon name="trash" size={18} color="#ff6b6b" /></div>
                  <div className="si-info">
                    <div className="si-title">{t('delete_account')}</div>
                    <div className="si-desc">{t('delete_desc')}</div>
                  </div>
                  <div className="si-arrow"><Icon name="arrowRight" size={14} color="var(--tm)" /></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
