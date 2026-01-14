import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/useAuthContext';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuthContext();
  const location = useLocation();

  if (!user) {
    // Redirect to login page with current location as state to redirect back after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
