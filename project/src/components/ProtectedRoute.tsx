import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, isOnboarded, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-teal-700 font-medium">Loading SHAKTHI...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Force onboarding if they haven't completed it yet
  const isOnboardingPath = [
    '/signup/athlete',
    '/signup/mentor',
    '/signup/guardian'
  ].includes(location.pathname);

  if (!isOnboarded && !isOnboardingPath) {
    switch (profile.role) {
      case 'ATHLETE':
        return <Navigate to="/signup/athlete" replace />;
      case 'MENTOR':
        return <Navigate to="/signup/mentor" replace />;
      case 'GUARDIAN':
        return <Navigate to="/signup/guardian" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    switch (profile.role) {
      case 'ATHLETE':
      case 'SPONSOR':
      case 'COLLEGE_REP':
        return <Navigate to="/dashboard/athlete" replace />;
      case 'MENTOR':
        return <Navigate to="/dashboard/mentor" replace />;
      case 'GUARDIAN':
        return <Navigate to="/dashboard/guardian" replace />;
      case 'ADMIN':
        return <Navigate to="/dashboard/admin" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}

