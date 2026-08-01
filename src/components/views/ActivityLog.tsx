import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../ui/Avatar';
import { timeAgo, getUserName } from '../../utils/helpers';
import { IconSearch, IconTrash, IconActivity } from '../ui/Icons';
import type { ActivityType } from '../../types';

const TYPE_CONFIG: Record<ActivityType, { label: string; color: string; bg: string }> = {
  create: { label: 'Created', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.12)' },
  update: { label: 'Updated', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' },
  complete: { label: 'Completed', color: 'var(--accent)', bg: 'rgba(94, 106, 210, 0.12)' },
  delete: { label: 'Deleted', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)' },
  assign: { label: 'Assigned', color: '#eab308', bg: 'rgba(234, 179, 8, 0.12)' },
  comment: { label: 'Note', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.12)' },
};

type FilterType = 'all' | ActivityType;

export function ActivityLog() {
  const { activities, users, tasks, addActivity, activeUserId, clearActivities, showToast } = useApp();
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [noteText, setNoteText] = useState('');

  const filtered = activities.filter(act => {
    if (filter !== 'all' && act.type !== filter) return false;
    if (search) {
      const user = users.find(u => u.id === act.userId);
      const haystack = `${getUserName(user || { fname: '', lname: '' } as any)} ${act.text}`.toLowerCase();
      if (!haystack.includes(search.toLowerCase())) return false;
    }
    return true;
  });

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All Activity' },
    { key: 'create', label: 'Created' },
    { key: 'update', label: 'Updated' },
    { key: 'complete', label: 'Completed' },
    { key: 'assign', label: 'Assigned' },
    { key: 'delete', label: 'Deleted' },
    { key: 'comment', label: 'Notes' },
  ];

  function postNote() {
    if (!noteText.trim()) return;
    addActivity('comment', activeUserId, null, noteText.trim());
    showToast('Note posted to timeline', 'success');
    setNoteText('');
  }

  return (
    <div className="view-root">
      {/* Navigation Filter Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '0 20px',
        borderBottom: '1px solid var(--border)', gap: 0,
        height: 44, flexShrink: 0, flexWrap: 'wrap',
      }}>
        {FILTERS.map(f => (
          <div
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: '0 12px', height: '100%', display: 'flex', alignItems: 'center',
              fontSize: 13, cursor: 'pointer',
              borderBottom: `2px solid ${filter === f.key ? 'var(--accent)' : 'transparent'}`,
              color: filter === f.key ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: filter === f.key ? 500 : 400,
              transition: 'color 0.1s',
            }}
          >{f.label}</div>
        ))}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--bg-primary)', border: '1px solid var(--border)',
            borderRadius: 6, padding: '3px 8px', width: 150,
          }}>
            <IconSearch size={12} color="var(--text-muted)" />
            <input
              type="text" value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search timeline..."
              style={{
                background: 'none', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: 12, width: '100%',
              }}
            />
          </div>
          <button
            onClick={() => { clearActivities(); showToast('Activity cleared', 'info'); }}
            style={{
              padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)',
              background: 'transparent', color: 'var(--text-muted)',
              fontSize: 12, cursor: 'pointer', transition: 'all 0.1s',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--red)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.3)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
          >
            <IconTrash size={12} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Post Status Note Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 20px', background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
      }}>
        <IconActivity size={15} color="var(--text-muted)" />
        <input
          type="text" value={noteText}
          onChange={e => setNoteText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && postNote()}
          placeholder="Post a status update or team note... (Press Enter)"
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit',
          }}
        />
        <button
          onClick={postNote}
          style={{
            padding: '4px 12px', borderRadius: 6, border: 'none',
            background: noteText.trim() ? 'var(--accent)' : 'var(--bg-tertiary)',
            color: noteText.trim() ? '#fff' : 'var(--text-muted)',
            fontSize: 12, cursor: 'pointer', fontWeight: 500,
            transition: 'all 0.1s',
          }}
        >Post</button>
      </div>

      {/* Timeline Stream */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
        {filtered.length === 0 && (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No activity events recorded
          </div>
        )}
        
        {filtered.length > 0 && (
          <div className="timeline-container animate-fadeInUp">
            <div className="timeline-line"></div>
            {filtered.map(act => {
              const user = users.find(u => u.id === act.userId);
              const task = tasks.find(t => t.id === act.taskId);
              const targetUser = act.targetUserId ? users.find(u => u.id === act.targetUserId) : null;
              const config = TYPE_CONFIG[act.type] || TYPE_CONFIG.comment;
              if (!user) return null;

              return (
                <div key={act.id} className="timeline-item">
                  <div className="timeline-dot" style={{ borderColor: config.color }}></div>
                  <div className="timeline-content">
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <div style={{ paddingTop: 2 }}>
                          <Avatar user={user} size={20} fontSize={9} />
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 6px', alignItems: 'center', flex: 1 }}>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 13, flexShrink: 0 }}>{getUserName(user)}</span>
                          <span style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: '1.4' }}>
                            {act.text}
                            {task && <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}> "{task.title}"</span>}
                            {targetUser && <span style={{ color: 'var(--text-muted)' }}> → {getUserName(targetUser)}</span>}
                          </span>
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, paddingTop: 4 }}>{timeAgo(act.time)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
