import { useApp } from '../../context/AppContext';
import { TodoList } from './TodoList';
import { ActivityLog } from './ActivityLog';
import { Task } from '../../types';

interface DashboardProps {
  onEdit: (task: Task) => void;
  onAdd: () => void;
}

export function Dashboard({ onEdit, onAdd }: DashboardProps) {
  const { tasks } = useApp();

  const total = tasks.length;
  const done = tasks.filter(t => t.completed).length;
  const inProgress = tasks.filter(t => t.status === 'inprogress').length;
  const todo = total - done - inProgress;

  // Calculate conic-gradient percentages
  const pDone = total ? (done / total) * 100 : 0;
  const pProg = total ? (inProgress / total) * 100 : 0;
  
  // Format the gradient string. Colors match our index.css design system.
  // Done = green, In Progress = yellow, Todo = blue
  const conicGradient = `conic-gradient(
    var(--green) 0% ${pDone}%, 
    var(--yellow) ${pDone}% ${pDone + pProg}%, 
    var(--blue) ${pDone + pProg}% 100%
  )`;

  return (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {/* Main Split Layout */}
      <div className="dashboard-layout">
        {/* Left Pane: Todoist List (Appears first on mobile due to DOM order + flex-column) */}
        <div className="dashboard-pane-left">
          <TodoList onEdit={onEdit} onAdd={onAdd} />
        </div>

        {/* Right Pane: Stats & Activity Timeline */}
        <div className="dashboard-pane-right">
          {/* Simple Pie Chart Stats */}
          <div className="pie-chart-container" style={{
            background: 'var(--bg-secondary)',
            borderRadius: 12, border: '1px solid var(--border)', padding: 24,
            display: 'flex', alignItems: 'center', gap: 24,
          }}>
            <div className="pie-chart" style={{ background: conicGradient }}></div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Task Breakdown</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <LegendItem color="var(--green)" label="Completed" count={done} />
                <LegendItem color="var(--yellow)" label="In Progress" count={inProgress} />
                <LegendItem color="var(--blue)" label="To Do" count={todo} />
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            background: 'var(--bg-secondary)',
            borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden'
          }}>
            <ActivityLog />
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }}></div>
        <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      </div>
      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{count}</span>
    </div>
  );
}
