import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './AuthModal.css';

export default function AuthModal({ onClose }) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (tab === 'register' && !form.name.trim()) {
      setError('El nom és obligatori');
      return;
    }
    if (!form.email.trim()) {
      setError("L'email és obligatori");
      return;
    }
    if (!form.password || form.password.length < 6) {
      setError('La contrasenya ha de tenir mínim 6 caràcters');
      return;
    }

    setLoading(true);
    try {
      if (tab === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Error inesperat');
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (t) => {
    setTab(t);
    setError('');
  };

  return (
    <div className="auth-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="auth-modal fade-in">
        <button className="auth-close" onClick={onClose}>✕</button>

        <div className="auth-header">
          <div className="auth-logo">FD</div>
          <div className="auth-title">
            {tab === 'login' ? 'Benvingut de nou' : 'Crea el teu compte'}
          </div>
          <div className="auth-subtitle">
            {tab === 'login' ? 'Inicia sessió per continuar' : 'Registra\'t per llogar o publicar cotxes'}
          </div>
        </div>

        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => switchTab('login')}>Entrar</button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => switchTab('register')}>Registrar-se</button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {tab === 'register' && (
            <div className="auth-field">
              <label className="auth-label">Nom complet</label>
              <input className="auth-input" type="text" placeholder="Ex: Joan Duran"
                value={form.name} onChange={set('name')} />
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input className="auth-input" type="email" placeholder="email@exemple.com"
              value={form.email} onChange={set('email')} />
          </div>

          <div className="auth-field">
            <label className="auth-label">Contrasenya</label>
            <input className="auth-input" type="password" placeholder="Mínim 6 caràcters"
              value={form.password} onChange={set('password')} />
          </div>

          {error && <div className="auth-error">⚠️ {error}</div>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading && <span className="auth-spinner" />}
            {tab === 'login' ? 'Iniciar sessió' : 'Crear compte'}
          </button>
        </form>

        <div className="auth-footer">
          {tab === 'login' ? (
            <>No tens compte? <button onClick={() => switchTab('register')}>Registra't</button></>
          ) : (
            <>Ja tens compte? <button onClick={() => switchTab('login')}>Inicia sessió</button></>
          )}
        </div>
      </div>
    </div>
  );
}
