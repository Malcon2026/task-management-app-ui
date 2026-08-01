import { useState, useMemo, useCallback, memo } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, Status, User } from '../../types';
import { isOverdue, formatDate } from '../../utils/helpers';
import { Avatar } from '../ui/Avatar';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  IconPlus, IconTrash, IconChevronDown,
  StatusTodo, StatusInProgress, StatusReview, StatusDone,
  PriorityUrgent, PriorityHigh, PriorityMedium, PriorityLow,
} from '../ui/Icons';

const COLUMNS: { key: Status; label: string; icon: (p: any) => JSX.Element; color: string; bg: string }[] = [
  { key: 'todo', label: 'To Do', icon: StatusTodo, color: 'var(--text-muted)', bg: 'rgba(255, 255, 255, 0.02)' },
  { key: 'inprogress', label: 'In Progress', icon: StatusInProgress, color: '#eab308', bg: 'rgba(234, 179, 8, 0.03)' },
  { key: 'review', label: 'In Review', icon: StatusReview, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.03)' },
  { key: 'done', label: 'Done', icon: StatusDone, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.03)' },
];

interface KanbanProps {
  onEdit: (task: Task) => void;
  onAdd: () => void;
}

interface KanbanCardProps {
  task: Task;
  user: User | undefined;
  isMenuOpen: boolean;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onToggleMenu: (id: number) => void;
  onMoveClick: (id: number, status: Status) => void;
}

const KanbanCard = memo(function KanbanCard({
  task,
  user,
  isMenuOpen,
  onEdit,
  onDelete,
  onToggleMenu,
  onMoveClick,
}: KanbanCardProps) {
  const PriorityIcon = task.priority === 'urgent' ? PriorityUrgent : task.priority === 'high' ? PriorityHigh : task.priority === 'medium' ? PriorityMedium : PriorityLow;

  return (
    <div
      onClick={() => onEdit(task)}
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 8, padding: '12px 14px',
        display: 'flex', flexDirection: 'column', gap: 10,
        position: 'relative',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className={`todo-tag tag-${task.tag}`} style={{
          fontSize: 10, padding: '2px 6px', borderRadius: 4,
          fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em',
        }}>{task.tag}</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <PriorityIcon size={13} />
          <div style={{ position: 'relative' }}>
            <button
              onClick={e => {
                e.stopPropagation();
                onToggleMenu(task.id);
              }}
              style={{
                background: 'var(--bg-primary)', border: '1px solid var(--border)',
                borderRadius: 4, color: 'var(--text-muted)', cursor: 'pointer',
                padding: '2px 4px', fontSize: 10, display: 'flex', alignItems: 'center', gap: 2,
              }}
            >
              <span>Move</span>
              <IconChevronDown size={10} />
            </button>

            {isMenuOpen && (
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  position: 'absolute', right: 0, top: 22, zIndex: 100,
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-light)',
                  borderRadius: 6, padding: 4, width: 130,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                }}
              >
                {COLUMNS.filter(c => c.key !== task.status).map(c => (
                  <div
                    key={c.key}
                    onClick={() => onMoveClick(task.id, c.key)}
                    className="kanban-menu-item"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
                      cursor: 'pointer', fontSize: 12, color: 'var(--text-primary)', borderRadius: 4,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: c.color }} />
                    <span>{c.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{
        fontSize: 13, fontWeight: 500, color: 'var(--text-primary)',
        lineHeight: 1.4, textDecoration: task.completed ? 'line-through' : 'none',
      }}>
        {task.title}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 2,
      }}>
        <span style={{
          fontSize: 11, color: isOverdue(task.due) && !task.completed ? 'var(--red)' : 'var(--text-muted)',
          fontWeight: 500,
        }}>{formatDate(task.due)}</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {user && <Avatar user={user} size={20} fontSize={8} />}
          <button
            onClick={e => { e.stopPropagation(); onDelete(task.id); }}
            className="kanban-delete-btn"
            style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', padding: 2, display: 'flex',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            title="Delete Task"
          >
            <IconTrash size={12} />
          </button>
        </div>
      </div>
    </div>
  );
});

export function Kanban({ onEdit, onAdd }: KanbanProps) {
  const { tasks, users, updateTaskStatus, moveTask, deleteTask } = useApp();
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  const tasksByStatus = useMemo(() => {
    const map: Record<Status, Task[]> = {
      todo: [],
      inprogress: [],
      review: [],
      done: [],
    };
    tasks.forEach(t => {
      if (map[t.status]) {
        map[t.status].push(t);
      }
    });
    return map;
  }, [tasks]);

  const usersById = useMemo(() => {
    const map = new Map<number, User>();
    users.forEach(u => map.set(u.id, u));
    return map;
  }, [users]);

  const onDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const taskId = parseInt(draggableId, 10);
    const newStatus = destination.droppableId as Status;
    
    // Optimistic update happens natively through our fast context with custom sort order
    moveTask(taskId, newStatus, destination.index);
  }, [moveTask]);

  const handleMoveClick = useCallback((taskId: number, newStatus: Status) => {
    updateTaskStatus(taskId, newStatus);
    setActiveMenuId(null);
  }, [updateTaskStatus]);

  const handleToggleMenu = useCallback((id: number) => {
    setActiveMenuId(prev => (prev === id ? null : id));
  }, []);

  const handleDeleteTask = useCallback((id: number) => {
    deleteTask(id);
  }, [deleteTask]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div
        onClick={() => setActiveMenuId(null)}
        style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16, padding: 20, height: '100%', overflowX: 'auto',
          alignItems: 'start',
        }}
      >
        {COLUMNS.map(col => {
          const colTasks = tasksByStatus[col.key] || [];

          return (
            <div
              key={col.key}
              style={{
                background: col.bg,
                border: '1.5px solid var(--border)',
                borderRadius: 10, display: 'flex', flexDirection: 'column',
                height: '100%', overflow: 'hidden', minHeight: 400,
              }}
            >
              <div style={{
                padding: '12px 16px', borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'var(--bg-secondary)', flexShrink: 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{col.label}</span>
                  <span style={{
                    fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-primary)',
                    padding: '2px 8px', borderRadius: 10, fontWeight: 600,
                    border: '1px solid var(--border)',
                  }}>{colTasks.length}</span>
                </div>
                <button
                  onClick={onAdd}
                  style={{
                    background: 'transparent', border: 'none', color: 'var(--text-muted)',
                    cursor: 'pointer', padding: 2, display: 'flex',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <IconPlus size={14} />
                </button>
              </div>

              <Droppable droppableId={col.key}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      flex: 1, padding: 12,
                      display: 'flex', flexDirection: 'column', gap: 10,
                      background: snapshot.isDraggingOver ? 'rgba(255,255,255,0.02)' : 'transparent',
                      transition: 'background 0.2s ease',
                      minHeight: 100, overflowY: 'auto',
                    }}
                  >
                    {colTasks.map((t, index) => (
                      <Draggable key={t.id} draggableId={t.id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.9 : 1,
                              transform: provided.draggableProps.style?.transform,
                              cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                            }}
                          >
                            <KanbanCard
                              task={t}
                              user={usersById.get(t.assignedTo)}
                              isMenuOpen={activeMenuId === t.id}
                              onEdit={onEdit}
                              onDelete={handleDeleteTask}
                              onToggleMenu={handleToggleMenu}
                              onMoveClick={handleMoveClick}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {colTasks.length === 0 && !snapshot.isDraggingOver && (
                      <div style={{
                        padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)',
                        fontSize: 12, border: '1px dashed var(--border)', borderRadius: 8,
                      }}>
                        Drop tasks here or click +
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
