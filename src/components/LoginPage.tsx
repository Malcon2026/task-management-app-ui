import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export function LoginPage() {
  const { login, showToast } = useApp();
  const [email, setEmail] = useState('admin@malconnexus.com');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const PRESET_ACCOUNTS = [
    { label: 'Admin', email: 'admin@malconnexus.com', role: 'Management' },
    { label: 'Preetam', email: 'preetam@malconnexus.com', role: 'Engineering' },
    { label: 'Staff', email: 'staff@malconnexus.com', role: 'Operations' },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage('');
    if (!email.trim()) { setErrorMessage('Please enter your email address'); return; }
    if (!password) { setErrorMessage('Please enter your password'); return; }

    setIsSubmitting(true);
    setTimeout(() => {
      const success = login(email.trim(), password);
      setIsSubmitting(false);
      if (!success) {
        setErrorMessage('Invalid credentials. Check email and password.');
        showToast('Login failed — invalid credentials', 'error');
      }
    }, 300);
  }

  function handleQuickSelect(accEmail: string) {
    setEmail(accEmail);
    setPassword('Malcon@Malcon123');
    setErrorMessage('');
  }

  return (
    <div style={{
      height: '100vh', width: '100vw',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)',
    }}>
      <div className="modal-animate" style={{
        width: '100%', maxWidth: 380,
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '32px 28px',
      }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: 6,
              background: 'var(--accent)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#fff',
            }}>T</div>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>TaskFlow</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Sign in to your workspace
          </p>
        </div>

        {/* Quick Account Selectors */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 11, fontWeight: 500, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8,
          }}>
            Accounts
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {PRESET_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleQuickSelect(acc.email)}
                style={{
                  padding: '8px 12px', borderRadius: 8, textAlign: 'left',
                  border: email === acc.email ? '1px solid rgba(94, 106, 210, 0.4)' : '1px solid var(--border)',
                  background: email === acc.email ? 'var(--accent-dim)' : 'var(--bg-primary)',
                  color: email === acc.email ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
              >
                <span>{acc.label}</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{acc.role}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {errorMessage && (
          <div style={{
            padding: '8px 12px', borderRadius: 6,
            background: 'var(--red-dim)',
            border: '1px solid rgba(229, 72, 77, 0.2)',
            color: 'var(--red)', fontSize: 12, marginBottom: 16,
            fontWeight: 500,
          }}>
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{
              display: 'block', fontSize: 12, fontWeight: 500,
              color: 'var(--text-secondary)', marginBottom: 4,
            }}>Email</label>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              style={{
                width: '100%', padding: '8px 12px',
                background: 'var(--bg-input)', border: '1px solid var(--border)',
                borderRadius: 8, color: 'var(--text-primary)',
                fontSize: 13, outline: 'none', transition: 'border-color 0.15s',
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block', fontSize: 12, fontWeight: 500,
              color: 'var(--text-secondary)', marginBottom: 4,
            }}>Password</label>
            <input
              type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              style={{
                width: '100%', padding: '8px 12px',
                background: 'var(--bg-input)', border: '1px solid var(--border)',
                borderRadius: 8, color: 'var(--text-primary)',
                fontSize: 13, outline: 'none', transition: 'border-color 0.15s',
              }}
            />
          </div>

          <button
            type="submit" disabled={isSubmitting}
            style={{
              width: '100%', padding: '8px', borderRadius: 8, border: 'none',
              background: 'var(--accent)', color: '#ffffff',
              fontSize: 13, fontWeight: 600,
              cursor: isSubmitting ? 'wait' : 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (!isSubmitting) (e.currentTarget as HTMLElement).style.background = 'var(--accent-hover)'; }}
            onMouseLeave={e => { if (!isSubmitting) (e.currentTarget as HTMLElement).style.background = 'var(--accent)'; }}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: 'var(--text-muted)' }}>
          Password: <code style={{ color: 'var(--text-secondary)', background: 'var(--bg-primary)', padding: '1px 6px', borderRadius: 4, fontSize: 11 }}>Malcon@Malcon123</code>
        </div>
      </div>
    </div>
  );
}
