import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppLayout } from '@/components/layout/AppLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { PublicRoute } from '@/components/layout/PublicRoute';
import { env } from '@/config/env';
import { ROUTES } from '@/routes/routes';

const showUiKit = import.meta.env.DEV || env.showUiKit;

export const router = createBrowserRouter([
  {
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      {
        path: ROUTES.LOGIN,
        lazy: async () => ({
          Component: (await import('@/pages/LoginPage')).default,
        }),
      },
      {
        path: ROUTES.REGISTER,
        lazy: async () => ({
          Component: (await import('@/pages/RegisterPage')).default,
        }),
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
        index: true,
        lazy: async () => ({
          Component: (await import('@/pages/DashboardPage')).default,
        }),
      },
      {
        path: ROUTES.SESSIONS,
        lazy: async () => ({
          Component: (await import('@/pages/SessionsPage')).default,
        }),
      },
      {
        path: ROUTES.SESSION_CHAT(),
        lazy: async () => ({
          Component: (await import('@/pages/SessionChatPage')).default,
        }),
      },
      {
        path: ROUTES.SESSION_HISTORY(),
        lazy: async () => ({
          Component: (await import('@/pages/SessionHistoryPage')).default,
        }),
      },
      {
        path: ROUTES.PROGRESS,
        lazy: async () => ({
          Component: (await import('@/pages/ProgressPage')).default,
        }),
      },
      {
        path: ROUTES.PROGRESS_TOPICS(),
        lazy: async () => ({
          Component: (await import('@/pages/ProgressTopicsPage')).default,
        }),
      },
      {
        path: ROUTES.PROGRESS_QUESTIONS(),
        lazy: async () => ({
          Component: (await import('@/pages/ProgressQuestionsPage')).default,
        }),
      },
      {
        path: ROUTES.QUESTION_HISTORY(),
        lazy: async () => ({
          Component: (await import('@/pages/QuestionHistoryPage')).default,
        }),
      },
      {
        path: ROUTES.LEADERBOARD,
        lazy: async () => ({
          Component: (await import('@/pages/LeaderboardPage')).default,
        }),
      },
      {
        path: ROUTES.PROFILE,
        lazy: async () => ({
          Component: (await import('@/pages/ProfilePage')).default,
        }),
      },
    ],
  },
  ...(showUiKit
    ? [
        {
          path: ROUTES.UI_KIT,
          lazy: async () => ({
            Component: (await import('@/pages/UiKitShowcase')).default,
          }),
        },
      ]
    : []),
  {
    path: '/404',
    lazy: async () => ({
      Component: (await import('@/pages/NotFoundPage')).default,
    }),
  },
  { path: '*', element: <Navigate to="/404" replace /> },
]);
