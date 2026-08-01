import { useApp } from '../../context/AppContext';
import { Avatar } from '../ui/Avatar';
import { isOverdue, isToday, formatDate, timeAgo, getUserName } from '../../utils/helpers';
import {
  IconIssues, IconClock, IconCheck, IconAlertCircle,
  IconActivity, IconTrendingUp, IconUsers, IconCalendar,
  IconArrowRight, StatusDone, StatusInProgress, PriorityUrgent,
} from '../ui/Icons';
import type { ActivityType } from '../../types';

const TYPE_CONFIG: Record<ActivityType, { label: string; color: string }> = {
  create: { label: 'Created', color: 'var(--green)' },
  update: { label: 'Updated', color: 'var(--blue)' },
  complete: { label: 'Completed', color: 'var(--accent)' },
  delete: { label: 'Deleted', color: 'var(--red)' },
  assign: { label: 'Assigned', color: 'var(--yellow)' },
  comment: { label: 'Note', color: 'var(--purple)' },
};

export function Dashboard() {
  const { tasks, users, activities, setCurrentView, toggleTask } = useApp();

  const total = tasks.length;
  const done = tasks.filter(t => t.completed).length;
  const inProgress = tasks.filter(t => t.status === 'inprogress').length;
  const overdue = tasks.filter(t => !t.completed && isOverdue(t.due)).length;
  const todayTasks = tasks.filter(t => !t.completed && isToday(t.due));
  const pct = total ? Math.round((done / total) * 100) : 0;

  const recentTasks = [...tasks].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
  const urgentTasks = tasks.filter(t => !t.completed && (t.priority === 'high' || t.priority === 'urgent')).slice(0, 5);
  const recentActivities = activities.slice(0, 6);

  return (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* Top Stats Banner */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 12, padding: '20px 24px',
        borderBottom: '1px solid var(--border)', flexShrink: 0,
      }}>
        <MetricCard
          title="Total Tasks"
          value={total}
          subtext="Total workspace tasks"
          icon={<IconIssues size={18} color="var(--accent)" />}
          badge="Workspace"
        />
        <MetricCard
          title="In Progress"
          value={inProgress}
          subtext="Active issues being worked on"
          icon={<IconClock size={18} color="var(--yellow)" />}
          badge={`${total ? Math.round((inProgress / total) * 100) : 0}% active`}
        />
        <MetricCard
          title="Completed"
          value={done}
          subtext={`${pct}% completion rate`}
          icon={<IconCheck size={18} color="var(--green)" />}
          pct={pct}
        />
        <MetricCard
          title="Overdue"
          value={overdue}
          subtext={overdue > 0 ? "Requires immediate attention" : "All deadlines on track"}
          icon={<IconAlertCircle size={18} color={overdue > 0 ? 'var(--red)' : 'var(--text-muted)'} />}
          isAlert={overdue > 0}
        />
      </div>

      {/* Main Grid Content */}
      <div style={{
        padding: '24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: 20,
      }}>

        {/* Live Activity Feed - Span 2 Columns if layout permits */}
        <div style={{ gridColumn: '1 / -1' }}>
          <SectionCard
            title="Live Activity Feed"
            subtitle="Real-time log of team actions & task updates"
            icon={<IconActivity size={16} color="var(--accent)" />}
            action={
              <button
                onClick={() => setCurrentView('activity')}
                style={{
                  padding: '4px 10px', borderRadius: 6,
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-active)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                }}
              >
                <span>View All Log</span>
                <IconArrowRight size={12} />
              </button>
            }
          >
            {recentActivities.length === 0 ? (
              <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                No recent activity logged
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 10, marginTop: 4,
              }}>
                {recentActivities.map((act) => {
                  const user = users.find(u => u.id === act.userId);
                  const task = tasks.find(t => t.id === act.taskId);
                  const targetUser = act.targetUserId ? users.find(u => u.id === act.targetUserId) : null;
                  const config = TYPE_CONFIG[act.type] || TYPE_CONFIG.comment;
                  if (!user) return null;

                  return (
                    <div
                      key={act.id}
                      onClick={() => setCurrentView('activity')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 14px', borderRadius: 8,
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border)',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-light)';
                        (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                        (e.currentTarget as HTMLElement).style.background = 'var(--bg-primary)';
                      }}
                    >
                      <Avatar user={user} size={28} fontSize={10} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <span style={{ fontWeight: 600 }}>{getUserName(user)}</span>
                          {' '}<span style={{ color: 'var(--text-secondary)' }}>{act.text}</span>
                          {task && <span style={{ color: 'var(--accent)', fontWeight: 500 }}> "{task.title}"</span>}
                          {targetUser && <span style={{ color: 'var(--text-muted)' }}> → {getUserName(targetUser)}</span>}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>{timeAgo(act.time)}</span>
                          <span>•</span>
                          <span style={{ color: config.color, fontWeight: 500 }}>{config.label}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Recent Tasks Column */}
        <SectionCard
          title="Recent Tasks"
          subtitle="Newly created or updated tasks"
          icon={<IconClock size={16} color="var(--text-secondary)" />}
        >
          {recentTasks.map(t => {
            const user = users.find(u => u.id === t.assignedTo);
            return (
              <div
                key={t.id}
                onClick={() => setCurrentView('todo')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 6,
                  cursor: 'pointer', transition: 'background 0.1s',
                  borderBottom: '1px solid var(--border)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <span className={`todo-tag tag-${t.tag}`} style={{
                  fontSize: 10, padding: '2px 6px', borderRadius: 4,
                  fontWeight: 500, letterSpacing: '0.02em', textTransform: 'uppercase',
                }}>{t.tag}</span>
                <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                {user && <Avatar user={user} size={20} fontSize={9} />}
                <span style={{ fontSize: 11, color: isOverdue(t.due) ? 'var(--red)' : 'var(--text-muted)', flexShrink: 0 }}>{formatDate(t.due)}</span>
              </div>
            );
          })}
        </SectionCard>

        {/* High Priority Column */}
        <SectionCard
          title="Urgent Priority"
          subtitle="Issues needing immediate action"
          icon={<PriorityUrgent size={14} color="var(--red)" />}
        >
          {urgentTasks.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '24px 0' }}>
              No urgent tasks pending
            </div>
          ) : (
            urgentTasks.map(t => (
              <div
                key={t.id}
                onClick={() => setCurrentView('todo')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 6,
                  cursor: 'pointer', transition: 'background 0.1s',
                  borderBottom: '1px solid var(--border)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                <span style={{ fontSize: 11, color: isOverdue(t.due) ? 'var(--red)' : 'var(--text-muted)', flexShrink: 0 }}>{formatDate(t.due)}</span>
              </div>
            ))
          )}
        </SectionCard>

        {/* Team Workload */}
        <SectionCard
          title="Team Distribution"
          subtitle="Active task load by member"
          icon={<IconUsers size={16} color="var(--text-secondary)" />}
        >
          {users.map(u => {
            const myTasks = tasks.filter(t => t.assignedTo === u.id && !t.completed).length;
            const myDone = tasks.filter(t => t.assignedTo === u.id && t.completed).length;
            const totalU = myTasks + myDone;
            const pctU = totalU ? Math.round((myDone / totalU) * 100) : 0;
            return (
              <div key={u.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '8px 0', borderBottom: '1px solid var(--border)',
              }}>
                <Avatar user={u} size={24} fontSize={9} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 4, fontWeight: 500 }}>{getUserName(u)}</div>
                  <div style={{ height: 4, background: 'var(--bg-primary)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pctU}%`,
                      background: 'var(--accent)', borderRadius: 4,
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0, fontWeight: 500 }}>{myTasks} open</span>
              </div>
            );
          })}
        </SectionCard>

        {/* Due Today Column */}
        <SectionCard
          title="Due Today"
          subtitle={`${todayTasks.length} issue${todayTasks.length !== 1 ? 's' : ''} scheduled`}
          icon={<IconCalendar size={16} color="var(--text-secondary)" />}
        >
          {todayTasks.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '24px 0' }}>
              No issues due today
            </div>
          ) : (
            todayTasks.map(t => (
              <div
                key={t.id}
                onClick={() => setCurrentView('todo')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 6,
                  cursor: 'pointer', transition: 'background 0.1s',
                  borderBottom: '1px solid var(--border)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <button
                  onClick={e => { e.stopPropagation(); toggleTask(t.id); }}
                  style={{
                    width: 16, height: 16, borderRadius: '50%',
                    border: `1.5px solid ${t.completed ? 'var(--accent)' : 'var(--border-light)'}`,
                    background: t.completed ? 'var(--accent)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', padding: 0, flexShrink: 0,
                  }}
                >
                  {t.completed && <IconCheck size={10} color="#fff" />}
                </button>
                <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                <span className={`priority-pill-${t.priority === 'high' ? 'high' : t.priority === 'medium' ? 'med' : 'low'}`} style={{
                  fontSize: 10, padding: '1px 6px', borderRadius: 4, fontWeight: 500, textTransform: 'uppercase',
                }}>{t.priority}</span>
              </div>
            ))
          )}
        </SectionCard>

      </div>
    </div>
  );
}

