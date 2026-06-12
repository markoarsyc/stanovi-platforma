import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { Role } from '@/shared/types/enums/role.enum';

const LandingPage = lazy(() => import('../pages/public/LandingPage'));
const AuthPage = lazy(() => import('../pages/auth/AuthPage'));
const Listings = lazy(() => import('../pages/public/Listings'));
const BuildingDetailPage = lazy(() => import('../pages/public/BuildingDetailPage'));
const InvestorPanel = lazy(() => import('../pages/investor/InvestorPanel'));
const ProfilePage = lazy(() => import('@/pages/public/profile/ProfilePage'));
const AdminPanel = lazy(() => import('@/pages/admin/AdminPanel'));
const NotFoundPage = lazy(() => import('@/pages/public/NotFoundPage'));

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/auth', element: <AuthPage /> },
      { path: '/oglasi', element: <Listings /> },
      { path: '/oglasi/:id', element: <BuildingDetailPage /> },
      {
        path: '/investor',
        element: (
          <ProtectedRoute roles={[Role.INVESTOR]}>
            <InvestorPanel />
          </ProtectedRoute>
        ),
      },
      {
        path: '/profil',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin',
        element: (
          <ProtectedRoute roles={[Role.ADMIN]}>
            <AdminPanel />
          </ProtectedRoute>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
