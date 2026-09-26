import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  PlusCircle, 
  FileText, 
  Clock, 
  Star, 
  RotateCcw, 
  Paperclip, 
  MessageSquare,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { PRIORITY_CONFIG, SLA_STATUS_CONFIG } from '../../lib/constants';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'my_tickets' | 'new_ticket'>('my_tickets');

  // Sample student complaint tickets state
  const [complaints] = useState([
    {
      id: 'TCK-2026-0001',
      title: 'Water leakage and low pressure in 3rd floor washroom',
      department: 'Hostel Administration',
      location: 'Hostel Block C, Floor 3',
      priority: 'HIGH' as const,
      status: 'IN_PROGRESS',
      slaStatus: 'ON_TRACK' as const,
      dueIn: '6 hours remaining',
      createdAt: 'Today, 09:30 AM',
      hasFeedback: false,
    },
    {
      id: 'TCK-2026-0004',
      title: 'Broken study chair and loose desk screw in Room 112',
      department: 'Hostel Administration',
      location: 'Hostel Block A, Room 112',
      priority: 'LOW' as const,
      status: 'RESOLVED',
      slaStatus: 'MET' as const,
      dueIn: 'Resolved on time',
      createdAt: 'Yesterday, 02:15 PM',
      hasFeedback: true,
      rating: 5,
    },
  ]);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-indigo-900/40 via-slate-900/60 to-slate-900 p-6 sm:p-8 backdrop-blur shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20 mb-3">
              <ShieldCheck className="h-3.5 w-3.5" /> Student Portal Verified
            </div>
            <h1 className="text-3xl font-extrabold text-white font-heading">
              Welcome back, {user?.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Submit campus maintenance issues, track live SLA progress, and submit feedback upon resolution.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('new_ticket')}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition shrink-0"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Complaint</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('my_tickets')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
            activeTab === 'my_tickets'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>My Complaints ({complaints.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('new_ticket')}
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

      {activeTab === 'my_tickets' ? (
        <div className="space-y-4">
          {complaints.map((ticket) => (
            <div
              key={ticket.id}
              className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 hover:border-slate-700 transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-indigo-400">{ticket.id}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-400">{ticket.department}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-500">{ticket.location}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${PRIORITY_CONFIG[ticket.priority].color}`}>
                    {ticket.priority} PRIORITY
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${SLA_STATUS_CONFIG[ticket.slaStatus].color}`}>
                    {ticket.status}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold text-white">{ticket.title}</h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  <span>SLA Countdown: <strong>{ticket.dueIn}</strong></span>
                </p>
              </div>

              {/* Student Actions: Feedback / Reopen / Comments */}
              <div className="pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Add Comment</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition">
                    <Paperclip className="h-3.5 w-3.5" />
                    <span>Attach Photo</span>
                  </button>
                  {ticket.status === 'RESOLVED' && (
                    <button className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition">
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Reopen Ticket</span>
                    </button>
                  )}
                </div>

                {ticket.status === 'RESOLVED' && ticket.hasFeedback ? (
                  <div className="flex items-center gap-1 text-yellow-400 font-semibold text-xs">
                    <Star className="h-3.5 w-3.5 fill-yellow-400" />
                    <span>Rated {ticket.rating} / 5 Stars</span>
                  </div>
                ) : ticket.status === 'RESOLVED' ? (
                  <button className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-semibold hover:bg-yellow-500/20 transition">
                    <Star className="h-3.5 w-3.5" />
                    <span>Submit Rating</span>
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5 max-w-2xl">
          <div>
            <h3 className="text-base font-semibold text-white">File a New Complaint</h3>
            <p className="text-xs text-slate-400">Our AI engine will classify the department and check for duplicates in real-time.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Issue Title</label>
              <input
                type="text"
                placeholder="e.g. WiFi not connecting in Library 2nd floor"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Campus Location</label>
              <input
                type="text"
                placeholder="e.g. Central Library, Reading Room 2"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Detailed Description</label>
              <textarea
                rows={4}
                placeholder="Provide details about the issue..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0 text-indigo-400" />
              <span>AI Duplicate Detection will automatically scan existing campus tickets upon submission.</span>
            </div>

            <button
              onClick={() => setActiveTab('my_tickets')}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
            >
              Submit Ticket (Triggers AI Routing & SLA)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
