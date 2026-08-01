import { useApp } from '../../context/AppContext';
import { Avatar } from '../ui/Avatar';
import { getUserName } from '../../utils/helpers';
import { IconPlus, IconUser } from '../ui/Icons';

interface UsersProps {
  onAddUser: () => void;
  onViewTasks: (userId: number) => void;
}

export function Users({ onAddUser, onViewTasks }: UsersProps) {
  const { users, tasks } = useApp();

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 20px' }}>

        {/* Header */}
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>Team Members</h1>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{users.length} active team members</p>
          </div>
          <button
            onClick={onAddUser}
            style={{
              padding: '6px 12px', borderRadius: 6,
              background: 'var(--accent)', color: '#fff', border: 'none',
              fontSize: 12, fontWeight: 500, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <IconPlus size={14} />
            <span>Add Member</span>
          </button>
        </div>

        {/* Members Table */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 8, overflow: 'hidden',
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 120px 100px 80px',
            padding: '10px 16px', borderBottom: '1px solid var(--border)',
            fontSize: 11, color: 'var(--text-muted)', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>
            <span>Member</span>
            <span>Department</span>
            <span>Role</span>
            <span style={{ textAlign: 'right' }}>Open Issues</span>
          </div>

          {/* Rows */}
          {users.map(u => {
            const openTasks = tasks.filter(t => t.assignedTo === u.id && !t.completed).length;
            const totalTasks = tasks.filter(t => t.assignedTo === u.id).length;
            return (
              <div
                key={u.id}
                onClick={() => onViewTasks(u.id)}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 120px 100px 80px',
                  padding: '12px 16px', borderBottom: '1px solid var(--border)',
                  cursor: 'pointer', transition: 'background 0.08s',
                  alignItems: 'center',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                {/* Name & Email */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar user={u} size={28} fontSize={10} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{getUserName(u)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                  </div>
                </div>

                {/* Dept */}
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{u.dept}</span>

                {/* Role */}
                <div>
                  <span className={`role-${u.role}`} style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 4,
                    fontWeight: 500, textTransform: 'capitalize', display: 'inline-block',
                  }}>{u.role}</span>
                </div>

                {/* Task Count */}
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'right', fontWeight: 500 }}>
                  {openTasks} / {totalTasks}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
