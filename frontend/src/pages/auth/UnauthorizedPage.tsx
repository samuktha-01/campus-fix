import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { ROLE_LABELS } from '../../lib/constants';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleReturnHome = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    switch (user.role) {
      case 'STUDENT':
        navigate('/student');
        break;
      case 'STAFF':
        navigate('/staff');
        break;
      case 'DEPARTMENT_HEAD':
        navigate('/department');
        break;
      case 'ADMIN':
        navigate('/admin');
        break;
      case 'MANAGEMENT':
        navigate('/management');
        break;
      default:
        navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 text-center">
      <div className="max-w-md w-full rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-6">
          <ShieldAlert className="h-7 w-7" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white font-heading">
          403 — Access Restricted
        </h1>
        <p className="mt-2 text-xs text-slate-400 leading-relaxed">
          Your current account role does not have authorization to access this portal or resource.
        </p>

        {user && (
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Authenticated User:</span>
              <span className="text-slate-200 font-semibold">{user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Email:</span>
              <span className="text-slate-300">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Server-Assigned Role:</span>
              <span className="text-indigo-400 font-bold">{ROLE_LABELS[user.role] || user.role}</span>
            </div>
          </div>
        )}

        <div className="mt-8 flex gap-3 justify-center">
          <button
            onClick={handleReturnHome}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to My Authorized Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
