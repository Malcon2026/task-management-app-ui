import React, { useEffect } from 'react';
import { IconX } from './Icons';

interface ModalProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: number;
}

export function Modal({ open, isOpen, onClose, title, children, footer, maxWidth = 520 }: ModalProps) {
  const isVisible = open !== undefined ? open : isOpen;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0, 0, 0, 0.65)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        className="modal-animate"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          width: '100%', maxWidth,
          maxHeight: '85vh', overflowY: 'auto',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 20 }}>{children}</div>

        {/* Footer */}
        {footer && (
          <div style={{
            padding: '12px 20px', borderTop: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10,
            background: 'var(--bg-primary)', borderRadius: '0 0 10px 10px',
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function FormField({ label, children, hint, required }: {
  label: string; children: React.ReactNode; hint?: string; required?: boolean;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 500,
        color: 'var(--text-secondary)', marginBottom: 6,
      }}>
        {label} {required && <span style={{ color: 'var(--red)' }}>*</span>}
      </label>
      {children}
      {hint && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

export const FormGroup = FormField;

export function FormRow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {children}
    </div>
  );
}

export function FormInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: '100%', padding: '7px 10px',
        background: 'var(--bg-primary)', border: '1px solid var(--border)',
        borderRadius: 6, color: 'var(--text-primary)',
        fontSize: 13, outline: 'none', transition: 'border-color 0.15s',
        ...props.style,
      }}
      onFocus={e => { (e.target as HTMLElement).style.borderColor = 'var(--accent)'; }}
      onBlur={e => { (e.target as HTMLElement).style.borderColor = 'var(--border)'; }}
    />
  );
}

export function FormSelect({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={{
        width: '100%', padding: '7px 10px',
        background: 'var(--bg-primary)', border: '1px solid var(--border)',
        borderRadius: 6, color: 'var(--text-primary)',
        fontSize: 13, outline: 'none', cursor: 'pointer',
        ...props.style,
      }}
    >
      {children}
    </select>
  );
}

export function FormTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{
        width: '100%', padding: '7px 10px',
        background: 'var(--bg-primary)', border: '1px solid var(--border)',
        borderRadius: 6, color: 'var(--text-primary)',
        fontSize: 13, outline: 'none', minHeight: 70, resize: 'vertical',
        fontFamily: 'inherit',
        ...props.style,
      }}
      onFocus={e => { (e.target as HTMLElement).style.borderColor = 'var(--accent)'; }}
      onBlur={e => { (e.target as HTMLElement).style.borderColor = 'var(--border)'; }}
    />
  );
}

export function BtnPrimary({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '6px 14px', borderRadius: 6,
        background: 'var(--accent)', color: '#fff', border: 'none',
        fontSize: 12, fontWeight: 500, cursor: 'pointer',
        opacity: disabled ? 0.6 : 1, transition: 'background 0.15s',
      }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLElement).style.background = 'var(--accent-hover)'; }}
      onMouseLeave={e => { if (!disabled) (e.currentTarget as HTMLElement).style.background = 'var(--accent)'; }}
    >
      {children}
    </button>
  );
}

export function BtnGhost({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px', borderRadius: 6,
        background: 'transparent', color: 'var(--text-muted)',
        border: '1px solid var(--border)', fontSize: 12,
        fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-light)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
    >
      {children}
    </button>
  );
}
