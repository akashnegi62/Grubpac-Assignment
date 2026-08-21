import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { Login } from '../../features/auth/Login';
import { Board } from '../../features/board/Board';

import { Dashboard } from '../../features/dashboard/Dashboard.tsx';

import { Analytics } from '../../features/analytics/Analytics.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <div>Welcome to SprintDesk. Navigate from sidebar.</div>,
          },
          {
            path: 'dashboard',
            element: <Dashboard />,
          },
          {
            path: 'board',
            element: <Board />,
          },
          {
            path: 'analytics',
            element: <Analytics />,
          }
        ],
      }
    ]
  },
  {
    path: '/login',
    element: <PublicRoute />,
    children: [
      {
        path: '',
        element: <Login />,
      }
    ]
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
