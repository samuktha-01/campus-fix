import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Shield,
  Users,
  Building,
  FolderTree,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { UserRole, ROLE_LABELS, PRIORITY_CONFIG } from '../../lib/constants';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentName?: string;
  isActive: boolean;
}

interface AdminDepartment {
  id: string;
  name: string;
  code: string;
  contactEmail: string;
  slaConfig: {
    critical_hours: number;
    high_hours: number;
    medium_hours: number;
    low_hours: number;
  };
}

interface AdminCategory {
  id: string;
  name: string;
  department: string;
  subcategories: string[];
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'departments' | 'sla' | 'categories' | 'all_tickets'>('users');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Managed Users state
  const [usersList, setUsersList] = useState<AdminUser[]>([
    {
      id: 'u-1',
      name: 'System Administrator',
      email: 'admin@smartcampus.edu',
      role: 'ADMIN',
      isActive: true,
    },
    {
      id: 'u-2',
      name: 'Dr. Ramesh Kumar',
      email: 'head.hostel@smartcampus.edu',
      role: 'DEPARTMENT_HEAD',
      departmentName: 'Hostel Administration',
      isActive: true,
    },
    {
      id: 'u-3',
      name: 'Vikram Joshi',
      email: 'staff.it@smartcampus.edu',
      role: 'STAFF',
      departmentName: 'IT & Technical Services',
      isActive: true,
    },
    {
      id: 'u-4',
      name: 'Aarav Mehta',
      email: 'aarav.mehta@student.smartcampus.edu',
      role: 'STUDENT',
      isActive: true,
    },
    {
      id: 'u-5',
      name: 'Prof. Ananya Sen',
      email: 'director@smartcampus.edu',
      role: 'MANAGEMENT',
      isActive: true,
    },
  ]);

  // Managed Departments
  const [departments] = useState<AdminDepartment[]>([
    {
      id: 'd-1',
      name: 'Hostel Administration & Facilities',
      code: 'HOSTEL',
      contactEmail: 'hostel.admin@smartcampus.edu',
      slaConfig: { critical_hours: 4, high_hours: 12, medium_hours: 24, low_hours: 48 },
    },
    {
      id: 'd-2',
      name: 'IT & Digital Infrastructure',
      code: 'IT_INFRA',
      contactEmail: 'it.helpdesk@smartcampus.edu',
      slaConfig: { critical_hours: 2, high_hours: 8, medium_hours: 24, low_hours: 72 },
    },
    {
      id: 'd-3',
      name: 'Electrical & Power Systems',
      code: 'ELECTRICAL',
      contactEmail: 'electrical@smartcampus.edu',
      slaConfig: { critical_hours: 2, high_hours: 6, medium_hours: 24, low_hours: 48 },
    },
    {
      id: 'd-4',
      name: 'Campus Security & Access',
      code: 'SECURITY',
      contactEmail: 'security@smartcampus.edu',
      slaConfig: { critical_hours: 1, high_hours: 4, medium_hours: 12, low_hours: 24 },
    },
  ]);

  // SLA Configuration Rules
  const [globalSlaRules] = useState([
    { priority: 'CRITICAL', hours: 4, escalationThresholdPercent: 75, notifyRole: 'DEPARTMENT_HEAD & ADMIN' },
    { priority: 'HIGH', hours: 12, escalationThresholdPercent: 80, notifyRole: 'DEPARTMENT_HEAD' },
    { priority: 'MEDIUM', hours: 24, escalationThresholdPercent: 85, notifyRole: 'STAFF & DEPARTMENT_HEAD' },
    { priority: 'LOW', hours: 48, escalationThresholdPercent: 90, notifyRole: 'STAFF' },
  ]);

  // Categories
  const [categories] = useState<AdminCategory[]>([
    {
      id: 'cat-1',
      name: 'Wi-Fi & Connectivity',
      department: 'IT & Digital Infrastructure',
      subcategories: ['Router Offline', 'Slow Bandwidth', 'Captive Portal Login', 'DNS Failure'],
    },
    {
      id: 'cat-2',
      name: 'Water & Plumbing',
      department: 'Hostel Administration & Facilities',
      subcategories: ['Pipe Leakage', 'No Water Supply', 'Flush Tank Malfunction', 'Geyser Issue'],
    },
    {
      id: 'cat-3',
      name: 'Power & Lighting',
      department: 'Electrical & Power Systems',
      subcategories: ['Tripped Circuit Breaker', 'Flickering LED Tube', 'Socket Sparking', 'AC Thermostat'],
    },
  ]);

