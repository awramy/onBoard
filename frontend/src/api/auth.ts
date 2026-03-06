import api from './client';
import type { AuthResponse } from '../types';

export const registerUser = (email: string, password: string, username: string) =>
  api.post<AuthResponse>('/auth/register', { email, password, username });

export const loginUser = (email: string, password: string) =>
  api.post<AuthResponse>('/auth/login', { email, password });
