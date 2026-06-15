import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout.jsx';
import { AuthLayout } from '../layouts/AuthLayout.jsx';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute.jsx';
import { LoginPage } from '../features/auth/pages/LoginPage.jsx';
import { RegisterPage } from '../features/auth/pages/RegisterPage.jsx';
import { AnalyticsPage } from '../features/analytics/pages/AnalyticsPage.jsx';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage.jsx';
import { HistoryPage } from '../features/history/pages/HistoryPage.jsx';
import { InterviewRoomPage } from '../features/interview-room/pages/InterviewRoomPage.jsx';
import { JobAnalysisPage } from '../features/job/JobAnalysisPage.jsx';
import { ResumeUploadPage } from '../features/resume-upload/pages/ResumeUploadPage.jsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/resume-upload',
        element: <ResumeUploadPage />,
      },
      {
        path: '/jd-upload',
        element: <JobAnalysisPage />,
      },
      {
        path: '/interview-room',
        element: <InterviewRoomPage />,
      },
      {
        path: '/analytics',
        element: <AnalyticsPage />,
      },
      {
        path: '/history',
        element: <HistoryPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
