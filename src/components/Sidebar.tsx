import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { View } from '../types';
import { Avatar } from './ui/Avatar';
import { isOverdue, getUserName } from '../utils/helpers';

const NAV_WORKSPACE = [
  { id: 'dashboard' as View, icon: '⊞', label: 'Dashboard' },
  { id: 'todo' as View, icon: '☑', label: 'Todo List' },
  { id: 'matrix' as View, icon: '⊡', label: 'Eisenhower Matrix' },
  { id: 'kanban' as View, icon: '▦', label: 'Kanban Board' },
];
const NAV_TEAM = [
  { id: 'activity' as View, icon: '⚡', label: 'Activity Log' },
  { id: 'users' as View, icon: '👥', label: 'Team Members' },
];

export function Sidebar() {
  const { tasks, users, activities, currentView, setCurrentView, sidebarCollapsed, setSidebarCollapsed, showToast } = useApp();
  const [searchVal, setSearchVal] = useState('');

  const openCount = tasks.filter(t => !t.completed).length;
  const inProgress = tasks.filter(t => t.status === 'inprogress').length;
  const overdueCount = tasks.filter(t => !t.completed && isOverdue(t.due)).length;

  function getBadge(view: View): string {
    if (view === 'todo') return openCount > 0 ? String(openCount) : '';
    if (view === 'matrix') return overdueCount > 0 ? `${overdueCount}⚠` : String(tasks.filter(t => t.quadrant).length);
    if (view === 'kanban') return inProgress > 0 ? String(inProgress) : '';
    if (view === 'activity') return activities.length > 0 ? String(activities.length) : '';
    if (view === 'users') return String(users.length);
    return '';
  }

  function handleSearch(val: string) {
    setSearchVal(val);
    if (!val.trim()) return;
    const results = tasks.filter(t =>
      t.title.toLowerCase().includes(val.toLowerCase()) ||
      (t.desc && t.desc.toLowerCase().includes(val.toLowerCase()))
    );
    if (results.length > 0) {
      setCurrentView('todo');
      showToast(`🔍 Found ${results.length} result(s) for "${val}"`, 'info');
    } else {
      showToast(`🔍 No results for "${val}"`, 'warning');
    }
  }

  const { activeUser, activeUserId, switchUser, logout } = useApp();
  const w = sidebarCollapsed ? 56 : 270;

  return (
    <aside style={{
      width: w, minWidth: w, height: '100vh',
      background: 'rgba(10, 10, 25, 0.9)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      flexShrink: 0,
      transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1), min-width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      overflow: 'hidden',
      zIndex: 100,
      position: 'relative',
    }}>
      {/* Ambient aurora glow at top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 120,
        background: 'linear-gradient(180deg, rgba(108, 92, 231, 0.06) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{
        padding: '14px', height: 56,
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10,
        position: 'relative',
      }}>
        <div style={{
          width: 30, height: 30,
          background: 'linear-gradient(135deg, #6c5ce7, #a855f7)',
          borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 800, color: '#ffffff', flexShrink: 0, cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(108, 92, 231, 0.35)',
          transition: 'box-shadow 0.3s',
        }}>T</div>
        {!sidebarCollapsed && (
          <>
            <span style={{
              fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap',
              background: 'linear-gradient(135deg, #e8e6f0, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.02em',
            }}>TaskFlow</span>
            <button
              onClick={() => setSidebarCollapsed(true)}
              style={{
                marginLeft: 'auto', width: 26, height: 26, border: '1px solid var(--border)',
                background: 'rgba(14, 14, 36, 0.5)', color: 'var(--text-muted)',
                cursor: 'pointer', borderRadius: 6, fontSize: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(108, 92, 231, 0.3)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
            >‹</button>
          </>
        )}
        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            style={{
              marginLeft: 'auto', width: 26, height: 26, border: '1px solid var(--border)',
              background: 'rgba(14, 14, 36, 0.5)', color: 'var(--text-muted)',
              cursor: 'pointer', borderRadius: 6, fontSize: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(108, 92, 231, 0.3)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
          >›</button>
        )}
      </div>

      {/* Search */}
      {!sidebarCollapsed && (
        <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
          <input
            type="text"
            value={searchVal}
            onChange={e => handleSearch(e.target.value)}
            placeholder="🔍  Search tasks..."
            style={{
              width: '100%', padding: '8px 12px',
              background: 'rgba(18, 18, 42, 0.6)',
              border: '1px solid var(--border)',
              borderRadius: 8, color: 'var(--text-primary)',
              fontSize: 13, outline: 'none',
              transition: 'all 0.2s',
            }}
          />
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
        {/* Workspace */}
        {!sidebarCollapsed && (
          <div style={{
            padding: '6px 16px 6px', fontSize: 10, fontWeight: 700,
            color: 'var(--text-muted)', textTransform: 'uppercase',
            letterSpacing: '0.12em',
          }}>
            Workspace
          </div>
        )}
        {NAV_WORKSPACE.map(item => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            badge={getBadge(item.id)}
            active={currentView === item.id}
            collapsed={sidebarCollapsed}
            onClick={() => setCurrentView(item.id)}
          />
        ))}

        {!sidebarCollapsed && (
          <div style={{
            padding: '16px 16px 6px', fontSize: 10, fontWeight: 700,
            color: 'var(--text-muted)', textTransform: 'uppercase',
            letterSpacing: '0.12em',
          }}>
            Team
          </div>
        )}
        {NAV_TEAM.map(item => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            badge={getBadge(item.id)}
            active={currentView === item.id}
            collapsed={sidebarCollapsed}
            onClick={() => setCurrentView(item.id)}
          />
        ))}

        {!sidebarCollapsed && (
          <>
            <div style={{
              padding: '16px 16px 6px', fontSize: 10, fontWeight: 700,
              color: 'var(--text-muted)', textTransform: 'uppercase',
              letterSpacing: '0.12em',
            }}>
              Filters
            </div>
            <NavItem icon="👤" label="My Tasks" collapsed={false} onClick={() => { setCurrentView('todo'); showToast(`📋 Showing tasks for ${activeUser ? activeUser.fname : 'User'}`, 'info'); }} />
            <NavItem icon="📅" label="Due Today" collapsed={false} onClick={() => { setCurrentView('todo'); showToast('📅 Filtered by today', 'info'); }} />
            <NavItem icon="🔴" label="Overdue" collapsed={false} onClick={() => { setCurrentView('todo'); showToast(`🔴 ${overdueCount} overdue tasks`, 'warning'); }} />
            <NavItem icon="🚪" label="Sign Out" collapsed={false} onClick={logout} />
          </>
        )}
      </nav>

      {/* 3-Account Active Profile Switcher */}
      {activeUser && (
        <div style={{ padding: 12, borderTop: '1px solid var(--border)' }}>
          {!sidebarCollapsed && (
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, paddingLeft: 4 }}>
              Active Account (1 of 3)
            </div>
          )}
          <div style={{ position: 'relative' }}>
            <select
              value={activeUserId}
              onChange={e => switchUser(Number(e.target.value))}
              style={{
                position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', zIndex: 10,
              }}
            >
              {users.map(u => (
                <option key={u.id} value={u.id} style={{ background: '#0c0c1e', color: '#fff' }}>
                  {getUserName(u)} ({u.role})
                </option>
              ))}
            </select>

            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                background: 'rgba(18, 18, 42, 0.6)',
                border: '1px solid rgba(108, 92, 231, 0.25)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(108, 92, 231, 0.4)'; (e.currentTarget as HTMLElement).style.background = 'rgba(26, 26, 58, 0.7)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(108, 92, 231, 0.25)'; (e.currentTarget as HTMLElement).style.background = 'rgba(18, 18, 42, 0.6)'; }}
            >
              <Avatar user={activeUser} size={30} fontSize={12} />
              {!sidebarCollapsed && (
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getUserName(activeUser)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green-glow)' }} />
                    {activeUser.role.toUpperCase()} • Switch ▾
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

function NavItem({ icon, label, badge, active, collapsed, onClick }: {
  icon: string; label: string; badge?: string;
  active?: boolean; collapsed: boolean; onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      title={collapsed ? label : undefined}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 14px', cursor: 'pointer',
        borderRadius: 8, margin: '2px 8px',
        fontSize: 13.5, fontWeight: active ? 600 : 400,
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        background: active ? 'rgba(108, 92, 231, 0.1)' : 'transparent',
        whiteSpace: 'nowrap', transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        borderLeft: active ? '2px solid transparent' : '2px solid transparent',
        ...(active ? {
          borderImage: 'linear-gradient(180deg, #6c5ce7, #a855f7) 1',
        } : {}),
      }}
      onMouseEnter={e => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = 'rgba(108, 92, 231, 0.06)';
          (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = 'transparent';
          (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
        }
      }}
    >
      <span style={{
        width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 15, flexShrink: 0,
        opacity: active ? 1 : 0.7,
      }}>{icon}</span>
      {!collapsed && <span style={{ flex: 1 }}>{label}</span>}
      {!collapsed && badge && (
        <span style={{
          background: active
            ? 'linear-gradient(135deg, rgba(108, 92, 231, 0.2), rgba(168, 85, 247, 0.2))'
            : 'rgba(18, 18, 42, 0.6)',
          color: active ? '#a78bfa' : 'var(--text-muted)',
          fontSize: 11, padding: '2px 8px', borderRadius: 10, fontWeight: 600,
          border: active ? '1px solid rgba(108, 92, 231, 0.15)' : '1px solid var(--border)',
        }}>{badge}</span>
      )}
    </div>
  );
}