  const toggleUserStatus = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updated = !u.isActive;
          setFeedbackMsg(`User ${u.name} status updated to ${updated ? 'Active' : 'Suspended'}.`);
          setTimeout(() => setFeedbackMsg(null), 3000);
          return { ...u, isActive: updated };
        }
        return u;
      })
    );
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          setFeedbackMsg(`Updated ${u.name}'s role to ${ROLE_LABELS[newRole]}.`);
          setTimeout(() => setFeedbackMsg(null), 3000);
          return { ...u, role: newRole };
        }
        return u;
      })
    );
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-purple-950/40 via-slate-900/70 to-slate-900 p-6 sm:p-8 backdrop-blur shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400 border border-purple-500/20 mb-3">
              <Shield className="h-3.5 w-3.5" /> Root System Administration
            </div>
            <h1 className="text-3xl font-extrabold text-white font-heading">
              SmartCampus Control Plane
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Admin: <span className="text-purple-300 font-semibold">{user?.name}</span> • Manage campus users, role hierarchies, SLA matrices, departments, and category hierarchies.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-2 text-center">
              <div className="text-xl font-bold text-purple-400">{usersList.length}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Registered Users</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-2 text-center">
              <div className="text-xl font-bold text-indigo-400">{departments.length}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Departments</div>
            </div>
          </div>
        </div>
      </div>

      {feedbackMsg && (
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-xs font-semibold text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex border-b border-slate-800 gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>User Role Management ({usersList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'departments'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building className="h-4 w-4" />
          <span>Departments ({departments.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('sla')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'sla'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>SLA Rules Engine</span>
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 whitespace-nowrap ${
            activeTab === 'categories'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FolderTree className="h-4 w-4" />
          <span>Complaint Taxonomy</span>
        </button>
      </div>

      {/* Tab: Users Management */}
      {activeTab === 'users' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">Campus User Directory & Access Delegation</h2>
              <p className="text-xs text-slate-400">
                Backend strictly verifies authorization rules before executing any operations for these roles.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role Assignment</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-950/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{u.name}</div>
                      <div className="text-slate-500 text-[11px] font-mono">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="STUDENT">Student</option>
                        <option value="STAFF">Staff</option>
                        <option value="DEPARTMENT_HEAD">Department Head</option>
                        <option value="ADMIN">System Admin</option>
                        <option value="MANAGEMENT">Management</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {u.departmentName || <span className="text-slate-600">—</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {u.isActive ? 'ACTIVE' : 'SUSPENDED'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                          u.isActive
                            ? 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/20'
                        }`}
                      >
                        {u.isActive ? 'Suspend' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Departments Management */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {departments.map((dept) => (
            <div key={dept.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-purple-400">{dept.code}</span>
                  <h3 className="text-base font-bold text-white mt-0.5">{dept.name}</h3>
                </div>
                <Building className="h-5 w-5 text-slate-500" />
              </div>

              <div className="text-xs text-slate-400">
                Contact: <span className="text-slate-200 font-mono">{dept.contactEmail}</span>
              </div>

              <div className="pt-3 border-t border-slate-800/80">
                <div className="text-xs font-bold text-slate-300 mb-2">Department SLA Thresholds:</div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <div className="text-rose-400 font-bold">{dept.slaConfig.critical_hours}h</div>
                    <div className="text-[10px] text-slate-500">Critical</div>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <div className="text-amber-400 font-bold">{dept.slaConfig.high_hours}h</div>
                    <div className="text-[10px] text-slate-500">High</div>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <div className="text-blue-400 font-bold">{dept.slaConfig.medium_hours}h</div>
                    <div className="text-[10px] text-slate-500">Medium</div>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <div className="text-slate-400 font-bold">{dept.slaConfig.low_hours}h</div>
                    <div className="text-[10px] text-slate-500">Low</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: SLA Rules */}
      {activeTab === 'sla' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
          <div>
            <h2 className="text-base font-bold text-white">Global Priority & Escalation Matrix</h2>
            <p className="text-xs text-slate-400">
              When tickets reach the escalation threshold percentage of their SLA, automatic alerts trigger.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {globalSlaRules.map((rule) => (
              <div key={rule.priority} className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold border ${PRIORITY_CONFIG[rule.priority as keyof typeof PRIORITY_CONFIG]?.color}`}>
                    {rule.priority}
                  </span>
                  <span className="text-lg font-bold text-white">{rule.hours} hrs</span>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>Escalate at: <strong className="text-amber-400">{rule.escalationThresholdPercent}% SLA time</strong></div>
                  <div>Alert target: <span className="text-slate-300">{rule.notifyRole}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Categories */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <div key={cat.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm">{cat.name}</h3>
                <FolderTree className="h-4 w-4 text-purple-400" />
              </div>
              <p className="text-[11px] text-purple-300 font-medium">{cat.department}</p>
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <div className="text-[11px] text-slate-400 font-semibold uppercase">Subcategories</div>
                <div className="flex flex-wrap gap-1.5">
                  {cat.subcategories.map((sub, idx) => (
                    <span key={idx} className="bg-slate-950 border border-slate-800 rounded-md px-2 py-0.5 text-[11px] text-slate-300">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
