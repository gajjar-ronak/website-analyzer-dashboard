import { createBrowserRouter, Navigate } from 'react-router-dom';
import SidebarLayout from './layouts/SidebarLayout';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import URLManagement from './features/urlManagement/pages/URLManagement';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <SidebarLayout />,
    children: [
      {
        index: true,
        element: <Navigate to='/dashboard' replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'url-management',
        element: <URLManagement />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
