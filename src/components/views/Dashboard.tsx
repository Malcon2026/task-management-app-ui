import { useApp } from '../../context/AppContext';
import { Avatar } from '../ui/Avatar';
import { isOverdue, isToday, formatDate, timeAgo, getUserName, getInitials } from '../../utils/helpers';

const TYPE_ICONS: Record<string, string> = { create: '⚡', update: '✏️', complete: '🎉', delete: '🗑', assign: '👤', comment: '💬' };
const TYPE_CLS: Record<string, string> = { create: 'act-create', update: 'act-update', complete: 'act-complete', delete: 'act-delete', assign: 'act-assign', comment: 'act-comment' };

export function Dashboard() {
  const { tasks, users, activities, setCurrentView, toggleTask } = useApp();

  const total = tasks.length;
  const done = tasks.filter(t => t.completed).length;
  const inProgress = tasks.filter(t => t.status === 'inprogress').length;
  const overdue = tasks.filter(t => !t.completed && isOverdue(t.due)).length;
  const todayTasks = tasks.filter(t => !t.completed && isToday(t.due));
  const pct = total ? Math.round(done / total * 100) : 0;

  const recentTasks = [...tasks].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
  const urgentTasks = tasks.filter(t => !t.completed && t.priority === 'high').slice(0, 5);
  const recentActivities = activities.slice(0, 6);

  return (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* Stats */}
      <div className="stagger" style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 14, padding: '20px 28px',
        borderBottom: '1px solid var(--border)', flexShrink: 0,
      }}>
        <StatCard icon="📋" gradient="linear-gradient(135deg, rgba(51, 154, 240, 0.15), rgba(76, 110, 245, 0.15))" borderColor="rgba(51, 154, 240, 0.2)" value={total} label="Total Tasks" />
        <StatCard icon="⚙️" gradient="linear-gradient(135deg, rgba(255, 212, 59, 0.12), rgba(255, 146, 43, 0.12))" borderColor="rgba(255, 212, 59, 0.2)" value={inProgress} label="In Progress" />
        <StatCard icon="✅" gradient="linear-gradient(135deg, rgba(81, 207, 102, 0.12), rgba(34, 211, 238, 0.1))" borderColor="rgba(81, 207, 102, 0.2)" value={done} label="Completed" pct={pct} />
        <StatCard icon="🔴" gradient="linear-gradient(135deg, rgba(255, 107, 107, 0.12), rgba(255, 146, 43, 0.08))" borderColor="rgba(255, 107, 107, 0.2)" value={overdue} label="Overdue" isAlert={overdue > 0} />
      </div>

      {/* Main Grid */}
      <div className="stagger" style={{ padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, overflowY: 'auto' }}>

        {/* Live Activity Feed - Featured on Dashboard Main Screen! */}
        <div style={{ gridColumn: '1 / -1' }}>
          <DashCard 
            title="⚡ Live Activity Log Feed" 
            subtitle="Real-time timeline of team updates & actions"
            headerAction={
              <button
                onClick={() => setCurrentView('activity')}
                style={{
                  padding: '5px 14px', borderRadius: 8,
                  background: 'rgba(108, 92, 231, 0.12)',
                  border: '1px solid rgba(108, 92, 231, 0.25)',
                  color: '#a78bfa', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(108, 92, 231, 0.25)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(108, 92, 231, 0.12)'; }}
              >
                View Full Activity Log →
              </button>
            }
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12, marginTop: 4 }}>
              {recentActivities.map((act) => {
                const user = users.find(u => u.id === act.userId);
                const task = tasks.find(t => t.id === act.taskId);
                const targetUser = act.targetUserId ? users.find(u => u.id === act.targetUserId) : null;
                if (!user) return null;

                return (
                  <div
                    key={act.id}
                    onClick={() => setCurrentView('activity')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', borderRadius: 10,
                      background: 'rgba(18, 18, 42, 0.5)',
                      border: '1px solid var(--border)',
                      cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(26, 26, 58, 0.65)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(108, 92, 231, 0.3)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(18, 18, 42, 0.5)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                      (e.currentTarget as HTMLElement).style.transform = '';
                    }}
                  >
                    <div
                      className={TYPE_CLS[act.type] || 'act-comment'}
                      style={{
                        width: 34, height: 34, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, flexShrink: 0, border: '1px solid',
                      }}
                    >
                      {TYPE_ICONS[act.type] || '⚡'}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <span style={{ fontWeight: 700, color: '#e8e6f0' }}>{getUserName(user)}</span>
                        {' '}<span style={{ color: 'var(--text-secondary)' }}>{act.text}</span>
                        {task && <span style={{ color: '#a78bfa', fontWeight: 600 }}> "{task.title}"</span>}
                        {targetUser && <span style={{ color: 'var(--cyan)' }}> → {getUserName(targetUser)}</span>}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>⏱ {timeAgo(act.time)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </DashCard>
        </div>

        {/* Recent Tasks */}
        <DashCard title="🕐 Recent Tasks" subtitle="Latest activity">
          {recentTasks.map(t => {
            const user = users.find(u => u.id === t.assignedTo);
            return (
              <div key={t.id} onClick={() => setCurrentView('todo')} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8,
                cursor: 'pointer', transition: 'all 0.2s',
                borderBottom: '1px solid var(--border)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(108, 92, 231, 0.05)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <span className={`todo-tag tag-${t.tag}`} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 5, fontWeight: 600, letterSpacing: '0.03em' }}>{t.tag}</span>
                <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{t.title}</span>
                {user && <Avatar user={user} size={22} fontSize={9} />}
                <span style={{ fontSize: 11, color: isOverdue(t.due) ? 'var(--red)' : 'var(--text-muted)', flexShrink: 0, fontWeight: 500 }}>{formatDate(t.due)}</span>
              </div>
            );
          })}
        </DashCard>

        {/* High Priority */}
        <DashCard title="🔴 High Priority" subtitle="Needs immediate attention">
          {urgentTasks.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: 28 }}>
              <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.5 }}>🎉</div>
              No urgent tasks
            </div>
          )}
          {urgentTasks.map(t => (
            <div key={t.id} onClick={() => setCurrentView('todo')} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8,
              cursor: 'pointer', transition: 'all 0.2s',
              borderBottom: '1px solid var(--border)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255, 107, 107, 0.04)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--red)', flexShrink: 0, boxShadow: '0 0 8px var(--red-glow)' }} />
              <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{t.title}</span>
              <span style={{ fontSize: 11, color: isOverdue(t.due) ? 'var(--red)' : 'var(--text-muted)', flexShrink: 0, fontWeight: 500 }}>{formatDate(t.due)}</span>
            </div>
          ))}
        </DashCard>

        {/* Team Load */}
        <DashCard title="👥 Team Workload" subtitle="Task distribution">
          {users.map(u => {
            const myTasks = tasks.filter(t => t.assignedTo === u.id && !t.completed).length;
            const myDone = tasks.filter(t => t.assignedTo === u.id && t.completed).length;
            const totalU = myTasks + myDone;
            const pctU = totalU ? Math.round(myDone / totalU * 100) : 0;
            return (
              <div key={u.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 0', borderBottom: '1px solid var(--border)',
              }}>
                <Avatar user={u} size={30} fontSize={11} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 6, fontWeight: 500 }}>{u.fname} {u.lname}</div>
                  <div style={{ height: 5, background: 'rgba(18, 18, 42, 0.8)', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pctU}%`,
                      background: 'linear-gradient(90deg, #6c5ce7, #a855f7)',
                      borderRadius: 6, transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                    }} />
                  </div>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0, fontWeight: 600 }}>{myTasks} open</span>
              </div>
            );
          })}
        </DashCard>

        {/* Due Today */}
        <DashCard title={`📅 Due Today`} subtitle={`${todayTasks.length} task${todayTasks.length !== 1 ? 's' : ''} remaining`}>
          {todayTasks.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: 28 }}>
              <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.5 }}>🎉</div>
              No tasks due today
            </div>
          )}
          {todayTasks.map(t => (
            <div key={t.id} onClick={() => setCurrentView('todo')} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8,
              cursor: 'pointer', transition: 'all 0.2s',
              borderBottom: '1px solid var(--border)',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(108, 92, 231, 0.05)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <div
                onClick={e => { e.stopPropagation(); toggleTask(t.id); }}
                style={{
                  width: 20, height: 20, border: `2px solid ${t.completed ? 'var(--green)' : 'rgba(108, 92, 231, 0.4)'}`,
                  borderRadius: '50%', flexShrink: 0, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  background: t.completed ? 'var(--green)' : 'transparent',
                  color: 'white', fontSize: 11,
                  transition: 'all 0.2s',
                  boxShadow: t.completed ? '0 0 8px var(--green-glow)' : 'none',
                }}
              >{t.completed ? '✓' : ''}</div>
              <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1, fontWeight: 500 }}>{t.title}</span>
              <span style={{
                fontSize: 10, padding: '3px 8px', borderRadius: 5, fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }} className={`priority-pill-${t.priority === 'high' ? 'high' : t.priority === 'medium' ? 'med' : 'low'}`}>{t.priority}</span>
            </div>
          ))}
        </DashCard>
      </div>
    </div>
  );
}

function StatCard({ icon, gradient, borderColor, value, label, pct, isAlert }: {
  icon: string; gradient: string; borderColor: string; value: number; label: string; pct?: number; isAlert?: boolean;
}) {
  return (
    <div className="animate-fadeInUp" style={{
      background: 'rgba(14, 14, 36, 0.5)',
      backdropFilter: 'blur(12px)',
      border: `1px solid ${borderColor}`,
      borderRadius: 14, padding: '18px 20px',
      display: 'flex', alignItems: 'center', gap: 14,
      transition: 'all 0.25s',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background gradient glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: gradient,
        opacity: 0.5,
        pointerEvents: 'none',
      }} />
      <div style={{
        width: 42, height: 42, borderRadius: 10,
        background: gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18,
        position: 'relative',
        border: `1px solid ${borderColor}`,
      }}>{icon}</div>
      <div style={{ flex: 1, position: 'relative' }}>
        <div style={{
          fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1,
          letterSpacing: '-0.02em',
        }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>{label}</div>
        {pct !== undefined && (
          <div style={{ height: 4, background: 'rgba(18, 18, 42, 0.8)', borderRadius: 6, overflow: 'hidden', marginTop: 10, width: '100%' }}>
            <div style={{
              height: '100%', width: `${pct}%`,
              background: 'linear-gradient(90deg, #51cf66, #22d3ee)',
              borderRadius: 6, transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            }} />
          </div>
        )}
      </div>
      {isAlert && value > 0 && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          width: 8, height: 8, borderRadius: '50%',
          background: 'var(--red)',
          boxShadow: '0 0 8px var(--red-glow)',
          animation: 'pulseGlow 2s ease infinite',
        }} />
      )}
    </div>
  );
}

function DashCard({ title, subtitle, headerAction, children }: { title: string; subtitle?: string; headerAction?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="animate-fadeInUp" style={{
      background: 'rgba(14, 14, 36, 0.45)',
      backdropFilter: 'blur(12px)',
      border: '1px solid var(--border)',
      borderRadius: 14, padding: '20px 22px',
      transition: 'all 0.25s',
    }}>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{subtitle}</div>}
        </div>
        {headerAction && <div>{headerAction}</div>}
      </div>
      {children}
    </div>
  );
}
