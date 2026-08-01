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
  todo: 'Issues',
  matrix: 'Matrix',
  kanban: 'Board',
  activity: 'Activity',
  users: 'Members',
};

function AppInner() {
  const { currentView, setCurrentView, showToast, isAuthenticated, logout, activeUser } = useApp();

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<Status | undefined>();
  const [defaultQuadrant, setDefaultQuadrant] = useState<Quadrant | undefined>();
  const [userModalOpen, setUserModalOpen] = useState(false);

  const openAddTask = useCallback(() => {
    setEditingTask(null); setDefaultStatus(undefined); setDefaultQuadrant(undefined); setTaskModalOpen(true);
  }, []);
  const openEditTask = useCallback((task: Task) => {
    setEditingTask(task); setDefaultStatus(undefined); setDefaultQuadrant(undefined); setTaskModalOpen(true);
  }, []);
  const openAddInStatus = useCallback((status: Status) => {
    setEditingTask(null); setDefaultStatus(status); setDefaultQuadrant(undefined); setTaskModalOpen(true);
  }, []);
  const openAddInQuadrant = useCallback((quadrant: Quadrant) => {
    setEditingTask(null); setDefaultStatus(undefined); setDefaultQuadrant(quadrant); setTaskModalOpen(true);
  }, []);
  const handleViewUserTasks = useCallback((_userId: number) => {
    setCurrentView('todo'); showToast('Showing tasks', 'info');
  }, [setCurrentView, showToast]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); openAddTask(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [openAddTask]);

  if (!isAuthenticated) {
    return (<><LoginPage /><ToastContainer /></>);
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Header */}
        <header style={{
          height: 44, borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12,
          background: 'var(--bg-secondary)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>TaskFlow</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>/</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{VIEW_LABELS[currentView] || currentView}</span>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={openAddTask}
              style={{
                padding: '5px 12px', borderRadius: 6, border: 'none',
                background: 'var(--accent)', color: '#ffffff',
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                transition: 'background 0.15s',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent-hover)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent)'; }}
            >
              <span style={{ fontSize: 14, fontWeight: 300 }}>+</span> Issue
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

      <TaskModal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} editTask={editingTask} defaultStatus={defaultStatus} defaultQuadrant={defaultQuadrant} />
      <UserModal open={userModalOpen} onClose={() => setUserModalOpen(false)} />
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
