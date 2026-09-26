import { UserRole, TicketStatus, TicketPriority, SLAStatus } from '../lib/constants';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  departmentId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  headId?: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  departmentId: string;
  name: string;
  description?: string;
  defaultPriority: TicketPriority;
  defaultSlaHours: number;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  studentId: string;
  departmentId: string;
  categoryId: string;
  title: string;
  description: string;
  location: string;
  status: TicketStatus;
  priority: TicketPriority;
  aiCategoryConfidence?: number;
  aiPriorityExplanation?: string;
  isDuplicate: boolean;
  parentTicketId?: string;
  duplicateSimilarityScore?: number;
  assignedStaffId?: string;
  slaTargetHours: number;
  slaDueAt: string;
  slaStatus: SLAStatus;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketActivity {
  id: string;
  ticketId: string;
  actorId: string;
  action: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  note?: string;
  createdAt: string;
}

export interface StudentFeedback {
  id: string;
  ticketId: string;
  studentId: string;
  rating: number; // 1-5
  satisfaction: 'VERY_SATISFIED' | 'SATISFIED' | 'NEUTRAL' | 'DISSATISFIED';
  comments?: string;
  createdAt: string;
}
