import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useThemeStore = create((set, get) => ({
  isDarkMode: false,

  initializeTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme_mode');
      if (savedTheme !== null) {
        set({ isDarkMode: JSON.parse(savedTheme) });
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  },

  toggleTheme: async () => {
    const { isDarkMode } = get();
    const newTheme = !isDarkMode;
    
    try {
      await AsyncStorage.setItem('theme_mode', JSON.stringify(newTheme));
      set({ isDarkMode: newTheme });
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  },
}));