import { create } from 'zustand';

const storageKey = 'themeMode';
const fallbackMode = 'light';

function getStoredMode() {
  if (typeof window === 'undefined') {
    return fallbackMode;
  }

  const storedMode = window.localStorage.getItem(storageKey);
  return storedMode === 'dark' || storedMode === 'light' ? storedMode : fallbackMode;
}

function persistMode(mode) {
  window.localStorage.setItem(storageKey, mode);
}

export const useThemeModeStore = create((set) => ({
  mode: getStoredMode(),
  toggleMode: () =>
    set((state) => {
      const nextMode = state.mode === 'light' ? 'dark' : 'light';
      persistMode(nextMode);
      return { mode: nextMode };
    }),
}));
