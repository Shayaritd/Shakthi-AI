import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';
import { UserRole } from '@/types';

interface RoleBasedRouteProps {
  children: ReactNode;
  roles: UserRole[];
}

export default function RoleBasedRoute({ children, roles }: RoleBasedRouteProps) {
  const { profile } = useAuth();

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(profile.role as UserRole)) {
    const dashboardPath = getDashboardPath(profile.role);
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
}

function getDashboardPath(role: string): string {
  switch (role) {
    case 'ATHLETE':
      return '/dashboard/athlete';
    case 'MENTOR':
      return '/dashboard/mentor';
    case 'GUARDIAN':
      return '/dashboard/guardian';
    case 'ADMIN':
      return '/dashboard/admin';
    default:
      return '/';
  }
}
