import { useApp } from '../../context/AppContext';
import type { Task, Quadrant } from '../../types';
import { formatDate, isOverdue } from '../../utils/helpers';
import { Avatar } from '../ui/Avatar';

interface MatrixProps {
  onEdit: (task: Task) => void;
  onAddInQuadrant: (q: Quadrant) => void;
}

const QUADRANTS = [
  { id: 'q1' as Quadrant, label: 'Q1 — Do First', name: 'Urgent + Important', cls: 'quadrant-q1', lblCls: 'q1-label', badgeCls: 'q1-badge', icon: '🔴', axisRow: 1, axisCol: 1, color: 'var(--red)' },
  { id: 'q2' as Quadrant, label: 'Q2 — Schedule', name: 'Not Urgent + Important', cls: 'quadrant-q2', lblCls: 'q2-label', badgeCls: 'q2-badge', icon: '🔵', axisRow: 1, axisCol: 2, color: 'var(--blue)' },
  { id: 'q3' as Quadrant, label: 'Q3 — Delegate', name: 'Urgent + Not Important', cls: 'quadrant-q3', lblCls: 'q3-label', badgeCls: 'q3-badge', icon: '🟡', axisRow: 2, axisCol: 1, color: 'var(--yellow)' },
  { id: 'q4' as Quadrant, label: 'Q4 — Eliminate', name: 'Not Urgent + Not Important', cls: 'quadrant-q4', lblCls: 'q4-label', badgeCls: 'q4-badge', icon: '⬜', axisRow: 2, axisCol: 2, color: 'var(--text-muted)' },
];

export function Matrix({ onEdit, onAddInQuadrant }: MatrixProps) {
  const { tasks, users } = useApp();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 28px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{
          padding: '11px 16px', fontSize: 13, fontWeight: 600,
          color: 'var(--text-primary)',
          borderBottom: '2px solid var(--accent-hover)',
        }}>⊡ Eisenhower Matrix</div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
          <button onClick={() => onAddInQuadrant('q2')} style={{
            padding: '6px 18px', height: 34, borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer',
            transition: 'all 0.2s', fontWeight: 500,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-light)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
          >+ Task</button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '24px 28px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 18, flexShrink: 0 }}>
          <div style={{
            fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px',
            color: 'var(--text-primary)',
          }}>⊡ Eisenhower Matrix</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6, fontWeight: 400 }}>Prioritize tasks by urgency and importance</div>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr 1fr',
          gridTemplateRows: 'auto 1fr 1fr',
          gap: 14, flex: 1, minHeight: 0,
        }}>
          {/* Top-left empty */}
          <div />
          {/* Top axis labels */}
          <AxisLabel label="🚨 Urgent" />
          <AxisLabel label="🗓 Not Urgent" />
          {/* Side label 1 */}
          <AxisLabel label="⭐ Important" side />
          {/* Q1 & Q2 */}
          {QUADRANTS.filter(q => q.axisRow === 1).map(q => {
            const qTasks = tasks.filter(t => t.quadrant === q.id && !t.completed);
            return (
              <QuadrantCell key={q.id} q={q} tasks={qTasks} users={users} onEdit={onEdit} onAdd={() => onAddInQuadrant(q.id)} />
            );
          })}
          {/* Side label 2 */}
          <AxisLabel label="📉 Not Important" side />
          {/* Q3 & Q4 */}
          {QUADRANTS.filter(q => q.axisRow === 2).map(q => {
            const qTasks = tasks.filter(t => t.quadrant === q.id && !t.completed);
            return (
              <QuadrantCell key={q.id} q={q} tasks={qTasks} users={users} onEdit={onEdit} onAdd={() => onAddInQuadrant(q.id)} />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AxisLabel({ label, side }: { label: string; side?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
      textTransform: 'uppercase', letterSpacing: '0.1em',
      writingMode: side ? 'vertical-lr' : undefined,
      transform: side ? 'rotate(180deg)' : undefined,
    }}>{label}</div>
  );
}

function QuadrantCell({ q, tasks, users, onEdit, onAdd }: {
  q: typeof QUADRANTS[0];
  tasks: Task[];
  users: ReturnType<typeof useApp>['users'];
  onEdit: (t: Task) => void;
  onAdd: () => void;
}) {
  return (
    <div
      className={q.cls}
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 14, padding: 18,
        display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 180,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexShrink: 0 }}>
        <div>
          <div className={q.lblCls} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            {q.icon} {q.label}
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginTop: 3 }}>{q.name}</div>
        </div>
        <span className={q.badgeCls} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 10, fontWeight: 700 }}>{tasks.length}</span>
      </div>

      {/* Tasks */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tasks.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, padding: '24px 0', opacity: 0.7 }}>No tasks here</div>
        )}
        {tasks.map(t => {
          const user = users.find(u => u.id === t.assignedTo);
          return (
            <div
              key={t.id}
              onClick={() => onEdit(t)}
              style={{
                padding: '10px 12px',
                background: 'var(--bg-tertiary)',
                borderRadius: 8,
                border: '1px solid var(--border)',
                cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'flex-start', gap: 8,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--bg-active)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-dim)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLElement).style.transform = '';
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.4, fontWeight: 500 }}>{t.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                  <span className={`todo-tag tag-${t.tag}`} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 5, fontWeight: 600, letterSpacing: '0.03em' }}>{t.tag}</span>
                  {t.due && (
                    <span style={{ fontSize: 11, color: isOverdue(t.due) ? 'var(--red)' : 'var(--text-muted)', fontWeight: 500 }}>
                      📅 {formatDate(t.due)}
                    </span>
                  )}
                </div>
              </div>
              {user && <Avatar user={user} size={22} fontSize={9} />}
            </div>
          );
        })}
      </div>

      {/* Add button */}
      <button
        onClick={onAdd}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 10px', borderRadius: 8,
          background: 'transparent', border: '1px dashed var(--border)',
          color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12,
          marginTop: 8, flexShrink: 0, transition: 'all 0.2s', width: '100%',
          fontWeight: 500,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-light)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
      >+ Add task</button>
    </div>
  );
}
