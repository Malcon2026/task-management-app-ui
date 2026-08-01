import { useApp } from '../../context/AppContext';
import { Task } from '../../types';
import { Avatar } from '../ui/Avatar';
import { PriorityUrgent, PriorityHigh, PriorityMedium, PriorityLow, IconPlus } from '../ui/Icons';

const QUADRANTS = [
  { key: 'q1', label: 'Do First', desc: 'Urgent & Important', color: 'var(--red)', priority: 'urgent' },
  { key: 'q2', label: 'Schedule', desc: 'Important, Not Urgent', color: 'var(--blue)', priority: 'high' },
  { key: 'q3', label: 'Delegate', desc: 'Urgent, Not Important', color: 'var(--yellow)', priority: 'medium' },
  { key: 'q4', label: 'Don\'t Do', desc: 'Neither Urgent nor Important', color: 'var(--text-muted)', priority: 'low' },
];

interface MatrixProps {
  onEdit: (task: Task) => void;
  onAdd: () => void;
}

export function Matrix({ onEdit, onAdd }: MatrixProps) {
  const { tasks, users } = useApp();

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: 12, padding: 16, height: '100%', overflowY: 'auto',
    }}>
      {QUADRANTS.map(q => {
        const qTasks = tasks.filter(t => !t.completed && (t.quadrant === q.key || (t.priority === 'urgent' && q.key === 'q1') || (t.priority === 'high' && q.key === 'q2') || (t.priority === 'medium' && q.key === 'q3') || (t.priority === 'low' && q.key === 'q4')));

        return (
          <div
            key={q.key}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 8, padding: 14,
              display: 'flex', flexDirection: 'column', gap: 10,
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: '1px solid var(--border)', paddingBottom: 8,
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: q.color }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{q.label}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({qTasks.length})</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{q.desc}</div>
              </div>
              <button
                onClick={onAdd}
                style={{
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  cursor: 'pointer', padding: 2,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
              >
                <IconPlus size={14} />
              </button>
            </div>

            {/* Content List */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {qTasks.map(t => {
                const user = users.find(u => u.id === t.assignedTo);
                return (
                  <div
                    key={t.id}
                    onClick={() => onEdit(t)}
                    style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border)',
                      borderRadius: 6, padding: '8px 10px',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                      transition: 'all 0.1s',
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
                    <span className={`todo-tag tag-${t.tag}`} style={{
                      fontSize: 9, padding: '1px 5px', borderRadius: 3,
                      fontWeight: 500, textTransform: 'uppercase', flexShrink: 0,
                    }}>{t.tag}</span>

                    <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.title}
                    </span>

                    {user && <Avatar user={user} size={18} fontSize={8} />}
                  </div>
                );
              })}

              {qTasks.length === 0 && (
                <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                  No issues in quadrant
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
