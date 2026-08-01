import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { IconTarget, IconArrowRight, IconUser } from './ui/Icons';

export function LoginPage() {
  const { login, showToast } = useApp();
  const [email, setEmail] = useState('admin@malconnexus.com');
  const [password, setPassword] = useState('Malcon@Malcon123');
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

    if (!email.trim()) {
      setErrorMessage('Please enter your email address');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const success = login(email.trim(), password);
      setIsSubmitting(false);
      if (!success) {
        setErrorMessage('Invalid credentials. Please check authorized email and password.');
        showToast('Login failed: Invalid credentials', 'error');
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
      padding: 20,
    }}>
      <div style={{
        width: '100%', maxWidth: 380,
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '32px 28px',
        display: 'flex', flexDirection: 'column', gap: 24,
      }}>
        {/* Header Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 8 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'var(--accent)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 18, fontWeight: 700,
          }}>
            T
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Sign in to TaskFlow
            </h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              Enter your credentials or choose a quick account
            </p>
          </div>
        </div>

        {/* Quick Select Presets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Quick Accounts
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {PRESET_ACCOUNTS.map(acc => {
              const selected = email === acc.email;
              return (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleQuickSelect(acc.email)}
                  style={{
                    padding: '8px 6px', borderRadius: 6,
                    border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                    background: selected ? 'var(--bg-active)' : 'var(--bg-primary)',
                    color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontSize: 11, cursor: 'pointer', textAlign: 'center',
                    fontWeight: selected ? 600 : 400, transition: 'all 0.1s',
                  }}
                >
                  <div>{acc.label}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>{acc.role}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {errorMessage && (
            <div style={{
              padding: '8px 12px', borderRadius: 6,
              background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--red)', fontSize: 12, lineHeight: 1.4,
            }}>
              {errorMessage}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@malconnexus.com"
              required
              style={{
                padding: '8px 12px', borderRadius: 6,
                background: 'var(--bg-primary)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: 13, outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              style={{
                padding: '8px 12px', borderRadius: 6,
                background: 'var(--bg-primary)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: 13, outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '9px 16px', borderRadius: 6, marginTop: 6,
              background: 'var(--accent)', color: '#fff', border: 'none',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background 0.15s', opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            <span>{isSubmitting ? 'Signing in...' : 'Sign in'}</span>
            <IconArrowRight size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}
