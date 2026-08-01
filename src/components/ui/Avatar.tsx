import { User } from '../../types';
import { getInitials } from '../../utils/helpers';

interface AvatarProps {
  user: User;
  size?: number;
  fontSize?: number;
}

export function Avatar({ user, size = 24, fontSize = 10 }: AvatarProps) {
  return (
    <div
      className={user.avatarClass || 'avatar-a'}
      style={{
        width: size, height: size,
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#ffffff',
        fontSize, fontWeight: 600,
        flexShrink: 0,
        lineHeight: 1,
      }}
    >
      {getInitials(user)}
    </div>
  );
}
