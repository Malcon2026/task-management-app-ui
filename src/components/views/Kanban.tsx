import { useState, useMemo, useCallback, useRef, memo } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, Status, User } from '../../types';
import { isOverdue, formatDate } from '../../utils/helpers';
import { Avatar } from '../ui/Avatar';
import {
  IconPlus, IconTrash, IconChevronDown,
  StatusTodo, StatusInProgress, StatusReview, StatusDone,
  PriorityUrgent, PriorityHigh, PriorityMedium, PriorityLow,
} from '../ui/Icons';

const COLUMNS: { key: Status; label: string; icon: (p: any) => JSX.Element; color: string; bg: string }[] = [
  { key: 'todo', label: 'To Do', icon: StatusTodo, color: 'var(--text-muted)', bg: 'rgba(255, 255, 255, 0.02)' },
  { key: 'inprogress', label: 'In Progress', icon: StatusInProgress, color: '#eab308', bg: 'rgba(234, 179, 8, 0.03)' },
  { key: 'review', label: 'In Review', icon: StatusReview, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.03)' },
  { key: 'done', label: 'Done', icon: StatusDone, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.03)' },
];

interface KanbanProps {
  onEdit: (task: Task) => void;
  onAdd: () => void;
}

interface KanbanCardProps {
  task: Task;
  user: User | undefined;
  isMenuOpen: boolean;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onDragStart: (e: React.DragEvent, id: number) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onToggleMenu: (id: number) => void;
  onMoveClick: (id: number, status: Status) => void;
}

const KanbanCard = memo(function KanbanCard({
  task,
  user,
  isMenuOpen,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
  onToggleMenu,
  onMoveClick,
}: KanbanCardProps) {
  const PriorityIcon = task.priority === 'urgent' ? PriorityUrgent : task.priority === 'high' ? PriorityHigh : task.priority === 'medium' ? PriorityMedium : PriorityLow;

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      onClick={() => onEdit(task)}
      className="kanban-card"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 8, padding: '12px 14px',
        cursor: 'grab', display: 'flex', flexDirection: 'column', gap: 10,
        position: 'relative',
      }}
    >
      {/* Top row: tag & 1-click status switcher menu */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className={`todo-tag tag-${task.tag}`} style={{
          fontSize: 10, padding: '2px 6px', borderRadius: 4,
          fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em',
        }}>{task.tag}</span>

        {/* Priority Icon & Move Dropdown Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <PriorityIcon size={13} />
          <div style={{ position: 'relative' }}>
            <button
              onClick={e => {
                e.stopPropagation();
                onToggleMenu(task.id);
              }}
              style={{
                background: 'var(--bg-primary)', border: '1px solid var(--border)',
                borderRadius: 4, color: 'var(--text-muted)', cursor: 'pointer',
                padding: '2px 4px', fontSize: 10, display: 'flex', alignItems: 'center', gap: 2,
              }}
            >
              <span>Move</span>
              <IconChevronDown size={10} />
            </button>

            {/* 1-Click Move Menu */}
            {isMenuOpen && (
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  position: 'absolute', right: 0, top: 22, zIndex: 100,
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-light)',
                  borderRadius: 6, padding: 4, width: 130,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                }}
              >
                {COLUMNS.filter(c => c.key !== task.status).map(c => (
                  <div
                    key={c.key}
                    onClick={() => onMoveClick(task.id, c.key)}
                    className="kanban-menu-item"
                  >
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: c.color }} />
                    <span>{c.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Title */}
      <div style={{
        fontSize: 13, fontWeight: 500, color: 'var(--text-primary)',
        lineHeight: 1.4, textDecoration: task.completed ? 'line-through' : 'none',
      }}>
        {task.title}
      </div>

      {/* Footer Row: Due Date & Assignee */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 2,
      }}>
        <span style={{
          fontSize: 11, color: isOverdue(task.due) && !task.completed ? 'var(--red)' : 'var(--text-muted)',
          fontWeight: 500,
        }}>{formatDate(task.due)}</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {user && <Avatar user={user} size={20} fontSize={8} />}
          <button
            onClick={e => { e.stopPropagation(); onDelete(task.id); }}
            className="kanban-delete-btn"
            title="Delete Task"
          >
            <IconTrash size={12} />
          </button>
        </div>
      </div>
    </div>
  );
});

