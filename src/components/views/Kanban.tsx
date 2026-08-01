import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, Status } from '../../types';
import { isOverdue, formatDate, getUserName } from '../../utils/helpers';
import { Avatar } from '../ui/Avatar';
import {
  IconPlus, IconTrash, StatusTodo, StatusInProgress,
  StatusReview, StatusDone, PriorityUrgent, PriorityHigh,
  PriorityMedium, PriorityLow,
} from '../ui/Icons';

const COLUMNS: { key: Status; label: string; icon: (p: any) => JSX.Element; color: string }[] = [
  { key: 'todo', label: 'To Do', icon: StatusTodo, color: 'var(--text-muted)' },
  { key: 'inprogress', label: 'In Progress', icon: StatusInProgress, color: 'var(--yellow)' },
  { key: 'review', label: 'In Review', icon: StatusReview, color: 'var(--blue)' },
  { key: 'done', label: 'Done', icon: StatusDone, color: 'var(--accent)' },
];

interface KanbanProps {
  onEdit: (task: Task) => void;
  onAdd: () => void;
}

export function Kanban({ onEdit, onAdd }: KanbanProps) {
  const { tasks, users, updateTaskStatus, deleteTask, showToast } = useApp();
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverCol, setDragOverCol] = useState<Status | null>(null);

  function onDragStart(id: number) { setDraggedId(id); }
  function onDragOver(e: React.DragEvent, status: Status) {
    e.preventDefault();
    setDragOverCol(status);
  }
  function onDragLeave() { setDragOverCol(null); }
  function onDrop(status: Status) {
    if (draggedId !== null) {
      updateTaskStatus(draggedId, status);
      const t = tasks.find(x => x.id === draggedId);
      showToast(`Moved "${t?.title || 'Task'}" to ${status}`, 'info');
      setDraggedId(null);
      setDragOverCol(null);
    }
  }

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: 12, padding: 16, height: '100%', overflowX: 'auto',
    }}>
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.key);
        const isTarget = dragOverCol === col.key;
        const Icon = col.icon;

        return (
          <div
            key={col.key}
            onDragOver={e => onDragOver(e, col.key)}
            onDragLeave={onDragLeave}
            onDrop={() => onDrop(col.key)}
            style={{
              background: 'var(--bg-secondary)',
              border: `1px solid ${isTarget ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 8, display: 'flex', flexDirection: 'column',
              height: '100%', overflow: 'hidden', transition: 'border-color 0.15s',
            }}
          >
            {/* Column Header */}
            <div style={{
              padding: '10px 14px', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon size={14} color={col.color} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{col.label}</span>
                <span style={{
                  fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-primary)',
                  padding: '1px 6px', borderRadius: 8,
                }}>{colTasks.length}</span>
              </div>
              <button
                onClick={onAdd}
                style={{
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
              >
                <IconPlus size={14} />
              </button>
            </div>

            {/* Column Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {colTasks.map(t => {
                const user = users.find(u => u.id === t.assignedTo);
                const PriorityIcon = t.priority === 'urgent' ? PriorityUrgent : t.priority === 'high' ? PriorityHigh : t.priority === 'medium' ? PriorityMedium : PriorityLow;

                return (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={() => onDragStart(t.id)}
                    onClick={() => onEdit(t)}
                    style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border)',
                      borderRadius: 6, padding: '10px 12px',
                      cursor: 'grab', display: 'flex', flexDirection: 'column', gap: 8,
                      transition: 'all 0.1s',
                      opacity: draggedId === t.id ? 0.5 : 1,
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-light)';
                      (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                      (e.currentTarget as HTMLElement).style.background = 'var(--bg-primary)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className={`todo-tag tag-${t.tag}`} style={{
                        fontSize: 9, padding: '1px 5px', borderRadius: 3,
                        fontWeight: 500, textTransform: 'uppercase',
                      }}>{t.tag}</span>
                      <div style={{ marginLeft: 'auto' }}>
                        <PriorityIcon size={12} />
                      </div>
                    </div>

                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                      {t.title}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                      <span style={{
                        fontSize: 11, color: isOverdue(t.due) && !t.completed ? 'var(--red)' : 'var(--text-muted)',
                      }}>{formatDate(t.due)}</span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {user && <Avatar user={user} size={18} fontSize={8} />}
                        <button
                          onClick={e => { e.stopPropagation(); deleteTask(t.id); }}
                          style={{
                            background: 'none', border: 'none', color: 'var(--text-muted)',
                            cursor: 'pointer', padding: 0, opacity: 0.5,
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
                  padding: '24px 10px', textAlign: 'center', color: 'var(--text-muted)',
                  fontSize: 12, border: '1px dashed var(--border)', borderRadius: 6,
                }}>
                  No issues
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
