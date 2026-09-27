import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Building2,
  MapPin,
  AlertTriangle,
  MessageSquare,
  Paperclip,
  Send,
  Loader2,
  Play,
  Sparkles,
} from 'lucide-react';
import { ticketApi } from '../../lib/api';
import { Ticket } from '../../types';
import { PRIORITY_CONFIG, SLA_STATUS_CONFIG } from '../../lib/constants';

interface TicketDetailModalProps {
  ticketNumber: string;
  onClose: () => void;
  onTicketUpdated?: () => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticketNumber,
  onClose,
  onTicketUpdated,
}) => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Comment input
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // File upload state
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchTicket = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ticketApi.getTicketDetails(ticketNumber);
      setTicket(data);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
        err.response?.data?.detail ||
        'Failed to load ticket details.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [ticketNumber]);

  // Add Comment Handler
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !ticket) return;

    setIsSubmittingComment(true);
    try {
      await ticketApi.addComment(ticket.ticket_number, newComment.trim());
      setNewComment('');
      await fetchTicket();
      if (onTicketUpdated) onTicketUpdated();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to post comment.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Upload Additional Attachment Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !ticket) return;

    setIsUploadingFile(true);
    setUploadError(null);
    try {
      await ticketApi.addAttachment(ticket.ticket_number, file);
      await fetchTicket();
      if (onTicketUpdated) onTicketUpdated();
    } catch (err: any) {
      setUploadError(err.response?.data?.error?.message || 'Failed to upload attachment.');
    } finally {
      setIsUploadingFile(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-xs text-slate-400">Loading ticket #{ticketNumber} details...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 max-w-md w-full space-y-4">
          <div className="text-rose-400 font-bold text-sm">Error Loading Ticket</div>
          <p className="text-xs text-slate-300">{error || 'Ticket not found.'}</p>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const priorityStyle = PRIORITY_CONFIG[ticket.priority] || {
    label: ticket.priority,
    color: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  const slaStatus = ticket.sla_tracking?.sla_status || 'ON_TRACK';
  const slaStyle = SLA_STATUS_CONFIG[slaStatus] || {
    label: slaStatus,
    color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
  };

  // Helper to construct full media URL if relative
  const getMediaUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    return `http://localhost:8000${url}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 max-w-4xl w-full shadow-2xl relative my-auto max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="font-mono text-sm font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-lg">
                {ticket.ticket_number}
              </span>
              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black border ${priorityStyle.color}`}>
                {ticket.priority} PRIORITY
              </span>
              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${slaStyle.color}`}>
                {ticket.status}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {ticket.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-500" />
                {ticket.location}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-slate-500" />
                {ticket.department?.name || 'Assigned Department'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto py-5 space-y-6 pr-1 flex-1">
          {/* Duplicate Matches Warning if present */}
          {ticket.duplicate_matches && ticket.duplicate_matches.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <AlertTriangle className="h-4 w-4" />
                <span>Linked Duplicate Complaint Records</span>
              </div>
              <p className="text-[11px] text-amber-300/80">
                This ticket has been matched with previous complaints from the same location.
              </p>
              <div className="space-y-1.5 pt-1">
                {ticket.duplicate_matches.map((match) => (
                  <div
                    key={match.matched_ticket_id}
                    className="p-2.5 rounded-xl bg-amber-900/30 border border-amber-700/40 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-300">#{match.matched_ticket_number}</span>
                      <span className="text-slate-300 font-medium truncate max-w-[280px]">{match.matched_title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-slate-400">{match.matched_status}</span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                        {Math.round(match.similarity_score * 100)}% match
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SLA Tracking Bar */}
          {ticket.sla_tracking && (
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-emerald-400" />
                  <span>SLA Adherence Tracking</span>
                </span>
                <span className="font-bold text-emerald-400">
                  {ticket.sla_tracking.time_remaining_hours !== undefined
                    ? `${ticket.sla_tracking.time_remaining_hours}h Remaining`
                    : 'Target Active'}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Resolution Deadline: <strong className="text-white">{ticket.sla_tracking.formatted_resolution_deadline}</strong>
              </div>
            </div>
          )}

          {/* Description Section */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Issue Description
            </h4>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </div>
          </div>

          {/* Multi-Factor Priority Breakdown */}
          {ticket.priority_factors && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <span>AI Multi-Factor Risk Assessment</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="block text-slate-500">Safety Hazard</span>
                  <span className="font-bold text-white text-xs">{ticket.priority_factors.safety_score} / 5.0</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="block text-slate-500">Severity</span>
                  <span className="font-bold text-white text-xs">{ticket.priority_factors.severity_score} / 5.0</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="block text-slate-500">Affected Users</span>
                  <span className="font-bold text-white text-xs">{ticket.priority_factors.affected_users_score} / 5.0</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="block text-slate-500">Location Score</span>
                  <span className="font-bold text-white text-xs">{ticket.priority_factors.location_score} / 5.0</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="block text-slate-500">Composite Score</span>
                  <span className="font-bold text-indigo-400 text-xs">{ticket.priority_factors.final_score.toFixed(1)} / 100</span>
                </div>
              </div>
            </div>
          )}

          {/* Attachments Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Paperclip className="h-3.5 w-3.5 text-indigo-400" />
                <span>Media Attachments ({ticket.attachments?.length || 0})</span>
              </h4>

              {/* Upload extra attachment */}
              <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploadingFile}
                />
                {isUploadingFile ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <span>+ Add Photo / Video</span>
                  </>
                )}
              </label>
            </div>

            {uploadError && (
              <p className="text-[11px] text-rose-400">{uploadError}</p>
            )}

            {ticket.attachments && ticket.attachments.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ticket.attachments.map((att) => {
                  const isVideo = att.file_type.includes('video');
                  const url = getMediaUrl(att.file_url);

                  return (
                    <div
                      key={att.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950 p-2 overflow-hidden group relative"
                    >
                      {isVideo ? (
                        <div className="w-full h-28 bg-slate-900 rounded-xl flex flex-col items-center justify-center relative">
                          <Play className="h-8 w-8 text-cyan-400" />
                          <span className="text-[10px] text-slate-400 mt-1">Video Attachment</span>
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-xl text-white text-xs font-semibold"
                          >
                            Play Video
                          </a>
                        </div>
                      ) : (
                        <div className="w-full h-28 relative rounded-xl overflow-hidden">
                          <img
                            src={url}
                            alt="Attachment"
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition text-white text-xs font-semibold"
                          >
                            View Full Photo
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No media attachments uploaded yet.</p>
            )}
          </div>

          {/* Timeline & Comments Section */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
              <span>Activity Timeline & Comments</span>
            </h4>

            {/* Existing Timeline */}
            <div className="space-y-3">
              {ticket.status_history && ticket.status_history.length > 0 ? (
                ticket.status_history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">{item.actor_name || 'System AI'}</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono">
                          {item.actor_role}
                        </span>
                      </div>
                      <span className="text-slate-500">
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {item.comment && (
                      <p className="text-xs text-slate-300 leading-relaxed">{item.comment}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No activity entries yet.</p>
              )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="pt-2 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write an inquiry or update note..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={isSubmittingComment || !newComment.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-bold text-white transition shadow-lg"
              >
                {isSubmittingComment ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Send</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
