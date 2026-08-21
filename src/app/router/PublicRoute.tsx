import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export function PublicRoute() {
  const { isAuthenticated, isLoadingSession } = useAuthStore();

  // If we are currently checking session, it's safer to just render the children, 
  // or we could show nothing. If they are authenticated, they shouldn't see this route.
  if (isLoadingSession) {
    return null; // Or a small loader, but ProtectedRoute handles the main loader.
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
