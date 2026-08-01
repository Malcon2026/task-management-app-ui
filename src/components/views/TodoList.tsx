import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, Priority, Quadrant } from '../../types';
import { isOverdue, isToday, formatDate, getPriorityOrder } from '../../utils/helpers';
import { Avatar } from '../ui/Avatar';

type TodoFilter = 'all' | 'today' | 'upcoming' | 'completed';
type SortBy = 'date' | 'priority' | 'name';

interface TodoListProps {
  onEdit: (task: Task) => void;
  onAdd: () => void;
}

export function TodoList({ onEdit, onAdd }: TodoListProps) {
  const { tasks, addTask, showToast } = useApp();
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [quickInput, setQuickInput] = useState('');
  const [quickPriority, setQuickPriority] = useState<Priority>('medium');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const todayStr = new Date().toISOString().split('T')[0];

  let filtered = [...tasks];
  if (filter === 'today') filtered = filtered.filter(t => t.due === todayStr && !t.completed);
  else if (filter === 'upcoming') filtered = filtered.filter(t => t.due > todayStr && !t.completed);
  else if (filter === 'completed') filtered = filtered.filter(t => t.completed);
  else filtered = filtered.filter(t => !t.completed);

  if (sortBy === 'priority') filtered.sort((a, b) => getPriorityOrder(a.priority) - getPriorityOrder(b.priority));
  else if (sortBy === 'name') filtered.sort((a, b) => a.title.localeCompare(b.title));
  else filtered.sort((a, b) => (a.due || '9999') < (b.due || '9999') ? -1 : 1);

  const pending = filtered.filter(t => !t.completed);
  const done = filtered.filter(t => t.completed);

  function quickAdd() {
    if (!quickInput.trim()) { showToast('Please enter a task title', 'error'); return; }
    addTask({
      title: quickInput.trim(), desc: '',
      priority: quickPriority, status: 'todo', tag: 'work',
      quadrant: quickPriority === 'high' ? 'q1' : 'q2' as Quadrant,
      due: todayStr, assignedTo: 1, completed: false,
    });
    showToast(`✅ Task "${quickInput.trim()}" added`, 'success');
    setQuickInput('');
  }

  function cyclePriority() {
    const opts: Priority[] = ['low', 'medium', 'high'];
    setQuickPriority(opts[(opts.indexOf(quickPriority) + 1) % 3]);
  }

  function toggleSection(key: string) {
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));
  }

  const overdueItems = filter === 'all' ? pending.filter(t => isOverdue(t.due)) : [];
  const todayItems = filter === 'all' ? pending.filter(t => isToday(t.due)) : filter === 'today' ? pending : [];
  const upcomingItems = filter === 'all' || filter === 'upcoming' ? pending.filter(t => !isOverdue(t.due) && !isToday(t.due)) : [];
  const noDateItems = filter === 'all' ? pending.filter(t => !t.due) : [];
  const completedItems = filter === 'completed' ? done : filter === 'all' ? tasks.filter(t => t.completed) : [];

  const openCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;
  const overdueCount = tasks.filter(t => !t.completed && isOverdue(t.due)).length;

  const TABS: { key: TodoFilter; label: string }[] = [
    { key: 'all', label: '📋 All Tasks' },
    { key: 'today', label: '📅 Today' },
    { key: 'upcoming', label: '🗓 Upcoming' },
    { key: 'completed', label: '✅ Completed' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tabs */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '0 28px',
        borderBottom: '1px solid var(--border)', gap: 2, flexShrink: 0,
      }}>
        {TABS.map(tab => (
          <div
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '11px 16px', fontSize: 13, cursor: 'pointer',
              borderBottom: `2px solid ${filter === tab.key ? 'var(--accent-hover)' : 'transparent'}`,
              color: filter === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: filter === tab.key ? 600 : 400,
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (filter !== tab.key) (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
            onMouseLeave={e => { if (filter !== tab.key) (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
          >{tab.label}</div>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, padding: '0 4px' }}>
          <button onClick={onAdd} style={{
            padding: '6px 16px', borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
            fontSize: 13, cursor: 'pointer', height: 34,
            transition: 'all 0.2s', fontWeight: 500,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-light)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
          >+ Task</button>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortBy)}
            style={{
              padding: '6px 12px', background: 'var(--bg-secondary)',
              border: '1px solid var(--border)', borderRadius: 8,
              color: 'var(--text-primary)', fontSize: 12, outline: 'none', height: 34,
              cursor: 'pointer',
            }}
          >
            <option value="date">Sort: Date</option>
            <option value="priority">Sort: Priority</option>
            <option value="name">Sort: Name</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 28px', width: '100%' }}>
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <div style={{
              fontSize: 30, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 8,
              color: 'var(--text-primary)',
            }}>☑ Todo List</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 16, fontWeight: 500 }}>
              <span>{openCount} open</span><span style={{ color: 'var(--border-light)' }}>•</span>
              <span>{completedCount} completed</span><span style={{ color: 'var(--border-light)' }}>•</span>
              <span style={{ color: overdueCount > 0 ? 'var(--red)' : 'var(--text-muted)' }}>{overdueCount} overdue</span>
            </div>
          </div>

          {/* Quick Add */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px',
            border: '1px solid var(--border)',
            borderRadius: 12,
            background: 'var(--bg-secondary)',
            marginBottom: 28,
            transition: 'border-color 0.2s',
          }}>
            <div
              onClick={cyclePriority}
              title={`Priority: ${quickPriority}`}
              style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              className={`priority-${quickPriority}`}
            />
            <input
              type="text"
              value={quickInput}
              onChange={e => setQuickInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && quickAdd()}
              placeholder="Add a task... (Press Enter)"
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: 14, fontFamily: 'inherit',
              }}
            />
            <button onClick={quickAdd} style={{
              padding: '6px 18px', borderRadius: 8, border: 'none',
              background: 'var(--accent)',
              color: '#ffffff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 10px var(--border-light)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(108, 92, 231, 0.5)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 10px var(--border-light)'; }}
            >Add</button>
          </div>

          {/* Sections */}
          {filter !== 'completed' && (
            <>
              {overdueItems.length > 0 && <TodoSection title="🔴 Overdue" items={overdueItems} sectionKey="overdue" collapsed={collapsed} onToggle={toggleSection} onEdit={onEdit} />}
              {todayItems.length > 0 && <TodoSection title="📅 Today" items={todayItems} sectionKey="today" collapsed={collapsed} onToggle={toggleSection} onEdit={onEdit} />}
              {upcomingItems.length > 0 && <TodoSection title="🗓 Upcoming" items={upcomingItems} sectionKey="upcoming" collapsed={collapsed} onToggle={toggleSection} onEdit={onEdit} />}
              {noDateItems.length > 0 && <TodoSection title="📋 No Due Date" items={noDateItems} sectionKey="nodate" collapsed={collapsed} onToggle={toggleSection} onEdit={onEdit} />}
              {filter === 'all' && pending.length === 0 && (
                <EmptyState icon="🎉" title="All caught up!" desc="No pending tasks. Add a new task to get started." />
              )}
              {filter === 'today' && todayItems.length === 0 && (
                <EmptyState icon="📅" title="Nothing due today" desc="Enjoy your free day or add a task for today." />
              )}
              {filter === 'upcoming' && upcomingItems.length === 0 && (
                <EmptyState icon="🗓" title="No upcoming tasks" desc="Your schedule is clear ahead." />
              )}
            </>
          )}

          {(filter === 'completed' || filter === 'all') && completedItems.length > 0 && (
            <TodoSection title="✅ Completed" items={completedItems} sectionKey="completed" collapsed={collapsed} onToggle={toggleSection} onEdit={onEdit} />
          )}
          {filter === 'completed' && completedItems.length === 0 && (
            <EmptyState icon="✅" title="No completed tasks yet" desc="Complete some tasks to see them here." />
          )}
        </div>
      </div>
    </div>
  );
}

