import { useApp } from '../../context/AppContext';
import { Avatar } from '../ui/Avatar';
import { isOverdue, isToday, formatDate, timeAgo, getUserName } from '../../utils/helpers';

const STATUS_ICONS: Record<string, { icon: string; color: string }> = {
  todo: { icon: '○', color: 'var(--text-muted)' },
  inprogress: { icon: '◐', color: 'var(--yellow)' },
  review: { icon: '◕', color: 'var(--blue)' },
  done: { icon: '●', color: 'var(--accent)' },
};

const PRIORITY_BARS: Record<string, string> = {
  high: 'var(--orange)',
  medium: 'var(--yellow)',
  low: 'var(--blue)',
};

export function Dashboard() {
  const { tasks, users, activities, setCurrentView, toggleTask } = useApp();

  const total = tasks.length;
  const done = tasks.filter(t => t.completed).length;
  const inProgress = tasks.filter(t => t.status === 'inprogress').length;
  const overdue = tasks.filter(t => !t.completed && isOverdue(t.due)).length;
  const pct = total ? Math.round(done / total * 100) : 0;

  const recentTasks = [...tasks].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);
  const urgentTasks = tasks.filter(t => !t.completed && t.priority === 'high').slice(0, 5);
  const recentActivities = activities.slice(0, 8);

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 24px' }}>

        {/* Page Title */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Overview of your workspace</p>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12, marginBottom: 24,
        }}>
          <StatCard label="Total" value={total} />
          <StatCard label="In Progress" value={inProgress} color="var(--yellow)" />
          <StatCard label="Completed" value={done} color="var(--green)" sub={`${pct}%`} />
          <StatCard label="Overdue" value={overdue} color={overdue > 0 ? 'var(--red)' : undefined} />
        </div>

        {/* Two Column Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

          {/* Recent Activity */}
          <Section
            title="Activity"
            action={{ label: 'View all', onClick: () => setCurrentView('activity') }}
          >
            {recentActivities.length === 0 && <EmptyMsg>No activity yet</EmptyMsg>}
            {recentActivities.map(act => {
              const user = users.find(u => u.id === act.userId);
              if (!user) return null;
              return (
                <div key={act.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '6px 0',
                  fontSize: 13,
                }}>
                  <Avatar user={user} size={20} fontSize={9} />
                  <span style={{ color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{getUserName(user)}</span>
                    {' '}{act.text}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{timeAgo(act.time)}</span>
                </div>
              );
            })}
          </Section>

          {/* Recent Issues */}
          <Section
            title="Recent Issues"
            action={{ label: 'View all', onClick: () => setCurrentView('todo') }}
          >
            {recentTasks.length === 0 && <EmptyMsg>No issues yet</EmptyMsg>}
            {recentTasks.map(t => (
              <div key={t.id} onClick={() => setCurrentView('todo')} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '5px 0', cursor: 'pointer',
                fontSize: 13,
              }}>
                <span style={{ color: STATUS_ICONS[t.status]?.color || 'var(--text-muted)', fontSize: 14 }}>
                  {STATUS_ICONS[t.status]?.icon || '○'}
                </span>
                <span style={{
                  flex: 1, color: 'var(--text-primary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{t.title}</span>
                <div style={{ width: 3, height: 12, borderRadius: 2, background: PRIORITY_BARS[t.priority] || 'var(--text-muted)' }} />
              </div>
            ))}
          </Section>

          {/* Urgent */}
          <Section title="Urgent">
            {urgentTasks.length === 0 && <EmptyMsg>No urgent issues</EmptyMsg>}
            {urgentTasks.map(t => (
              <div key={t.id} onClick={() => setCurrentView('todo')} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '5px 0', cursor: 'pointer', fontSize: 13,
              }}>
                <span style={{ color: 'var(--orange)', fontSize: 14 }}>!</span>
                <span style={{ flex: 1, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                <span style={{ fontSize: 11, color: isOverdue(t.due) ? 'var(--red)' : 'var(--text-muted)' }}>{formatDate(t.due)}</span>
              </div>
            ))}
          </Section>

          {/* Team */}
          <Section title="Team">
            {users.map(u => {
              const open = tasks.filter(t => t.assignedTo === u.id && !t.completed).length;
              const total = tasks.filter(t => t.assignedTo === u.id).length;
              const pct = total ? Math.round((total - open) / total * 100) : 0;
              return (
                <div key={u.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '6px 0',
                }}>
                  <Avatar user={u} size={22} fontSize={9} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{getUserName(u)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 48, height: 3, borderRadius: 2, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent)', borderRadius: 2, transition: 'width 0.3s' }} />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 36, textAlign: 'right' }}>{open} open</span>
                  </div>
                </div>
              );
            })}
          </Section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, sub }: { label: string; value: number; color?: string; sub?: string }) {
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: 8, padding: '14px 16px',
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 500 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: 22, fontWeight: 600, color: color || 'var(--text-primary)', lineHeight: 1 }}>{value}</span>
        {sub && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</span>}
      </div>
    </div>
  );
}

function Section({ title, action, children }: { title: string; action?: { label: string; onClick: () => void }; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: 8, padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{title}</span>
        {action && (
          <span
            onClick={action.onClick}
            style={{ fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.1s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
          >{action.label} →</span>
        )}
      </div>
      {children}
    </div>
  );
}

function EmptyMsg({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '12px 0', textAlign: 'center' }}>{children}</div>;
}
