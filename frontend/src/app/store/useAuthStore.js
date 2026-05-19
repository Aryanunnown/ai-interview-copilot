import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  isAuthenticated: true,
  login: () => set({ isAuthenticated: true }),
  logout: () => set({ isAuthenticated: false }),
}));
