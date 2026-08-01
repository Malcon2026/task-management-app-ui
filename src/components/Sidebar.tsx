import { useApp } from '../context/AppContext';
import { getUserName } from '../utils/helpers';
import { Avatar } from './ui/Avatar';
import type { View } from '../types';

const NAV_ITEMS: { key: View; icon: string; label: string }[] = [
  { key: 'dashboard', icon: '⌂', label: 'Dashboard' },
  { key: 'todo', icon: '☰', label: 'Issues' },
  { key: 'kanban', icon: '▦', label: 'Board' },
  { key: 'matrix', icon: '◫', label: 'Matrix' },
  { key: 'activity', icon: '◷', label: 'Activity' },
  { key: 'users', icon: '◉', label: 'Members' },
];

export function Sidebar() {
  const { currentView, setCurrentView, tasks, users, showToast, activeUser, activeUserId, switchUser, logout } = useApp();

  const openCount = tasks.filter(t => !t.completed).length;
  const inProgressCount = tasks.filter(t => t.status === 'inprogress').length;

  return (
    <div style={{
      width: 220, flexShrink: 0,
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      height: '100vh',
      userSelect: 'none',
    }}>
      {/* Workspace Header */}
      <div style={{
        padding: '12px 14px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: 6,
          background: 'var(--accent)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, color: '#fff',
        }}>T</div>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>TaskFlow</span>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '8px 6px', overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => {
          const isActive = currentView === item.key;
          const count = item.key === 'todo' ? openCount : item.key === 'kanban' ? inProgressCount : undefined;
          return (
            <div
              key={item.key}
              onClick={() => setCurrentView(item.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 10px', borderRadius: 6,
                cursor: 'pointer',
                background: isActive ? 'var(--bg-active)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: isActive ? 500 : 400,
                transition: 'background 0.1s',
                marginBottom: 1,
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <span style={{
                width: 18, textAlign: 'center', fontSize: 14,
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                fontFamily: 'system-ui',
              }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {count !== undefined && count > 0 && (
                <span style={{
                  fontSize: 11, color: 'var(--text-muted)', fontWeight: 500,
                  minWidth: 18, textAlign: 'right',
                }}>{count}</span>
              )}
            </div>
          );
        })}

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border)', margin: '8px 10px' }} />

        {/* Quick Filters */}
        <div style={{
          fontSize: 11, fontWeight: 500, color: 'var(--text-muted)',
          padding: '4px 10px 6px', letterSpacing: '0.03em',
        }}>Filters</div>

        {[
          { icon: '→', label: 'My Issues', action: () => { setCurrentView('todo'); showToast('Filtered: My Issues', 'info'); } },
          { icon: '!', label: 'Urgent', action: () => { setCurrentView('todo'); showToast('Filtered: Urgent', 'info'); } },
        ].map(f => (
          <div
            key={f.label}
            onClick={f.action}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 10px', borderRadius: 6,
              cursor: 'pointer', color: 'var(--text-secondary)',
              fontSize: 13, transition: 'background 0.1s', marginBottom: 1,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <span style={{ width: 18, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'system-ui' }}>{f.icon}</span>
            <span>{f.label}</span>
          </div>
        ))}
      </nav>

      {/* Account Switcher */}
      {activeUser && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '8px 6px' }}>
          <div style={{ position: 'relative' }}>
            <select
              value={activeUserId}
              onChange={e => switchUser(Number(e.target.value))}
              style={{
                position: 'absolute', inset: 0, opacity: 0,
                cursor: 'pointer', width: '100%', zIndex: 10,
              }}
            >
              {users.map(u => (
                <option key={u.id} value={u.id} style={{ background: '#141415', color: '#fff' }}>
                  {getUserName(u)} ({u.role})
                </option>
              ))}
            </select>
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 10px', borderRadius: 6, cursor: 'pointer',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <Avatar user={activeUser} size={22} fontSize={10} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {getUserName(activeUser)}
                </div>
              </div>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>▾</span>
            </div>
          </div>

          {/* Sign Out */}
          <div
            onClick={logout}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 10px', borderRadius: 6,
              cursor: 'pointer', color: 'var(--text-muted)',
              fontSize: 12, transition: 'background 0.1s', marginTop: 2,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
          >
            <span style={{ width: 18, textAlign: 'center', fontSize: 12 }}>↩</span>
            <span>Sign out</span>
          </div>
        </div>
      )}
    </div>
  );
}