export function Kanban({ onEdit, onAdd }: KanbanProps) {
  const { tasks, users, updateTaskStatus, deleteTask, showToast } = useApp();
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const draggedTaskIdRef = useRef<number | null>(null);

  // Group tasks by status efficiently using useMemo
  const tasksByStatus = useMemo(() => {
    const map: Record<Status, Task[]> = {
      todo: [],
      inprogress: [],
      review: [],
      done: [],
    };
    tasks.forEach(t => {
      if (map[t.status]) {
        map[t.status].push(t);
      }
    });
    return map;
  }, [tasks]);

  // Quick user map lookup
  const usersById = useMemo(() => {
    const map = new Map<number, User>();
    users.forEach(u => map.set(u.id, u));
    return map;
  }, [users]);

  // Zero-rerender Drag & Drop Handlers
  const handleDragStart = useCallback((e: React.DragEvent, id: number) => {
    e.dataTransfer.setData('text/plain', id.toString());
    e.dataTransfer.effectAllowed = 'move';
    draggedTaskIdRef.current = id;
    const target = e.currentTarget as HTMLElement;
    target.classList.add('is-dragging');
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('is-dragging');
    draggedTaskIdRef.current = null;
    document.querySelectorAll('.kanban-col').forEach(el => el.classList.remove('col-drag-over'));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const colEl = (e.currentTarget as HTMLElement).closest('.kanban-col');
    if (colEl) {
      colEl.classList.add('col-drag-over');
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const colEl = (e.currentTarget as HTMLElement).closest('.kanban-col');
    if (colEl && !colEl.contains(e.relatedTarget as Node)) {
      colEl.classList.remove('col-drag-over');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, status: Status) => {
    e.preventDefault();
    const colEl = (e.currentTarget as HTMLElement).closest('.kanban-col');
    if (colEl) {
      colEl.classList.remove('col-drag-over');
    }

    const idStr = e.dataTransfer.getData('text/plain');
    const id = idStr ? parseInt(idStr, 10) : draggedTaskIdRef.current;

    if (id !== null && !isNaN(id)) {
      const task = tasks.find(t => t.id === id);
      if (task && task.status !== status) {
        updateTaskStatus(id, status);
        showToast(`Moved "${task.title}" to ${status}`, 'info');
      }
    }
    draggedTaskIdRef.current = null;
    document.querySelectorAll('.kanban-col').forEach(el => el.classList.remove('col-drag-over'));
  }, [tasks, updateTaskStatus, showToast]);

  const handleMoveClick = useCallback((taskId: number, newStatus: Status) => {
    updateTaskStatus(taskId, newStatus);
    const task = tasks.find(t => t.id === taskId);
    showToast(`Moved "${task?.title || 'Task'}" to ${newStatus}`, 'info');
    setActiveMenuId(null);
  }, [tasks, updateTaskStatus, showToast]);

  const handleToggleMenu = useCallback((id: number) => {
    setActiveMenuId(prev => (prev === id ? null : id));
  }, []);

  const handleDeleteTask = useCallback((id: number) => {
    deleteTask(id);
  }, [deleteTask]);

  return (
    <div
      onClick={() => setActiveMenuId(null)}
      style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16, padding: 20, height: '100%', overflowX: 'auto',
      }}
    >
      {COLUMNS.map(col => {
        const colTasks = tasksByStatus[col.key] || [];

        return (
          <div
            key={col.key}
            className="kanban-col"
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={e => handleDrop(e, col.key)}
            style={{
              background: col.bg,
              border: '1.5px solid var(--border)',
              borderRadius: 10, display: 'flex', flexDirection: 'column',
              height: '100%', overflow: 'hidden',
            }}
          >
            {/* Column Header */}
            <div style={{
              padding: '12px 16px', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--bg-secondary)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', background: col.color,
                }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{col.label}</span>
                <span style={{
                  fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-primary)',
                  padding: '2px 8px', borderRadius: 10, fontWeight: 600,
                  border: '1px solid var(--border)',
                }}>{colTasks.length}</span>
              </div>
              <button
                onClick={onAdd}
                className="kanban-action-btn"
                title="Add Task"
              >
                <IconPlus size={14} />
              </button>
            </div>

            {/* Column Task List */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: 12,
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              {colTasks.map(t => (
                <KanbanCard
                  key={t.id}
                  task={t}
                  user={usersById.get(t.assignedTo)}
                  isMenuOpen={activeMenuId === t.id}
                  onEdit={onEdit}
                  onDelete={handleDeleteTask}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onToggleMenu={handleToggleMenu}
                  onMoveClick={handleMoveClick}
                />
              ))}

              {colTasks.length === 0 && (
                <div style={{
                  padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)',
                  fontSize: 12, border: '1px dashed var(--border)', borderRadius: 8,
                }}>
                  Drop tasks here or click +
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
