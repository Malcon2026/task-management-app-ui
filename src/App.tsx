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
import { IconPlus, IconBell, IconChevronRight } from './components/ui/Icons';
import type { Task, Status, Quadrant } from './types';

const VIEW_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  todo: 'Tasks',
  matrix: 'Matrix',
  kanban: 'Board',
  activity: 'Activity',
  users: 'Members',
};

function AppInner() {
  const { currentView, setCurrentView, showToast, isAuthenticated } = useApp();

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<Status | undefined>();
  const [defaultQuadrant, setDefaultQuadrant] = useState<Quadrant | undefined>();

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

  const handleViewUserTasks = useCallback((_userId: number) => {
    setCurrentView('todo');
    showToast('Showing member issues', 'info');
  }, [setCurrentView, showToast]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        openAddTask();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [openAddTask]);

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
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Header */}
        <header style={{
          height: 44, borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12,
          background: 'var(--bg-secondary)', flexShrink: 0,
        }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
            <span style={{ fontWeight: 500 }}>TaskFlow</span>
            <IconChevronRight size={12} color="var(--text-muted)" />
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{VIEW_LABELS[currentView] || currentView}</span>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => showToast('No unread notifications', 'info')}
              style={{
                width: 28, height: 28, border: '1px solid var(--border)',
                background: 'var(--bg-primary)', color: 'var(--text-muted)',
                cursor: 'pointer', borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-light)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
            >
              <IconBell size={14} />
            </button>

            <button
              onClick={openAddTask}
              style={{
                height: 28, padding: '0 10px', borderRadius: 6,
                background: 'var(--accent)', color: '#fff', border: 'none',
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 5,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent-hover)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent)'; }}
            >
              <IconPlus size={13} />
              <span>Task</span>
            </button>
          </div>
        </header>

        {/* Content View */}
        <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'todo' && <TodoList onEdit={openEditTask} onAdd={openAddTask} />}
          {currentView === 'matrix' && <Matrix onEdit={openEditTask} onAdd={openAddTask} />}
          {currentView === 'kanban' && <Kanban onEdit={openEditTask} onAdd={openAddTask} />}
          {currentView === 'activity' && <ActivityLog />}
          {currentView === 'users' && (
            <Users
              onAddUser={() => setUserModalOpen(true)}
              onViewTasks={handleViewUserTasks}
            />
          )}
        </main>
      </div>

      <TaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        editTask={editingTask}
        defaultStatus={defaultStatus}
        defaultQuadrant={defaultQuadrant}
      />

      <UserModal
        open={userModalOpen}
        onClose={() => setUserModalOpen(false)}
      />

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
