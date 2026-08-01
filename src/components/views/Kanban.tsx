import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, Status } from '../../types';
import { isOverdue, formatDate, getUserName } from '../../utils/helpers';
import { Avatar } from '../ui/Avatar';
import {
  IconPlus, IconTrash, IconEdit, IconChevronDown,
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

export function Kanban({ onEdit, onAdd }: KanbanProps) {
  const { tasks, users, updateTaskStatus, deleteTask, showToast } = useApp();
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverCol, setDragOverCol] = useState<Status | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  // Drag and Drop Handlers
  function handleDragStart(e: React.DragEvent, id: number) {
    e.dataTransfer.setData('text/plain', id.toString());
    e.dataTransfer.effectAllowed = 'move';
    setDraggedId(id);
  }

  function handleDragOver(e: React.DragEvent, status: Status) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== status) {
      setDragOverCol(status);
    }
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(e: React.DragEvent, status: Status) {
    e.preventDefault();
    const idStr = e.dataTransfer.getData('text/plain');
    const id = idStr ? parseInt(idStr, 10) : draggedId;

    if (id !== null && !isNaN(id)) {
      const task = tasks.find(t => t.id === id);
      if (task && task.status !== status) {
        updateTaskStatus(id, status);
        showToast(`Moved "${task.title}" to ${status}`, 'info');
      }
    }
    setDraggedId(null);
    setDragOverCol(null);
  }

  function handleMoveClick(taskId: number, newStatus: Status) {
    updateTaskStatus(taskId, newStatus);
    const task = tasks.find(t => t.id === taskId);
    showToast(`Moved "${task?.title || 'Task'}" to ${newStatus}`, 'info');
    setActiveMenuId(null);
  }

  return (
    <div
      onClick={() => setActiveMenuId(null)}
      style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16, padding: 20, height: '100%', overflowX: 'auto',
      }}
    >
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.key);
        const isTarget = dragOverCol === col.key;
        const Icon = col.icon;

        return (
          <div
            key={col.key}
            onDragOver={e => handleDragOver(e, col.key)}
            onDragLeave={handleDragLeave}
            onDrop={e => handleDrop(e, col.key)}
            style={{
              background: isTarget ? 'var(--bg-tertiary)' : col.bg,
              border: `1.5px solid ${isTarget ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 10, display: 'flex', flexDirection: 'column',
              height: '100%', overflow: 'hidden', transition: 'all 0.15s ease',
              boxShadow: isTarget ? '0 0 12px var(--accent-dim)' : 'none',
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
                style={{
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center',
                  borderRadius: 4, transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <IconPlus size={14} />
              </button>
            </div>

            {/* Column Task List */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: 12,
              display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              {colTasks.map(t => {
                const user = users.find(u => u.id === t.assignedTo);
                const isDraggingThis = draggedId === t.id;
                const isMenuOpen = activeMenuId === t.id;

                const PriorityIcon = t.priority === 'urgent' ? PriorityUrgent : t.priority === 'high' ? PriorityHigh : t.priority === 'medium' ? PriorityMedium : PriorityLow;

                return (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={e => handleDragStart(e, t.id)}
                    onClick={() => onEdit(t)}
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 8, padding: '12px 14px',
                      cursor: 'grab', display: 'flex', flexDirection: 'column', gap: 10,
                      transition: 'all 0.15s ease',
                      opacity: isDraggingThis ? 0.4 : 1,
                      transform: isDraggingThis ? 'scale(0.98)' : 'none',
                      position: 'relative',
                    }}
                    onMouseEnter={e => {
                      if (!isDraggingThis) {
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-light)';
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isDraggingThis) {
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                        (e.currentTarget as HTMLElement).style.transform = 'none';
                      }
                    }}
                  >
                    {/* Top row: tag & 1-click status switcher menu */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className={`todo-tag tag-${t.tag}`} style={{
                        fontSize: 10, padding: '2px 6px', borderRadius: 4,
                        fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em',
                      }}>{t.tag}</span>

                      {/* Priority Icon & Move Dropdown Trigger */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <PriorityIcon size={13} />
                        <div style={{ position: 'relative' }}>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setActiveMenuId(isMenuOpen ? null : t.id);
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
                              {COLUMNS.filter(c => c.key !== t.status).map(c => (
                                <div
                                  key={c.key}
                                  onClick={() => handleMoveClick(t.id, c.key)}
                                  style={{
                                    padding: '6px 8px', borderRadius: 4, fontSize: 11,
                                    color: 'var(--text-primary)', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: 6,
                                  }}
                                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
                                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
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
                      lineHeight: 1.4, textDecoration: t.completed ? 'line-through' : 'none',
                    }}>
                      {t.title}
                    </div>

                    {/* Footer Row: Due Date & Assignee */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 2,
                    }}>
                      <span style={{
                        fontSize: 11, color: isOverdue(t.due) && !t.completed ? 'var(--red)' : 'var(--text-muted)',
                        fontWeight: 500,
                      }}>{formatDate(t.due)}</span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {user && <Avatar user={user} size={20} fontSize={8} />}
                        <button
                          onClick={e => { e.stopPropagation(); deleteTask(t.id); }}
                          style={{
                            background: 'none', border: 'none', color: 'var(--text-muted)',
                            cursor: 'pointer', padding: 2, opacity: 0.5,
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--red)'; (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.5'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
                        >
                          <IconTrash size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

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
