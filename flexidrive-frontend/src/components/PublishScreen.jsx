import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { carsService } from '../services/api';
import Icon from './Icon';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import CustomSelect from './CustomSelect';
import './PublishScreen.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hours = String(Math.floor(i / 2)).padStart(2, '0');
  const minutes = i % 2 === 0 ? '00' : '30';
  return `${hours}:${minutes}`;
});

const DAYS = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'];
const ALL_FEATURES = [
  'A/C', 'Bluetooth', 'USB', 'GPS', 'Càmera enrere', 'Càmera 360°',
  'Sensors aparcament', 'Seients pell', 'Seients calefactables', 'A/C bizona',
  'Apple CarPlay', 'Android Auto', 'Llums LED', 'Sostre solar', 'Mode ECO',
  'Conducció assistida', 'Portó elèctric', 'Keyless Go', 'Radi FM',
];

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.setView(center, map.getZoom()); }, [center, map]);
  return null;
}

export default function PublishScreen({ showToast, navigate, onCarCreated }) {
  const { isAuthenticated, user } = useAuth();
  const [activeDays, setActiveDays] = useState([0,1,2,3,4]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [photos, setPhotos] = useState([]);
const [dragOver, setDragOver] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState(['A/C', 'Bluetooth']);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({ makeModel: '', matricula: '', year: '', mileage: '', seats: '5', fuel: 'Gasolina', transmission: 'Manual', location: '', availableFrom: '08:00', availableTo: '20:00', pricePerHour: '', minHours: '1', description: '' });
  const [mapPos, setMapPos] = useState([41.3874, 2.1686]);

  const set = (key) => (e) => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(err => ({ ...err, [key]: null })); };
  const toggleDay = (i) => setActiveDays(d => d.includes(i) ? d.filter(x => x !== i) : [...d, i]);
  const toggleFeature = (f) => setSelectedFeatures(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  const validateStep1 = () => { const errs = {}; if (!form.makeModel.trim()) errs.makeModel = 'Marca i model obligatoris'; if (!form.matricula.trim()) {
        errs.matricula = 'Matrícula obligatòria';
      } else if (!/^\d{4}[A-Z]{3}$/.test(form.matricula.trim())) {
        errs.matricula = 'Formato matrícula inválido (1234ABC)';
      } if (!form.year || form.year < 1990 || form.year > 2027) errs.year = 'Any vàlid obligatori'; if (!form.location.trim()) errs.location = 'Ubicació obligatòria'; setErrors(errs); return Object.keys(errs).length === 0; };
  const validateStep3 = () => { const errs = {}; if (!form.pricePerHour || form.pricePerHour <= 0) errs.pricePerHour = 'Preu obligatori'; setErrors(errs); return Object.keys(errs).length === 0; };
  const goStep = (s) => { if (s === 2 && !validateStep1()) return; setStep(s); };

  const handleFiles = (files) => {
    let currentPhotosCount = photos.length;
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        if (file.size > 5 * 1024 * 1024) {
          showToast(`La imatge ${file.name} supera el límit de 5 MB`, 'error');
          return;
        }
        if (currentPhotosCount >= 8) {
          showToast('Màxim 8 fotos permeses', 'warning');
          return;
        }
        currentPhotosCount++;
        const reader = new FileReader();
        reader.onload = (e) => {
          setPhotos(prev => [...prev, { id: Date.now() + Math.random(), url: e.target.result, name: file.name }]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); };
  const removePhoto = (id) => { setPhotos(prev => prev.filter(p => p.id !== id)); };

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.display_name) {
        setForm(f => ({ ...f, location: data.display_name.split(',').slice(0, 3).join(',') }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setMapPos([e.latlng.lat, e.latlng.lng]);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
        setErrors(err => ({ ...err, location: null }));
      }
    });
    return <Marker position={mapPos} />;
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setMapPos([lat, lng]);
          reverseGeocode(lat, lng);
          setErrors(err => ({ ...err, location: null }));
        },
        () => showToast('Permís d\'ubicació denegat', 'error')
      );
    } else {
      showToast('Geolocalització no suportada', 'error');
    }
  };

  const handleLocationBlur = async () => {
    if (!form.location.trim()) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.location.trim())}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setMapPos([lat, lng]);
      }
    } catch (e) {
      console.error('Error geocoding location:', e);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validateStep3()) return;
    const parts = form.makeModel.trim().split(' ');
    setLoading(true);
    try {
      const newCar = await carsService.createCar({ 
        make: parts[0] || '', 
        model: parts.slice(1).join(' ') || parts[0], 
        matricula: form.matricula, 
        year: parseInt(form.year), 
        mileage: parseInt(form.mileage) || 0, 
        location: form.location, 
        city: form.location.split(',')[1]?.trim() || 'Barcelona', 
        lat: mapPos[0], 
        lng: mapPos[1], 
        pricePerHour: parseFloat(form.pricePerHour), 
        seats: parseInt(form.seats), 
        fuel: form.fuel, 
        transmission: form.transmission, 
        minHours: parseInt(form.minHours) || 1, 
        description: form.description, 
        features: selectedFeatures, 
        availableFrom: form.availableFrom, 
        availableTo: form.availableTo 
      });

      // Subir fotos al backend/Supabase Storage
      if (photos.length > 0) {
        for (let i = 0; i < photos.length; i++) {
          const photo = photos[i];
          const resBlob = await fetch(photo.url);
          const blob = await resBlob.blob();
          await carsService.uploadPhoto(newCar.id, blob, photo.name || `photo_${i}.jpg`, i === 0);
        }
      }

      showToast('Cotxe publicat correctament!');
      
      const subscribedEmail = localStorage.getItem('fd_newsletter_email');
      if (subscribedEmail) {
        setTimeout(() => {
          showToast(`Correu enviat a ${subscribedEmail} amb el nou cotxe: ${form.makeModel}!`, 'success');
        }, 800);
      }

      if (onCarCreated) onCarCreated();
      setTimeout(() => navigate('profile'), 2500);
    } catch (err) { 
      showToast(`${err.message || 'Error al publicar'}`, 'error'); 
    } finally {
      setLoading(false);
    }
  };

  const estimatedPrice = parseFloat(form.pricePerHour) || 15;
  const estimatedEarnings = Math.round(estimatedPrice * activeDays.length * 3 * 4.3);

  return (
    <div className="publish-page fade-in">
      <div className="publish-inner">
        <div className="pub-header">
          <h1 className="pub-title">Publica el teu coche</h1>
          <p className="pub-sub">Comença a guanyar diners deixant el teu vehicle</p>
        </div>

        <div className="steps-nav">
          {['Vehicle', 'Disponibilitat', 'Preu i fotos'].map((label, i) => (
            <div key={i} className={`step-nav-item ${step === i+1 ? 'active' : ''} ${step > i+1 ? 'done' : ''}`}>
              <div className="sni-num">{step > i+1 ? <Icon name="check" size={14} /> : i+1}</div>
              <span className="sni-label">{label}</span>
              {i < 2 && <div className="sni-line" />}
            </div>
          ))}
        </div>

        <form className="pub-form" onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="form-step fade-in">
              <h2 className="step-section-title"><Icon name="car" size={16} color="#c47dff" /> Dades del vehicle</h2>
              <div className="field-row-2">
                <div className="field-group">
                  <label className="field-label">Marca i model</label>
                  <input className={`field-input ${errors.makeModel ? 'field-error' : ''}`} type="text" placeholder="Ex: Seat León 2021" value={form.makeModel} onChange={set('makeModel')} />
                  {errors.makeModel && <span className="field-error-msg">{errors.makeModel}</span>}
                </div>
                <div className="field-group">
                  <label className="field-label">Matrícula</label>
                  <input className={`field-input ${errors.matricula ? 'field-error' : ''}`} type="text" placeholder="Ex: 1234ABC" value={form.matricula} onChange={set('matricula')} />
                  {errors.matricula && <span className="field-error-msg">{errors.matricula}</span>}
                </div>
                <div className="field-group">
                  <label className="field-label">Any</label>
                  <input className={`field-input ${errors.year ? 'field-error' : ''}`} type="number" placeholder="2021" value={form.year} onChange={set('year')} />
                  {errors.year && <span className="field-error-msg">{errors.year}</span>}
                </div>
              </div>
              <div className="field-row-2">
                <div className="field-group">
                  <label className="field-label"><Icon name="gauge" size={11} color="#c47dff" /> Quilometratge actual (km)</label>
                  <input className="field-input" type="number" placeholder="Ex: 45000" value={form.mileage} onChange={set('mileage')} min="0" />
                  <span className="field-hint">Indica els km actuals del cotxe</span>
                </div>
                <div className="field-group">
                  <label className="field-label">Places</label>
                  <CustomSelect value={form.seats} onChange={set('seats')} options={['2','4','5','7']} />
                </div>
              </div>
              <div className="field-row-2">
                <div className="field-group"><label className="field-label">Combustible</label><CustomSelect value={form.fuel} onChange={set('fuel')} options={['Gasolina','Diésel','Eléctrico','Híbrido']} /></div>
                <div className="field-group"><label className="field-label">Canvi</label><CustomSelect value={form.transmission} onChange={set('transmission')} options={['Manual','Automático']} /></div>
              </div>
              
              <div className="field-group">
                <label className="field-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span><Icon name="pin" size={11} color="#c47dff" /> Ubicació del cotxe</span>
                  <button type="button" onClick={handleUseCurrentLocation} style={{ background: 'none', border: 'none', color: '#c47dff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon name="pin" size={12} /> Utilitzar ubicació actual
                  </button>
                </label>
                <input className={`field-input ${errors.location ? 'field-error' : ''}`} type="text" placeholder="Carrer, número, ciutat…" value={form.location} onChange={set('location')} onBlur={handleLocationBlur} style={{ marginBottom: 12 }} />
                <div style={{ height: 200, width: '100%', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <MapContainer center={mapPos} zoom={13} style={{ width: '100%', height: '100%' }}>
                    <TileLayer attribution='&copy; Google Maps' url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />
                    <MapUpdater center={mapPos} />
                    <LocationMarker />
                  </MapContainer>
                </div>
                <span className="field-hint" style={{ marginTop: 8, display: 'block' }}>Fes clic al mapa per ajustar la ubicació exacta</span>
                {errors.location && <span className="field-error-msg">{errors.location}</span>}
              </div>

              <div className="field-group">
                <label className="field-label"><Icon name="gear" size={11} color="#c47dff" /> Equipament del vehicle</label>
                <div className="feature-chips">{ALL_FEATURES.map(f => (<button key={f} type="button" className={`feature-chip ${selectedFeatures.includes(f) ? 'active' : ''}`} onClick={() => toggleFeature(f)}>{selectedFeatures.includes(f) ? <><Icon name="check" size={10} /> </> : ''}{f}</button>))}</div>
                <div className="feature-count">{selectedFeatures.length} seleccionats</div>
              </div>
              <div className="form-nav"><div /><button type="button" className="btn-primary" onClick={() => goStep(2)}>Continuar <Icon name="arrowRight" size={12} /></button></div>
            </div>
          )}

          {step === 2 && (
            <div className="form-step fade-in">
              <h2 className="step-section-title"><Icon name="calendar" size={16} color="#c47dff" /> Disponibilitat</h2>
              <div className="field-group">
                <label className="field-label">Dies disponibles</label>
                <div className="day-chips">{DAYS.map((d, i) => (<button key={i} type="button" className={`day-chip ${activeDays.includes(i) ? 'on' : ''}`} onClick={() => toggleDay(i)}>{d}</button>))}</div>
              </div>
              <div className="field-row-2">
                <div className="field-group">
                  <label className="field-label">Des de</label>
                  <CustomSelect value={form.availableFrom} onChange={set('availableFrom')} options={TIME_OPTIONS} />
                </div>
                <div className="field-group">
                  <label className="field-label">Fins a</label>
                  <CustomSelect value={form.availableTo} onChange={set('availableTo')} options={TIME_OPTIONS} />
                </div>
              </div>
              <div className="avail-preview">
                <div className="ap-label">Vista prèvia</div>
                <div className="ap-days">{DAYS.map((d, i) => (<div key={i} className={`ap-day ${activeDays.includes(i) ? 'on' : 'off'}`}>{d}</div>))}</div>
                <div className="ap-time"><Icon name="clock" size={12} /> {form.availableFrom} – {form.availableTo}</div>
              </div>
              <div className="form-nav">
                <button type="button" className="btn-ghost" onClick={() => setStep(1)}><Icon name="arrowLeft" size={12} /> Enrere</button>
                <button type="button" className="btn-primary" onClick={() => goStep(3)}>Continuar <Icon name="arrowRight" size={12} /></button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="form-step fade-in">
              <h2 className="step-section-title"><Icon name="money" size={16} color="#c47dff" /> Preu i fotos</h2>
              <div className="field-row-2">
                <div className="field-group">
                  <label className="field-label">Preu per hora (€)</label>
                  <input className={`field-input ${errors.pricePerHour ? 'field-error' : ''}`} type="number" placeholder="Ex: 18" value={form.pricePerHour} onChange={set('pricePerHour')} />
                  {errors.pricePerHour && <span className="field-error-msg">{errors.pricePerHour}</span>}
                </div>
                <div className="field-group"><label className="field-label">Preu mínim (hores)</label><input className="field-input" type="number" placeholder="1" value={form.minHours} onChange={set('minHours')} /></div>
              </div>
              <div className="field-group">
                <label className="field-label"><Icon name="camera" size={11} color="#c47dff" /> Fotos del cotxe ({photos.length}/8)</label>
                <div className={`upload-zone ${dragOver ? 'drag-over' : ''} ${photos.length > 0 ? 'has-photos' : ''}`} onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onClick={() => fileInputRef.current?.click()}>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => handleFiles(e.target.files)} />
                  {photos.length === 0 ? (<><div className="uz-icon"><Icon name="camera" size={32} color="#c47dff" /></div><div className="uz-text">Arrossega o fes clic per pujar fotos</div><div className="uz-hint">JPG, PNG · Màx. 5 MB per foto · Fins a 8 fotos</div></>) : (<div className="uz-add-more"><Icon name="plus" size={14} /> Afegir més fotos</div>)}
                </div>
                {photos.length > 0 && (
                  <div className="photo-previews">{photos.map((photo, i) => (<div key={photo.id} className="photo-preview"><img src={photo.url} alt={`Foto ${i + 1}`} /><button className="photo-remove" onClick={(e) => { e.stopPropagation(); removePhoto(photo.id); }}><Icon name="x" size={10} /></button>{i === 0 && <div className="photo-main-badge">Principal</div>}</div>))}</div>
                )}
              </div>
              <div className="field-group"><label className="field-label">Descripció (opcional)</label><textarea className="field-input field-textarea" placeholder="Descriu el teu cotxe, característiques especials, normes d'ús…" rows={4} value={form.description} onChange={set('description')} /></div>
              <div className="form-nav">
                <button type="button" className="btn-ghost" onClick={() => setStep(2)}><Icon name="arrowLeft" size={12} /> Enrere</button>
                <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Publicant...' : <><Icon name="car" size={14} /> Publicar coche</>}</button>
              </div>
            </div>
          )}
        </form>

        <div className="pub-tips">
          <h3 className="tips-title">Consells per guanyar més</h3>
          {[
            { icon: 'camera', t: 'Fotos de qualitat', d: 'Els cotxes amb 5+ fotos reben 3x més reserves.' },
            { icon: 'money', t: 'Preu competitiu', d: 'Revisa preus similars a la teva zona.' },
            { icon: 'star', t: 'Respon ràpid', d: 'Els propietaris amb resposta <1h reben més valoracions positives.' },
          ].map(tip => (
            <div className="tip-card" key={tip.t}>
               <div className="tip-icon"><Icon name={tip.icon} size={18} color="#c47dff" /></div>
               <div><div className="tip-title">{tip.t}</div><div className="tip-desc">{tip.d}</div></div>
            </div>
          ))}
          <div className="earnings-estimate">
            <div className="ee-label">Guanys estimats</div>
            <div className="ee-amount">+ {estimatedEarnings}€ <span>/mes</span></div>
            <div className="ee-sub">Basat en {activeDays.length} dies/setmana · {estimatedPrice}€/h</div>
          </div>
        </div>
      </div>
    </div>
  );
}

