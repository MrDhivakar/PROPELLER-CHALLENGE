import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      await login(email.trim(), password);
      nav('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: 20,
    }}>
      <form onSubmit={submit} style={{
        width: '100%', maxWidth: 380,
        background: '#151A22', border: '1px solid #1E2631',
        borderRadius: 16, padding: 32,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <img src="/logo.svg" alt="" width={40} height={40} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>Propeller Challenge</div>
            <div style={{ fontSize: 12, color: '#8B96A5' }}>Admin Console</div>
          </div>
        </div>
        <label>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          required autoFocus autoComplete="username" />
        <label>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          required autoComplete="current-password" />
        {error && <div className="error-banner">{error}</div>}
        <button type="submit" className="primary"
          style={{ width: '100%', marginTop: 20 }} disabled={loading}>
          {loading ? 'Signing inâ€¦' : 'Sign in'}
        </button>
        <div style={{ marginTop: 16, fontSize: 11, color: '#8B96A5', textAlign: 'center' }}>
          Super Admin only. No public registration.
        </div>
      </form>
    </div>
  );
}