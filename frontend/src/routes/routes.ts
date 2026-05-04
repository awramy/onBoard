export const ROUTES = {
  ROOT: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/',
  SESSIONS: '/sessions',
  SESSION_CHAT: (id: string | ':id' = ':id') => `/sessions/${id}/chat`,
  SESSION_HISTORY: (id: string | ':id' = ':id') => `/sessions/${id}/history`,
  PROGRESS: '/progress',
  PROGRESS_TOPICS: (techLevelId: string | ':techLevelId' = ':techLevelId') =>
    `/progress/${techLevelId}`,
  PROGRESS_QUESTIONS: (topicId: string | ':topicId' = ':topicId') =>
    `/progress/topics/${topicId}`,
  QUESTION_HISTORY: (questionId: string | ':questionId' = ':questionId') =>
    `/progress/questions/${questionId}`,
  LEADERBOARD: '/progress/leaderboard',
  PROFILE: '/profile',
  UI_KIT: '/ui-kit',
} as const;
