import { useApp } from '../../context/AppContext';
import { Avatar } from '../ui/Avatar';
import { getUserName } from '../../utils/helpers';

interface UsersProps {
  onAddUser: () => void;
  onViewTasks: (userId: number) => void;
}

export function Users({ onAddUser, onViewTasks }: UsersProps) {
  const { users, tasks } = useApp();

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>Members</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{users.length} team members</p>
          </div>
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
            padding: '8px 16px', borderBottom: '1px solid var(--border)',
            fontSize: 11, color: 'var(--text-muted)', fontWeight: 500,
            textTransform: 'uppercase', letterSpacing: '0.03em',
          }}>
            <span>Name</span>
            <span>Department</span>
            <span>Role</span>
            <span style={{ textAlign: 'right' }}>Issues</span>
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
                  padding: '10px 16px',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'pointer', transition: 'background 0.08s',
                  alignItems: 'center',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                {/* Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar user={u} size={24} fontSize={10} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{getUserName(u)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                  </div>
                </div>

                {/* Dept */}
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{u.dept}</span>

                {/* Role */}
                <span className={`role-${u.role}`} style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 4,
                  fontWeight: 500, display: 'inline-block', width: 'fit-content',
                }}>{u.role}</span>

                {/* Task Count */}
                <span style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'right' }}>
                  {openTasks}/{totalTasks}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
