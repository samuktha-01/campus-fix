import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Wrench,
  Clock,
  CheckCircle2,
  MessageSquare,
  UploadCloud,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';
import { PRIORITY_CONFIG, SLA_STATUS_CONFIG } from '../../lib/constants';

interface AssignedTicket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  location: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';
  slaStatus: 'ON_TRACK' | 'AT_RISK' | 'BREACHED' | 'MET';
  deadline: string;
  studentName: string;
  createdAt: string;
  comments: string[];
  resolutionNotes?: string;
  resolutionEvidence?: string;
}

export const StaffDashboard: React.FC = () => {
  const { user } = useAuth();

  const [tickets, setTickets] = useState<AssignedTicket[]>([
    {
      id: '1',
      ticketNumber: 'TCK-2026-0002',
      title: 'Academic Block B Wi-Fi Access Point Frequent Disconnection',
      description: 'Access Point AP-B-04 drops connection every 5 minutes during lectures.',
      category: 'IT Infrastructure',
      location: 'Academic Block B, Room 204',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      slaStatus: 'ON_TRACK',
      deadline: '4 hours remaining',
      studentName: 'Rohan Sharma',
      createdAt: 'Today, 08:45 AM',
      comments: ['Rebooted PoE switch port remotely; scheduled on-site antenna check.'],
    },
    {
      id: '2',
      ticketNumber: 'TCK-2026-0005',
      title: 'Projector display flickers and turns pink in Auditorium 1',
      description: 'HDMI transmitter cable seems frayed causing signal loss.',
      category: 'Audio/Visual & IT',
      location: 'Auditorium 1, Main Stage',
      priority: 'CRITICAL',
      status: 'ASSIGNED',
      slaStatus: 'AT_RISK',
      deadline: '1 hour remaining (SLA Alert)',
      studentName: 'Priya Patel',
      createdAt: 'Today, 10:15 AM',
      comments: [],
    },
    {
      id: '3',
      ticketNumber: 'TCK-2026-0003',
      title: 'Lab 3 Ethernet Port E-12 Jack Damaged',
      description: 'RJ45 pin bent and not giving gigabit connection.',
      category: 'Network Support',
      location: 'Computer Lab 3, Desk 12',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      slaStatus: 'MET',
      deadline: 'Resolved ahead of SLA',
      studentName: 'Kunal Verma',
      createdAt: 'Yesterday, 03:00 PM',
      comments: ['Re-crimped RJ45 keystone jack and validated with cable tester.'],
      resolutionNotes: 'Keystone jack replaced with Cat6 module. Fluke network tester confirmed 1000Mbps full duplex.',
      resolutionEvidence: 'cable_test_report_lab3_e12.pdf',
    },
  ]);

  const [selectedTicketId, setSelectedTicketId] = useState<string>('1');
  const [newComment, setNewComment] = useState('');
  const [resolutionNotesInput, setResolutionNotesInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter === 'ALL') return true;
    return t.status === statusFilter;
  });

  const handleUpdateStatus = (newStatus: 'IN_PROGRESS' | 'RESOLVED') => {
    setIsUpdatingStatus(true);
    setTimeout(() => {
      setTickets((prev) =>
        prev.map((t) => {
          if (t.id === selectedTicket.id) {
            return {
              ...t,
              status: newStatus,
              slaStatus: newStatus === 'RESOLVED' ? 'MET' : t.slaStatus,
              deadline: newStatus === 'RESOLVED' ? 'Resolved successfully' : t.deadline,
              resolutionNotes: newStatus === 'RESOLVED' ? (resolutionNotesInput || 'Work completed per standard operating procedure.') : t.resolutionNotes,
              resolutionEvidence: newStatus === 'RESOLVED' ? 'resolution_work_order_signed.jpg' : t.resolutionEvidence,
            };
          }
          return t;
        })
      );
      setIsUpdatingStatus(false);
      setResolutionNotesInput('');
    }, 400);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === selectedTicket.id) {
          return {
            ...t,
            comments: [...t.comments, newComment.trim()],
          };
        }
        return t;
      })
    );
    setNewComment('');
  };

  return (
    <div className="space-y-8">
      {/* Staff Header */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-cyan-950/40 via-slate-900/70 to-slate-900 p-6 sm:p-8 backdrop-blur shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400 border border-cyan-500/20 mb-3">
              <ShieldCheck className="h-3.5 w-3.5" /> Staff Assigned Workbench
            </div>
            <h1 className="text-3xl font-extrabold text-white font-heading">
              Staff Workbench: {user?.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Department: <span className="text-cyan-300 font-semibold">{user?.department_name || 'IT & Technical Services'}</span> • Manage assigned tickets, update work states, and attach resolution proof.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-2 text-center">
              <div className="text-xl font-bold text-cyan-400">{tickets.filter((t) => t.status !== 'RESOLVED').length}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Active Queue</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-2 text-center">
              <div className="text-xl font-bold text-emerald-400">{tickets.filter((t) => t.status === 'RESOLVED').length}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Resolved</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Ticket List, Right Workbench Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ticket List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Wrench className="h-4 w-4 text-cyan-400" />
              <span>Assigned Queue ({filteredTickets.length})</span>
            </h2>
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-[11px]">
              {(['ALL', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition ${
                    statusFilter === filter
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredTickets.map((ticket) => {
              const isSelected = ticket.id === selectedTicket.id;
              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`cursor-pointer rounded-2xl border p-4 transition text-xs space-y-2.5 ${
                    isSelected
                      ? 'border-cyan-500/60 bg-cyan-950/20 shadow-md ring-1 ring-cyan-500/20'
                      : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-cyan-400">{ticket.ticketNumber}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${PRIORITY_CONFIG[ticket.priority].color}`}>
                        {ticket.priority}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${SLA_STATUS_CONFIG[ticket.slaStatus].color}`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-semibold text-white text-sm line-clamp-1">{ticket.title}</h3>

                  <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-800/50">
                    <span className="truncate max-w-[150px]">{ticket.location}</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>{ticket.deadline}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Ticket Execution Panel (7 cols) */}
        {selectedTicket && (
          <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
            {/* Header info */}
            <div className="space-y-3 pb-5 border-b border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-cyan-400">{selectedTicket.ticketNumber}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-400">{selectedTicket.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded text-xs font-bold border ${PRIORITY_CONFIG[selectedTicket.priority].color}`}>
                    {selectedTicket.priority} PRIORITY
                  </span>
                  <span className={`px-2.5 py-1 rounded text-xs font-bold border ${SLA_STATUS_CONFIG[selectedTicket.slaStatus].color}`}>
                    {selectedTicket.status}
                  </span>
                </div>
              </div>

              <h2 className="text-xl font-bold text-white">{selectedTicket.title}</h2>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
                {selectedTicket.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div>
                  <span className="text-slate-500 block">Reported By</span>
                  <span className="font-semibold text-slate-200">{selectedTicket.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Location</span>
                  <span className="font-semibold text-slate-200">{selectedTicket.location}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">SLA Due</span>
                  <span className="font-semibold text-amber-400">{selectedTicket.deadline}</span>
                </div>
              </div>
            </div>

            {/* Status Transition Actions */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Staff Status Control & Resolution Workflow
              </h3>

              <div className="flex flex-wrap items-center gap-3">
                {selectedTicket.status === 'ASSIGNED' && (
                  <button
                    onClick={() => handleUpdateStatus('IN_PROGRESS')}
                    disabled={isUpdatingStatus}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-600/20 transition disabled:opacity-50"
                  >
                    <Clock className="h-4 w-4" />
                    <span>Begin Work (Mark In-Progress)</span>
                  </button>
                )}

                {selectedTicket.status !== 'RESOLVED' && (
                  <div className="w-full space-y-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                    <label className="block text-xs font-semibold text-slate-300">
                      Resolution Evidence & Action Notes (Mandatory for Resolution)
                    </label>
                    <textarea
                      rows={2}
                      value={resolutionNotesInput}
                      onChange={(e) => setResolutionNotesInput(e.target.value)}
                      placeholder="Describe the physical repair or configuration changes performed..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 border border-slate-800 rounded-lg px-3 py-1.5 bg-slate-900 transition"
                      >
                        <UploadCloud className="h-4 w-4 text-cyan-400" />
                        <span>Upload Photo / Evidence Receipt</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus('RESOLVED')}
                        disabled={isUpdatingStatus}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Mark Ticket Resolved & Close SLA</span>
                      </button>
                    </div>
                  </div>
                )}

                {selectedTicket.status === 'RESOLVED' && (
                  <div className="w-full p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <FileCheck className="h-4 w-4" />
                      <span>Ticket Verified Resolved</span>
                    </div>
                    {selectedTicket.resolutionNotes && (
                      <p className="text-slate-300">
                        <strong className="text-slate-400">Resolution Notes: </strong>
                        {selectedTicket.resolutionNotes}
                      </p>
                    )}
                    {selectedTicket.resolutionEvidence && (
                      <div className="text-[11px] text-emerald-300 font-mono">
                        Evidence file attached: {selectedTicket.resolutionEvidence}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Internal Staff Comments / Logs */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-cyan-400" />
                <span>Ticket Internal Work Log ({selectedTicket.comments.length})</span>
              </h3>

              <div className="space-y-2">
                {selectedTicket.comments.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No notes logged yet on this ticket.</p>
                ) : (
                  selectedTicket.comments.map((comm, idx) => (
                    <div key={idx} className="rounded-lg bg-slate-950/60 p-3 border border-slate-800/80 text-xs text-slate-300">
                      {comm}
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  placeholder="Add a work log or dispatch update..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  onClick={handleAddComment}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
