import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getUserName } from '../utils/helpers';
import { Avatar } from './ui/Avatar';
import {
  IconDashboard, IconIssues, IconBoard, IconMatrix,
  IconActivity, IconMembers, IconLogout, IconMenu,
  IconChevronDown, IconSearch, IconZap, IconArrowRight,
} from './ui/Icons';
import type { View } from '../types';

const NAV_ITEMS: { key: View; icon: (p: any) => JSX.Element; label: string }[] = [
  { key: 'dashboard', icon: IconDashboard, label: 'Dashboard' },
  { key: 'todo', icon: IconIssues, label: 'Tasks' },
  { key: 'kanban', icon: IconBoard, label: 'Board' },
  { key: 'matrix', icon: IconMatrix, label: 'Matrix' },
  { key: 'activity', icon: IconActivity, label: 'Activity' },
  { key: 'users', icon: IconMembers, label: 'Members' },
];

export function Sidebar() {
  const { currentView, setCurrentView, tasks, users, showToast, activeUser, activeUserId, switchUser, logout } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const openCount = tasks.filter(t => !t.completed).length;
  const inProgressCount = tasks.filter(t => t.status === 'inprogress').length;

  function navTo(view: View) {
    setCurrentView(view);
    if (isMobile) setMobileOpen(false);
  }

  const sidebarContent = (
    <>
      {/* Workspace Header */}
      <div style={{
        padding: '12px 14px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10,
        flexShrink: 0,
      }}>
        <div style={{
          width: 26, height: 26, borderRadius: 7,
          background: 'var(--accent)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: '#fff',
        }}>T</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>TaskFlow</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>Workspace</div>
        </div>
        {isMobile && (
          <button onClick={() => setMobileOpen(false)} style={{
            background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4,
          }}><IconSearch size={14} /></button>
        )}
      </div>

      {/* Search */}
      <div style={{ padding: '8px 10px', flexShrink: 0 }}>
        <div
          onClick={() => showToast('Search coming soon', 'info')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 10px', borderRadius: 6,
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            cursor: 'pointer', transition: 'border-color 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-light)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
        >
          <IconSearch size={13} color="var(--text-muted)" />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', flex: 1 }}>Search...</span>
          <span style={{
            fontSize: 10, color: 'var(--text-muted)',
            background: 'var(--bg-secondary)', padding: '1px 5px',
            borderRadius: 3, border: '1px solid var(--border)',
          }}>⌘K</span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '4px 8px', overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => {
          const isActive = currentView === item.key;
          const count = item.key === 'todo' ? openCount : item.key === 'kanban' ? inProgressCount : undefined;
          const Icon = item.icon;
          return (
            <div
              key={item.key}
              onClick={() => navTo(item.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '7px 10px', borderRadius: 6,
                cursor: 'pointer',
                background: isActive ? 'var(--bg-active)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: isActive ? 500 : 400,
                transition: 'all 0.1s',
                marginBottom: 1,
                position: 'relative',
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              {isActive && <div style={{
                position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                width: 3, height: 16, borderRadius: '0 3px 3px 0', background: 'var(--accent)',
              }} />}
              <Icon size={15} color={isActive ? 'var(--text-primary)' : 'var(--text-muted)'} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {count !== undefined && count > 0 && (
                <span style={{
                  fontSize: 11, color: 'var(--text-muted)', fontWeight: 500,
                  background: 'var(--bg-primary)', padding: '0 6px', borderRadius: 10,
                  minWidth: 20, textAlign: 'center', lineHeight: '18px',
                }}>{count}</span>
              )}
            </div>
          );
        })}

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border)', margin: '10px 10px' }} />

        {/* Quick Filters */}
        <div style={{
          fontSize: 10, fontWeight: 600, color: 'var(--text-muted)',
          padding: '6px 10px 6px', letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>Shortcuts</div>

        {[
          { icon: IconArrowRight, label: 'My Tasks', action: () => { navTo('todo'); showToast('Filtered: My Tasks', 'info'); } },
          { icon: IconZap, label: 'Urgent', action: () => { navTo('todo'); showToast('Filtered: Urgent', 'info'); } },
        ].map(f => (
          <div
            key={f.label}
            onClick={f.action}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '6px 10px', borderRadius: 6,
              cursor: 'pointer', color: 'var(--text-secondary)',
              fontSize: 13, transition: 'background 0.1s', marginBottom: 1,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <f.icon size={14} color="var(--text-muted)" />
            <span>{f.label}</span>
          </div>
        ))}
      </nav>

      {/* Account Section */}
      {activeUser && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '8px 8px', flexShrink: 0 }}>
          {/* User Switcher */}
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
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 6, cursor: 'pointer',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <Avatar user={activeUser} size={24} fontSize={10} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {getUserName(activeUser)}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{activeUser.role}</div>
              </div>
              <IconChevronDown size={12} color="var(--text-muted)" />
            </div>
          </div>

          {/* Sign Out */}
          <div
            onClick={logout}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '6px 10px', borderRadius: 6,
              cursor: 'pointer', color: 'var(--text-muted)',
              fontSize: 12, transition: 'all 0.1s', marginTop: 2,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; (e.currentTarget as HTMLElement).style.color = 'var(--red)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
          >
            <IconLogout size={14} />
            <span>Sign out</span>
          </div>
        </div>
      )}
    </>
  );

  // Mobile overlay
  if (isMobile) {
    return (
      <>
        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(true)}
          style={{
            position: 'fixed', top: 10, left: 10, zIndex: 200,
            width: 36, height: 36, borderRadius: 8,
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-secondary)',
          }}
        >
          <IconMenu size={18} />
        </button>

        {/* Overlay */}
        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
              zIndex: 300,
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                width: 260, height: '100vh',
                background: 'var(--bg-secondary)',
                borderRight: '1px solid var(--border)',
                display: 'flex', flexDirection: 'column',
                animation: 'slideInLeft 0.2s ease-out',
              }}
            >
              {sidebarContent}
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop sidebar
  return (
    <div style={{
      width: 230, flexShrink: 0,
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      height: '100vh',
      userSelect: 'none',
    }}>
      {sidebarContent}
    </div>
  );
}
