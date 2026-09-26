import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../lib/constants';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mb-4" />
        <p className="text-sm font-medium tracking-wide text-slate-400">Verifying security session...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Redirect to login page and preserve the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User authenticated but unauthorized for this role view
    return <Navigate to="/unauthorized" state={{ attemptedRole: user.role }} replace />;
  }

  return <>{children}</>;
};
