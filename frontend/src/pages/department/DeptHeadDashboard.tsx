import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Users,
  Clock,
  AlertTriangle,
  Flame,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { PRIORITY_CONFIG, SLA_STATUS_CONFIG } from '../../lib/constants';

interface DeptTicket {
  id: string;
  ticketNumber: string;
  title: string;
  category: string;
  location: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED';
  slaStatus: 'ON_TRACK' | 'AT_RISK' | 'BREACHED' | 'MET';
  assignedStaffId?: string;
  assignedStaffName?: string;
  slaDeadline: string;
  createdAt: string;
  isEscalated?: boolean;
}

interface StaffMember {
  id: string;
  name: string;
  activeCount: number;
  specialty: string;
}

export const DeptHeadDashboard: React.FC = () => {
  const { user } = useAuth();

  const [staffMembers] = useState<StaffMember[]>([
    { id: 'st-1', name: 'Vikram Joshi', activeCount: 3, specialty: 'Network & Routing' },
    { id: 'st-2', name: 'Ananya Roy', activeCount: 1, specialty: 'Audio-Visual & Smart Class' },
    { id: 'st-3', name: 'Devendra Singhania', activeCount: 4, specialty: 'Hardware & Workstations' },
  ]);

  const [tickets, setTickets] = useState<DeptTicket[]>([
    {
      id: '1',
      ticketNumber: 'TCK-2026-0001',
      title: 'Water leakage and low pressure in 3rd floor washroom',
      category: 'Plumbing & Facilities',
      location: 'Hostel Block C, Floor 3',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      slaStatus: 'ON_TRACK',
      assignedStaffId: 'st-1',
      assignedStaffName: 'Vikram Joshi',
      slaDeadline: '5 hours remaining',
      createdAt: 'Today, 08:30 AM',
    },
    {
      id: '2',
      ticketNumber: 'TCK-2026-0006',
      title: 'Main water pump motor overheated causing supply cutoff',
      category: 'Critical Infrastructure',
      location: 'Pump House, Hostel Quad 2',
      priority: 'CRITICAL',
      status: 'ASSIGNED',
      slaStatus: 'AT_RISK',
      assignedStaffId: 'st-3',
      assignedStaffName: 'Devendra Singhania',
      slaDeadline: '45 mins remaining (SLA At Risk)',
      createdAt: 'Today, 09:15 AM',
      isEscalated: false,
    },
    {
      id: '3',
      ticketNumber: 'TCK-2026-0007',
      title: 'Geyser thermostat malfunctioning in Room 304',
      category: 'Electrical & Appliances',
      location: 'Hostel Block B, Room 304',
      priority: 'MEDIUM',
      status: 'NEW',
      slaStatus: 'ON_TRACK',
      slaDeadline: '22 hours remaining',
      createdAt: 'Today, 11:00 AM',
    },
    {
      id: '4',
      ticketNumber: 'TCK-2026-0008',
      title: 'Water dispenser cooling compressor failure',
      category: 'Facilities Maintenance',
      location: 'Dining Hall Floor 1',
      priority: 'HIGH',
      status: 'ESCALATED',
      slaStatus: 'BREACHED',
      assignedStaffId: 'st-1',
      assignedStaffName: 'Vikram Joshi',
      slaDeadline: 'Breached by 2 hours',
      createdAt: 'Yesterday, 04:00 PM',
      isEscalated: true,
    },
  ]);

  const [selectedStaffToAssign, setSelectedStaffToAssign] = useState<{ [ticketId: string]: string }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAssignStaff = (ticketId: string) => {
    const staffId = selectedStaffToAssign[ticketId];
    if (!staffId) return;

    const staff = staffMembers.find((s) => s.id === staffId);
    if (!staff) return;

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            status: t.status === 'NEW' ? 'ASSIGNED' : t.status,
            assignedStaffId: staff.id,
            assignedStaffName: staff.name,
          };
        }
        return t;
      })
    );

    setSuccessMessage(`Assigned ticket to ${staff.name} successfully.`);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleEscalateTicket = (ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            status: 'ESCALATED',
            isEscalated: true,
            slaStatus: 'BREACHED',
          };
        }
        return t;
      })
    );

    setSuccessMessage(`Priority ticket escalated to Senior Campus Administration.`);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const departmentName = user?.department_name || 'Hostel Administration & Facilities';

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-amber-950/40 via-slate-900/70 to-slate-900 p-6 sm:p-8 backdrop-blur shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20 mb-3">
              <ShieldCheck className="h-3.5 w-3.5" /> Department Command Center
            </div>
            <h1 className="text-3xl font-extrabold text-white font-heading">
              {departmentName}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Department Head: <span className="text-amber-300 font-semibold">{user?.name}</span> • Supervise ticket routing, SLA compliance, emergency escalations, and staff workloads.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-2 text-center">
              <div className="text-xl font-bold text-amber-400">92.4%</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">SLA Met Rate</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-2 text-center">
              <div className="text-xl font-bold text-rose-400">
                {tickets.filter((t) => t.slaStatus === 'BREACHED' || t.isEscalated).length}
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Escalated / Breached</div>
            </div>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-xs font-semibold text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Department KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Department Total</span>
            <Users className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{tickets.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Active complaints in queue</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">SLA At Risk</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-2">
            {tickets.filter((t) => t.slaStatus === 'AT_RISK').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Within 25% of SLA threshold</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Staff on Duty</span>
            <UserCheck className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{staffMembers.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Ready for ticket assignment</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Mean Turnaround (MTTR)</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">3.8 hrs</div>
          <div className="text-[11px] text-slate-500 mt-1">Campus benchmark: 6.0 hrs</div>
        </div>
      </div>

      {/* Tickets Queue with Staff Assignment & Escalation Control */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white font-heading">
              Department Tickets & Dispatch Management
            </h2>
            <p className="text-xs text-slate-400">
              Assign field staff, monitor SLA timelines, or trigger emergency management escalation.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            {tickets.length} Active Tickets
          </span>
        </div>

        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className={`rounded-2xl border p-5 transition space-y-4 ${
                ticket.isEscalated
                  ? 'border-rose-500/50 bg-rose-950/20'
                  : ticket.slaStatus === 'AT_RISK'
                  ? 'border-amber-500/40 bg-amber-950/15'
                  : 'border-slate-800/80 bg-slate-950/50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono font-bold text-amber-400">{ticket.ticketNumber}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">{ticket.category}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-500">{ticket.location}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${PRIORITY_CONFIG[ticket.priority].color}`}>
                    {ticket.priority} PRIORITY
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${SLA_STATUS_CONFIG[ticket.slaStatus].color}`}>
                    {ticket.status}
                  </span>
                  {ticket.isEscalated && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-rose-500/30 bg-rose-500/20 text-rose-300 flex items-center gap-1">
                      <Flame className="h-3 w-3" /> ESCALATED
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold text-white">{ticket.title}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  <span>SLA Countdown: <strong className="text-slate-200">{ticket.slaDeadline}</strong></span>
                </div>
              </div>

              {/* Assignment & Escalation Row */}
              <div className="pt-3 border-t border-slate-800/70 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                {/* Staff Assignment Control */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-slate-400 font-semibold">Assigned Specialist:</span>
                  {ticket.assignedStaffName ? (
                    <span className="px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-medium">
                      {ticket.assignedStaffName}
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-400 font-medium">
                      Unassigned
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedStaffToAssign[ticket.id] || ''}
                      onChange={(e) =>
                        setSelectedStaffToAssign({ ...selectedStaffToAssign, [ticket.id]: e.target.value })
                      }
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                    >
                      <option value="">Select staff...</option>
                      {staffMembers.map((staff) => (
                        <option key={staff.id} value={staff.id}>
                          {staff.name} ({staff.activeCount} active tasks)
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAssignStaff(ticket.id)}
                      disabled={!selectedStaffToAssign[ticket.id]}
                      className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-sm transition disabled:opacity-40"
                    >
                      {ticket.assignedStaffName ? 'Reassign' : 'Assign'}
                    </button>
                  </div>
                </div>

                {/* Escalation Button */}
                {!ticket.isEscalated && (
                  <button
                    onClick={() => handleEscalateTicket(ticket.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold hover:bg-rose-500/20 transition self-start md:self-auto"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Trigger Escalation</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
