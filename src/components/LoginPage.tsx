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

    if (!email.trim()) {
      setErrorMessage('Please enter your email address');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate brief authentication check
    setTimeout(() => {
      const success = login(email.trim(), password);
      setIsSubmitting(false);
      if (!success) {
        setErrorMessage('Invalid credentials. Password must be Malcon@Malcon123 and email must be an authorized account.');
        showToast('❌ Login failed: Invalid email or password', 'error');
      }
    }, 400);
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
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient background glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 
          'radial-gradient(ellipse 60% 50% at 50% 35%, rgba(108, 92, 231, 0.15) 0%, transparent 70%),' +
          'radial-gradient(ellipse 40% 40% at 80% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* Glassmorphic Login Card */}
      <div className="modal-animate" style={{
        width: '100%', maxWidth: 440,
        background: 'rgba(14, 14, 36, 0.75)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(108, 92, 231, 0.25)',
        borderRadius: 20,
        padding: '36px 32px',
        boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6), 0 0 32px rgba(108, 92, 231, 0.15)',
        position: 'relative',
        zIndex: 10,
      }}>
        {/* Gradient Top Accent Bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg, #6c5ce7, #a855f7, #22d3ee)',
          borderRadius: '20px 20px 0 0',
        }} />

        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 48, height: 48, margin: '0 auto 14px',
            background: 'linear-gradient(135deg, #6c5ce7, #a855f7)',
            borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 900, color: '#ffffff',
            boxShadow: '0 4px 20px rgba(108, 92, 231, 0.4)',
          }}>T</div>
          <h1 style={{
            fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #ffffff, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>TaskFlow Login</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6, fontWeight: 500 }}>
            Sign in to access your Malconnexus workspace
          </p>
        </div>

        {/* Quick Account Selectors */}
        <div style={{ marginBottom: 22 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8,
          }}>
            Quick Sign-In (3 Authorized Accounts):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {PRESET_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleQuickSelect(acc.email)}
                style={{
                  padding: '7px 8px', borderRadius: 8,
                  border: email === acc.email ? '1px solid rgba(168, 85, 247, 0.5)' : '1px solid var(--border)',
                  background: email === acc.email ? 'rgba(108, 92, 231, 0.2)' : 'rgba(18, 18, 42, 0.5)',
                  color: email === acc.email ? '#ffffff' : 'var(--text-secondary)',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  textAlign: 'center', transition: 'all 0.2s',
                }}
              >
                <div>{acc.label}</div>
                <div style={{ fontSize: 9, opacity: 0.7, marginTop: 2 }}>{acc.role}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Error Message Alert */}
        {errorMessage && (
          <div style={{
            padding: '10px 14px', borderRadius: 8,
            background: 'rgba(255, 107, 107, 0.12)',
            border: '1px solid rgba(255, 107, 107, 0.3)',
            color: 'var(--red)', fontSize: 12, marginBottom: 18,
            display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500,
          }}>
            <span>⚠️</span>
            <span style={{ flex: 1 }}>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={{
              display: 'block', fontSize: 11, fontWeight: 700,
              color: 'var(--text-muted)', textTransform: 'uppercase',
              letterSpacing: '0.12em', marginBottom: 6,
            }}>
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. preetam@malconnexus.com"
              required
              style={{
                width: '100%', padding: '11px 14px',
                background: 'rgba(18, 18, 42, 0.7)',
                border: '1px solid var(--border)',
                borderRadius: 10, color: 'var(--text-primary)',
                fontSize: 14, outline: 'none',
                transition: 'all 0.2s',
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block', fontSize: 11, fontWeight: 700,
              color: 'var(--text-muted)', textTransform: 'uppercase',
              letterSpacing: '0.12em', marginBottom: 6,
            }}>
              Password *
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password..."
              required
              style={{
                width: '100%', padding: '11px 14px',
                background: 'rgba(18, 18, 42, 0.7)',
                border: '1px solid var(--border)',
                borderRadius: 10, color: 'var(--text-primary)',
                fontSize: 14, outline: 'none',
                transition: 'all 0.2s',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%', padding: '12px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #6c5ce7, #a855f7)',
              color: '#ffffff', fontSize: 14, fontWeight: 700,
              cursor: isSubmitting ? 'wait' : 'pointer',
              transition: 'all 0.25s',
              boxShadow: '0 4px 20px rgba(108, 92, 231, 0.4)',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={e => { if (!isSubmitting) (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 24px rgba(108, 92, 231, 0.6)'; }}
            onMouseLeave={e => { if (!isSubmitting) (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(108, 92, 231, 0.4)'; }}
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In to TaskFlow →'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'var(--text-muted)' }}>
          Malconnexus Task Management System • Password: <code style={{ color: '#a78bfa', background: 'rgba(108,92,231,0.1)', padding: '1px 6px', borderRadius: 4 }}>Malcon@Malcon123</code>
        </div>
      </div>
    </div>
  );
}
