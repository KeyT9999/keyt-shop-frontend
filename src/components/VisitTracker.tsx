import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/useAuthContext';
import { visitService } from '../services/visitService';

/**
 * Component to track page visits
 * Should be added to App.tsx
 */
export default function VisitTracker() {
  const location = useLocation();
  const { user } = useAuthContext();

  useEffect(() => {
    // Track visit when route changes
    const userId = user?.id || null;
    visitService.trackVisit(userId);
  }, [location.pathname, user]);

  return null; // This component doesn't render anything
}
