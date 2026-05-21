import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useReservations } from '../context/ReservationsContext';
import { useFavorites } from '../context/FavoritesContext';
import { DEMO_CARS } from '../services/demoData';
import Icon from './Icon';
import './ProfileScreen.css';

const TABS = ['Reserves', 'Els meus cotxes', 'Favorits', 'Estadístiques', 'Configuració'];
const TAB_ICONS = ['clipboard', 'car', 'heart', 'chart', 'gear'];

export default function ProfileScreen({ navigate, showToast, cars }) {
  const { user, updateUser, logout } = useAuth();
  const { reservations, cancelReservation, stats } = useReservations();
  const { favorites } = useFavorites();
  const [activeTab, setActiveTab] = useState(0);
  const [resFilter, setResFilter] = useState('all');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' });
  const [confirmModal, setConfirmModal] = useState(null); // { title, message, onConfirm }
  const [notifications, setNotifications] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fd_notifications')) || { email: true, push: true, sms: false }; }
    catch { return { email: true, push: true, sms: false }; }
  });

  const publishedCars = JSON.parse(localStorage.getItem('fd_published_cars') || '[]');
  const allCars = [...(cars || []), ...DEMO_CARS];
  const favCars = favorites.map(id => allCars.find(c => c.id === id)).filter(Boolean);
  const uniqueFavCars = favCars.filter((car, idx, arr) => arr.findIndex(c => c.id === car.id) === idx);
  const filteredRes = resFilter === 'all' ? reservations : reservations.filter(r => r.status === resFilter);

  useEffect(() => { if (user) setProfileForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' }); }, [user]);

  const handleProfileSave = () => { updateUser(profileForm); setEditingProfile(false); showToast('Perfil actualitzat correctament'); };
  const handleNotificationToggle = (key) => { const u = { ...notifications, [key]: !notifications[key] }; setNotifications(u); localStorage.setItem('fd_notifications', JSON.stringify(u)); showToast(`Notificacions ${key} ${u[key] ? 'activades' : 'desactivades'}`); };
  const handleCancelReservation = (id) => {
    setConfirmModal({
      title: 'Cancel·lar reserva',
      message: 'Estàs segur que vols cancel·lar aquesta reserva? Aquesta acció no es pot desfer.',
      confirmLabel: 'Sí, cancel·lar',
      danger: true,
      onConfirm: () => { cancelReservation(id); showToast('Reserva cancel·lada'); setConfirmModal(null); },
    });
  };
  const handleRemoveCar = (carId) => {
    setConfirmModal({
      title: 'Retirar anunci',
      message: 'Estàs segur que vols retirar aquest anunci? El cotxe deixarà de ser visible per als usuaris.',
      confirmLabel: 'Sí, retirar anunci',
      danger: true,
      onConfirm: () => {
        const updated = JSON.parse(localStorage.getItem('fd_published_cars') || '[]').filter(c => c.id !== carId);
        localStorage.setItem('fd_published_cars', JSON.stringify(updated));
        showToast('Anunci retirat correctament');
        setConfirmModal(null);
        window.location.reload();
      },
    });
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
              <button className="btn-ghost confirm-cancel-btn" onClick={() => setConfirmModal(null)}>Tornar enrere</button>
              <button className={`confirm-ok-btn ${confirmModal.danger ? 'danger' : ''}`} onClick={confirmModal.onConfirm}>{confirmModal.confirmLabel || 'Confirmar'}</button>
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
              <div className="pstat"><span className="pstat-n">{stats.total}</span><span className="pstat-l">Reserves</span></div>
              <div className="pstat-sep" />
              <div className="pstat"><span className="pstat-n">{user.rating || '4.8'}<Icon name="star" size={10} color="#f5c518" /></span><span className="pstat-l">Valoració</span></div>
              <div className="pstat-sep" />
              <div className="pstat"><span className="pstat-n">{publishedCars.length}</span><span className="pstat-l">Cotxes</span></div>
            </div>
            <div className="profile-badge"><Icon name="check" size={12} color="#5dcaa5" /> {user.verified ? 'Verificat' : 'Membre'} · Membre des de {user.memberSince || '2025'}</div>
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
                  { key: 'all', label: 'Totes', count: reservations.length },
                  { key: 'active', label: 'Actives', count: stats.active },
                  { key: 'completed', label: 'Completades', count: stats.completed },
                  { key: 'cancelled', label: 'Cancel·lades', count: stats.cancelled },
                ].map(f => (<button key={f.key} className={`res-filter-btn ${resFilter === f.key ? 'active' : ''}`} onClick={() => setResFilter(f.key)}>{f.label} ({f.count})</button>))}
              </div>
              <div className="reservations-list">
                {filteredRes.length === 0 && (
                  <div className="empty-res"><Icon name="clipboard" size={36} color="var(--td)" style={{marginBottom:12}} /><p>Cap reserva {resFilter !== 'all' ? `amb estat "${resFilter}"` : 'encara'}</p><button className="btn-ghost-sm" onClick={() => navigate('search')}>Buscar cotxes</button></div>
                )}
                {filteredRes.map(r => (
                  <div className="reservation-card" key={r.id}>
                    <div className="rc-car-icon"><Icon name="car" size={22} color="#c47dff" /></div>
                    <div className="rc-info">
                      <div className="rc-name">{r.car?.name || r.car || 'Cotxe'}</div>
                      <div className="rc-date"><Icon name="calendar" size={10} color="var(--td)" /> {r.date} · {r.startTime || ''} · {r.hours} hores</div>
                    </div>
                    <div className="rc-right">
                      <div className="rc-price">{r.total || r.price}€</div>
                      <span className={`rc-status ${r.status}`}>
                        {r.status==='active' && <><Icon name="active" size={8} color="#5dcaa5" /> Activa</>}
                        {r.status==='completed' && <><Icon name="check" size={10} color="#c47dff" /> Completada</>}
                        {r.status==='cancelled' && <><Icon name="x" size={10} color="#ff6b6b" /> Cancel·lada</>}
                      </span>
                      {r.status === 'active' && <button className="btn-ghost-sm rc-cancel" onClick={() => handleCancelReservation(r.id)}>Cancel·lar</button>}
                      {r.status==='completed' && <button className="btn-ghost-sm rc-review"><Icon name="star" size={10} /> Valorar</button>}
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
                <h2 className="profile-section-title">Els meus cotxes</h2>
                <button className="btn-primary" onClick={() => navigate('publish')}><Icon name="plus" size={13} /> Publicar cotxe</button>
              </div>
              {publishedCars.length === 0 && (
                <div className="empty-res"><Icon name="car" size={36} color="var(--td)" style={{marginBottom:12}} /><p>Encara no has publicat cap cotxe</p><button className="btn-primary" onClick={() => navigate('publish')}>Publicar el primer</button></div>
              )}
              {publishedCars.map(c => (
                <div className="my-car-card expanded" key={c.id}>
                  <div className="mcc-icon"><Icon name="car" size={22} color="#c47dff" /></div>
                  <div className="mcc-info">
                    <div className="mcc-name">{c.name}</div>
                    <div className="mcc-meta"><Icon name="pin" size={10} color="var(--td)" /> {c.location} · {c.pricePerHour}€/hora</div>
                    <div className="mcc-stats"><span><Icon name="fuel" size={10} /> {c.fuel}</span><span><Icon name="transmission" size={10} /> {c.transmission}</span>{c.mileage ? <span><Icon name="gauge" size={10} /> {c.mileage.toLocaleString()} km</span> : null}</div>
                  </div>
                  <div className="mcc-actions">
                    <span className="mcc-status active"><Icon name="active" size={8} color="#5dcaa5" /> Actiu</span>
                    <button className="btn-ghost-sm mcc-remove" onClick={() => handleRemoveCar(c.id)}>Retirar</button>
                  </div>
                </div>
              ))}
              <div className="add-car-cta" onClick={() => navigate('publish')}>
                <div className="acc-icon"><Icon name="plus" size={24} color="#c47dff" /></div>
                <div className="acc-text">Publicar un altre cotxe</div>
                <div className="acc-hint">Guanya fins a 450€/mes addicionals</div>
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
                    <div className="fav-card-img"><div className="fav-card-color" style={{ background: car.color || '#9b4dca' }} /><span className="fav-card-emoji"><Icon name="car" size={32} color={car.color || '#c47dff'} /></span></div>
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
                  { label: 'Total gastat',    value: `${stats.totalSpent}€`,     icon: 'card', color: '#e040fb' },
                  { label: 'Total guanyat',   value: `${0}€`,                    icon: 'money', color: '#5dcaa5' },
                  { label: 'Reserves totals', value: stats.total,                icon: 'calendar', color: '#9b4dca' },
                  { label: 'Cotxes publicats',value: publishedCars.length,       icon: 'car', color: '#4db8ff' },
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
              <h2 className="profile-section-title">Configuració</h2>
              <div className="settings-section">
                <div className="settings-section-header">
                  <div className="ssh-icon"><Icon name="user" size={20} color="#c47dff" /></div>
                  <div><div className="ssh-title">Dades personals</div><div className="ssh-desc">Nom, email, telèfon</div></div>
                  <button className="btn-ghost-sm" onClick={() => setEditingProfile(!editingProfile)}>{editingProfile ? 'Cancel·lar' : 'Editar'}</button>
                </div>
                {editingProfile && (
                  <div className="settings-form fade-in">
                    <div className="sf-row"><label className="sf-lbl">Nom complet</label><input className="sf-inp" type="text" value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} /></div>
                    <div className="sf-row"><label className="sf-lbl">Email</label><input className="sf-inp" type="email" value={profileForm.email} onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))} /></div>
                    <div className="sf-row"><label className="sf-lbl">Telèfon</label><input className="sf-inp" type="tel" value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} placeholder="+34 612 345 678" /></div>
                    <button className="btn-primary" onClick={handleProfileSave}>Guardar canvis</button>
                  </div>
                )}
              </div>
              <div className="settings-section">
                <div className="settings-section-header">
                  <div className="ssh-icon"><Icon name="bell" size={20} color="#c47dff" /></div>
                  <div><div className="ssh-title">Notificacions</div><div className="ssh-desc">Configura com vols rebre alertes</div></div>
                </div>
                <div className="notification-toggles">
                  {[
                    { key: 'email', label: 'Email', desc: 'Rebre confirmacions i alertes per email', icon: 'mail' },
                    { key: 'push', label: 'Push', desc: 'Notificacions del navegador en temps real', icon: 'bell' },
                    { key: 'sms', label: 'SMS', desc: 'Missatges de text per a reserves urgents', icon: 'phone' },
                  ].map(n => (
                    <div className="notif-row" key={n.key}>
                      <div className="notif-info"><div className="notif-label"><Icon name={n.icon} size={13} color="var(--td)" style={{marginRight:6}} />{n.label}</div><div className="notif-desc">{n.desc}</div></div>
                      <button className={`toggle-switch ${notifications[n.key] ? 'on' : ''}`} onClick={() => handleNotificationToggle(n.key)}><div className="toggle-knob" /></button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="settings-list">
                {[
                  { icon: 'lock', title: 'Seguretat', desc: 'Contrasenya i autenticació 2FA' },
                  { icon: 'card', title: 'Mètodes de pagament', desc: 'Targetes i compte bancari' },
                  { icon: 'globe', title: 'Idioma i regió', desc: 'Català · Barcelona' },
                  { icon: 'trash', title: 'Eliminar compte', desc: 'Acció irreversible', danger: true },
                ].map(s => (
                  <div key={s.title} className={`settings-item ${s.danger ? 'danger' : ''}`} onClick={() => showToast(s.danger ? 'Funció no disponible en mode demo' : 'Funció pròximament disponible')}>
                    <div className="si-icon"><Icon name={s.icon} size={18} color={s.danger ? '#ff6b6b' : '#c47dff'} /></div>
                    <div className="si-info"><div className="si-title">{s.title}</div><div className="si-desc">{s.desc}</div></div>
                    <div className="si-arrow"><Icon name="arrowRight" size={14} color="var(--tm)" /></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
