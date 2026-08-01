import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { timeAgo, getUserName, getInitials } from '../../utils/helpers';
import { ActivityType } from '../../types';

const TYPE_ICONS: Record<string, string> = { create: '⚡', update: '✏️', complete: '🎉', delete: '🗑', assign: '👤', comment: '💬' };
const TYPE_LABELS: Record<string, string> = { create: 'Created', update: 'Updated', complete: 'Completed', delete: 'Deleted', assign: 'Assigned', comment: 'Commented' };
const TYPE_CLS: Record<string, string> = { create: 'act-create', update: 'act-update', complete: 'act-complete', delete: 'act-delete', assign: 'act-assign', comment: 'act-comment' };

export function ActivityLog() {
  const { activities, users, tasks, clearActivities, addActivity, setCurrentView, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [commentText, setCommentText] = useState('');

  // Stats calculation
  const totalCount = activities.length;
  const createdCount = activities.filter(a => a.type === 'create').length;
  const completedCount = activities.filter(a => a.type === 'complete').length;
  const activeUserIds = new Set(activities.map(a => a.userId)).size;

  // Filtering
  const filtered = activities.filter(a => {
    // Type filter
    if (selectedType !== 'all' && a.type !== selectedType) return false;
    // User filter
    if (selectedUser !== 'all' && a.userId !== parseInt(selectedUser)) return false;
    // Search query filter
    if (search.trim()) {
      const user = users.find(u => u.id === a.userId);
      const task = tasks.find(t => t.id === a.taskId);
      const targetUser = a.targetUserId ? users.find(u => u.id === a.targetUserId) : null;
      const text = `${user ? getUserName(user) : ''} ${a.text} ${task ? task.title : ''} ${targetUser ? getUserName(targetUser) : ''}`.toLowerCase();
      if (!text.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  // Group by day
  const groups: Record<string, typeof activities> = {};
  filtered.forEach(a => {
    const d = new Date(a.time);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    let label: string;
    if (d >= today) label = 'Today';
    else if (d >= yesterday) label = 'Yesterday';
    else label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    if (!groups[label]) groups[label] = [];
    groups[label].push(a);
  });

  function handleClear() {
    if (!confirm('Are you sure you want to clear all activity logs?')) return;
    clearActivities();
    showToast('Activity log cleared', 'info');
  }

  function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    addActivity('comment', 1, null, commentText.trim());
    showToast('💬 Log note posted to team stream', 'success');
    setCommentText('');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 28px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{
          padding: '11px 16px', fontSize: 13, fontWeight: 700,
          color: 'var(--text-primary)',
          borderBottom: '2px solid var(--accent-hover)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span style={{ fontSize: 15 }}>⚡</span> Activity Log Stream
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, padding: '4px 0' }}>
          <button onClick={handleClear} style={{
            padding: '6px 16px', height: 34, borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--bg-secondary)',
            color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer',
            transition: 'all 0.2s', fontWeight: 500,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 107, 107, 0.4)'; (e.currentTarget as HTMLElement).style.color = 'var(--red)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
          >Clear Log</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: 940, margin: '0 auto', padding: '28px 28px 48px', width: '100%' }}>
          
          {/* Main Title & Stats Banner */}
          <div style={{ marginBottom: 24 }}>
            <div style={{
              fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}>⚡ Team Activity Stream</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>
              Live audit trail of actions, task updates, assignments, and team comments
            </div>
          </div>

          {/* Activity Metrics Banner */}
          <div className="stagger" style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
            marginBottom: 24,
          }}>
            <StatPill label="Total Events" value={totalCount} icon="⚡" color="var(--accent)" />
            <StatPill label="Tasks Created" value={createdCount} icon="✨" color="#22d3ee" />
            <StatPill label="Completed" value={completedCount} icon="🎉" color="#51cf66" />
            <StatPill label="Active Users" value={activeUserIds} icon="👥" color="var(--accent)" />
          </div>

          {/* Post Activity Note Bar */}
          <form onSubmit={handleAddComment} style={{
            display: 'flex', gap: 10, padding: '12px 16px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 12, marginBottom: 24,
            alignItems: 'center',
          }}>
            <span style={{ fontSize: 16 }}>💬</span>
            <input
              type="text"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Post a status update or team note to activity log..."
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit',
              }}
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              style={{
                padding: '6px 16px', borderRadius: 8, border: 'none',
                background: commentText.trim() ? 'var(--accent)' : 'var(--accent-dim)',
                color: commentText.trim() ? '#ffffff' : 'var(--text-muted)',
                fontSize: 12, fontWeight: 600, cursor: commentText.trim() ? 'pointer' : 'default',
                transition: 'all 0.2s',
              }}
            >Post Note</button>
          </form>

          {/* Search & Filter Toolbar */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 14,
            padding: '16px 20px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 14, marginBottom: 28,
          }}>
            {/* Top row: Search input + User Dropdown */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="🔍 Search activity feed by user, task title or keyword..."
                  style={{
                    width: '100%', padding: '9px 14px 9px 36px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    borderRadius: 10, color: 'var(--text-primary)', fontSize: 13, outline: 'none',
                    transition: 'all 0.2s',
                  }}
                />
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'var(--text-muted)' }}>🔍</span>
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      border: 'none', background: 'transparent', color: 'var(--text-muted)',
                      cursor: 'pointer', fontSize: 12,
                    }}
                  >✕</button>
                )}
              </div>

              {/* User filter */}
              <select
                value={selectedUser}
                onChange={e => setSelectedUser(e.target.value)}
                style={{
                  padding: '9px 14px', background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)', borderRadius: 10,
                  color: 'var(--text-primary)', fontSize: 12, outline: 'none',
                  cursor: 'pointer', fontWeight: 500, minWidth: 160,
                }}
              >
                <option value="all">👤 All Collaborators</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{getUserName(u)}</option>
                ))}
              </select>
            </div>

            {/* Action Type Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: 4 }}>Filter:</span>
              <FilterPill label="All Types" active={selectedType === 'all'} onClick={() => setSelectedType('all')} count={totalCount} />
              {Object.keys(TYPE_LABELS).map((type) => {
                const count = activities.filter(a => a.type === type).length;
                return (
                  <FilterPill
                    key={type}
                    icon={TYPE_ICONS[type]}
                    label={TYPE_LABELS[type]}
                    active={selectedType === type}
                    onClick={() => setSelectedType(type)}
                    count={count}
                  />
                );
              })}
            </div>
          </div>

          {/* Timeline Feed */}
          {filtered.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '64px 24px', color: 'var(--text-muted)', textAlign: 'center', gap: 14,
              background: 'var(--bg-secondary)', borderRadius: 16, border: '1px dashed var(--border)',
            }}>
              <div style={{ fontSize: 56, opacity: 0.3 }}>⚡</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-secondary)' }}>No matching activity found</div>
              <div style={{ fontSize: 13, maxWidth: 300, lineHeight: 1.6 }}>Try resetting your filter options or search term.</div>
              {(search || selectedType !== 'all' || selectedUser !== 'all') && (
                <button
                  onClick={() => { setSearch(''); setSelectedType('all'); setSelectedUser('all'); }}
                  style={{
                    marginTop: 8, padding: '7px 18px', borderRadius: 8,
                    background: 'var(--accent-dim)',
                    border: '1px solid var(--border-light)',
                    color: 'var(--accent)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Reset All Filters
                </button>
              )}
            </div>
          ) : (
            Object.entries(groups).map(([day, acts]) => (
              <div key={day} style={{ marginBottom: 36 }}>
                {/* Day Header Badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  fontSize: 11, fontWeight: 700, color: 'var(--accent)',
                  textTransform: 'uppercase', letterSpacing: '0.12em',
                  padding: '4px 12px', borderRadius: 20,
                  background: 'var(--accent-dim)',
                  border: '1px solid var(--accent-dim)',
                  marginBottom: 16, marginLeft: 6,
                }}>
                  <span>📅</span> {day}
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', paddingLeft: 4 }}>({acts.length})</span>
                </div>

                {/* Event list */}
                <div style={{ position: 'relative', paddingLeft: 6 }}>
                  {acts.map((a, i) => {
                    const user = users.find(u => u.id === a.userId);
                    const task = tasks.find(t => t.id === a.taskId);
                    const targetUser = a.targetUserId ? users.find(u => u.id === a.targetUserId) : null;
                    if (!user) return null;

                    return (
                      <div key={a.id} style={{ display: 'flex', gap: 16, padding: '10px 0', position: 'relative' }}>
                        {/* Connecting timeline line */}
                        {i < acts.length - 1 && (
                          <div style={{
                            position: 'absolute', left: 20, top: 48, bottom: -14, width: 2,
                            background: 'var(--border)',
                            zIndex: 1,
                          }} />
                        )}

                        {/* Event Category Glowing Node */}
                        <div
                          className={TYPE_CLS[a.type] || 'act-comment'}
                          style={{
                            width: 42, height: 42, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, fontSize: 16, border: '2px solid',
                            zIndex: 2,
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                          }}
                        >
                          {TYPE_ICONS[a.type] || '📌'}
                        </div>

                        {/* Glassmorphic Event Card */}
                        <div
                          style={{
                            flex: 1, minWidth: 0,
                            padding: '14px 18px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border)',
                            borderRadius: 12,
                            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = 'var(--bg-active)';
                            (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-light)';
                            (e.currentTarget as HTMLElement).style.transform = 'translateX(4px)';
                            (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.35)';
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)';
                            (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                            (e.currentTarget as HTMLElement).style.transform = '';
                            (e.currentTarget as HTMLElement).style.boxShadow = '';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                            {/* Main event message */}
                            <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5, flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--text-primary)' }}>
                                  <span
                                    className={user.avatarClass}
                                    style={{
                                      width: 22, height: 22, borderRadius: '50%', fontSize: 10, fontWeight: 700,
                                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                      color: '#0a0a0a', boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                                    }}
                                  >{getInitials(user)}</span>
                                  {getUserName(user)}
                                </span>
                                <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>{a.text}</span>
                              </div>

                              {/* Task card tag or mention */}
                              {task && (
                                <div
                                  onClick={() => { setCurrentView('todo'); showToast(`Navigated to task: "${task.title}"`, 'info'); }}
                                  style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    margin: '6px 0 2px', padding: '4px 10px',
                                    borderRadius: 6,
                                    background: 'var(--accent-dim)',
                                    border: '1px solid var(--accent-dim)',
                                    color: 'var(--accent)', fontSize: 12, fontWeight: 600,
                                    cursor: 'pointer', transition: 'all 0.2s',
                                  }}
                                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent-dim)'; }}
                                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent-dim)'; }}
                                >
                                  <span>📌</span> "{task.title}"
                                </div>
                              )}

                              {targetUser && (
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 4, color: 'var(--cyan)', fontSize: 12, fontWeight: 600 }}>
                                  <span>→</span>
                                  <span
                                    className={targetUser.avatarClass}
                                    style={{
                                      width: 18, height: 18, borderRadius: '50%', fontSize: 9, fontWeight: 700,
                                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                      color: '#0a0a0a',
                                    }}
                                  >{getInitials(targetUser)}</span>
                                  {getUserName(targetUser)}
                                </div>
                              )}
                            </div>

                            {/* Timestamp & Type Pill */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{timeAgo(a.time)}</span>
                              <span style={{
                                fontSize: 10, padding: '2px 8px', borderRadius: 4,
                                textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700,
                                background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
                                border: '1px solid var(--border)',
                              }}>{TYPE_LABELS[a.type] || a.type}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatPill({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <div style={{
      padding: '14px 16px', borderRadius: 12,
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: 12,
      transition: 'all 0.2s',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: `${color}18`,
        border: `1px solid ${color}35`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontWeight: 600 }}>{label}</div>
      </div>
    </div>
  );
}

function FilterPill({ label, icon, active, onClick, count }: { label: string; icon?: string; active: boolean; onClick: () => void; count?: number }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 12px', borderRadius: 20, border: active ? '1px solid var(--border-light)' : '1px solid var(--border)',
        background: active ? 'var(--accent-dim)' : 'var(--bg-tertiary)',
        color: active ? '#ffffff' : 'var(--text-secondary)',
        fontSize: 12, fontWeight: active ? 600 : 500, cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 5,
        transition: 'all 0.2s',
        boxShadow: active ? '0 2px 10px var(--border)' : 'none',
      }}
      onMouseEnter={e => {
        if (!active) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-light)';
      }}
      onMouseLeave={e => {
        if (!active) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
      }}
    >
      {icon && <span>{icon}</span>}
      <span>{label}</span>
      {count !== undefined && (
        <span style={{
          fontSize: 10, padding: '1px 6px', borderRadius: 10,
          background: active ? 'rgba(255, 255, 255, 0.2)' : 'var(--accent-dim)',
          color: active ? '#ffffff' : 'var(--accent)',
          fontWeight: 700,
        }}>{count}</span>
      )}
    </button>
  );
}
