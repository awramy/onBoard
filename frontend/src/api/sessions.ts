import api from './client';
import type { InterviewSession } from '../types';

export const createSession = (technologyLevelId: string, config?: Record<string, unknown>) =>
  api.post<InterviewSession>('/sessions', { technologyLevelId, config });

export const getSessions = () => api.get<InterviewSession[]>('/sessions');

export const getSession = (id: string) => api.get<InterviewSession>(`/sessions/${id}`);
