import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../services/authService';
import { Skeleton } from '../../components/ui/Skeleton';

export function ProtectedRoute() {
  const { isAuthenticated, isLoadingSession, restoreSession, setLoadingSession, logout } = useAuthStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeSession = async () => {
      if (isAuthenticated) {
        setIsInitializing(false);
        setLoadingSession(false);
        return;
      }

      const refreshToken = sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken');
      const userDataStr = sessionStorage.getItem('userData') || localStorage.getItem('userData');
      
      if (!refreshToken || !userDataStr) {
        setLoadingSession(false);
        setIsInitializing(false);
        logout();
        return;
      }

      try {
        const newSession = await authService.refreshToken();
        const user = JSON.parse(userDataStr);
        restoreSession(newSession.accessToken, user);
      } catch {
        logout();
      } finally {
        setLoadingSession(false);
        setIsInitializing(false);
      }
    };

    initializeSession();
  }, [isAuthenticated, restoreSession, setLoadingSession, logout]);

  if (isLoadingSession || isInitializing) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <p className="text-gray-500 font-medium animate-pulse">Restoring session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
