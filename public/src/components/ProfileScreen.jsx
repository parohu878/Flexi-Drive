import { useState } from 'react';
import './ProfileScreen.css';

const RESERVATIONS = [
  { id: 1, car: 'Seat León 2021',     date: '28 Abr 2026', hours: 3, price: 59,  status: 'active'    },
  { id: 2, car: 'Tesla Model 3 2023', date: '20 Abr 2026', hours: 2, price: 62,  status: 'completed' },
  { id: 3, car: 'BMW Serie 3 2022',   date: '12 Abr 2026', hours: 4, price: 97,  status: 'completed' },
  { id: 4, car: 'Renault Clio 2020',  date: '2 Abr 2026',  hours: 5, price: 83,  status: 'completed' },
  { id: 5, car: 'VW Golf 2021',       date: '18 Mar 2026', hours: 3, price: 56,  status: 'cancelled' },
];

const MY_CARS = [
  { id: 1, name: 'Honda Civic 2019', location: 'Sants', price: 12, reservations: 3, earnings: 432, status: 'active' },
];

const TABS = ['Reserves', 'Els meus cotxes', 'Estadístiques', 'Configuració'];

export default function ProfileScreen({ navigate, cars }) {
  const [activeTab, setActiveTab] = useState(0);

  const totalSpent    = RESERVATIONS.filter(r => r.status === 'completed').reduce((s, r) => s + r.price, 0);
  const totalEarnings = MY_CARS.reduce((s, c) => s + c.earnings, 0);

  return (
    <div className="profile-page fade-in">
      <div className="profile-inner">
        {/* ── Left col ── */}
        <aside className="profile-sidebar">
          <div className="profile-card">
            <div className="profile-avatar">JD</div>
            <div className="profile-name">Joan Duran</div>
            <div className="profile-email">joan.duran@email.com</div>
            <div className="profile-stats">
              <div className="pstat"><span className="pstat-n">7</span><span className="pstat-l">Reserves</span></div>
              <div className="pstat-sep" />
              <div className="pstat"><span className="pstat-n">4.8★</span><span className="pstat-l">Valoració</span></div>
              <div className="pstat-sep" />
              <div className="pstat"><span className="pstat-n">1</span><span className="pstat-l">Cotxe</span></div>
            </div>
            <div className="profile-badge">✅ Verificat · Membre des de 2025</div>
          </div>

          <nav className="profile-nav">
            {TABS.map((label, i) => (
              <button key={label} className={`pnav-item ${activeTab === i ? 'active' : ''}`}
                onClick={() => setActiveTab(i)}>
                <span className="pnav-icon">
                  {i===0?'📋':i===1?'🚗':i===2?'📊':'⚙️'}
                </span>
                <span>{label}</span>
                {i===0 && <span className="pnav-badge">1</span>}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Main col ── */}
        <div className="profile-main">

          {/* ── TAB 0: RESERVES ── */}
          {activeTab === 0 && (
            <div className="fade-in">
              <div className="pm-header">
                <h2 className="profile-section-title">Les meves reserves</h2>
                <button className="btn-primary" onClick={() => navigate('search')}>+ Nova reserva</button>
              </div>
              <div className="res-filter">
                {['Totes','Actives','Completades','Cancel·lades'].map(f => (
                  <button key={f} className="res-filter-btn active-first">{f}</button>
                ))}
              </div>
              <div className="reservations-list">
                {RESERVATIONS.map(r => (
                  <div className="reservation-card" key={r.id}>
                    <div className="rc-car-icon">🚗</div>
                    <div className="rc-info">
                      <div className="rc-name">{r.car}</div>
                      <div className="rc-date">{r.date} · {r.hours} hores</div>
                    </div>
                    <div className="rc-right">
                      <div className="rc-price">{r.price}€</div>
                      <span className={`rc-status ${r.status}`}>
                        {r.status==='active'?'🟢 Activa':r.status==='completed'?'✓ Completada':'✗ Cancel·lada'}
                      </span>
                      {r.status==='completed' && <button className="btn-ghost-sm rc-review">Valorar</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 1: COTXES ── */}
          {activeTab === 1 && (
            <div className="fade-in">
              <div className="pm-header">
                <h2 className="profile-section-title">Els meus cotxes</h2>
                <button className="btn-primary" onClick={() => navigate('publish')}>+ Publicar cotxe</button>
              </div>
              {MY_CARS.map(c => (
                <div className="my-car-card expanded" key={c.id}>
                  <div className="mcc-icon">🚗</div>
                  <div className="mcc-info">
                    <div className="mcc-name">{c.name}</div>
                    <div className="mcc-meta">📍 {c.location} · {c.price}€/hora</div>
                    <div className="mcc-stats">
                      <span>📅 {c.reservations} reserves</span>
                      <span>💰 {c.earnings}€ guanyats</span>
                    </div>
                  </div>
                  <div className="mcc-actions">
                    <span className={`mcc-status ${c.status}`}>{c.status==='active'?'Actiu':'Pausat'}</span>
                    <button className="btn-ghost-sm">Editar</button>
                    <button className="btn-ghost-sm danger">Pausar</button>
                  </div>
                </div>
              ))}
              <div className="add-car-cta" onClick={() => navigate('publish')}>
                <div className="acc-icon">+</div>
                <div className="acc-text">Publicar un altre cotxe</div>
                <div className="acc-hint">Guanya fins a 450€/mes addicionals</div>
              </div>
            </div>
          )}

          {/* ── TAB 2: ESTADÍSTIQUES ── */}
          {activeTab === 2 && (
            <div className="fade-in">
              <h2 className="profile-section-title">Estadístiques</h2>
              <div className="stats-grid">
                {[
                  { label: 'Total gastat',    value: `${totalSpent}€`,     icon: '💳', color: '#e040fb' },
                  { label: 'Total guanyat',   value: `${totalEarnings}€`,  icon: '💰', color: '#5dcaa5' },
                  { label: 'Reserves totals', value: RESERVATIONS.length,  icon: '📅', color: '#9b4dca' },
                  { label: 'Cotxes publicats',value: MY_CARS.length,       icon: '🚗', color: '#4db8ff' },
                ].map(s => (
                  <div className="stat-card" key={s.label} style={{ '--sc-color': s.color }}>
                    <div className="sc-icon">{s.icon}</div>
                    <div className="sc-value">{s.value}</div>
                    <div className="sc-label">{s.label}</div>
                  </div>
                ))}
              </div>

              <h3 className="stats-subtitle">Activitat recent</h3>
              <div className="activity-chart">
                {['Gen','Feb','Mar','Abr','Mai','Jun'].map((m, i) => (
                  <div key={m} className="ac-col">
                    <div className="ac-bar-wrap">
                      <div className="ac-bar" style={{ height: `${[20,45,30,70,55,80][i]}%` }} />
                    </div>
                    <div className="ac-month">{m}</div>
                  </div>
                ))}
              </div>
              <div className="ac-legend"><span style={{ color:'var(--p)' }}>■</span> Reserves per mes (2026)</div>
            </div>
          )}

          {/* ── TAB 3: CONFIGURACIÓ ── */}
          {activeTab === 3 && (
            <div className="fade-in">
              <h2 className="profile-section-title">Configuració</h2>
              <div className="settings-list">
                {[
                  { icon: '👤', title: 'Dades personals',      desc: 'Nom, email, telèfon' },
                  { icon: '🔒', title: 'Seguretat',             desc: 'Contrasenya i autenticació 2FA' },
                  { icon: '💳', title: 'Mètodes de pagament',   desc: 'Targetes i compte bancari' },
                  { icon: '🔔', title: 'Notificacions',          desc: 'Email, push i SMS' },
                  { icon: '🌐', title: 'Idioma i regió',         desc: 'Català · Barcelona' },
                  { icon: '🗑️', title: 'Eliminar compte',        desc: 'Acció irreversible', danger: true },
                ].map(s => (
                  <div key={s.title} className={`settings-item ${s.danger ? 'danger' : ''}`}>
                    <div className="si-icon">{s.icon}</div>
                    <div className="si-info">
                      <div className="si-title">{s.title}</div>
                      <div className="si-desc">{s.desc}</div>
                    </div>
                    <div className="si-arrow">›</div>
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
