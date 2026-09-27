import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  PlusCircle,
  FileText,
  Clock,
  Paperclip,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Search,
  AlertTriangle,
  AlertCircle,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { ticketApi } from '../../lib/api';
import { Ticket, TicketSubmissionResult } from '../../types';
import { PRIORITY_CONFIG, SLA_STATUS_CONFIG } from '../../lib/constants';
import { ComplaintForm } from '../../components/complaints/ComplaintForm';
import { SubmissionResultModal } from '../../components/complaints/SubmissionResultModal';
import { TicketDetailModal } from '../../components/complaints/TicketDetailModal';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();

  // Tab State
  const [activeTab, setActiveTab] = useState<'my_tickets' | 'new_ticket'>('my_tickets');

  // Real data state
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Submission Result Modal State
  const [submissionResult, setSubmissionResult] = useState<TicketSubmissionResult | null>(null);

  // Detail Modal State
  const [selectedTicketNumber, setSelectedTicketNumber] = useState<string | null>(null);

  // Load student complaints from backend
  const loadMyTickets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ticketApi.getMyTickets();
      setTickets(data);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
        err.response?.data?.detail ||
        'Unable to load your complaints from the server.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMyTickets();
  }, []);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.department?.name && t.department.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'RESOLVED' && (t.status === 'RESOLVED' || t.status === 'CLOSED')) ||
        (statusFilter === 'ACTIVE' && t.status !== 'RESOLVED' && t.status !== 'CLOSED') ||
        t.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchQuery, statusFilter]);

  // Dynamic statistics
  const stats = useMemo(() => {
    const total = tickets.length;
    const active = tickets.filter((t) => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;
    const resolved = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
    const critical = tickets.filter((t) => t.priority === 'CRITICAL').length;
    return { total, active, resolved, critical };
  }, [tickets]);

  // Submission Success Handler
  const handleSubmissionSuccess = (result: TicketSubmissionResult) => {
    setSubmissionResult(result);
    // Refresh tickets list in background
    loadMyTickets();
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-slate-900 p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20 mb-3">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Student Complaint Portal • Verified Session</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white font-heading tracking-tight">
              Welcome back, {user?.name || 'Student'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Submit campus issues, receive automated AI categorization & safety priority, track live SLA countdowns, and stay updated with department engineers.
            </p>
          </div>

          <button
            onClick={() => {
              setSubmissionResult(null);
              setActiveTab('new_ticket');
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition shrink-0"
          >
            <PlusCircle className="h-4 w-4" />
            <span>File New Complaint</span>
          </button>
        </div>

        {/* Dynamic Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3">
            <span className="block text-[11px] font-semibold text-slate-400">Total Logged</span>
            <span className="text-xl font-black text-white">{stats.total}</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3">
            <span className="block text-[11px] font-semibold text-slate-400">In Progress / Active</span>
            <span className="text-xl font-black text-indigo-400">{stats.active}</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3">
            <span className="block text-[11px] font-semibold text-slate-400">Resolved Complaints</span>
            <span className="text-xl font-black text-emerald-400">{stats.resolved}</span>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3">
            <span className="block text-[11px] font-semibold text-slate-400">High / Critical Urgency</span>
            <span className="text-xl font-black text-amber-400">{stats.critical}</span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-800 gap-6">
        <button
          onClick={() => {
            setSubmissionResult(null);
            setActiveTab('my_tickets');
          }}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'my_tickets'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>My Complaints ({tickets.length})</span>
        </button>

        <button
          onClick={() => {
            setSubmissionResult(null);
            setActiveTab('new_ticket');
          }}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'new_ticket'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>AI-Powered Complaint Submission</span>
        </button>
      </div>

      {/* Main Tab View */}
      {activeTab === 'my_tickets' ? (
        <div className="space-y-5">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search complaints by title, ticket #, or location..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                  statusFilter === 'ALL'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                All ({tickets.length})
              </button>
              <button
                onClick={() => setStatusFilter('ACTIVE')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                  statusFilter === 'ACTIVE'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Active ({stats.active})
              </button>
              <button
                onClick={() => setStatusFilter('RESOLVED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                  statusFilter === 'RESOLVED'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Resolved ({stats.resolved})
              </button>
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoading ? (
            <div className="p-12 rounded-3xl border border-slate-800 bg-slate-900/40 text-center flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              <p className="text-xs text-slate-400">Retrieving your complaints from campus database...</p>
            </div>
          ) : error ? (
            <div className="p-8 rounded-3xl border border-rose-800/60 bg-rose-950/30 text-center space-y-3">
              <AlertCircle className="h-8 w-8 text-rose-400 mx-auto" />
              <p className="text-xs text-rose-300">{error}</p>
              <button
                onClick={loadMyTickets}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white font-semibold transition"
              >
                Retry
              </button>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-12 rounded-3xl border border-slate-800 bg-slate-900/30 text-center space-y-4">
              <FileText className="h-10 w-10 text-slate-600 mx-auto" />
              <div>
                <h3 className="text-base font-bold text-white">No complaints found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  {searchQuery || statusFilter !== 'ALL'
                    ? 'No tickets match your search or filter criteria.'
                    : "You haven't filed any complaints yet. Use the button below to submit your first issue."}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('new_ticket')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Submit Complaint</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => {
                const priorityStyle = PRIORITY_CONFIG[ticket.priority] || {
                  label: ticket.priority,
                  color: 'bg-slate-800 text-slate-300 border-slate-700',
                };
                const slaStatus = ticket.sla_tracking?.sla_status || 'ON_TRACK';
                const slaStyle = SLA_STATUS_CONFIG[slaStatus] || {
                  label: slaStatus,
                  color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
                };

                const hasDuplicates = ticket.duplicate_matches && ticket.duplicate_matches.length > 0;

                return (
                  <div
                    key={ticket.id}
                    className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 hover:border-slate-700 transition space-y-4 shadow-lg group"
                  >
                    {/* Top Row: Ticket Number, Department, Location, Priority */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                          {ticket.ticket_number}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-xs font-semibold text-slate-300">
                          {ticket.department?.name || 'General Maintenance'}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-xs text-slate-400">{ticket.location}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {hasDuplicates && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-amber-950/80 text-amber-300 border-amber-800/60 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Duplicate Linked
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${priorityStyle.color}`}>
                          {ticket.priority} PRIORITY
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${slaStyle.color}`}>
                          {ticket.status}
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: Title & SLA Countdown */}
                    <div>
                      <h3
                        onClick={() => setSelectedTicketNumber(ticket.ticket_number)}
                        className="text-base font-bold text-white group-hover:text-indigo-300 transition cursor-pointer"
                      >
                        {ticket.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                        <span>
                          SLA Target:{' '}
                          <strong className="text-slate-200">
                            {ticket.sla_tracking?.formatted_resolution_deadline || 'Standard duration'}
                          </strong>
                        </span>
                        {ticket.sla_tracking?.time_remaining_hours !== undefined && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span className="font-semibold text-emerald-400">
                              {ticket.sla_tracking.time_remaining_hours}h remaining
                            </span>
                          </>
                        )}
                      </p>
                    </div>

                    {/* Bottom Action Row */}
                    <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-4 text-slate-400">
                        <button
                          onClick={() => setSelectedTicketNumber(ticket.ticket_number)}
                          className="flex items-center gap-1.5 hover:text-indigo-300 transition"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>Comments ({ticket.status_history?.length || 0})</span>
                        </button>

                        <button
                          onClick={() => setSelectedTicketNumber(ticket.ticket_number)}
                          className="flex items-center gap-1.5 hover:text-indigo-300 transition"
                        >
                          <Paperclip className="h-3.5 w-3.5" />
                          <span>Attachments ({ticket.attachments?.length || 0})</span>
                        </button>
                      </div>

                      <button
                        onClick={() => setSelectedTicketNumber(ticket.ticket_number)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
                      >
                        <span>View Details</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* New Complaint Tab */
        <div>
          {submissionResult ? (
            /* Show comprehensive result modal after submission */
            <SubmissionResultModal
              result={submissionResult}
              onViewDetails={(ticketNum) => {
                setSubmissionResult(null);
                setSelectedTicketNumber(ticketNum);
              }}
              onNewComplaint={() => setSubmissionResult(null)}
              onGoToMyTickets={() => {
                setSubmissionResult(null);
                setActiveTab('my_tickets');
              }}
            />
          ) : (
            /* Clean complaint form */
            <ComplaintForm
              onSuccess={handleSubmissionSuccess}
              onCancel={() => setActiveTab('my_tickets')}
            />
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedTicketNumber && (
        <TicketDetailModal
          ticketNumber={selectedTicketNumber}
          onClose={() => setSelectedTicketNumber(null)}
          onTicketUpdated={loadMyTickets}
        />
      )}
    </div>
  );
};
