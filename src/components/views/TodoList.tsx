import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, Priority, Quadrant } from '../../types';
import { isOverdue, isToday, formatDate, getPriorityOrder } from '../../utils/helpers';
import { Avatar } from '../ui/Avatar';

type TodoFilter = 'all' | 'today' | 'upcoming' | 'completed';
type SortBy = 'date' | 'priority' | 'name';

const STATUS_ICONS: Record<string, { icon: string; color: string }> = {
  todo: { icon: '○', color: 'var(--text-muted)' },
  inprogress: { icon: '◐', color: 'var(--yellow)' },
  review: { icon: '◕', color: 'var(--blue)' },
  done: { icon: '●', color: 'var(--accent)' },
};

const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  high: { label: 'Urgent', color: 'var(--orange)' },
  medium: { label: 'Medium', color: 'var(--yellow)' },
  low: { label: 'Low', color: 'var(--blue)' },
};

interface TodoListProps {
  onEdit: (task: Task) => void;
  onAdd: () => void;
}

export function TodoList({ onEdit, onAdd }: TodoListProps) {
  const { tasks, addTask, showToast, toggleTask, deleteTask, users } = useApp();
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [quickInput, setQuickInput] = useState('');
  const [quickPriority, setQuickPriority] = useState<Priority>('medium');

  const todayStr = new Date().toISOString().split('T')[0];

  let filtered = [...tasks];
  if (filter === 'today') filtered = filtered.filter(t => t.due === todayStr && !t.completed);
  else if (filter === 'upcoming') filtered = filtered.filter(t => t.due > todayStr && !t.completed);
  else if (filter === 'completed') filtered = filtered.filter(t => t.completed);
  else filtered = filtered.filter(t => !t.completed);

  if (sortBy === 'priority') filtered.sort((a, b) => getPriorityOrder(a.priority) - getPriorityOrder(b.priority));
  else if (sortBy === 'name') filtered.sort((a, b) => a.title.localeCompare(b.title));
  else filtered.sort((a, b) => (a.due || '9999') < (b.due || '9999') ? -1 : 1);

  const openCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;

  const TABS: { key: TodoFilter; label: string }[] = [
    { key: 'all', label: 'All Issues' },
    { key: 'today', label: 'Today' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Done' },
  ];

  function quickAdd() {
    if (!quickInput.trim()) { showToast('Enter a title', 'error'); return; }
    addTask({
      title: quickInput.trim(), desc: '',
      priority: quickPriority, status: 'todo', tag: 'work',
      quadrant: quickPriority === 'high' ? 'q1' : 'q2' as Quadrant,
      due: todayStr, assignedTo: 1, completed: false,
    });
    showToast(`Created "${quickInput.trim()}"`, 'success');
    setQuickInput('');
  }

  function cyclePriority() {
    const opts: Priority[] = ['low', 'medium', 'high'];
    setQuickPriority(opts[(opts.indexOf(quickPriority) + 1) % 3]);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tab Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '0 20px',
        borderBottom: '1px solid var(--border)', gap: 0, flexShrink: 0,
        height: 40,
      }}>
        {TABS.map(tab => (
          <div
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '0 14px', height: '100%', display: 'flex', alignItems: 'center',
              fontSize: 13, cursor: 'pointer',
              borderBottom: `2px solid ${filter === tab.key ? 'var(--accent)' : 'transparent'}`,
              color: filter === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: filter === tab.key ? 500 : 400,
              transition: 'color 0.1s',
            }}
            onMouseEnter={e => { if (filter !== tab.key) (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
            onMouseLeave={e => { if (filter !== tab.key) (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
          >{tab.label}</div>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{openCount} open · {completedCount} done</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortBy)}
            style={{
              padding: '4px 8px', background: 'var(--bg-primary)',
              border: '1px solid var(--border)', borderRadius: 6,
              color: 'var(--text-secondary)', fontSize: 12, outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="date">Date</option>
            <option value="priority">Priority</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {/* Quick Add */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 20px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div
          onClick={cyclePriority}
          title={`Priority: ${quickPriority}`}
          style={{
            width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
            cursor: 'pointer', background: PRIORITY_LABELS[quickPriority]?.color || 'var(--text-muted)',
          }}
        />
        <input
          type="text" value={quickInput}
          onChange={e => setQuickInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && quickAdd()}
          placeholder="Create new issue..."
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit',
          }}
        />
        <button onClick={onAdd} style={{
          padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)',
          background: 'transparent', color: 'var(--text-muted)',
          fontSize: 12, cursor: 'pointer', transition: 'all 0.1s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
        >+ Detail</button>
      </div>

      {/* Issue List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 && (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No issues found
          </div>
        )}
        {filtered.map(t => {
          const user = users.find(u => u.id === t.assignedTo);
          const overdue = isOverdue(t.due) && !t.completed;
          const statusIcon = STATUS_ICONS[t.status] || STATUS_ICONS.todo;
          const priorityInfo = PRIORITY_LABELS[t.priority];

          return (
            <div
              key={t.id}
              onClick={() => onEdit(t)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 20px',
                borderBottom: '1px solid var(--border)',
                cursor: 'pointer', transition: 'background 0.08s',
                fontSize: 13,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              {/* Priority bar */}
              <div style={{
                width: 3, height: 14, borderRadius: 2, flexShrink: 0,
                background: priorityInfo?.color || 'var(--text-muted)',
              }} />

              {/* Status icon */}
              <span
                onClick={e => { e.stopPropagation(); toggleTask(t.id); }}
                style={{
                  color: statusIcon.color, fontSize: 15, cursor: 'pointer',
                  flexShrink: 0, width: 18, textAlign: 'center',
                  fontFamily: 'system-ui',
                }}
              >{t.completed ? '●' : statusIcon.icon}</span>

              {/* Title */}
              <span style={{
                flex: 1, color: t.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                textDecoration: t.completed ? 'line-through' : 'none',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                fontWeight: 400,
              }}>{t.title}</span>

              {/* Tag */}
              <span className={`tag-${t.tag}`} style={{
                fontSize: 11, padding: '1px 6px', borderRadius: 4, fontWeight: 500,
              }}>{t.tag}</span>

              {/* Due */}
              {t.due && (
                <span style={{
                  fontSize: 12, color: overdue ? 'var(--red)' : 'var(--text-muted)',
                  flexShrink: 0, fontWeight: overdue ? 500 : 400,
                }}>{formatDate(t.due)}</span>
              )}

              {/* Assignee */}
              {user && <Avatar user={user} size={20} fontSize={9} />}

              {/* Delete */}
              <button
                onClick={e => { e.stopPropagation(); if (confirm(`Delete "${t.title}"?`)) deleteTask(t.id); }}
                style={{
                  width: 24, height: 24, border: 'none', background: 'transparent',
                  cursor: 'pointer', fontSize: 12, color: 'var(--text-muted)', borderRadius: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.1s', opacity: 0.4,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.color = 'var(--red)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.4'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
              >×</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
