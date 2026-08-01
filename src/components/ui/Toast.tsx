import { useApp } from '../../context/AppContext';
import { Toast as ToastType } from '../../types';
import { IconCheck, IconAlertCircle, IconZap } from './Icons';

function ToastItem({ toast }: { toast: ToastType }) {
  const { removeToast } = useApp();

  const isError = toast.type === 'error';
  const isSuccess = toast.type === 'success';

  return (
    <div
      className="toast-animate"
      onClick={() => removeToast(toast.id)}
      style={{
        background: 'var(--bg-secondary)',
        border: `1px solid ${isError ? 'rgba(239, 68, 68, 0.4)' : isSuccess ? 'rgba(34, 197, 94, 0.4)' : 'var(--border)'}`,
        borderRadius: 8, padding: '10px 14px',
        display: 'flex', alignItems: 'center', gap: 10,
        minWidth: 260, maxWidth: 360,
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        cursor: 'pointer',
      }}
    >
      {isError ? (
        <IconAlertCircle size={15} color="var(--red)" />
      ) : isSuccess ? (
        <IconCheck size={15} color="var(--green)" />
      ) : (
        <IconZap size={15} color="var(--accent)" />
      )}
      <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1, fontWeight: 500 }}>{toast.msg}</span>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useApp();
  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20,
      display: 'flex', flexDirection: 'column', gap: 8,
      zIndex: 2000,
    }}>
      {toasts.map(t => <ToastItem key={t.id} toast={t} />)}
    </div>
  );
}
