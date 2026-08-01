import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, Priority, Quadrant } from '../../types';
import { isOverdue, isToday, formatDate, getPriorityOrder } from '../../utils/helpers';
import { Avatar } from '../ui/Avatar';
import {
  IconPlus, IconSearch, IconCheck, IconTrash,
  IconChevronDown, IconChevronRight, 
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
    if (!quickInput.trim()) return;
    addTask({
      title: quickInput.trim(), desc: '',
      priority: quickPriority, status: 'todo', tag: 'work',
      quadrant: quickPriority === 'high' ? 'q1' : 'q2' as Quadrant,
      due: todayStr, assignedTo: 1, completed: false,
    });
    showToast(`Task added`, 'success');
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

  const TABS: { key: TodoFilter; label: string; count?: number }[] = [
    { key: 'all', label: 'Inbox', count: openCount },
    { key: 'today', label: 'Today', count: tasks.filter(t => !t.completed && isToday(t.due)).length },
    { key: 'upcoming', label: 'Upcoming', count: tasks.filter(t => !t.completed && !isOverdue(t.due) && !isToday(t.due)).length },
    { key: 'completed', label: 'Completed', count: completedCount },
  ];

  return (
    <div className="view-root">
      {/* Header Bar */}
      <div className="todo-header">
        <div className="todo-tabs">
          {TABS.map(tab => (
            <div
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                padding: '0 16px', height: '100%', display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 14, cursor: 'pointer',
                borderBottom: `2px solid ${filter === tab.key ? 'var(--accent)' : 'transparent'}`,
                color: filter === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: filter === tab.key ? 500 : 400,
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span style={{
                  fontSize: 11, color: filter === tab.key ? 'var(--accent)' : 'var(--text-muted)',
                }}>{tab.count}</span>
              )}
            </div>
          ))}
        </div>

        <div className="todo-actions">
          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--bg-secondary)', border: '1px solid transparent',
            borderRadius: 6, padding: '4px 10px', width: 180,
            transition: 'border-color 0.2s',
          }}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--border-focus)'}
          onBlur={e => e.currentTarget.style.borderColor = 'transparent'}
          >
            <IconSearch size={14} color="var(--text-muted)" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks..."
              style={{
                background: 'none', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: 13, width: '100%',
              }}
            />
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortBy)}
            style={{
              padding: '5px 10px', background: 'var(--bg-secondary)',
              border: '1px solid transparent', borderRadius: 6,
              color: 'var(--text-primary)', fontSize: 13, outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="date">Date</option>
            <option value="priority">Priority</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {/* Content Area */}
      <div className="view-scroll">
        <div className="content-container">
          
          <div className="page-title">
            {TABS.find(t => t.key === filter)?.label}
          </div>

          {/* Quick Add Inline */}
          <div className="todoist-row quick-add">
            <div style={{ width: 16, display: 'flex', justifyContent: 'center' }}>
              <IconPlus size={16} color="var(--accent)" />
            </div>
            <input
              type="text"
              value={quickInput}
              onChange={e => setQuickInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && quickAdd()}
              placeholder="Add task... (Press Enter)"
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: 14, fontFamily: 'inherit',
              }}
            />
            {quickInput.trim() && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => {
                    const p: Priority[] = ['low', 'medium', 'high', 'urgent'];
                    setQuickPriority(p[(p.indexOf(quickPriority) + 1) % 4]);
                  }}
                  style={{
                    padding: '2px 8px', borderRadius: 4,
                    border: '1px solid var(--border)', background: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer',
                    textTransform: 'uppercase', fontWeight: 500,
                  }}
                >{quickPriority}</button>
                <button
                  onClick={quickAdd}
                  style={{
                    padding: '4px 12px', borderRadius: 6,
                    background: 'var(--accent)', color: '#fff',
                    border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  }}
                >Add Task</button>
              </div>
            )}
          </div>

          {/* Task Lists */}
          {overdueItems.length > 0 && (
            <IssueGroup title="Overdue" collapsed={!!collapsed['overdue']} onToggle={() => toggleSection('overdue')} isAlert>
              {overdueItems.map(t => <IssueRow key={t.id} task={t} users={users} onEdit={onEdit} onToggle={toggleTask} onDelete={deleteTask} />)}
            </IssueGroup>
          )}

          {todayItems.length > 0 && (
            <IssueGroup title="Today" collapsed={!!collapsed['today']} onToggle={() => toggleSection('today')}>
              {todayItems.map(t => <IssueRow key={t.id} task={t} users={users} onEdit={onEdit} onToggle={toggleTask} onDelete={deleteTask} />)}
            </IssueGroup>
          )}

          {upcomingItems.length > 0 && (
            <IssueGroup title="Upcoming" collapsed={!!collapsed['upcoming']} onToggle={() => toggleSection('upcoming')}>
              {upcomingItems.map(t => <IssueRow key={t.id} task={t} users={users} onEdit={onEdit} onToggle={toggleTask} onDelete={deleteTask} />)}
            </IssueGroup>
          )}

          {completedItems.length > 0 && (
            <IssueGroup title="Completed" collapsed={!!collapsed['completed']} onToggle={() => toggleSection('completed')}>
              {completedItems.map(t => <IssueRow key={t.id} task={t} users={users} onEdit={onEdit} onToggle={toggleTask} onDelete={deleteTask} />)}
            </IssueGroup>
          )}

          {filtered.length === 0 && (
            <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
              What do you need to get done today?
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IssueGroup({ title, collapsed, onToggle, isAlert, children }: {
  title: string; collapsed: boolean; onToggle: () => void; isAlert?: boolean; children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        onClick={onToggle}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 0', borderBottom: '1px solid var(--border)',
          cursor: 'pointer', userSelect: 'none', marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: isAlert ? 'var(--red)' : 'var(--text-primary)' }}>{title}</span>
        {collapsed ? <IconChevronRight size={14} color="var(--text-muted)" /> : <IconChevronDown size={14} color="var(--text-muted)" />}
      </div>
      {!collapsed && <div>{children}</div>}
    </div>
  );
}

