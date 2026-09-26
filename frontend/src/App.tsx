import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Navbar } from './components/layout/Navbar';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { UnauthorizedPage } from './pages/auth/UnauthorizedPage';

// Role Dashboards
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { DeptHeadDashboard } from './pages/department/DeptHeadDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManagementDashboard } from './pages/management/ManagementDashboard';

import {
  Sparkles,
  ArrowRight,
  LogIn,
  Users,
} from 'lucide-react';

/**
 * Root Landing / Gateway component:
 * If authenticated, redirects straight to their authorized portal.
 * If unauthenticated, displays the platform architecture and role demo launchpad.
 */
const HomeGateway: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mb-3" />
        <p className="text-xs font-medium">Checking authorization session...</p>
      </div>
    );
  }

  if (isAuthenticated && user) {
    switch (user.role) {
      case 'STUDENT':
        return <Navigate to="/student" replace />;
      case 'STAFF':
        return <Navigate to="/staff" replace />;
      case 'DEPARTMENT_HEAD':
        return <Navigate to="/department" replace />;
      case 'ADMIN':
        return <Navigate to="/admin" replace />;
      case 'MANAGEMENT':
        return <Navigate to="/management" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  const rolePortals = [
    {
      role: 'Student',
      desc: 'Submit complaints, real-time SLA countdowns, duplicate alerts, and feedback closure.',
      target: '/login',
      color: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-400',
    },
    {
      role: 'Staff Specialist',
      desc: 'Execute assigned department tickets, update resolution notes, and attach photo evidence.',
      target: '/login',
      color: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400',
    },
    {
      role: 'Department Head',
      desc: 'Supervise ticket triage, assign specialist workloads, monitor SLA risk, and trigger escalations.',
      target: '/login',
      color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
    },
    {
      role: 'Root Administrator',
      desc: 'Full governance of users, role grants, departments, SLA policies, and complaint taxonomy.',
      target: '/login',
      color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
    },
    {
      role: 'Executive Management',
      desc: 'Read-only organization-wide analytics, SLA compliance heatmaps, and MTTR benchmarks.',
      target: '/login',
      color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
    },
  ];

  return (
    <div className="space-y-12 py-6">
      {/* Hero Banner */}
      <div className="relative rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-900/50 to-slate-950 p-8 sm:p-12 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-400">
            <Sparkles className="h-3.5 w-3.5" />
            JWT Role-Based Access Control Active
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-heading">
            Intelligent Campus Ticketing & <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Resolution Engine</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            SmartCampus AI delivers real-time complaint categorization, semantic vector duplicate clustering, dynamic priority scoring, strict SLA enforcement, and closed-loop feedback powered by FastAPI, PostgreSQL, and LLMs.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In to Your Role</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-5 py-3 text-xs font-semibold text-slate-200 hover:border-slate-700 transition"
            >
              <Users className="h-4 w-4 text-indigo-400" />
              <span>Student Registration</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Role Workbenches Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white font-heading">Role-Based Access Control Portals</h2>
          <p className="text-xs text-slate-400">
            Backend strictly verifies JWT roles; unauthorized access attempts are rejected with HTTP 403.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rolePortals.map((portal) => (
            <Link
              key={portal.role}
              to={portal.target}
              className={`rounded-2xl border bg-gradient-to-br p-5 hover:scale-[1.02] transition shadow-lg ${portal.color}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">{portal.role}</span>
                <ArrowRight className="h-4 w-4" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{portal.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
          <Navbar />

          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            <Routes>
              {/* Public Gateway */}
              <Route path="/" element={<HomeGateway />} />

              {/* Public Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />

              {/* Protected Role-Based Routes */}
              {/* Student Portal: Accessible to STUDENT and ADMIN */}
              <Route
                path="/student"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Staff Portal: Accessible to STAFF, DEPARTMENT_HEAD, and ADMIN */}
              <Route
                path="/staff"
                element={
                  <ProtectedRoute allowedRoles={['STAFF', 'DEPARTMENT_HEAD', 'ADMIN']}>
                    <StaffDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Department Head Portal: Accessible to DEPARTMENT_HEAD and ADMIN */}
              <Route
                path="/department"
                element={
                  <ProtectedRoute allowedRoles={['DEPARTMENT_HEAD', 'ADMIN']}>
                    <DeptHeadDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin Portal: Accessible to ADMIN only */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Executive Management Portal: Accessible to MANAGEMENT and ADMIN */}
              <Route
                path="/management"
                element={
                  <ProtectedRoute allowedRoles={['MANAGEMENT', 'ADMIN']}>
                    <ManagementDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
