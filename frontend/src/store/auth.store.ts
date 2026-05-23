'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setHasHydrated: (val: boolean) => void;
  updateUser: (partial: Partial<User>) => void;
}

function setCookie(name: string, value: string, maxAgeSecs: number) {
  if (typeof document === 'undefined') return;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSecs}; Path=/; SameSite=Lax${secure}`;
}

function removeCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setUser: (user) => set({ user, isAuthenticated: true }),

      updateUser: (partial) => {
        const current = get().user;
        if (!current) return;
        set({ user: { ...current, ...partial } });
      },

      setTokens: (accessToken, refreshToken) => {
        setCookie('access_token', accessToken, 15 * 60);
        setCookie('refresh_token', refreshToken, 7 * 24 * 3600);
      },

      logout: () => {
        removeCookie('access_token');
        removeCookie('refresh_token');
        set({ user: null, isAuthenticated: false });
      },

      setHasHydrated: (val) => set({ _hasHydrated: val }),
    }),
    {
      name: 'foytain-auth',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        },
      ),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

// Hook that waits for hydration before returning state
// Use this to avoid SSR/client mismatch
export function useAuth() {
  const store = useAuthStore();
  return {
    ...store,
    isReady: store._hasHydrated,
  };
}