function MetricCard({ title, value, subtext, icon, pct, badge, isAlert }: {
  title: string; value: number; subtext: string; icon: React.ReactNode; pct?: number; badge?: string; isAlert?: boolean;
}) {
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: `1px solid ${isAlert ? 'rgba(239, 68, 68, 0.3)' : 'var(--border)'}`,
      borderRadius: 8, padding: '14px 16px',
      display: 'flex', flexDirection: 'column', gap: 8,
      position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {badge && (
            <span style={{ fontSize: 10, color: 'var(--text-muted)', background: 'var(--bg-primary)', padding: '1px 6px', borderRadius: 4 }}>{badge}</span>
          )}
          {icon}
        </div>
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
        {value}
      </div>
      {pct !== undefined && (
        <div style={{ height: 3, background: 'var(--bg-primary)', borderRadius: 3, overflow: 'hidden', width: '100%', marginTop: 2 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'var(--green)', borderRadius: 3 }} />
        </div>
      )}
      <div style={{ fontSize: 11, color: isAlert ? 'var(--red)' : 'var(--text-muted)' }}>
        {subtext}
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, icon, action, children }: {
  title: string; subtitle?: string; icon?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: 8, padding: '16px 18px',
      display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon}
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
            {subtitle && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{subtitle}</div>}
          </div>
        </div>
        {action}
      </div>
      <div>{children}</div>
    </div>
  );
}
