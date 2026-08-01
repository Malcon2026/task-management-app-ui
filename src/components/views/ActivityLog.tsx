import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Avatar } from '../ui/Avatar';
import { timeAgo, getUserName } from '../../utils/helpers';
import { IconSearch, IconTrash, IconPlus, IconActivity } from '../ui/Icons';
import type { ActivityType } from '../../types';

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  create: { label: 'Created', color: 'var(--green)' },
  update: { label: 'Updated', color: 'var(--blue)' },
  complete: { label: 'Completed', color: 'var(--accent)' },
  delete: { label: 'Deleted', color: 'var(--red)' },
  assign: { label: 'Assigned', color: 'var(--yellow)' },
  comment: { label: 'Note', color: 'var(--purple)' },
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header Bar */}
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
            borderRadius: 6, padding: '3px 8px', width: 140,
          }}>
            <IconSearch size={12} color="var(--text-muted)" />
            <input
              type="text" value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
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
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--red)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(229,72,77,0.3)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
          >
            <IconTrash size={12} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Post Note */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 20px', background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
      }}>
        <IconActivity size={14} color="var(--text-muted)" />
        <input
          type="text" value={noteText}
          onChange={e => setNoteText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && postNote()}
          placeholder="Post a status note or update to the team timeline..."
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
        >Post Note</button>
      </div>

      {/* Activity List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 && (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No activity logged
          </div>
        )}
        {filtered.map(act => {
          const user = users.find(u => u.id === act.userId);
          const task = tasks.find(t => t.id === act.taskId);
          const targetUser = act.targetUserId ? users.find(u => u.id === act.targetUserId) : null;
          const typeInfo = TYPE_LABELS[act.type] || TYPE_LABELS.comment;
          if (!user) return null;

          return (
            <div
              key={act.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 20px',
                borderBottom: '1px solid var(--border)',
                fontSize: 13, transition: 'background 0.08s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              {/* Type dot */}
              <div style={{
                width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                background: typeInfo.color,
              }} />

              {/* Avatar */}
              <Avatar user={user} size={22} fontSize={9} />

              {/* Content */}
              <div style={{ flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{getUserName(user)}</span>
                {' '}
                <span style={{ color: 'var(--text-secondary)' }}>{act.text}</span>
                {task && <span style={{ color: 'var(--accent)', fontWeight: 500 }}> "{task.title}"</span>}
                {targetUser && <span style={{ color: 'var(--text-muted)' }}> → {getUserName(targetUser)}</span>}
              </div>

              {/* Type badge */}
              <span style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 500,
                background: `color-mix(in srgb, ${typeInfo.color} 12%, transparent)`,
                color: typeInfo.color, flexShrink: 0,
              }}>{typeInfo.label}</span>

              {/* Time */}
              <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{timeAgo(act.time)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
