import { useState, useCallback, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/ui/Toast';
import { TaskModal } from './components/TaskModal';
import { UserModal } from './components/UserModal';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/views/Dashboard';
import { TodoList } from './components/views/TodoList';
import { Matrix } from './components/views/Matrix';
import { Kanban } from './components/views/Kanban';
import { ActivityLog } from './components/views/ActivityLog';
import { Users } from './components/views/Users';
import type { Task, Status, Quadrant } from './types';

const VIEW_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  todo: 'Todo List',
  matrix: 'Eisenhower Matrix',
  kanban: 'Kanban Board',
  activity: 'Activity Log',
  users: 'Team Members',
};

function AppInner() {
  const { currentView, setCurrentView, showToast, isAuthenticated, logout } = useApp();

  // Task modal state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<Status | undefined>();
  const [defaultQuadrant, setDefaultQuadrant] = useState<Quadrant | undefined>();

  // User modal state
  const [userModalOpen, setUserModalOpen] = useState(false);

  const openAddTask = useCallback(() => {
    setEditingTask(null);
    setDefaultStatus(undefined);
    setDefaultQuadrant(undefined);
    setTaskModalOpen(true);
  }, []);

  const openEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setDefaultStatus(undefined);
    setDefaultQuadrant(undefined);
    setTaskModalOpen(true);
  }, []);

  const openAddInStatus = useCallback((status: Status) => {
    setEditingTask(null);
    setDefaultStatus(status);
    setDefaultQuadrant(undefined);
    setTaskModalOpen(true);
  }, []);

  const openAddInQuadrant = useCallback((quadrant: Quadrant) => {
    setEditingTask(null);
    setDefaultStatus(undefined);
    setDefaultQuadrant(quadrant);
    setTaskModalOpen(true);
  }, []);

  const handleViewUserTasks = useCallback((_userId: number) => {
    setCurrentView('todo');
    showToast(`📋 Showing tasks`, 'info');
  }, [setCurrentView, showToast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openAddTask();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [openAddTask]);

  // Unauthenticated screen
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <ToastContainer />
      </>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Header */}
        <header style={{
          height: 56, borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16,
          background: 'var(--bg-secondary)',
          flexShrink: 0,
          position: 'relative',
        }}>
          {/* Subtle gradient accent at bottom of header */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
            background: 'var(--border)',
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: 500, letterSpacing: '0.02em' }}>TaskFlow</span>
            <span style={{ color: 'var(--border-light)', fontSize: 10 }}>›</span>
            <span style={{
              color: 'var(--text-primary)', fontWeight: 600,
            }}>{VIEW_LABELS[currentView] || currentView}</span>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              data-tooltip="Toggle theme"
              onClick={() => showToast('🎨 Only dark theme available', 'info')}
              style={{
                width: 34, height: 34, border: '1px solid var(--border)',
                background: 'var(--bg-secondary)', color: 'var(--text-muted)',
                cursor: 'pointer', borderRadius: 8, fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-light)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
            >◑</button>
            <button
              onClick={() => showToast('📬 No new notifications', 'info')}
              style={{
                width: 34, height: 34, border: '1px solid var(--border)',
                background: 'var(--bg-secondary)', color: 'var(--text-muted)',
                cursor: 'pointer', borderRadius: 8, fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
                position: 'relative',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-light)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
            >
              🔔
              {/* Notification dot */}
              <div style={{
                position: 'absolute', top: 6, right: 6,
                width: 6, height: 6, borderRadius: '50%',
                background: 'var(--red)',
                boxShadow: '0 0 6px var(--red-glow)',
              }} />
            </button>
            <button
              onClick={openAddTask}
              style={{
                padding: '7px 18px', borderRadius: 8, border: 'none',
                background: 'var(--accent)',
                color: '#ffffff', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.25s',
                boxShadow: '0 2px 12px var(--border-light)',
                letterSpacing: '0.01em',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(108, 92, 231, 0.5)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px var(--border-light)'; (e.currentTarget as HTMLElement).style.transform = ''; }}
            >
              <span style={{ fontSize: 15, fontWeight: 300 }}>+</span> New Task
            </button>
            {/* Logout Button */}
            <button
              onClick={logout}
              data-tooltip="Logout"
              style={{
                padding: '7px 14px', borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 107, 107, 0.4)'; (e.currentTarget as HTMLElement).style.color = 'var(--red)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
            >
              🚪 Logout
            </button>
          </div>
        </header>

        {/* Views */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'todo' && <TodoList onEdit={openEditTask} onAdd={openAddTask} />}
          {currentView === 'matrix' && <Matrix onEdit={openEditTask} onAddInQuadrant={openAddInQuadrant} />}
          {currentView === 'kanban' && <Kanban onEdit={openEditTask} onAddInStatus={openAddInStatus} />}
          {currentView === 'activity' && <ActivityLog />}
          {currentView === 'users' && <Users onAddUser={() => setUserModalOpen(true)} onViewTasks={handleViewUserTasks} />}
        </div>
      </div>

      {/* Modals */}
      <TaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        editTask={editingTask}
        defaultStatus={defaultStatus}
        defaultQuadrant={defaultQuadrant}
      />
      <UserModal open={userModalOpen} onClose={() => setUserModalOpen(false)} />

      {/* Toasts */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
