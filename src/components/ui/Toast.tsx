import { useApp } from '../../context/AppContext';

export function ToastContainer() {
  const { toasts, removeToast } = useApp();
  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 16, right: 16,
      display: 'flex', flexDirection: 'column', gap: 6,
      zIndex: 10000, maxWidth: 340,
    }}>
      {toasts.map(t => {
        const color =
          t.type === 'error' ? 'var(--red)' :
          t.type === 'warning' ? 'var(--yellow)' :
          t.type === 'info' ? 'var(--accent)' : 'var(--green)';
        return (
          <div
            key={t.id}
            className="toast-animate"
            onClick={() => removeToast(t.id)}
            style={{
              padding: '10px 14px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-light)',
              borderLeft: `3px solid ${color}`,
              borderRadius: 8,
              fontSize: 13,
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            }}
          >
            <span style={{ flex: 1 }}>{t.msg}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1 }}>×</span>
          </div>
        );
      })}
    </div>
  );
}
