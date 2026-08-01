import { useApp } from '../../context/AppContext';
import { Task, Quadrant } from '../../types';

const QUADRANTS: { key: Quadrant; label: string; desc: string; color: string }[] = [
  { key: 'q1', label: 'Urgent & Important', desc: 'Do first', color: 'var(--red)' },
  { key: 'q2', label: 'Not Urgent & Important', desc: 'Schedule', color: 'var(--blue)' },
  { key: 'q3', label: 'Urgent & Not Important', desc: 'Delegate', color: 'var(--yellow)' },
  { key: 'q4', label: 'Not Urgent & Not Important', desc: 'Eliminate', color: 'var(--text-muted)' },
];

interface MatrixProps {
  onEdit: (task: Task) => void;
  onAddInQuadrant: (quadrant: Quadrant) => void;
}

export function Matrix({ onEdit, onAddInQuadrant }: MatrixProps) {
  const { tasks, toggleTask } = useApp();

  return (
    <div style={{
      flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr 1fr', overflow: 'hidden',
    }}>
      {QUADRANTS.map(q => {
        const qTasks = tasks.filter(t => t.quadrant === q.key && !t.completed);
        return (
          <div key={q.key} style={{
            display: 'flex', flexDirection: 'column',
            borderRight: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              padding: '10px 14px',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 8,
              flexShrink: 0,
            }}>
              <div style={{ width: 3, height: 14, borderRadius: 2, background: q.color }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{q.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{q.desc}</div>
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{qTasks.length}</span>
              <button
                onClick={() => onAddInQuadrant(q.key)}
                style={{
                  width: 22, height: 22, border: 'none', background: 'transparent',
                  color: 'var(--text-muted)', cursor: 'pointer', borderRadius: 4,
                  fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.1s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >+</button>
            </div>

            {/* Tasks */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '4px 6px' }}>
              {qTasks.map(t => (
                <div
                  key={t.id}
                  onClick={() => onEdit(t)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 8px', borderRadius: 4,
                    cursor: 'pointer', fontSize: 13,
                    transition: 'background 0.08s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <span
                    onClick={e => { e.stopPropagation(); toggleTask(t.id); }}
                    style={{ color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer', fontFamily: 'system-ui' }}
                  >○</span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
                    {t.title}
                  </span>
                </div>
              ))}
              {qTasks.length === 0 && (
                <div style={{ padding: '16px 8px', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
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
