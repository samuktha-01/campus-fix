import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Building2, Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      // Route to appropriate role portal
      if (from !== '/') {
        navigate(from, { replace: true });
      } else {
        switch (user.role) {
          case 'STUDENT':
            navigate('/student', { replace: true });
            break;
          case 'STAFF':
            navigate('/staff', { replace: true });
            break;
          case 'DEPARTMENT_HEAD':
            navigate('/department', { replace: true });
            break;
          case 'ADMIN':
            navigate('/admin', { replace: true });
            break;
          case 'MANAGEMENT':
            navigate('/management', { replace: true });
            break;
          default:
            navigate('/', { replace: true });
        }
      }
    } catch {
      // Error handled in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Campus@2026!');
    clearError();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/25">
            <Building2 className="h-6 w-6 text-white" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight text-white font-heading">
          Sign In to <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">SmartCampus AI</span>
        </h2>
        <p className="mt-1.5 text-center text-xs text-slate-400">
          Campus Ticketing & Autonomous SLA Resolution System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/80 backdrop-blur-xl py-8 px-4 shadow-2xl border border-slate-800 rounded-2xl sm:px-10">
          {error && (
            <div className="mb-5 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3.5 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-300 leading-relaxed font-medium">{error}</div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-300">
                Email Address
              </label>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) clearError();
                  }}
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="name@smartcampus.edu"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-300">
                Password
              </label>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) clearError();
                  }}
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-600/25 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition"
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins for All 5 Roles */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>One-Click Role Demonstration Accounts:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('aarav.mehta@student.smartcampus.edu')}
                className="p-2 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 rounded-lg text-left transition"
              >
                <div className="font-semibold text-slate-200">Student</div>
                <div className="text-[10px] text-slate-500 truncate">aarav.mehta@...</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('staff.it@smartcampus.edu')}
                className="p-2 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 rounded-lg text-left transition"
              >
                <div className="font-semibold text-slate-200">Staff</div>
                <div className="text-[10px] text-slate-500 truncate">staff.it@...</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('head.hostel@smartcampus.edu')}
                className="p-2 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/50 rounded-lg text-left transition"
              >
                <div className="font-semibold text-slate-200">Dept Head</div>
                <div className="text-[10px] text-slate-500 truncate">head.hostel@...</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin@smartcampus.edu')}
                className="p-2 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/50 rounded-lg text-left transition"
              >
                <div className="font-semibold text-slate-200">Admin</div>
                <div className="text-[10px] text-slate-500 truncate">admin@...</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('director@smartcampus.edu')}
                className="col-span-2 p-2 bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 rounded-lg text-left transition flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-slate-200">Executive Management</div>
                  <div className="text-[10px] text-slate-500">director@smartcampus.edu</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">Read-Only Analytics</span>
              </button>
            </div>
            <p className="mt-2 text-[10px] text-slate-500 text-center">Default Password: <code>Campus@2026!</code></p>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            <span>New campus student? </span>
            <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
