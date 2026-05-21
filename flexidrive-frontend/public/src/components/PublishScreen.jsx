import { useState } from 'react';
import './PublishScreen.css';

const DAYS = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg'];

export default function PublishScreen({ showToast }) {
  const [activeDays, setActiveDays] = useState([0,1,2,3,4]);
  const [step, setStep] = useState(1);

  const toggleDay = (i) =>
    setActiveDays(d => d.includes(i) ? d.filter(x => x !== i) : [...d, i]);

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast('🚗 Coche publicat correctament!');
    setStep(1);
  };

  return (
    <div className="publish-page fade-in">
      <div className="publish-inner">
        {/* Header */}
        <div className="pub-header">
          <h1 className="pub-title">Publica el teu coche</h1>
          <p className="pub-sub">Comença a guanyar diners deixant el teu vehicle</p>
        </div>

        {/* Steps indicator */}
        <div className="steps-nav">
          {['Vehicle', 'Disponibilitat', 'Preu i fotos'].map((label, i) => (
            <div key={i} className={`step-nav-item ${step === i+1 ? 'active' : ''} ${step > i+1 ? 'done' : ''}`}>
              <div className="sni-num">{step > i+1 ? '✓' : i+1}</div>
              <span className="sni-label">{label}</span>
              {i < 2 && <div className="sni-line" />}
            </div>
          ))}
        </div>

        <form className="pub-form" onSubmit={handleSubmit}>
          {/* Step 1 */}
          {step === 1 && (
            <div className="form-step fade-in">
              <h2 className="step-section-title">Dades del vehicle</h2>
              <div className="field-row-2">
                <Field label="Marca i model" type="text" placeholder="Ex: Seat León 2021" required />
                <Field label="Any" type="number" placeholder="2021" required />
              </div>
              <div className="field-row-2">
                <SelectField label="Places" options={['2','4','5','7']} />
                <SelectField label="Combustible" options={['Gasolina','Diésel','Eléctrico','Híbrido']} />
              </div>
              <SelectField label="Canvi" options={['Manual','Automático']} />
              <Field label="Ubicació del cotxe" type="text" placeholder="Carrer, número, ciutat…" required />
              <div className="form-nav">
                <div />
                <button type="button" className="btn-primary" onClick={() => setStep(2)}>Continuar →</button>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="form-step fade-in">
              <h2 className="step-section-title">Disponibilitat</h2>
              <div className="field-group">
                <label className="field-label">Dies disponibles</label>
                <div className="day-chips">
                  {DAYS.map((d, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`day-chip ${activeDays.includes(i) ? 'on' : ''}`}
                      onClick={() => toggleDay(i)}
                    >{d}</button>
                  ))}
                </div>
              </div>
              <div className="field-row-2">
                <Field label="Des de" type="time" defaultValue="08:00" />
                <Field label="Fins a" type="time" defaultValue="20:00" />
              </div>
              <div className="avail-preview">
                <div className="ap-label">Vista prèvia</div>
                <div className="ap-days">
                  {DAYS.map((d, i) => (
                    <div key={i} className={`ap-day ${activeDays.includes(i) ? 'on' : 'off'}`}>{d}</div>
                  ))}
                </div>
              </div>
              <div className="form-nav">
                <button type="button" className="btn-ghost" onClick={() => setStep(1)}>← Enrere</button>
                <button type="button" className="btn-primary" onClick={() => setStep(3)}>Continuar →</button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="form-step fade-in">
              <h2 className="step-section-title">Preu i fotos</h2>
              <div className="field-row-2">
                <Field label="Preu per hora (€)" type="number" placeholder="Ex: 18" required />
                <Field label="Preu mínim (hores)" type="number" placeholder="1" />
              </div>
              <div className="field-group">
                <label className="field-label">Fotos del cotxe</label>
                <div className="upload-zone">
                  <div className="uz-icon">📷</div>
                  <div className="uz-text">Arrossega o fes clic per pujar fotos</div>
                  <div className="uz-hint">JPG, PNG · Màx. 10 MB per foto</div>
                </div>
              </div>
              <div className="field-group">
                <label className="field-label">Descripció (opcional)</label>
                <textarea
                  className="field-input field-textarea"
                  placeholder="Descriu el teu cotxe, característiques especials, normes d'ús…"
                  rows={4}
                />
              </div>
              <div className="form-nav">
                <button type="button" className="btn-ghost" onClick={() => setStep(2)}>← Enrere</button>
                <button type="submit" className="btn-primary">🚀 Publicar coche</button>
              </div>
            </div>
          )}
        </form>

        {/* Right panel: tips */}
        <div className="pub-tips">
          <h3 className="tips-title">Consells per guanyar més</h3>
          {[
            { icon: '📸', t: 'Fotos de qualitat', d: 'Els cotxes amb 5+ fotos reben 3x més reserves.' },
            { icon: '💰', t: 'Preu competitiu', d: 'Revisa preus similars a la teva zona.' },
            { icon: '⭐', t: 'Respon ràpid', d: 'Els propietaris amb resposta <1h reben més valoracions positives.' },
          ].map(tip => (
            <div className="tip-card" key={tip.t}>
              <div className="tip-icon">{tip.icon}</div>
              <div>
                <div className="tip-title">{tip.t}</div>
                <div className="tip-desc">{tip.d}</div>
              </div>
            </div>
          ))}
          <div className="earnings-estimate">
            <div className="ee-label">Guanys estimats</div>
            <div className="ee-amount">+ 280–450€ <span>/mes</span></div>
            <div className="ee-sub">Basat en cotxes similars a Barcelona</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div className="field-group">
      <label className="field-label">{label}</label>
      <input className="field-input" {...props} />
    </div>
  );
}

function SelectField({ label, options }) {
  return (
    <div className="field-group">
      <label className="field-label">{label}</label>
      <select className="field-input">
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
