import React from 'react';

type IconProps = { size?: number; color?: string; className?: string };

const svg = (d: string, props: IconProps, viewBox = '0 0 24 24') => (
  <svg width={props.size || 16} height={props.size || 16} viewBox={viewBox} fill="none" stroke={props.color || 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d={d} />
  </svg>
);

// Navigation
export const IconDashboard = (p: IconProps = {}) => (
  <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="4" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="11" width="7" height="10" rx="1" />
  </svg>
);
export const IconIssues = (p: IconProps = {}) => (
  <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><path d="M12 8v4l2.5 2.5" />
  </svg>
);
export const IconBoard = (p: IconProps = {}) => (
  <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="5" height="18" rx="1" /><rect x="10" y="3" width="5" height="12" rx="1" /><rect x="17" y="3" width="5" height="15" rx="1" />
  </svg>
);
export const IconMatrix = (p: IconProps = {}) => (
  <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="8" rx="1" /><rect x="3" y="13" width="8" height="8" rx="1" /><rect x="13" y="13" width="8" height="8" rx="1" />
  </svg>
);
export const IconActivity = (p: IconProps = {}) => (
  <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
export const IconMembers = (p: IconProps = {}) => (
  <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
export const IconUsers = IconMembers;

// Actions
export const IconPlus = (p: IconProps = {}) => svg('M12 5v14M5 12h14', p);
export const IconSearch = (p: IconProps = {}) => (
  <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
export const IconFilter = (p: IconProps = {}) => (
  <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
export const IconEdit = (p: IconProps = {}) => (
  <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
export const IconTrash = (p: IconProps = {}) => (
  <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);
export const IconCheck = (p: IconProps = {}) => svg('M20 6L9 17l-5-5', p);
export const IconX = (p: IconProps = {}) => svg('M18 6L6 18M6 6l12 12', p);
export const IconChevronDown = (p: IconProps = {}) => svg('M6 9l6 6 6-6', p);
export const IconChevronRight = (p: IconProps = {}) => svg('M9 18l6-6-6-6', p);
export const IconLogout = (p: IconProps = {}) => (
  <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
export const IconBell = (p: IconProps = {}) => (
  <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
export const IconCalendar = (p: IconProps = {}) => (
  <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
export const IconClock = (p: IconProps = {}) => (
  <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
export const IconStar = (p: IconProps = {}) => (
  <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
export const IconArrowRight = (p: IconProps = {}) => svg('M5 12h14M12 5l7 7-7 7', p);
export const IconUser = (p: IconProps = {}) => (
  <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
export const IconAlertCircle = (p: IconProps = {}) => (
  <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
export const IconZap = (p: IconProps = {}) => svg('M13 2L3 14h9l-1 10 10-12h-9l1-10', p);
export const IconTarget = (p: IconProps = {}) => (
  <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
);
export const IconTrendingUp = (p: IconProps = {}) => (
  <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </svg>
);
export const IconMenu = (p: IconProps = {}) => (
  <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
export const IconMessageCircle = (p: IconProps = {}) => (
  <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke={p.color||'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

// Status circles (filled SVGs)
export const StatusTodo = (p: IconProps = {}) => (
  <svg width={p.size||14} height={p.size||14} viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6.5" stroke={p.color || 'var(--text-muted)'} strokeWidth="1.5" />
  </svg>
);
export const StatusInProgress = (p: IconProps = {}) => (
  <svg width={p.size||14} height={p.size||14} viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6.5" stroke={p.color || 'var(--yellow)'} strokeWidth="1.5" />
    <path d="M8 1.5A6.5 6.5 0 0 1 14.5 8" fill={p.color || 'var(--yellow)'} stroke="none" />
    <path d="M8 1.5A6.5 6.5 0 0 1 14.5 8H8V1.5Z" fill={p.color || 'var(--yellow)'} stroke="none" />
  </svg>
);
export const StatusReview = (p: IconProps = {}) => (
  <svg width={p.size||14} height={p.size||14} viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6.5" stroke={p.color || 'var(--blue)'} strokeWidth="1.5" />
    <path d="M8 1.5A6.5 6.5 0 0 0 1.5 8A6.5 6.5 0 0 0 8 14.5V1.5Z" fill={p.color || 'var(--blue)'} stroke="none" />
  </svg>
);
export const StatusDone = (p: IconProps = {}) => (
  <svg width={p.size||14} height={p.size||14} viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7" fill={p.color || 'var(--accent)'} />
    <path d="M5.5 8L7.2 9.7L10.5 6.3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Priority bars
export const PriorityUrgent = (p: IconProps = {}) => (
  <svg width={p.size||14} height={p.size||14} viewBox="0 0 16 16" fill="none">
    <rect x="1" y="2" width="3" height="12" rx="1" fill={p.color || 'var(--orange)'} />
    <rect x="6" y="2" width="3" height="12" rx="1" fill={p.color || 'var(--orange)'} />
    <rect x="11" y="2" width="3" height="12" rx="1" fill={p.color || 'var(--orange)'} />
  </svg>
);
export const PriorityHigh = (p: IconProps = {}) => (
  <svg width={p.size||14} height={p.size||14} viewBox="0 0 16 16" fill="none">
    <rect x="1" y="6" width="3" height="8" rx="1" fill={p.color || 'var(--orange)'} />
    <rect x="6" y="3" width="3" height="11" rx="1" fill={p.color || 'var(--orange)'} />
    <rect x="11" y="6" width="3" height="8" rx="1" fill="var(--text-muted)" opacity="0.3" />
  </svg>
);
export const PriorityMedium = (p: IconProps = {}) => (
  <svg width={p.size||14} height={p.size||14} viewBox="0 0 16 16" fill="none">
    <rect x="1" y="8" width="3" height="6" rx="1" fill={p.color || 'var(--yellow)'} />
    <rect x="6" y="5" width="3" height="9" rx="1" fill={p.color || 'var(--yellow)'} />
    <rect x="11" y="8" width="3" height="6" rx="1" fill="var(--text-muted)" opacity="0.3" />
  </svg>
);
export const PriorityLow = (p: IconProps = {}) => (
  <svg width={p.size||14} height={p.size||14} viewBox="0 0 16 16" fill="none">
    <rect x="1" y="10" width="3" height="4" rx="1" fill={p.color || 'var(--blue)'} />
    <rect x="6" y="10" width="3" height="4" rx="1" fill="var(--text-muted)" opacity="0.3" />
    <rect x="11" y="10" width="3" height="4" rx="1" fill="var(--text-muted)" opacity="0.3" />
  </svg>
);
