import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authApi from '../api/authApi';
import {
  setAccessToken,
  setUserData,
  clearAuth,
  getAccessToken,
  getUserData,
} from '../utils/auth';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  loading: false,

  checkAuthState: async () => {
    try {
      const token = await getAccessToken();
      const userData = await getUserData();

      if (token && userData) {
        set({ token, user: userData });
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const response = await authApi.login({ email, password });
      // response may have many shapes depending on backend (token, access_token, tokens.access, data: { token, user }, etc.)
      const maybe = (obj, path) =>
        path.split('.').reduce((acc, k) => acc && acc[k], obj);

      const tokenCandidates = [
        response?.access_token,
        response?.accessToken,
        response?.token,
        maybe(response, 'tokens.access'),
        maybe(response, 'data.access_token'),
        maybe(response, 'data.accessToken'),
        maybe(response, 'data.token'),
        maybe(response, 'data.tokens.access'),
      ];

      let token =
        tokenCandidates.find((t) => t !== undefined && t !== null) || null;

      // If token is an object with nested value, try common properties
      if (token && typeof token === 'object') {
        token = token.token || token.access || token.value || null;
      }

      const user =
        response?.user ||
        maybe(response, 'data.user') ||
        maybe(response, 'data') ||
        null;

      // Ensure token is a string before persisting
      if (token) {
        const tokenStr = typeof token === 'string' ? token : String(token);
        await setAccessToken(tokenStr);
        set({ token: tokenStr });
      }

      if (user) {
        await setUserData(user);
        set({ user });
      }

      set({ loading: false });
      return response;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  register: async (userData) => {
    set({ loading: true });
    try {
      const response = await authApi.register(userData);

      const maybe = (obj, path) =>
        path.split('.').reduce((acc, k) => acc && acc[k], obj);

      const tokenCandidates = [
        response?.access_token,
        response?.accessToken,
        response?.token,
        maybe(response, 'tokens.access'),
        maybe(response, 'data.access_token'),
        maybe(response, 'data.accessToken'),
        maybe(response, 'data.token'),
        maybe(response, 'data.tokens.access'),
      ];

      let token =
        tokenCandidates.find((t) => t !== undefined && t !== null) || null;
      if (token && typeof token === 'object')
        token = token.token || token.access || token.value || null;

      const user =
        response?.user ||
        maybe(response, 'data.user') ||
        maybe(response, 'data') ||
        null;

      if (token) {
        const tokenStr = typeof token === 'string' ? token : String(token);
        await setAccessToken(tokenStr);
        set({ token: tokenStr });
      }

      if (user) {
        await setUserData(user);
        set({ user });
      }

      set({ loading: false });
      return response;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  updateProfile: async (userData) => {
    set({ loading: true });
    try {
      const response = await authApi.updateProfile(userData);

      const user = response?.user || response?.data || null;
      if (user) await setUserData(user);

      set({ user, loading: false });

      return response;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await clearAuth();
      //const response = await authApi.logout();

      set({ token: null, user: null });
      //return response;
    } catch (error) {
      console.error('Error logging out:', error);
    }
  },
}));
