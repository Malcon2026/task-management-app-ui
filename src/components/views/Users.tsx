import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import { getInitials, getUserName, capitalize } from '../../utils/helpers';

interface UsersProps {
  onAddUser: () => void;
  onViewTasks: (userId: number) => void;
}

export function Users({ onAddUser, onViewTasks }: UsersProps) {
  const { users } = useApp();
  const onlineCount = users.filter(u => u.status === 'online').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 28px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{
          padding: '11px 16px', fontSize: 13, fontWeight: 600,
          color: 'var(--text-primary)',
          borderBottom: '2px solid #a855f7',
        }}>👥 Team Members</div>
        <div style={{ marginLeft: 'auto', padding: '4px 0' }}>
          <button onClick={onAddUser} style={{
            padding: '6px 18px', height: 34, borderRadius: 8, border: 'none',
            background: 'linear-gradient(135deg, #6c5ce7, #a855f7)',
            color: '#ffffff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(108, 92, 231, 0.3)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(108, 92, 231, 0.5)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 10px rgba(108, 92, 231, 0.3)'; }}
          >+ Invite Member</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '32px 28px', width: '100%' }}>
          <div style={{
            fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, #e8e6f0, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>👥 Team Members</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6, marginBottom: 28, fontWeight: 500 }}>
            {users.length} Authorized Team Accounts (Max 3) · <span style={{ color: 'var(--green)' }}>{onlineCount} online</span>
          </div>
          <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {users.map(u => <UserCard key={u.id} user={u} onViewTasks={onViewTasks} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserCard({ user, onViewTasks }: { user: User; onViewTasks: (id: number) => void }) {
  const { tasks, removeUser, showToast } = useApp();
  const myTasks = tasks.filter(t => t.assignedTo === user.id && !t.completed).length;
  const myDone = tasks.filter(t => t.assignedTo === user.id && t.completed).length;
  const inProg = tasks.filter(t => t.assignedTo === user.id && t.status === 'inprogress').length;

  function handleRemove() {
    if (!confirm(`Remove ${getUserName(user)} from the team?`)) return;
    removeUser(user.id);
    showToast(`👤 ${getUserName(user)} removed`, 'warning');
  }

  return (
    <div
      className="animate-fadeInUp"
      style={{
        background: 'rgba(14, 14, 36, 0.45)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border)',
        borderRadius: 14, padding: 22,
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(108, 92, 231, 0.25)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(108, 92, 231, 0.1)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
        (e.currentTarget as HTMLElement).style.transform = '';
        (e.currentTarget as HTMLElement).style.boxShadow = '';
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <div style={{ position: 'relative' }}>
          <div className={user.avatarClass} style={{
            width: 50, height: 50, borderRadius: '50%', fontSize: 18, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#0a0a0a', flexShrink: 0,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          }}>
            {getInitials(user)}
          </div>
          {/* Status indicator */}
          <div className={`status-${user.status}`} style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 12, height: 12, borderRadius: '50%',
            border: '2px solid var(--bg-primary)',
          }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{getUserName(user)}</div>
          <span className={`role-${user.role}`} style={{ fontSize: 10, padding: '3px 9px', borderRadius: 5, fontWeight: 600, letterSpacing: '0.03em' }}>{capitalize(user.role)}</span>
        </div>
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>📧 {user.email}</div>
      {user.dept && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14, fontWeight: 500 }}>🏢 {user.dept}</div>}

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        gap: 10, padding: '16px 0',
        borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: 16,
      }}>
        {[{ val: myTasks, label: 'Open', color: 'var(--text-primary)' }, { val: inProg, label: 'Active', color: 'var(--yellow)' }, { val: myDone, label: 'Done', color: 'var(--green)' }].map(s => (
          <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: '-0.02em' }}>{s.val}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
          <div className={`status-${user.status}`} style={{ width: 7, height: 7, borderRadius: '50%' }} />
          {capitalize(user.status)}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => onViewTasks(user.id)}
            style={{
              padding: '5px 14px', borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'rgba(14, 14, 36, 0.5)',
              color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer',
              transition: 'all 0.2s', fontWeight: 500,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(108, 92, 231, 0.3)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
          >View Tasks</button>
          {user.id !== 1 && (
            <button
              onClick={handleRemove}
              style={{
                width: 30, height: 30, border: '1px solid var(--border)',
                background: 'rgba(14, 14, 36, 0.5)',
                color: 'var(--text-muted)', cursor: 'pointer', borderRadius: 6, fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 107, 107, 0.3)'; (e.currentTarget as HTMLElement).style.color = 'var(--red)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
            >✕</button>
          )}
        </div>
      </div>
    </div>
  );
}
