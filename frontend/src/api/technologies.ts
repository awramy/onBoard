import api from './client';
import type { Technology } from '../types';

export const getTechnologies = () => api.get<Technology[]>('/technologies');
