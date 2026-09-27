import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Clock,
  Building2,
  Tag,
  Sparkles,
  FileText,
  Activity,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { TicketSubmissionResult } from '../../types';
import { PRIORITY_CONFIG, SLA_STATUS_CONFIG } from '../../lib/constants';

interface SubmissionResultModalProps {
  result: TicketSubmissionResult;
  onViewDetails: (ticketNumber: string) => void;
  onNewComplaint: () => void;
  onGoToMyTickets: () => void;
}

export const SubmissionResultModal: React.FC<SubmissionResultModalProps> = ({
  result,
  onViewDetails,
  onNewComplaint,
  onGoToMyTickets,
}) => {
  const { ticket, duplicate_warning, ai_insights } = result;
  const [copied, setCopied] = useState(false);

  const copyTicketNumber = () => {
    navigator.clipboard.writeText(ticket.ticket_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const priorityStyle = PRIORITY_CONFIG[ticket.priority] || {
    label: ticket.priority,
    color: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  const slaStatus = ticket.sla_tracking?.sla_status || 'ON_TRACK';
  const slaStyle = SLA_STATUS_CONFIG[slaStatus] || {
    label: slaStatus,
    color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Decorative gradient accents */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Success Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold mb-1">
              Complaint Logged Successfully
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight font-heading">
              Ticket Generated & AI Dispatched
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              The 11-step complaint workflow analyzed your issue, assigned a department, and calculated SLA.
            </p>
          </div>
        </div>

        {/* Ticket Number Badge with Copy */}
        <div className="bg-slate-950/90 border border-indigo-500/30 rounded-2xl p-3 flex items-center justify-between sm:justify-start gap-4 shadow-lg shrink-0">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Ticket Number
            </span>
            <span className="text-lg font-black font-mono text-indigo-300">
              {ticket.ticket_number}
            </span>
          </div>
          <button
            onClick={copyTicketNumber}
            className="p-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 transition flex items-center gap-1 text-xs"
            title="Copy ticket number"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-400 text-[11px] font-bold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Duplicate Warning Alert Banner (if applicable) */}
      {(duplicate_warning || (ticket.duplicate_matches && ticket.duplicate_matches.length > 0)) && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            <span>Possible Duplicate Warning Detected</span>
          </div>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            {duplicate_warning ||
              `Similar issues exist in our database. Our system identified potential overlap with existing reports.`}
          </p>
          {ticket.duplicate_matches && ticket.duplicate_matches.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-2">
              {ticket.duplicate_matches.map((match) => (
                <div
                  key={match.matched_ticket_id}
                  className="px-3 py-1.5 rounded-xl bg-amber-900/30 border border-amber-700/50 flex items-center gap-2 text-[11px]"
                >
                  <span className="font-mono font-bold text-amber-300">#{match.matched_ticket_number}</span>
                  <span className="text-slate-400 truncate max-w-[200px]">{match.matched_title}</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                    {Math.round(match.similarity_score * 100)}% match
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Primary Attributes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Category & Subcategory */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
            <Tag className="h-4 w-4 text-indigo-400" />
            <span>Category</span>
          </div>
          <div className="text-sm font-bold text-white">
            {ticket.category}
          </div>
          {ticket.subcategory && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
              <Layers className="h-3 w-3" />
              <span>{ticket.subcategory}</span>
            </div>
          )}
        </div>

        {/* Probable Department */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
            <Building2 className="h-4 w-4 text-cyan-400" />
            <span>Assigned Department</span>
          </div>
          <div className="text-sm font-bold text-white">
            {ticket.department?.name || 'General Campus Maintenance'}
          </div>
          {ticket.department?.contact_email && (
            <div className="text-xs text-slate-400 truncate">
              Contact: {ticket.department.contact_email}
            </div>
          )}
        </div>

        {/* Calculated Priority */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-400" />
              <span>Calculated Priority</span>
            </span>
            {ticket.priority_score && (
              <span className="text-[10px] text-slate-500 font-mono">
                Score: {ticket.priority_score.toFixed(1)}/100
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-black border ${priorityStyle.color}`}>
              {ticket.priority} PRIORITY
            </span>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${slaStyle.color}`}>
              {ticket.status}
            </span>
          </div>
        </div>

        {/* SLA Deadline Target */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2 sm:col-span-2 lg:col-span-2">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
            <Clock className="h-4 w-4 text-emerald-400" />
            <span>SLA Resolution Target Deadline</span>
          </div>
          <div className="text-base font-extrabold text-white">
            {ticket.sla_tracking?.formatted_resolution_deadline || 'Within standard SLA duration'}
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>Remaining:</span>
            <span className="font-bold text-emerald-400">
              {ticket.sla_tracking?.time_remaining_hours !== undefined
                ? `${ticket.sla_tracking.time_remaining_hours} hours left`
                : 'On Track'}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Status: {ticket.sla_tracking?.sla_status || 'ON_TRACK'}</span>
          </div>
        </div>

        {/* Current Status */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
            <FileText className="h-4 w-4 text-purple-400" />
            <span>Current Status</span>
          </div>
          <div className="text-sm font-extrabold text-indigo-400 font-mono">
            {ticket.status}
          </div>
          <div className="text-[11px] text-slate-500">
            Auto-assigned to queue. Maintenance team notified.
          </div>
        </div>
      </div>

      {/* Priority Factors Scoring Breakdown */}
      {ticket.priority_factors && (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Multi-Factor Priority Scoring Engine</span>
            </span>
            <span className="text-xs font-extrabold text-indigo-400">
              Final Composite Score: {ticket.priority_factors.final_score.toFixed(1)} / 100
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-[11px]">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="block text-slate-400">Safety Hazard</span>
              <span className="font-bold text-white text-xs">{ticket.priority_factors.safety_score} / 5.0</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="block text-slate-400">Severity</span>
              <span className="font-bold text-white text-xs">{ticket.priority_factors.severity_score} / 5.0</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="block text-slate-400">Affected Users</span>
              <span className="font-bold text-white text-xs">{ticket.priority_factors.affected_users_score} / 5.0</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="block text-slate-400">Location Score</span>
              <span className="font-bold text-white text-xs">{ticket.priority_factors.location_score} / 5.0</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="block text-slate-400">SLA Risk</span>
              <span className="font-bold text-white text-xs">{ticket.priority_factors.sla_risk_score} / 5.0</span>
            </div>
          </div>
        </div>
      )}

      {/* AI Reasoning Insight */}
      {ai_insights && (
        <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-900/40 text-xs text-indigo-200/90 space-y-1">
          <div className="font-bold text-indigo-300 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Reasoning (Confidence: {Math.round(ai_insights.confidence * 100)}%)</span>
          </div>
          <p className="text-slate-300">{ai_insights.reasoning}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
        <button
          onClick={onNewComplaint}
          className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
        >
          File Another Complaint
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={onGoToMyTickets}
            className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition"
          >
            My Complaints List
          </button>
          <button
            onClick={() => onViewDetails(ticket.ticket_number)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition"
          >
            <span>View Ticket Details & Timeline</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
