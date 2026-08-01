import React, { useState, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, Quadrant, User } from '../../types';
import { Avatar } from '../ui/Avatar';
import {
  IconPlus, IconChevronDown, StatusTodo, StatusDone,
} from '../ui/Icons';

const QUADRANTS: { key: Quadrant; title: string; subtitle: string; color: string; className: string }[] = [
  { key: 'q1', title: 'Q1: Do First', subtitle: 'Urgent & Important', color: '#E5484D', className: 'matrix-q1' },
  { key: 'q2', title: 'Q2: Schedule', subtitle: 'Not Urgent, Important', color: '#3B82F6', className: 'matrix-q2' },
  { key: 'q3', title: 'Q3: Delegate', subtitle: 'Urgent, Not Important', color: '#F5A623', className: 'matrix-q3' },
  { key: 'q4', title: 'Q4: Eliminate', subtitle: 'Not Urgent, Not Important', color: '#8B5CF6', className: 'matrix-q4' },
];

interface MatrixCardProps {
  task: Task;
  user?: User;
  onEdit: (task: Task) => void;
  onToggle: (id: number) => void;
  onMove: (task: Task, newQ: Quadrant) => void;
  isMenuOpen: boolean;
  onToggleMenu: (id: number | null) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

const MatrixCard = React.memo(({ 
  task, user, onEdit, onToggle, onMove, isMenuOpen, onToggleMenu, onDragStart, onDragEnd 
}: MatrixCardProps) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      onClick={() => onEdit(task)}
      className="kanban-card"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 8, padding: '10px 12px',
        cursor: 'grab', display: 'flex', alignItems: 'center', gap: 10,
        position: 'relative',
      }}
    >
      <button
        onClick={e => { e.stopPropagation(); onToggle(task.id); }}
        className="kanban-action-btn"
      >
        {task.completed ? <StatusDone size={14} color="var(--green)" /> : <StatusTodo size={14} />}
      </button>

      <span className={`todo-tag tag-${task.tag}`} style={{
        fontSize: 9, padding: '1px 5px', borderRadius: 4,
        fontWeight: 600, textTransform: 'uppercase', flexShrink: 0,
      }}>{task.tag}</span>

      <span style={{
        fontSize: 13, color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)', flex: 1,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        fontWeight: 500,
        textDecoration: task.completed ? 'line-through' : 'none'
      }}>{task.title}</span>

      {user && <Avatar user={user} size={20} fontSize={8} />}

      <div style={{ position: 'relative' }}>
        <button
          onClick={e => { e.stopPropagation(); onToggleMenu(isMenuOpen ? null : task.id); }}
          style={{
            background: 'var(--bg-primary)', border: '1px solid var(--border)',
            borderRadius: 4, color: 'var(--text-muted)', cursor: 'pointer',
            padding: '2px 4px', fontSize: 10, display: 'flex', alignItems: 'center', gap: 2,
          }}
        >
          <span>Q</span>
          <IconChevronDown size={10} />
        </button>

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
            {QUADRANTS.filter(qItem => qItem.key !== task.quadrant).map(qItem => (
              <div
                key={qItem.key}
                onClick={() => onMove(task, qItem.key)}
                className="kanban-menu-item"
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
});

interface MatrixProps {
  onEdit: (task: Task) => void;
  onAdd: () => void;
}

export function Matrix({ onEdit, onAdd }: MatrixProps) {
  const { tasks, users, updateTask, toggleTask, showToast } = useApp();
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  const dragItem = useRef<Task | null>(null);
  const dragNode = useRef<HTMLElement | null>(null);
  const dragOverQuadrant = useRef<Quadrant | null>(null);
  const quadrantNodes = useRef<Map<Quadrant, HTMLElement>>(new Map());

  const handleMoveQuadrant = useCallback((task: Task, newQ: Quadrant) => {
    updateTask({ ...task, quadrant: newQ });
    setActiveMenuId(null);
  }, [updateTask]);

  const handleDragStart = useCallback((e: React.DragEvent, task: Task) => {
    dragItem.current = task;
    dragNode.current = e.currentTarget as HTMLElement;
    
    // Defer adding dragging class so drag image looks normal
    setTimeout(() => {
      if (dragNode.current) {
        dragNode.current.classList.add('is-dragging');
      }
    }, 0);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent, targetQ: Quadrant) => {
    e.preventDefault();
    if (!dragItem.current) return;
    
    dragOverQuadrant.current = targetQ;
    
    // Update visual styles directly on DOM nodes
    quadrantNodes.current.forEach((node, q) => {
      if (q === targetQ && q !== dragItem.current?.quadrant) {
        node.classList.add('drag-over');
      } else {
        node.classList.remove('drag-over');
      }
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetQ: Quadrant) => {
    e.preventDefault();
    
    if (dragItem.current && dragItem.current.quadrant !== targetQ) {
      updateTask({ ...dragItem.current, quadrant: targetQ });
    }
    
    // Clean up
    quadrantNodes.current.forEach(node => node.classList.remove('drag-over'));
    if (dragNode.current) dragNode.current.classList.remove('is-dragging');
    
    dragItem.current = null;
    dragNode.current = null;
    dragOverQuadrant.current = null;
  }, [updateTask]);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    quadrantNodes.current.forEach(node => node.classList.remove('drag-over'));
    if (dragNode.current) dragNode.current.classList.remove('is-dragging');
    dragItem.current = null;
    dragNode.current = null;
    dragOverQuadrant.current = null;
  }, []);

  return (
    <div className="matrix-container animate-fadeInUp" onClick={() => setActiveMenuId(null)}>
      <div className="matrix-layout">
        
        {/* Axes Labels */}
        <div className="matrix-axis-y">
          <span>Important</span>
          <span>Not Important</span>
        </div>
        
        <div className="matrix-axis-x">
          <span>Urgent</span>
          <span>Not Urgent</span>
        </div>

        {/* Quadrants */}
        {QUADRANTS.map(q => {
          const qTasks = tasks.filter(t => !t.completed && t.quadrant === q.key);
          
          return (
            <div
              key={q.key}
              ref={el => {
                if (el) quadrantNodes.current.set(q.key, el);
                else quadrantNodes.current.delete(q.key);
              }}
              className={`matrix-quadrant ${q.className}`}
              onDragEnter={(e) => handleDragEnter(e, q.key)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, q.key)}
            >
              {/* Header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 16px 12px 16px', borderBottom: '1px solid var(--border)'
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
                  className="kanban-action-btn"
                >
                  <IconPlus size={14} />
                </button>
              </div>

              {/* Task List */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {qTasks.map(t => (
                  <MatrixCard
                    key={t.id}
                    task={t}
                    user={users.find(u => u.id === t.assignedTo)}
                    onEdit={onEdit}
                    onToggle={toggleTask}
                    onMove={handleMoveQuadrant}
                    isMenuOpen={activeMenuId === t.id}
                    onToggleMenu={setActiveMenuId}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  />
                ))}

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
    </div>
  );
}
