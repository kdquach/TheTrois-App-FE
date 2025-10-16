import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockAuthAPI } from '../api/mockAuth';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  loading: false,

  checkAuthState: async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');
      
      if (token && userData) {
        set({ 
          token, 
          user: JSON.parse(userData) 
        });
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const response = await mockAuthAPI.login(email, password);
      
      await AsyncStorage.setItem('auth_token', response.token);
      await AsyncStorage.setItem('user_data', JSON.stringify(response.user));
      
      set({ 
        token: response.token, 
        user: response.user,
        loading: false 
      });
      
      return response;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  register: async (userData) => {
    set({ loading: true });
    try {
      const response = await mockAuthAPI.register(userData);
      
      await AsyncStorage.setItem('auth_token', response.token);
      await AsyncStorage.setItem('user_data', JSON.stringify(response.user));
      
      set({ 
        token: response.token, 
        user: response.user,
        loading: false 
      });
      
      return response;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  updateProfile: async (userData) => {
    set({ loading: true });
    try {
      const response = await mockAuthAPI.updateProfile(userData);
      
      await AsyncStorage.setItem('user_data', JSON.stringify(response.user));
      
      set({ 
        user: response.user,
        loading: false 
      });
      
      return response;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
      
      set({ 
        token: null, 
        user: null 
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  },
}));