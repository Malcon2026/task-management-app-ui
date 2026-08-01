import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, Quadrant } from '../../types';
import { Avatar } from '../ui/Avatar';
import {
  PriorityUrgent, PriorityHigh, PriorityMedium, PriorityLow,
  IconPlus, IconTrash, IconCheck, IconChevronDown, StatusDone, StatusTodo,
} from '../ui/Icons';

const QUADRANTS: { key: Quadrant; title: string; subtitle: string; color: string; bg: string }[] = [
  { key: 'q1', title: 'Q1: Do First', subtitle: 'Urgent & Important (Immediate Action)', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.03)' },
  { key: 'q2', title: 'Q2: Schedule', subtitle: 'Important, Not Urgent (Planning & Focus)', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.03)' },
  { key: 'q3', title: 'Q3: Delegate', subtitle: 'Urgent, Not Important (Interruption / Pass)', color: '#eab308', bg: 'rgba(234, 179, 8, 0.03)' },
  { key: 'q4', title: 'Q4: Eliminate', subtitle: 'Neither Urgent nor Important (Low Priority)', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.03)' },
];

interface MatrixProps {
  onEdit: (task: Task) => void;
  onAdd: () => void;
}

export function Matrix({ onEdit, onAdd }: MatrixProps) {
  const { tasks, users, updateTask, toggleTask, deleteTask, showToast } = useApp();
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  function handleMoveQuadrant(task: Task, newQ: Quadrant) {
    updateTask({ ...task, quadrant: newQ });
    showToast(`Reassigned to ${newQ.toUpperCase()}`, 'info');
    setActiveMenuId(null);
  }

  return (
    <div
      onClick={() => setActiveMenuId(null)}
      style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 16, padding: 20, height: '100%', overflowY: 'auto',
      }}
    >
      {QUADRANTS.map(q => {
        const qTasks = tasks.filter(t => !t.completed && t.quadrant === q.key);

        return (
          <div
            key={q.key}
            style={{
              background: q.bg,
              border: '1px solid var(--border)',
              borderRadius: 10, padding: 16,
              display: 'flex', flexDirection: 'column', gap: 12,
            }}
          >
            {/* Quadrant Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: '1px solid var(--border)', paddingBottom: 10,
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: q.color }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{q.title}</span>
                  <span style={{
                    fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-primary)',
                    padding: '2px 8px', borderRadius: 10, fontWeight: 600, border: '1px solid var(--border)',
                  }}>{qTasks.length}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{q.subtitle}</div>
              </div>
              <button
                onClick={onAdd}
                style={{
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  cursor: 'pointer', padding: 4, borderRadius: 4,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
              >
                <IconPlus size={14} />
              </button>
            </div>

            {/* Tasks List */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {qTasks.map(t => {
                const user = users.find(u => u.id === t.assignedTo);
                const isMenuOpen = activeMenuId === t.id;

                return (
                  <div
                    key={t.id}
                    onClick={() => onEdit(t)}
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: 8, padding: '10px 12px',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                      transition: 'all 0.15s ease',
                      position: 'relative',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-light)';
                      (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                      (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)';
                    }}
                  >
                    {/* Toggle Done */}
                    <button
                      onClick={e => { e.stopPropagation(); toggleTask(t.id); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                    >
                      <StatusTodo size={14} />
                    </button>

                    {/* Tag */}
                    <span className={`todo-tag tag-${t.tag}`} style={{
                      fontSize: 9, padding: '1px 5px', borderRadius: 4,
                      fontWeight: 600, textTransform: 'uppercase', flexShrink: 0,
                    }}>{t.tag}</span>

                    {/* Title */}
                    <span style={{
                      fontSize: 13, color: 'var(--text-primary)', flex: 1,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      fontWeight: 500,
                    }}>{t.title}</span>

                    {/* Assignee Avatar */}
                    {user && <Avatar user={user} size={20} fontSize={8} />}

                    {/* Move Quadrant Dropdown Trigger */}
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={e => { e.stopPropagation(); setActiveMenuId(isMenuOpen ? null : t.id); }}
                        style={{
                          background: 'var(--bg-primary)', border: '1px solid var(--border)',
                          borderRadius: 4, color: 'var(--text-muted)', cursor: 'pointer',
                          padding: '2px 4px', fontSize: 10, display: 'flex', alignItems: 'center', gap: 2,
                        }}
                      >
                        <span>Q</span>
                        <IconChevronDown size={10} />
                      </button>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <div
                          onClick={e => e.stopPropagation()}
                          style={{
                            position: 'absolute', right: 0, top: 22, zIndex: 100,
                            background: 'var(--bg-secondary)', border: '1px solid var(--border-light)',
                            borderRadius: 6, padding: 4, width: 140,
                            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                          }}
                        >
                          {QUADRANTS.filter(qItem => qItem.key !== t.quadrant).map(qItem => (
                            <div
                              key={qItem.key}
                              onClick={() => handleMoveQuadrant(t, qItem.key)}
                              style={{
                                padding: '6px 8px', borderRadius: 4, fontSize: 11,
                                color: 'var(--text-primary)', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 6,
                              }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                            >
                              <div style={{ width: 6, height: 6, borderRadius: '50%', background: qItem.color }} />
                              <span>{qItem.title.split(':')[0]}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {qTasks.length === 0 && (
                <div style={{
                  padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)',
                  fontSize: 12, border: '1px dashed var(--border)', borderRadius: 8,
                }}>
                  No tasks in quadrant
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
