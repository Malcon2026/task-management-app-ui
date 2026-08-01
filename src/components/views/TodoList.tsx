import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, Priority, Quadrant } from '../../types';
import { isOverdue, isToday, formatDate, getPriorityOrder } from '../../utils/helpers';
import { Avatar } from '../ui/Avatar';
import {
  IconPlus, IconSearch, IconFilter, IconCheck, IconTrash, IconEdit,
  IconChevronDown, IconChevronRight, IconClock, IconCalendar,
  StatusDone, StatusInProgress, StatusReview, StatusTodo,
  PriorityUrgent, PriorityHigh, PriorityMedium, PriorityLow,
} from '../ui/Icons';

type TodoFilter = 'all' | 'today' | 'upcoming' | 'completed';
type SortBy = 'date' | 'priority' | 'name';

interface TodoListProps {
  onEdit: (task: Task) => void;
  onAdd: () => void;
}

export function TodoList({ onEdit, onAdd }: TodoListProps) {
  const { tasks, users, addTask, toggleTask, deleteTask, showToast } = useApp();
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [search, setSearch] = useState('');
  const [quickInput, setQuickInput] = useState('');
  const [quickPriority, setQuickPriority] = useState<Priority>('medium');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const todayStr = new Date().toISOString().split('T')[0];

  let filtered = [...tasks];
  if (filter === 'today') filtered = filtered.filter(t => t.due === todayStr && !t.completed);
  else if (filter === 'upcoming') filtered = filtered.filter(t => t.due > todayStr && !t.completed);
  else if (filter === 'completed') filtered = filtered.filter(t => t.completed);
  else filtered = filtered.filter(t => !t.completed);

  if (search.trim()) {
    filtered = filtered.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.tag.toLowerCase().includes(search.toLowerCase()));
  }

  if (sortBy === 'priority') filtered.sort((a, b) => getPriorityOrder(a.priority) - getPriorityOrder(b.priority));
  else if (sortBy === 'name') filtered.sort((a, b) => a.title.localeCompare(b.title));
  else filtered.sort((a, b) => ((a.due || '9999') < (b.due || '9999') ? -1 : 1));

  const pending = filtered.filter(t => !t.completed);
  const done = filtered.filter(t => t.completed);

  function quickAdd() {
    if (!quickInput.trim()) { showToast('Please enter an issue title', 'error'); return; }
    addTask({
      title: quickInput.trim(), desc: '',
      priority: quickPriority, status: 'todo', tag: 'work',
      quadrant: quickPriority === 'high' ? 'q1' : 'q2' as Quadrant,
      due: todayStr, assignedTo: 1, completed: false,
    });
    showToast(`Issue "${quickInput.trim()}" created`, 'success');
    setQuickInput('');
  }

  function toggleSection(key: string) {
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));
  }

  const overdueItems = filter === 'all' ? pending.filter(t => isOverdue(t.due)) : [];
  const todayItems = filter === 'all' ? pending.filter(t => isToday(t.due)) : filter === 'today' ? pending : [];
  const upcomingItems = filter === 'all' || filter === 'upcoming' ? pending.filter(t => !isOverdue(t.due) && !isToday(t.due)) : [];
  const completedItems = filter === 'completed' ? done : filter === 'all' ? tasks.filter(t => t.completed) : [];

  const openCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;
  const overdueCount = tasks.filter(t => !t.completed && isOverdue(t.due)).length;

  const TABS: { key: TodoFilter; label: string; count?: number }[] = [
    { key: 'all', label: 'All Issues', count: openCount },
    { key: 'today', label: 'Today', count: tasks.filter(t => !t.completed && isToday(t.due)).length },
    { key: 'upcoming', label: 'Upcoming', count: tasks.filter(t => !t.completed && !isOverdue(t.due) && !isToday(t.due)).length },
    { key: 'completed', label: 'Done', count: completedCount },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '0 20px',
        borderBottom: '1px solid var(--border)', gap: 0,
        height: 44, flexShrink: 0, flexWrap: 'wrap',
      }}>
        {TABS.map(tab => (
          <div
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '0 12px', height: '100%', display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 13, cursor: 'pointer',
              borderBottom: `2px solid ${filter === tab.key ? 'var(--accent)' : 'transparent'}`,
              color: filter === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: filter === tab.key ? 500 : 400,
              transition: 'all 0.1s',
            }}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span style={{
                fontSize: 11, color: filter === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
                background: 'var(--bg-tertiary)', padding: '0 5px', borderRadius: 8,
              }}>{tab.count}</span>
            )}
          </div>
        ))}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--bg-primary)', border: '1px solid var(--border)',
            borderRadius: 6, padding: '3px 8px', width: 150,
          }}>
            <IconSearch size={12} color="var(--text-muted)" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter issues..."
              style={{
                background: 'none', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: 12, width: '100%',
              }}
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortBy)}
            style={{
              padding: '4px 8px', background: 'var(--bg-primary)',
              border: '1px solid var(--border)', borderRadius: 6,
              color: 'var(--text-secondary)', fontSize: 12, outline: 'none',
            }}
          >
            <option value="date">Sort by Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="name">Sort by Title</option>
          </select>

          {/* Create Button */}
          <button
            onClick={onAdd}
            style={{
              padding: '4px 10px', borderRadius: 6,
              background: 'var(--accent)', color: '#fff', border: 'none',
              fontSize: 12, fontWeight: 500, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <IconPlus size={13} />
            <span>New Issue</span>
          </button>
        </div>
      </div>

      {/* Quick Input Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 20px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
      }}>
        <StatusTodo size={14} />
        <input
          type="text"
          value={quickInput}
          onChange={e => setQuickInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && quickAdd()}
          placeholder="Create new issue... (Press Enter)"
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit',
          }}
        />
        <button
          onClick={() => {
            const p: Priority[] = ['low', 'medium', 'high'];
            setQuickPriority(p[(p.indexOf(quickPriority) + 1) % 3]);
          }}
          style={{
            padding: '2px 8px', borderRadius: 4,
            border: '1px solid var(--border)', background: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer',
            textTransform: 'uppercase', fontWeight: 500,
          }}
        >{quickPriority}</button>
        <button
          onClick={quickAdd}
          style={{
            padding: '3px 10px', borderRadius: 5,
            background: quickInput.trim() ? 'var(--accent)' : 'var(--bg-tertiary)',
            color: quickInput.trim() ? '#fff' : 'var(--text-muted)',
            border: 'none', fontSize: 12, fontWeight: 500, cursor: 'pointer',
          }}
        >Add</button>
      </div>

      {/* Table Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {overdueItems.length > 0 && (
          <IssueGroup
            title="Overdue"
            count={overdueItems.length}
            isAlert
            collapsed={!!collapsed['overdue']}
            onToggle={() => toggleSection('overdue')}
          >
            {overdueItems.map(t => (
              <IssueRow key={t.id} task={t} users={users} onEdit={onEdit} onToggle={toggleTask} onDelete={deleteTask} />
            ))}
          </IssueGroup>
        )}

        {todayItems.length > 0 && (
          <IssueGroup
            title="Today"
            count={todayItems.length}
            collapsed={!!collapsed['today']}
            onToggle={() => toggleSection('today')}
          >
            {todayItems.map(t => (
              <IssueRow key={t.id} task={t} users={users} onEdit={onEdit} onToggle={toggleTask} onDelete={deleteTask} />
            ))}
          </IssueGroup>
        )}

        {upcomingItems.length > 0 && (
          <IssueGroup
            title="Upcoming"
            count={upcomingItems.length}
            collapsed={!!collapsed['upcoming']}
            onToggle={() => toggleSection('upcoming')}
          >
            {upcomingItems.map(t => (
              <IssueRow key={t.id} task={t} users={users} onEdit={onEdit} onToggle={toggleTask} onDelete={deleteTask} />
            ))}
          </IssueGroup>
        )}

        {completedItems.length > 0 && (
          <IssueGroup
            title="Completed"
            count={completedItems.length}
            collapsed={!!collapsed['completed']}
            onToggle={() => toggleSection('completed')}
          >
            {completedItems.map(t => (
              <IssueRow key={t.id} task={t} users={users} onEdit={onEdit} onToggle={toggleTask} onDelete={deleteTask} />
            ))}
          </IssueGroup>
        )}

        {filtered.length === 0 && (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No issues match the selected view
          </div>
        )}
      </div>
    </div>
  );
}

function IssueGroup({ title, count, isAlert, collapsed, onToggle, children }: {
  title: string; count: number; isAlert?: boolean; collapsed: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div>
      <div
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 20px', background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)', cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        {collapsed ? <IconChevronRight size={12} color="var(--text-muted)" /> : <IconChevronDown size={12} color="var(--text-muted)" />}
        <span style={{ fontSize: 12, fontWeight: 600, color: isAlert ? 'var(--red)' : 'var(--text-primary)' }}>{title}</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({count})</span>
      </div>
      {!collapsed && <div>{children}</div>}
    </div>
  );
}

function IssueRow({ task, users, onEdit, onToggle, onDelete }: {
  task: Task; users: any[]; onEdit: (t: Task) => void; onToggle: (id: number) => void; onDelete: (id: number) => void;
}) {
  const user = users.find(u => u.id === task.assignedTo);
  const StatusIcon = task.completed ? StatusDone : task.status === 'inprogress' ? StatusInProgress : task.status === 'review' ? StatusReview : StatusTodo;
  const PriorityIcon = task.priority === 'urgent' ? PriorityUrgent : task.priority === 'high' ? PriorityHigh : task.priority === 'medium' ? PriorityMedium : PriorityLow;

  return (
    <div
      onClick={() => onEdit(task)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '8px 20px', borderBottom: '1px solid var(--border)',
        cursor: 'pointer', fontSize: 13, transition: 'background 0.08s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      {/* Priority Bar */}
      <div title={`Priority: ${task.priority}`}>
        <PriorityIcon size={14} />
      </div>

      {/* Status Toggle */}
      <button
        onClick={e => { e.stopPropagation(); onToggle(task.id); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
      >
        <StatusIcon size={14} />
      </button>

      {/* Tag */}
      <span className={`todo-tag tag-${task.tag}`} style={{
        fontSize: 10, padding: '1px 6px', borderRadius: 4, fontWeight: 500,
        textTransform: 'uppercase', letterSpacing: '0.02em', flexShrink: 0,
      }}>{task.tag}</span>

      {/* Title */}
      <span style={{
        flex: 1, color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
        textDecoration: task.completed ? 'line-through' : 'none',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{task.title}</span>

      {/* Assignee */}
      {user && <Avatar user={user} size={20} fontSize={9} />}

      {/* Due Date */}
      {task.due && (
        <span style={{
          fontSize: 11, color: isOverdue(task.due) && !task.completed ? 'var(--red)' : 'var(--text-muted)',
          flexShrink: 0,
        }}>{formatDate(task.due)}</span>
      )}

      {/* Delete button */}
      <button
        onClick={e => { e.stopPropagation(); onDelete(task.id); }}
        style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          cursor: 'pointer', opacity: 0.6, padding: 2,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--red)'; (e.currentTarget as HTMLElement).style.opacity = '1'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.6'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
      >
        <IconTrash size={13} />
      </button>
    </div>
  );
}
