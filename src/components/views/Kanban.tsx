import { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import type { Task, Status } from '../../types';
import { formatDate, isOverdue, getUserName } from '../../utils/helpers';
import { Avatar } from '../ui/Avatar';

const COLUMNS: { id: Status; label: string; color: string; gradient: string }[] = [
  { id: 'todo', label: 'To Do', color: '#9895b0', gradient: 'linear-gradient(135deg, #9895b0, #6c5ce7)' },
  { id: 'inprogress', label: 'In Progress', color: '#ffd43b', gradient: 'linear-gradient(135deg, #ffd43b, #ff922b)' },
  { id: 'review', label: 'In Review', color: '#339af0', gradient: 'linear-gradient(135deg, #339af0, #6c5ce7)' },
  { id: 'done', label: 'Done', color: '#51cf66', gradient: 'linear-gradient(135deg, #51cf66, #22d3ee)' },
];

interface KanbanProps {
  onEdit: (task: Task) => void;
  onAddInStatus: (s: Status) => void;
}

export function Kanban({ onEdit, onAddInStatus }: KanbanProps) {
  const { tasks, users, updateTask, showToast } = useApp();
  const [filterUserId, setFilterUserId] = useState<number | 'all'>('all');
  const [dragOverCol, setDragOverCol] = useState<Status | null>(null);
  const dragTaskId = useRef<number | null>(null);

  function handleDragStart(taskId: number) {
    dragTaskId.current = taskId;
  }

  function handleDrop(colId: Status) {
    if (dragTaskId.current === null) return;
    const task = tasks.find(t => t.id === dragTaskId.current);
    if (task && task.status !== colId) {
      updateTask(task.id, { status: colId, completed: colId === 'done' });
      const colLabel = COLUMNS.find(c => c.id === colId)?.label || colId;
      showToast(`📌 Moved to "${colLabel}"`, 'success');
    }
    dragTaskId.current = null;
    setDragOverCol(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 28px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{
          padding: '11px 16px', fontSize: 13, fontWeight: 600,
          color: 'var(--text-primary)',
          borderBottom: '2px solid #a855f7',
        }}>▦ Board View</div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
          <select
            value={filterUserId}
            onChange={e => setFilterUserId(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            style={{
              padding: '6px 12px', background: 'rgba(14, 14, 36, 0.5)',
              border: '1px solid var(--border)', borderRadius: 8,
              color: 'var(--text-primary)', fontSize: 12, outline: 'none', height: 34,
              cursor: 'pointer',
            }}
          >
            <option value="all">All Members</option>
            {users.map(u => <option key={u.id} value={u.id}>{getUserName(u)}</option>)}
          </select>
          <button onClick={() => onAddInStatus('todo')} style={{
            padding: '6px 18px', height: 34, borderRadius: 8, border: 'none',
            background: 'linear-gradient(135deg, #6c5ce7, #a855f7)',
            color: '#ffffff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(108, 92, 231, 0.3)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(108, 92, 231, 0.5)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 10px rgba(108, 92, 231, 0.3)'; }}
          >+ Task</button>
        </div>
      </div>

      {/* Board */}
      <div style={{ flex: 1, overflow: 'hidden', padding: '0 28px 28px' }}>
        <div style={{ display: 'flex', gap: 16, height: '100%', overflowX: 'auto', paddingTop: 24, paddingBottom: 8 }}>
          {COLUMNS.map(col => {
            let colTasks = tasks.filter(t => t.status === col.id);
            if (filterUserId !== 'all') colTasks = colTasks.filter(t => t.assignedTo === filterUserId);

            return (
              <div
                key={col.id}
                className={dragOverCol === col.id ? 'kanban-col-drag-over' : ''}
                onDragOver={e => { e.preventDefault(); setDragOverCol(col.id); }}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={() => handleDrop(col.id)}
                style={{
                  width: 290, minWidth: 290, display: 'flex', flexDirection: 'column',
                  background: 'rgba(14, 14, 36, 0.45)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid var(--border)',
                  borderRadius: 14, maxHeight: '100%', transition: 'all 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Gradient top border */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                  background: col.gradient,
                  borderRadius: '14px 14px 0 0',
                }} />

                {/* Column Header */}
                <div style={{
                  padding: '16px 16px 12px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
                }}>
                  <div style={{
                    width: 9, height: 9, borderRadius: '50%', background: col.color, flexShrink: 0,
                    boxShadow: `0 0 8px ${col.color}40`,
                  }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{col.label}</div>
                  <div style={{
                    marginLeft: 'auto', fontSize: 11, fontWeight: 600,
                    color: '#a78bfa',
                    background: 'rgba(108, 92, 231, 0.1)',
                    border: '1px solid rgba(108, 92, 231, 0.15)',
                    padding: '2px 8px', borderRadius: 8,
                  }}>{colTasks.length}</div>
                  <button onClick={() => onAddInStatus(col.id)} style={{
                    width: 26, height: 26, border: '1px solid var(--border)',
                    background: 'rgba(14, 14, 36, 0.5)', color: 'var(--text-muted)',
                    cursor: 'pointer', borderRadius: 6, fontSize: 16,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(108, 92, 231, 0.3)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
                  >+</button>
                </div>

                {/* Cards */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {colTasks.map(t => <KanbanCard key={t.id} task={t} onEdit={onEdit} onDragStart={() => handleDragStart(t.id)} />)}
                </div>

                {/* Add card btn */}
                <button
                  onClick={() => onAddInStatus(col.id)}
                  style={{
                    margin: '0 12px 12px', padding: 8,
                    background: 'transparent', border: '1px dashed var(--border)',
                    borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer',
                    fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                    flexShrink: 0, transition: 'all 0.2s', fontWeight: 500,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(108, 92, 231, 0.3)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
                >＋ Add card</button>
              </div>
            );
          })}

          {/* Add column placeholder */}
          <div
            onClick={() => showToast('Custom columns coming soon!', 'info')}
            style={{
              width: 44, minWidth: 44, border: '2px dashed var(--border)',
              borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20, flexShrink: 0,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(108, 92, 231, 0.3)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
          >+</div>
        </div>
      </div>
    </div>
  );
}

function KanbanCard({ task, onEdit, onDragStart }: { task: Task; onEdit: (t: Task) => void; onDragStart: () => void }) {
  const { users } = useApp();
  const user = users.find(u => u.id === task.assignedTo);
  const overdue = isOverdue(task.due);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={() => onEdit(task)}
      style={{
        background: 'rgba(18, 18, 42, 0.5)',
        border: '1px solid var(--border)',
        borderRadius: 10, padding: 14, cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = 'rgba(26, 26, 58, 0.6)';
        el.style.borderColor = 'rgba(108, 92, 231, 0.25)';
        el.style.transform = 'translateY(-3px)';
        el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.35), 0 0 0 1px rgba(108, 92, 231, 0.1)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = 'rgba(18, 18, 42, 0.5)';
        el.style.borderColor = 'var(--border)';
        el.style.transform = '';
        el.style.boxShadow = '';
      }}
    >
      {/* Label */}
      <div style={{ marginBottom: 10 }}>
        <span className={`todo-tag tag-${task.tag}`} style={{ fontSize: 10, padding: '3px 9px', borderRadius: 5, fontWeight: 600, letterSpacing: '0.03em' }}>{task.tag}</span>
      </div>

      {/* Title */}
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: 12 }}>{task.title}</div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          className={`priority-pill-${task.priority === 'high' ? 'high' : task.priority === 'medium' ? 'med' : 'low'}`}
          style={{ fontSize: 10, padding: '3px 8px', borderRadius: 5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}
        >{task.priority}</span>
        {task.due && (
          <span style={{ fontSize: 11, color: overdue ? 'var(--red)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 500 }}>
            📅 {formatDate(task.due)}
          </span>
        )}
        {user && (
          <div style={{ marginLeft: 'auto' }}>
            <Avatar user={user} size={24} fontSize={10} />
          </div>
        )}
      </div>
    </div>
  );
}
