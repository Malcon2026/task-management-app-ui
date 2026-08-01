import { User } from '../types';

export function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function isOverdue(dateStr: string): boolean {
  if (!dateStr) return false;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + 'T00:00:00');
  return d < today;
}

export function isToday(dateStr: string): boolean {
  if (!dateStr) return false;
  return dateStr === getTodayStr();
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + 'T00:00:00');
  const diff = Math.round((d.getTime() - today.getTime()) / 864e5);
  if (diff < -1) return `${Math.abs(diff)}d overdue`;
  if (diff === -1) return 'Yesterday';
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff < 7) return `In ${diff}d`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${days}d ago`;
}

export function getInitials(user: User): string {
  const f = user.fname ? user.fname[0] : '';
  const l = user.lname ? user.lname[0] : '';
  return (f + l).toUpperCase() || 'U';
}

export function getUserName(user: User): string {
  return `${user.fname}${user.lname ? ' ' + user.lname : ''}`.trim();
}

export function getPriorityOrder(p: string): number {
  return ({ high: 0, medium: 1, low: 2 } as Record<string, number>)[p] ?? 1;
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
