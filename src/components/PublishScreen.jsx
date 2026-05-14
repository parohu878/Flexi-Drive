import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { carsService } from '../services/api';
import Icon from './Icon';
import './PublishScreen.css';

const DAYS = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'];
const ALL_FEATURES = [
  'A/C', 'Bluetooth', 'USB', 'GPS', 'Càmera enrere', 'Càmera 360°',
  'Sensors aparcament', 'Seients pell', 'Seients calefactables', 'A/C bizona',
  'Apple CarPlay', 'Android Auto', 'Llums LED', 'Sostre solar', 'Mode ECO',
  'Conducció assistida', 'Portó elèctric', 'Keyless Go', 'Radi FM',
];

export default function PublishScreen({ showToast, navigate, onCarCreated }) {
  const { isAuthenticated } = useAuth();
  const [activeDays, setActiveDays] = useState([0,1,2,3,4]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [photos, setPhotos] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState(['A/C', 'Bluetooth']);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({ makeModel: '', year: '', seats: '5', fuel: 'Gasolina', transmission: 'Manual', location: '', availableFrom: '08:00', availableTo: '20:00', pricePerHour: '', minHours: '1', description: '' });

  const set = (key) => (e) => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(err => ({ ...err, [key]: null })); };
  const toggleDay = (i) => setActiveDays(d => d.includes(i) ? d.filter(x => x !== i) : [...d, i]);
  const toggleFeature = (f) => setSelectedFeatures(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  const validateStep1 = () => { const errs = {}; if (!form.makeModel.trim()) errs.makeModel = 'Marca i model obligatoris'; if (!form.year || form.year < 1990 || form.year > 2027) errs.year = 'Any vàlid obligatori'; if (!form.location.trim()) errs.location = 'Ubicació obligatòria'; setErrors(errs); return Object.keys(errs).length === 0; };
  const validateStep3 = () => { const errs = {}; if (!form.pricePerHour || form.pricePerHour <= 0) errs.pricePerHour = 'Preu obligatori'; setErrors(errs); return Object.keys(errs).length === 0; };
  const goStep = (s) => { if (s === 2 && !validateStep1()) return; setStep(s); };

  const handleFiles = (files) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/') && photos.length < 8) {
        const reader = new FileReader();
        reader.onload = (e) => { setPhotos(prev => [...prev, { id: Date.now() + Math.random(), url: e.target.result, name: file.name }]); };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); };
  const removePhoto = (id) => { setPhotos(prev => prev.filter(p => p.id !== id)); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep3()) return;
    const parts = form.makeModel.trim().split(' ');
    setLoading(true);
    try {
      await carsService.createCar({ make: parts[0] || '', model: parts.slice(1).join(' ') || parts[0], year: parseInt(form.year), location: form.location, city: 'Barcelona', lat: 41.3874 + (Math.random() - 0.5) * 0.04, lng: 2.1686 + (Math.random() - 0.5) * 0.06, pricePerHour: parseFloat(form.pricePerHour), seats: parseInt(form.seats), fuel: form.fuel, transmission: form.transmission, minHours: parseInt(form.minHours) || 1, description: form.description, features: selectedFeatures, availableFrom: form.availableFrom, availableTo: form.availableTo });
      showToast('Coche publicat correctament!');
      if (onCarCreated) onCarCreated();
      setTimeout(() => navigate('profile'), 1000);
    } catch (err) { showToast(`${err.message || 'Error al publicar'}`, 'error'); }
    finally { setLoading(false); }
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
                  <label className="field-label">Any</label>
                  <input className={`field-input ${errors.year ? 'field-error' : ''}`} type="number" placeholder="2021" value={form.year} onChange={set('year')} />
                  {errors.year && <span className="field-error-msg">{errors.year}</span>}
                </div>
              </div>
              <div className="field-row-2">
                <div className="field-group"><label className="field-label">Places</label><select className="field-input" value={form.seats} onChange={set('seats')}>{['2','4','5','7'].map(o => <option key={o}>{o}</option>)}</select></div>
                <div className="field-group"><label className="field-label">Combustible</label><select className="field-input" value={form.fuel} onChange={set('fuel')}>{['Gasolina','Diésel','Eléctrico','Híbrido'].map(o => <option key={o}>{o}</option>)}</select></div>
              </div>
              <div className="field-group"><label className="field-label">Canvi</label><select className="field-input" value={form.transmission} onChange={set('transmission')}>{['Manual','Automático'].map(o => <option key={o}>{o}</option>)}</select></div>
              <div className="field-group">
                <label className="field-label"><Icon name="pin" size={11} color="#c47dff" /> Ubicació del cotxe</label>
                <input className={`field-input ${errors.location ? 'field-error' : ''}`} type="text" placeholder="Carrer, número, ciutat…" value={form.location} onChange={set('location')} />
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
                <div className="field-group"><label className="field-label">Des de</label><input className="field-input" type="time" value={form.availableFrom} onChange={set('availableFrom')} /></div>
                <div className="field-group"><label className="field-label">Fins a</label><input className="field-input" type="time" value={form.availableTo} onChange={set('availableTo')} /></div>
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
                  {photos.length === 0 ? (<><div className="uz-icon"><Icon name="camera" size={32} color="#c47dff" /></div><div className="uz-text">Arrossega o fes clic per pujar fotos</div><div className="uz-hint">JPG, PNG · Màx. 10 MB per foto · Fins a 8 fotos</div></>) : (<div className="uz-add-more"><Icon name="plus" size={14} /> Afegir més fotos</div>)}
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
