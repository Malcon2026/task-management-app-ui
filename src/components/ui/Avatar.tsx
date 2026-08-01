import { User } from '../../types';
import { getInitials } from '../../utils/helpers';

interface AvatarProps {
  user: User;
  size?: number;
  fontSize?: number;
  className?: string;
}

export function Avatar({ user, size = 28, fontSize = 11, className = '' }: AvatarProps) {
  return (
    <div
      className={`${user.avatarClass} ${className}`}
      style={{
        width: size, height: size, borderRadius: '50%',
        fontSize, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#0a0a0a', flexShrink: 0,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
      }}
    >
      {getInitials(user)}
    </div>
  );
}