function IssueRow({ task, users, onEdit, onToggle, onDelete }: {
  task: Task; users: any[]; onEdit: (t: Task) => void; onToggle: (id: number) => void; onDelete: (id: number) => void;
}) {
  const user = users.find(u => u.id === task.assignedTo);
  
  return (
    <div
      onClick={() => onEdit(task)}
      className="todoist-row"
      onMouseEnter={e => {
        const btn = e.currentTarget.querySelector('.row-delete-btn') as HTMLElement;
        if (btn) btn.style.opacity = '1';
      }}
      onMouseLeave={e => {
        const btn = e.currentTarget.querySelector('.row-delete-btn') as HTMLElement;
        if (btn) btn.style.opacity = '0';
      }}
    >
      {/* Checkbox */}
      <div 
        className={`todoist-checkbox ${task.completed ? 'checked' : ''}`}
        onClick={e => { e.stopPropagation(); onToggle(task.id); }}
        style={{
          borderColor: task.completed ? 'var(--accent)' : task.priority === 'urgent' ? 'var(--red)' : task.priority === 'high' ? 'var(--orange)' : task.priority === 'medium' ? 'var(--yellow)' : 'var(--text-muted)'
        }}
      >
        {task.completed && <IconCheck size={10} color="#fff" />}
      </div>
      
      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{
          color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)',
          textDecoration: task.completed ? 'line-through' : 'none',
          fontSize: 14,
        }}>{task.title}</span>
        
        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {task.due && (
            <span style={{
              fontSize: 12, color: isOverdue(task.due) && !task.completed ? 'var(--red)' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', gap: 4
            }}>
              {formatDate(task.due)}
            </span>
          )}
          <span style={{
            fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.02em',
          }}>#{task.tag}</span>
        </div>
      </div>

      {/* Right side actions & assignee */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {user && <Avatar user={user} size={24} fontSize={10} />}
        
        <button
          onClick={e => { e.stopPropagation(); onDelete(task.id); }}
          className="row-delete-btn"
          style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', opacity: 0, padding: 4, transition: 'opacity 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--red)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
        >
          <IconTrash size={14} />
        </button>
      </div>
    </div>
  );
}
