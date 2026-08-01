import { useApp } from '../../context/AppContext';
import { Toast as ToastType } from '../../types';

const COLORS: Record<string, { border: string; glow: string }> = {
  success: { border: 'rgba(81, 207, 102, 0.3)', glow: 'rgba(81, 207, 102, 0.15)' },
  error: { border: 'rgba(255, 107, 107, 0.3)', glow: 'rgba(255, 107, 107, 0.15)' },
  info: { border: 'var(--border-light)', glow: 'var(--accent-dim)' },
  warning: { border: 'rgba(255, 212, 59, 0.3)', glow: 'rgba(255, 212, 59, 0.15)' },
};
const ICONS: Record<string, string> = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

function ToastItem({ toast }: { toast: ToastType }) {
  const { removeToast } = useApp();
  const colors = COLORS[toast.type] || COLORS.info;

  return (
    <div
      className="toast-animate"
      onClick={() => removeToast(toast.id)}
      style={{
        background: 'var(--bg-tertiary)',
        border: `1px solid ${colors.border}`,
        borderRadius: 12,
        padding: '13px 18px',
        display: 'flex', alignItems: 'center', gap: 10,
        minWidth: 300, maxWidth: 380,
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 16px ${colors.glow}`,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Left gradient accent */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: `linear-gradient(180deg, ${colors.border}, transparent)`,
      }} />
      <span style={{ fontSize: 16 }}>{ICONS[toast.type] || '✅'}</span>
      <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1, fontWeight: 500 }}>{toast.msg}</span>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useApp();
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24,
      display: 'flex', flexDirection: 'column', gap: 10,
      zIndex: 2000,
    }}>
      {toasts.map(t => <ToastItem key={t.id} toast={t} />)}
    </div>
  );
}
