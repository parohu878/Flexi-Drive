import { useState, useEffect } from 'react';
import { adminService, carsService, reservationsService } from '../services/api';
import Icon from './Icon';
import CustomSelect from './CustomSelect';
import './AdminDashboard.css';

export default function AdminDashboard({ navigate, showToast }) {
  const [activeTab, setActiveTab] = useState('vehicles');
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'vehicles') {
        const data = await adminService.getAllVehicles();
        setVehicles(data);
      } else {
        const data = await adminService.getAllBookings();
        setBookings(data);
      }
    } catch (err) {
      showToast('Error en carregar dades d\'administració', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Toggle vehicle active status
  const handleToggleVehicleActive = async (vehicle) => {
    try {
      const updated = await carsService.updateCar(vehicle.id, {
        ...vehicle,
        activo: !vehicle.activo
      });
      showToast(updated.activo ? 'Vehicle activat' : 'Vehicle desactivat');
      setVehicles(prev => prev.map(v => v.id === vehicle.id ? { ...v, activo: updated.activo } : v));
    } catch (err) {
      showToast('Error en canviar l\'estat del vehicle', 'error');
    }
  };

  // Delete vehicle
  const handleDeleteVehicle = async (id) => {
    if (!window.confirm('Segur que vols desactivar definitivament aquest vehicle?')) return;
    try {
      await carsService.deleteCar(id);
      showToast('Vehicle desactivat correctament');
      setVehicles(prev => prev.map(v => v.id === id ? { ...v, activo: false } : v));
    } catch (err) {
      showToast('Error en esborrar el vehicle', 'error');
    }
  };

  // Save vehicle changes
  const handleSaveVehicle = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        make: editingVehicle.make,
        model: editingVehicle.model,
        matricula: editingVehicle.matricula,
        year: parseInt(editingVehicle.year),
        mileage: parseInt(editingVehicle.mileage),
        pricePerHour: parseFloat(editingVehicle.pricePerHour),
        fuel: editingVehicle.fuel,
        transmission: editingVehicle.transmission,
        description: editingVehicle.description,
        availableFrom: editingVehicle.availableFrom,
        availableTo: editingVehicle.availableTo,
        seats: parseInt(editingVehicle.seats),
        location: editingVehicle.location,
        activo: editingVehicle.activo
      };
      await carsService.updateCar(editingVehicle.id, payload);
      showToast('Vehicle actualitzat correctament');
      setEditingVehicle(null);
      loadData();
    } catch (err) {
      showToast(err.message || 'Error en desar el vehicle', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Save booking changes
  const handleSaveBooking = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminService.updateBooking(editingBooking.id, {
        status: editingBooking.status,
        startDate: editingBooking.startDate,
        endDate: editingBooking.endDate,
        price: parseFloat(editingBooking.price)
      });
      showToast('Reserva actualitzada correctament');
      setEditingBooking(null);
      loadData();
    } catch (err) {
      showToast(err.message || 'Error en desar la reserva', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Quick cancel booking
  const handleCancelBooking = async (id) => {
    if (!window.confirm('Segur que vols cancel·lar aquesta reserva?')) return;
    try {
      await reservationsService.cancelReservation(id);
      showToast('Reserva cancel·lada correctament');
      loadData();
    } catch (err) {
      showToast('Error en cancel·lar la reserva', 'error');
    }
  };

  // Quick complete booking
  const handleCompleteBooking = async (id) => {
    try {
      await reservationsService.completeReservation(id);
      showToast('Reserva completada correctament');
      loadData();
    } catch (err) {
      showToast('Error en completar la reserva', 'error');
    }
  };

  // Filter lists
  const filteredVehicles = vehicles.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.matricula.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.owner?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBookings = bookings.filter(b => 
    b.id.toString().includes(searchQuery) ||
    b.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.renterName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.car?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-page fade-in">
      <div className="admin-inner">
        <div className="admin-header-panel">
          <div>
            <h1 className="admin-title">Tauler d'Administració</h1>
            <p className="admin-sub">Control i gestió de tota la plataforma FlexiDrive</p>
          </div>
          
          <div className="admin-tabs">
            <button 
              className={`admin-tab ${activeTab === 'vehicles' ? 'active' : ''}`}
              onClick={() => { setActiveTab('vehicles'); setSearchQuery(''); }}
            >
              <Icon name="car" size={14} /> Vehicles ({vehicles.length})
            </button>
            <button 
              className={`admin-tab ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => { setActiveTab('bookings'); setSearchQuery(''); }}
            >
              <Icon name="calendar" size={14} /> Reserves ({bookings.length})
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="admin-filters">
          <div className="search-box">
            <Icon name="search" size={14} color="var(--td)" />
            <input 
              type="text" 
              placeholder={activeTab === 'vehicles' ? "Cerca per marca, model, matrícula o propietari..." : "Cerca per id, client, cotxe..."} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn-refresh" onClick={loadData} title="Refrescar dades">
            <Icon name="bolt" size={14} /> Refrescar
          </button>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="app-loader" />
            <p>Carregant dades del panell...</p>
          </div>
        ) : activeTab === 'vehicles' ? (
          <div className="admin-table-wrapper fade-in">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Imatge</th>
                  <th>Vehicle</th>
                  <th>Matrícula</th>
                  <th>Preu/h</th>
                  <th>Propietari</th>
                  <th>Estat</th>
                  <th style={{ textAlign: 'right' }}>Accions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--td)' }}>
                      No s'ha trobat cap vehicle.
                    </td>
                  </tr>
                ) : filteredVehicles.map(v => (
                  <tr key={v.id} className={!v.activo ? 'row-inactive' : ''}>
                    <td>{v.id}</td>
                    <td>
                      <div className="table-img-container">
                        {v.images && v.images.length > 0 ? (
                          <img src={v.images[0]} alt={v.name} className="table-thumbnail" />
                        ) : (
                          <div className="table-thumbnail-placeholder"><Icon name="car" size={14} /></div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="table-name">{v.name}</div>
                      <div className="table-sub">{v.year} · {v.fuel} · {v.transmission}</div>
                    </td>
                    <td><span className="badge-plate">{v.matricula}</span></td>
                    <td style={{ color: 'var(--p)', fontWeight: 'bold' }}>{v.pricePerHour}€</td>
                    <td>
                      <div className="table-owner">{v.owner?.name || 'Sistema'}</div>
                      <div className="table-sub">{v.location?.split(',')[0]}</div>
                    </td>
                    <td>
                      <button 
                        className={`toggle-status-btn ${v.activo ? 'active' : 'inactive'}`}
                        onClick={() => handleToggleVehicleActive(v)}
                        title={v.activo ? "Desactivar vehicle" : "Activar vehicle"}
                      >
                        {v.activo ? 'Actiu' : 'Inactiu'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="actions-cell">
                        <button className="action-btn edit" onClick={() => setEditingVehicle(v)} title="Editar vehicle">
                          <Icon name="gear" size={12} />
                        </button>
                        <button className="action-btn delete" onClick={() => handleDeleteVehicle(v.id)} title="Desactivar vehicle">
                          <Icon name="trash" size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-table-wrapper fade-in">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Codi</th>
                  <th>Cotxe</th>
                  <th>Client (Inquilí)</th>
                  <th>Dates</th>
                  <th>Total</th>
                  <th>Pagament</th>
                  <th>Estat</th>
                  <th style={{ textAlign: 'right' }}>Accions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--td)' }}>
                      No s'ha trobat cap reserva.
                    </td>
                  </tr>
                ) : filteredBookings.map(b => (
                  <tr key={b.id} className={`status-row-${b.status}`}>
                    <td><span className="badge-code">{b.id}</span></td>
                    <td>
                      <div className="table-name">{b.car?.name || `Cotxe #${b.carId}`}</div>
                      <div className="table-sub">Propietari: {b.ownerName}</div>
                    </td>
                    <td>
                      <div className="table-name">{b.renterName}</div>
                      <div className="table-sub">{b.renterEmail}</div>
                    </td>
                    <td>
                      <div className="table-date">{b.date} - {b.startTime}</div>
                      <div className="table-sub">{b.hours}h de durada</div>
                    </td>
                    <td style={{ fontWeight: 'bold' }}>{b.total}€</td>
                    <td>
                      <span className={`payment-badge ${b.metodo_pago}`}>
                        <Icon name={b.metodo_pago === 'stripe' ? 'card' : 'money'} size={10} style={{ marginRight: 4 }} />
                        {b.metodo_pago === 'stripe' ? 'Stripe' : 'En mà'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${b.status}`}>
                        {b.status === 'active' ? 'Confirmada' : b.status === 'en_curs' ? 'En curs' : b.status === 'cancelled' ? 'Cancel·lada' : 'Completada'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="actions-cell">
                        <button className="action-btn edit" onClick={() => setEditingBooking(b)} title="Editar reserva">
                          <Icon name="gear" size={12} />
                        </button>
                        {b.status === 'active' && (
                          <>
                            <button className="action-btn check" onClick={() => handleCompleteBooking(b.id)} title="Completar reserva">
                              <Icon name="check" size={12} />
                            </button>
                            <button className="action-btn delete" onClick={() => handleCancelBooking(b.id)} title="Cancel·lar reserva">
                              <Icon name="x" size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Editing Vehicle Modal */}
        {editingVehicle && (
          <div className="modal-overlay">
            <div className="modal-content admin-modal fade-in">
              <div className="modal-header">
                <h2>Editar Vehicle #{editingVehicle.id}</h2>
                <button className="modal-close" onClick={() => setEditingVehicle(null)}>
                  <Icon name="x" size={14} />
                </button>
              </div>
              <form onSubmit={handleSaveVehicle}>
                <div className="modal-body">
                  <div className="field-row-2">
                    <div className="field-group">
                      <label className="field-label">Marca</label>
                      <input 
                        type="text" 
                        className="field-input" 
                        value={editingVehicle.make || ''} 
                        onChange={e => setEditingVehicle({ ...editingVehicle, make: e.target.value })} 
                        required
                      />
                    </div>
                    <div className="field-group">
                      <label className="field-label">Model</label>
                      <input 
                        type="text" 
                        className="field-input" 
                        value={editingVehicle.model || ''} 
                        onChange={e => setEditingVehicle({ ...editingVehicle, model: e.target.value })} 
                        required
                      />
                    </div>
                  </div>

                  <div className="field-row-2">
                    <div className="field-group">
                      <label className="field-label">Matrícula</label>
                      <input 
                        type="text" 
                        className="field-input" 
                        value={editingVehicle.matricula || ''} 
                        onChange={e => setEditingVehicle({ ...editingVehicle, matricula: e.target.value })} 
                        required
                      />
                    </div>
                    <div className="field-group">
                      <label className="field-label">Any</label>
                      <input 
                        type="number" 
                        className="field-input" 
                        value={editingVehicle.year || ''} 
                        onChange={e => setEditingVehicle({ ...editingVehicle, year: e.target.value })} 
                        required
                      />
                    </div>
                  </div>

                  <div className="field-row-2">
                    <div className="field-group">
                      <label className="field-label">Kilòmetres</label>
                      <input 
                        type="number" 
                        className="field-input" 
                        value={editingVehicle.mileage || 0} 
                        onChange={e => setEditingVehicle({ ...editingVehicle, mileage: e.target.value })} 
                      />
                    </div>
                    <div className="field-group">
                      <label className="field-label">Preu per hora (€)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        className="field-input" 
                        value={editingVehicle.pricePerHour || ''} 
                        onChange={e => setEditingVehicle({ ...editingVehicle, pricePerHour: e.target.value })} 
                        required
                      />
                    </div>
                  </div>

                  <div className="field-row-2">
                    <div className="field-group">
                      <label className="field-label">Combustible</label>
                      <CustomSelect 
                        value={editingVehicle.fuel} 
                        onChange={e => setEditingVehicle({ ...editingVehicle, fuel: e.target.value })}
                        options={['Gasolina', 'Diésel', 'Eléctrico', 'Híbrido']}
                      />
                    </div>
                    <div className="field-group">
                      <label className="field-label">Transmissió</label>
                      <CustomSelect 
                        value={editingVehicle.transmission} 
                        onChange={e => setEditingVehicle({ ...editingVehicle, transmission: e.target.value })}
                        options={['Manual', 'Automático']}
                      />
                    </div>
                  </div>

                  <div className="field-row-2">
                    <div className="field-group">
                      <label className="field-label">Disponible Des De</label>
                      <input 
                        type="text" 
                        className="field-input" 
                        placeholder="08:00" 
                        value={editingVehicle.availableFrom || '08:00'} 
                        onChange={e => setEditingVehicle({ ...editingVehicle, availableFrom: e.target.value })} 
                      />
                    </div>
                    <div className="field-group">
                      <label className="field-label">Disponible Fins A</label>
                      <input 
                        type="text" 
                        className="field-input" 
                        placeholder="20:00" 
                        value={editingVehicle.availableTo || '20:00'} 
                        onChange={e => setEditingVehicle({ ...editingVehicle, availableTo: e.target.value })} 
                      />
                    </div>
                  </div>

                  <div className="field-group">
                    <label className="field-label">Ubicació</label>
                    <input 
                      type="text" 
                      className="field-input" 
                      value={editingVehicle.location || ''} 
                      onChange={e => setEditingVehicle({ ...editingVehicle, location: e.target.value })} 
                      required
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label">Descripció</label>
                    <textarea 
                      className="field-input textarea" 
                      rows="3" 
                      value={editingVehicle.description || ''} 
                      onChange={e => setEditingVehicle({ ...editingVehicle, description: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-ghost" onClick={() => setEditingVehicle(null)}>
                    Cancel·lar
                  </button>
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Desant...' : 'Desar canvis'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Editing Booking Modal */}
        {editingBooking && (
          <div className="modal-overlay">
            <div className="modal-content admin-modal fade-in">
              <div className="modal-header">
                <h2>Editar Reserva #{editingBooking.id}</h2>
                <button className="modal-close" onClick={() => setEditingBooking(null)}>
                  <Icon name="x" size={14} />
                </button>
              </div>
              <form onSubmit={handleSaveBooking}>
                <div className="modal-body">
                  <div className="field-group">
                    <label className="field-label">Estat de la reserva</label>
                    <CustomSelect 
                      value={editingBooking.status} 
                      onChange={e => setEditingBooking({ ...editingBooking, status: e.target.value })}
                      options={[
                        { value: 'active', label: 'Confirmada' },
                        { value: 'en_curs', label: 'En curs' },
                        { value: 'completed', label: 'Completada' },
                        { value: 'cancelled', label: 'Cancel·lada' }
                      ]}
                    />
                  </div>

                  <div className="field-group">
                    <label className="field-label">Data Inici</label>
                    <input 
                      type="text" 
                      className="field-input" 
                      value={editingBooking.startDate || ''} 
                      onChange={e => setEditingBooking({ ...editingBooking, startDate: e.target.value })} 
                      required
                    />
                    <span className="field-hint">Format ISO: YYYY-MM-DDTHH:MM:SSZ</span>
                  </div>

                  <div className="field-group">
                    <label className="field-label">Data Final</label>
                    <input 
                      type="text" 
                      className="field-input" 
                      value={editingBooking.endDate || ''} 
                      onChange={e => setEditingBooking({ ...editingBooking, endDate: e.target.value })} 
                      required
                    />
                    <span className="field-hint">Format ISO: YYYY-MM-DDTHH:MM:SSZ</span>
                  </div>

                  <div className="field-group">
                    <label className="field-label">Preu Total (€)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      className="field-input" 
                      value={editingBooking.price || ''} 
                      onChange={e => setEditingBooking({ ...editingBooking, price: e.target.value })} 
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-ghost" onClick={() => setEditingBooking(null)}>
                    Cancel·lar
                  </button>
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Desant...' : 'Desar canvis'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
