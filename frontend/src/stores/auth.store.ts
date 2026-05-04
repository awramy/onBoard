import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AuthUser = {
  id: string;
  username: string;
  email?: string;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  setAuth: (payload: { token: string; user: AuthUser }) => void;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: ({ token, user }) => set({ token, user }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
      isAuthenticated: () => Boolean(get().token),
    }),
    {
      name: 'onboard-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);
