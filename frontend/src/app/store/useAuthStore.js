import { create } from 'zustand';

const storedToken = window.localStorage.getItem('token');
const storedUser = window.localStorage.getItem('user');

function parseStoredUser(value) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    window.localStorage.removeItem('user');
    return null;
  }
}

export const useAuthStore = create((set) => ({
  token: storedToken,
  user: parseStoredUser(storedUser),
  isAuthenticated: Boolean(storedToken),
  login: ({ token, user }) => {
    window.localStorage.setItem('token', token);
    window.localStorage.setItem('user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },
  logout: () => {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('authToken');
    window.localStorage.removeItem('accessToken');
    window.localStorage.removeItem('user');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
