import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  TrendingUp,
  BarChart3,
  Clock,
  Star,
  Building2,
  AlertOctagon,
  Eye,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const ManagementDashboard: React.FC = () => {
  const { user } = useAuth();

  // Organization-wide Analytics Data
  const departmentSlaData = [
    { name: 'Hostel Admin', compliance: 94.2, avgHours: 3.4, total: 142 },
    { name: 'IT Infrastructure', compliance: 89.5, avgHours: 4.8, total: 210 },
    { name: 'Electrical', compliance: 96.1, avgHours: 2.1, total: 88 },
    { name: 'Security', compliance: 98.4, avgHours: 1.2, total: 64 },
    { name: 'Academic Admin', compliance: 91.0, avgHours: 6.5, total: 75 },
    { name: 'Transport & Fleet', compliance: 87.3, avgHours: 5.2, total: 49 },
  ];

  const categoryDistribution = [
    { name: 'Wi-Fi & Network', value: 34, color: '#6366f1' },
    { name: 'Hostel Facilities', value: 26, color: '#06b6d4' },
    { name: 'Electrical & AC', value: 18, color: '#f59e0b' },
    { name: 'Classroom Tech', value: 12, color: '#8b5cf6' },
    { name: 'Campus Safety', value: 10, color: '#10b981' },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-emerald-950/40 via-slate-900/70 to-slate-900 p-6 sm:p-8 backdrop-blur shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 mb-3">
              <Eye className="h-3.5 w-3.5" /> Executive Intelligence Portal (Read-Only)
            </div>
            <h1 className="text-3xl font-extrabold text-white font-heading">
              Campus Executive Analytics
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Viewer: <span className="text-emerald-300 font-semibold">{user?.name}</span> • High-level strategic metrics, department MTTR benchmarks, and SLA compliance heatmaps.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-2 text-center">
              <div className="text-xl font-bold text-emerald-400">93.8%</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Campus SLA Met</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-2 text-center">
              <div className="text-xl font-bold text-indigo-400">4.7 / 5.0</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Satisfaction CSAT</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Tickets (Monthly)</span>
            <Building2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white">628</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>94.1% overall resolution completion</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Campus Average MTTR</span>
            <Clock className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-cyan-400">3.8 hrs</div>
          <div className="text-[11px] text-slate-400">
            Down from 5.4 hrs last quarter
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>SLA Breaches (MTD)</span>
            <AlertOctagon className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-3xl font-bold text-rose-400">39</div>
          <div className="text-[11px] text-slate-400">
            6.2% breach rate across all departments
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Student CSAT Rating</span>
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          </div>
          <div className="text-3xl font-bold text-yellow-400">4.72</div>
          <div className="text-[11px] text-slate-400">
            Based on 482 student feedback reviews
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department SLA Compliance Chart (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Department SLA Compliance Rate (%)</h2>
              <p className="text-xs text-slate-400">Comparison of SLA target achievement across active operational units</p>
            </div>
            <BarChart3 className="h-5 w-5 text-indigo-400" />
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentSlaData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" />
                <YAxis stroke="#94a3b8" domain={[70, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Bar dataKey="compliance" fill="#6366f1" radius={[6, 6, 0, 0]} name="SLA Met %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Issue Category Distribution</h2>
              <p className="text-xs text-slate-400">Share of campus issues logged by domain</p>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
            {categoryDistribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 truncate">{item.name}</span>
                <span className="text-slate-500 font-mono ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benchmark Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <h2 className="text-base font-bold text-white">Department Resolution Turnaround Benchmarks</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Total Handled</th>
                <th className="py-3 px-4">SLA Compliance Rate</th>
                <th className="py-3 px-4">Mean Time to Resolve (MTTR)</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {departmentSlaData.map((d) => (
                <tr key={d.name} className="hover:bg-slate-950/40">
                  <td className="py-3 px-4 font-semibold text-white">{d.name}</td>
                  <td className="py-3 px-4 text-slate-300">{d.total}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-semibold ${
                        d.compliance >= 95
                          ? 'text-emerald-400'
                          : d.compliance >= 90
                          ? 'text-cyan-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {d.compliance}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-mono">{d.avgHours} hours</td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ON TARGET
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
