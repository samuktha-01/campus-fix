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
  code?: string;
  description?: string;
  contact_email?: string;
  headId?: string;
  isActive?: boolean;
}

export interface PriorityFactors {
  severity_score: number;
  affected_users_score: number;
  safety_score: number;
  location_score: number;
  recurrence_score: number;
  sla_risk_score: number;
  final_score: number;
  created_at?: string;
}

export interface SLATracking {
  response_deadline: string;
  resolution_deadline: string;
  response_completed_at?: string | null;
  resolution_completed_at?: string | null;
  sla_status: SLAStatus;
  escalation_level: number;
  time_remaining_hours?: number;
  is_breached?: boolean;
  formatted_resolution_deadline?: string;
}

export interface DuplicateMatch {
  matched_ticket_id: string;
  matched_ticket_number: string;
  matched_title: string;
  matched_status: string;
  matched_location?: string;
  similarity_score: number;
  relationship_type: string;
  created_at: string;
}

export interface TicketAttachment {
  id: string;
  file_url: string;
  file_type: string;
  created_at: string;
}

export interface TicketStatusHistory {
  id: string;
  old_status: string;
  new_status: string;
  changed_by?: string;
  actor_name?: string;
  actor_role?: string;
  comment?: string;
  created_at: string;
}

export interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string | null;
  location: string;
  priority: TicketPriority;
  priority_score?: number | null;
  status: TicketStatus;
  created_by: string;
  creator_name?: string;
  creator_email?: string;
  assigned_department?: string | null;
  department?: Department | null;
  assigned_staff?: string | null;
  assigned_staff_name?: string | null;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
  closed_at?: string | null;

  // Rich AI & SLA metadata
  priority_factors?: PriorityFactors | null;
  sla_tracking?: SLATracking | null;
  duplicate_matches?: DuplicateMatch[];
  attachments?: TicketAttachment[];
  status_history?: TicketStatusHistory[];
}

export interface AIInsights {
  confidence: number;
  reasoning: string;
  is_emergency: boolean;
  detected_department: string;
  suggested_category: string;
  suggested_subcategory: string;
}

export interface TicketSubmissionResult {
  success: boolean;
  message: string;
  ticket: Ticket;
  duplicate_warning?: string | null;
  ai_insights?: AIInsights | null;
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
