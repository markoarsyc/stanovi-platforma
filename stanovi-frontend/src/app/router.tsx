import { createBrowserRouter } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import LandingPage from '../pages/public/LandingPage';
import AuthPage from '../pages/auth/AuthPage';
import Listings from '../pages/public/Listings';
import BuildingDetailPage from '../pages/public/BuildingDetailPage';
import InvestorPanel from '../pages/investor/InvestorPanel';

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/',
        element: <LandingPage />,
      },
      {
        path: '/auth',
        element: <AuthPage />,
      },
      {
        path: '/oglasi',
        element: <Listings />,
      },
      {
        path: '/oglasi/:id',
        element: <BuildingDetailPage />,
      },
      {
        path: '/investor',
        element: <InvestorPanel />,
      },
    ],
  },
]);