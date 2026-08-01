export type Priority = 'high' | 'medium' | 'low';
export type Status = 'todo' | 'inprogress' | 'review' | 'done';
export type Quadrant = 'q1' | 'q2' | 'q3' | 'q4';
export type Tag = 'work' | 'personal' | 'dev' | 'design' | 'review' | 'urgent';
export type UserRole = 'admin' | 'manager' | 'member' | 'viewer';
export type UserStatus = 'online' | 'away' | 'offline';
export type ActivityType = 'create' | 'update' | 'complete' | 'delete' | 'assign' | 'comment';
export type View = 'dashboard' | 'todo' | 'matrix' | 'kanban' | 'activity' | 'users';
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Task {
  id: number;
  title: string;
  desc: string;
  priority: Priority;
  status: Status;
  tag: Tag;
  quadrant: Quadrant;
  due: string;
  assignedTo: number;
  completed: boolean;
  createdAt: number;
}

export interface User {
  id: number;
  fname: string;
  lname: string;
  email: string;
  role: UserRole;
  dept: string;
  status: UserStatus;
  avatarClass: string;
}

export interface Activity {
  id: number;
  type: ActivityType;
  userId: number;
  taskId: number | null;
  text: string;
  targetUserId?: number | null;
  time: number;
}

export interface Toast {
  id: number;
  msg: string;
  type: ToastType;
}
