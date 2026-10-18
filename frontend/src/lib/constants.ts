/**
 * SmartCampus AI — Shared Constants, Types, and Configurations
 */

// User Roles
export type UserRole = 'STUDENT' | 'STAFF' | 'DEPARTMENT_HEAD' | 'ADMIN' | 'MANAGEMENT';

export const UserRole = {
  STUDENT: 'STUDENT',
  STAFF: 'STAFF',
  DEPARTMENT_HEAD: 'DEPARTMENT_HEAD',
  ADMIN: 'ADMIN',
  MANAGEMENT: 'MANAGEMENT',
} as const;

// Friendly display labels for user roles
export const ROLE_LABELS: Record<UserRole, string> = {
  STUDENT: 'Student',
  STAFF: 'Staff / Technician',
  DEPARTMENT_HEAD: 'Department Head',
  ADMIN: 'System Administrator',
  MANAGEMENT: 'Executive Management',
};

// Ticket Lifecycle Statuses
export type TicketStatus =
  | 'SUBMITTED'
  | 'AI_PROCESSED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'PENDING_INFO'
  | 'RESOLVED'
  | 'CLOSED'
  | 'ESCALATED';

export const TicketStatus = {
  SUBMITTED: 'SUBMITTED',
  AI_PROCESSED: 'AI_PROCESSED',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  PENDING_INFO: 'PENDING_INFO',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  ESCALATED: 'ESCALATED',
} as const;

// Ticket Priority Levels
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export const TicketPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

// SLA Tracking Statuses
export type SLAStatus = 'ON_TRACK' | 'AT_RISK' | 'BREACHED' | 'MET';

export const SLAStatus = {
  ON_TRACK: 'ON_TRACK',
  AT_RISK: 'AT_RISK',
  BREACHED: 'BREACHED',
  MET: 'MET',
} as const;

// UI Configuration for Priority Badges
export const PRIORITY_CONFIG: Record<
  TicketPriority,
  { label: string; color: string; badgeColor?: string }
> = {
  CRITICAL: {
    label: 'Critical Priority',
    color: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    badgeColor: 'bg-rose-500 text-white',
  },
  HIGH: {
    label: 'High Priority',
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    badgeColor: 'bg-amber-500 text-white',
  },
  MEDIUM: {
    label: 'Medium Priority',
    color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    badgeColor: 'bg-indigo-500 text-white',
  },
  LOW: {
    label: 'Low Priority',
    color: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    badgeColor: 'bg-slate-500 text-white',
  },
};

// UI Configuration for SLA Status Badges
export const SLA_STATUS_CONFIG: Record<
  SLAStatus,
  { label: string; color: string }
> = {
  ON_TRACK: {
    label: 'SLA On Track',
    color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
  },
  AT_RISK: {
    label: 'SLA At Risk',
    color: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
  },
  BREACHED: {
    label: 'SLA Breached',
    color: 'text-rose-400 bg-rose-950/60 border-rose-800/60',
  },
  MET: {
    label: 'SLA Met',
    color: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60',
  },
};
