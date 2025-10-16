import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#FF6B35',
    primaryContainer: '#FFDBCE',
    secondary: '#8B4513',
    secondaryContainer: '#E6D3C5',
    tertiary: '#4CAF50',
    tertiaryContainer: '#C8E6C9',
    surface: '#FFFFFF',
    surfaceVariant: '#F5F5F5',
    background: '#FAFAFA',
    error: '#EF5350',
    errorContainer: '#FFCDD2',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#212121',
    onSurface: '#212121',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#FF8A65',
    primaryContainer: '#BF360C',
    secondary: '#A1887F',
    secondaryContainer: '#5D4037',
    tertiary: '#66BB6A',
    tertiaryContainer: '#2E7D32',
    surface: '#121212',
    surfaceVariant: '#2C2C2C',
    background: '#000000',
    error: '#EF5350',
    errorContainer: '#B71C1C',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#FFFFFF',
    onSurface: '#FFFFFF',
  },
};