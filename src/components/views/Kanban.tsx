import { useApp } from '../../context/AppContext';
import { Task, Status } from '../../types';
import { isOverdue, formatDate } from '../../utils/helpers';
import { Avatar } from '../ui/Avatar';

const COLUMNS: { key: Status; label: string; icon: string; color: string }[] = [
  { key: 'todo', label: 'Todo', icon: '○', color: 'var(--text-muted)' },
  { key: 'inprogress', label: 'In Progress', icon: '◐', color: 'var(--yellow)' },
  { key: 'review', label: 'In Review', icon: '◕', color: 'var(--blue)' },
  { key: 'done', label: 'Done', icon: '●', color: 'var(--accent)' },
];

const PRIORITY_COLORS: Record<string, string> = {
  high: 'var(--orange)',
  medium: 'var(--yellow)',
  low: 'var(--blue)',
};

interface KanbanProps {
  onEdit: (task: Task) => void;
  onAddInStatus: (status: Status) => void;
}

export function Kanban({ onEdit, onAddInStatus }: KanbanProps) {
  const { tasks, updateTask, users } = useApp();

  function handleDragStart(e: React.DragEvent, taskId: number) {
    e.dataTransfer.setData('taskId', String(taskId));
  }

  function handleDrop(e: React.DragEvent, status: Status) {
    e.preventDefault();
    const taskId = Number(e.dataTransfer.getData('taskId'));
    if (taskId) {
      updateTask(taskId, { status, completed: status === 'done' });
    }
    (e.currentTarget as HTMLElement).style.background = 'transparent';
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)';
  }

  function handleDragLeave(e: React.DragEvent) {
    (e.currentTarget as HTMLElement).style.background = 'transparent';
  }

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.key);
        return (
          <div
            key={col.key}
            onDrop={e => handleDrop(e, col.key)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              borderRight: '1px solid var(--border)',
              transition: 'background 0.1s',
              minWidth: 0,
            }}
          >
            {/* Column Header */}
            <div style={{
              padding: '10px 14px',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 8,
              flexShrink: 0,
            }}>
              <span style={{ color: col.color, fontSize: 14, fontFamily: 'system-ui' }}>{col.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{col.label}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{colTasks.length}</span>
              <span style={{ marginLeft: 'auto' }}>
                <button
                  onClick={() => onAddInStatus(col.key)}
                  style={{
                    width: 22, height: 22, border: 'none', background: 'transparent',
                    color: 'var(--text-muted)', cursor: 'pointer', borderRadius: 4,
                    fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.1s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
                >+</button>
              </span>
            </div>

            {/* Cards */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 6 }}>
              {colTasks.map(t => {
                const user = users.find(u => u.id === t.assignedTo);
                const overdue = isOverdue(t.due) && !t.completed;
                return (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={e => handleDragStart(e, t.id)}
                    onClick={() => onEdit(t)}
                    style={{
                      padding: '10px 12px', borderRadius: 6,
                      border: '1px solid var(--border)',
                      background: 'var(--bg-secondary)',
                      cursor: 'pointer', marginBottom: 4,
                      transition: 'background 0.08s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)'; }}
                  >
                    <div style={{
                      fontSize: 13, color: t.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                      textDecoration: t.completed ? 'line-through' : 'none',
                      marginBottom: 8, lineHeight: 1.4,
                    }}>{t.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 3, height: 10, borderRadius: 2,
                        background: PRIORITY_COLORS[t.priority] || 'var(--text-muted)',
                      }} />
                      <span className={`tag-${t.tag}`} style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, fontWeight: 500 }}>{t.tag}</span>
                      {t.due && (
                        <span style={{ fontSize: 11, color: overdue ? 'var(--red)' : 'var(--text-muted)' }}>{formatDate(t.due)}</span>
                      )}
                      <div style={{ marginLeft: 'auto' }}>
                        {user && <Avatar user={user} size={18} fontSize={8} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
