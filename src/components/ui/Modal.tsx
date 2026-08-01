import React, { useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: number;
}

export function Modal({ open, onClose, title, children, footer, maxWidth = 520 }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!open) return null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        className="modal-animate"
        style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-light)',
          borderRadius: 12,
          width: '100%', maxWidth,
          maxHeight: '85vh', overflowY: 'auto',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{title}</span>
          <button onClick={onClose} style={{
            width: 28, height: 28, border: 'none',
            background: 'transparent', color: 'var(--text-muted)',
            borderRadius: 6, cursor: 'pointer', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.1s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
          >×</button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 20px' }}>{children}</div>

        {/* Footer */}
        {footer && (
          <div style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8,
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* Form helpers */
export function FormGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 500,
        color: 'var(--text-secondary)', marginBottom: 4,
      }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px',
  background: 'var(--bg-input)',
  border: '1px solid var(--border)',
  borderRadius: 8, color: 'var(--text-primary)',
  fontSize: 13, outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s',
};

export function FormInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...inputStyle, ...props.style }} />;
}

export function FormSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} style={{ ...inputStyle, appearance: 'none', cursor: 'pointer', ...props.style }} />;
}

export function FormTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} style={{ ...inputStyle, minHeight: 80, resize: 'vertical', lineHeight: 1.5, ...props.style }} />;
}

export function FormRow({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>{children}</div>;
}

export function BtnPrimary(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} style={{
      padding: '7px 16px', borderRadius: 6, border: 'none',
      background: 'var(--accent)', color: '#ffffff',
      fontSize: 13, fontWeight: 500, cursor: 'pointer',
      transition: 'background 0.15s',
      ...props.style,
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent-hover)'; }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent)'; }}
    />
  );
}

export function BtnGhost(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} style={{
      padding: '7px 16px', borderRadius: 6,
      border: '1px solid var(--border)',
      background: 'transparent', color: 'var(--text-secondary)',
      fontSize: 13, fontWeight: 500, cursor: 'pointer',
      transition: 'all 0.15s',
      ...props.style,
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
    />
  );
}
