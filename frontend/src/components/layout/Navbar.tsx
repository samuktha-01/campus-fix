import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldCheck, Sparkles, Building2, LogOut, LogIn, UserPlus } from 'lucide-react';
import { ROLE_LABELS } from '../../lib/constants';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'STUDENT':
        return '/student';
      case 'STAFF':
        return '/staff';
      case 'DEPARTMENT_HEAD':
        return '/department';
      case 'ADMIN':
        return '/admin';
      case 'MANAGEMENT':
        return '/management';
      default:
        return '/';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link to={getRoleDashboardLink()} className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white font-heading">
                SmartCampus <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AI</span>
              </span>
              <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-400 border border-indigo-500/20">
                <Sparkles className="mr-1 h-2.5 w-2.5" /> v0.1.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">Intelligent Campus Ticketing & SLA Engine</p>
          </div>
        </Link>

        {/* Right side navigation and authentication */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              {/* Role Badge */}
              <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                <span className="text-slate-400">Role:</span>
                <span className="font-semibold text-indigo-300">
                  {ROLE_LABELS[user.role] || user.role}
                </span>
              </div>

              {/* User Identity info */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left text-xs">
                  <div className="font-semibold text-slate-200 leading-tight">{user.name}</div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{user.email}</div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-700 transition"
              >
                <LogIn className="h-3.5 w-3.5 text-indigo-400" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