function TodoSection({ title, items, sectionKey, collapsed, onToggle, onEdit }: {
  title: string; items: Task[]; sectionKey: string;
  collapsed: Record<string, boolean>; onToggle: (k: string) => void; onEdit: (t: Task) => void;
}) {
  const { toggleTask, deleteTask, users } = useApp();
  const isCollapsed = collapsed[sectionKey];

  return (
    <div style={{ marginBottom: 28 }}>
      <div
        onClick={() => onToggle(sectionKey)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 0', marginBottom: 8, cursor: 'pointer',
        }}
      >
        <span style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.1em', color: 'var(--text-muted)',
        }}>{title}</span>
        <span style={{
          fontSize: 11, color: 'var(--accent)', fontWeight: 600,
          background: 'var(--accent-dim)',
          border: '1px solid var(--accent-dim)',
          padding: '2px 8px', borderRadius: 10,
        }}>{items.length}</span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)', transition: 'transform 0.2s', transform: isCollapsed ? 'rotate(-90deg)' : 'none' }}>▾</span>
      </div>

      {!isCollapsed && items.map(t => {
        const user = users.find(u => u.id === t.assignedTo);
        const overdue = isOverdue(t.due);
        const today = isToday(t.due);

        return (
          <div
            key={t.id}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '10px 14px', borderRadius: 10,
              border: '1px solid transparent',
              cursor: 'pointer', transition: 'all 0.2s',
              marginBottom: 2,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)';
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
            }}
          >
            {/* Priority dot */}
            <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, marginTop: 10 }} className={`priority-${t.priority}`} />

            {/* Checkbox */}
            <div
              onClick={e => { e.stopPropagation(); toggleTask(t.id); }}
              style={{
                width: 20, height: 20,
                border: `2px solid ${t.completed ? 'var(--green)' : 'var(--border)'}`,
                borderRadius: '50%', flexShrink: 0, marginTop: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                background: t.completed ? 'var(--green)' : 'transparent',
                color: 'white', fontSize: 11,
                transition: 'all 0.2s',
                boxShadow: t.completed ? '0 0 8px var(--green-glow)' : 'none',
              }}
            >{t.completed ? '✓' : ''}</div>

            {/* Content */}
            <div onClick={() => onEdit(t)} style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 14, color: t.completed ? 'var(--text-muted)' : 'var(--text-primary)',
                textDecoration: t.completed ? 'line-through' : 'none',
                marginBottom: 5, lineHeight: 1.5, fontWeight: 500,
              }}>{t.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span className={`todo-tag tag-${t.tag}`} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 5, fontWeight: 600, letterSpacing: '0.03em' }}>{t.tag}</span>
                {t.due && (
                  <span style={{
                    fontSize: 11, fontWeight: 500,
                    color: overdue && !t.completed ? 'var(--red)' : today ? 'var(--yellow)' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', gap: 3,
                  }}>
                    📅 {formatDate(t.due)}
                  </span>
                )}
                {user && <Avatar user={user} size={20} fontSize={9} />}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
              <button onClick={e => { e.stopPropagation(); onEdit(t); }} style={{
                width: 30, height: 30, border: 'none', background: 'transparent',
                cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)', borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent-dim)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
              >✏️</button>
              <button onClick={e => { e.stopPropagation(); if (confirm(`Delete "${t.title}"?`)) { deleteTask(t.id); } }} style={{
                width: 30, height: 30, border: 'none', background: 'transparent',
                cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)', borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255, 107, 107, 0.1)'; (e.currentTarget as HTMLElement).style.color = 'var(--red)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
              >🗑</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EmptyState({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '56px 24px', color: 'var(--text-muted)', textAlign: 'center', gap: 12,
    }}>
      <div style={{ fontSize: 52, opacity: 0.3 }}>{icon}</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '-0.01em' }}>{title}</div>
      <div style={{ fontSize: 13, maxWidth: 280, lineHeight: 1.6, fontWeight: 400 }}>{desc}</div>
    </div>
  );
}
