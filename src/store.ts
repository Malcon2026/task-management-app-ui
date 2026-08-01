import { Task, User, Activity } from './types';

export const AVATAR_COLORS = ['avatar-a', 'avatar-b', 'avatar-c'];

// Strictly the 3 authorized production user accounts for Malconnexus
export const INITIAL_USERS: User[] = [
  { id: 1, fname: 'Admin', lname: 'User', email: 'admin@malconnexus.com', role: 'admin', dept: 'Management', status: 'online', avatarClass: 'avatar-a' },
  { id: 2, fname: 'Preetam', lname: '', email: 'preetam@malconnexus.com', role: 'manager', dept: 'Engineering', status: 'online', avatarClass: 'avatar-b' },
  { id: 3, fname: 'Staff', lname: 'Member', email: 'staff@malconnexus.com', role: 'member', dept: 'Operations', status: 'away', avatarClass: 'avatar-c' },
];

// Clean zero fake tasks
export const INITIAL_TASKS: Task[] = [];

// Clean zero fake activities
export const INITIAL_ACTIVITIES: Activity[] = [];
