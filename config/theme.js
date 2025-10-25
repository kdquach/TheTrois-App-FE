import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // Starbucks-inspired color palette
    primary: '#00704A', // Starbucks Green
    primaryContainer: '#E8F5E8',
    secondary: '#D4AF37', // Gold
    secondaryContainer: '#FDF6E3',
    tertiary: '#8B4513', // Brown
    tertiaryContainer: '#F5E6D3',
    surface: '#FFFFFF',
    surfaceVariant: '#FAFAFA',
    background: '#F7F7F7',
    error: '#D32F2F',
    errorContainer: '#FFEBEE',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#1C1C1E',
    onSurface: '#1C1C1E',
    outline: '#E0E0E0',
    // Custom Starbucks colors
    starbucksGreen: '#00704A',
    starbucksGold: '#D4AF37',
    warmBrown: '#8B4513',
    creamWhite: '#F5F5DC',
    darkBrown: '#3E2723',
    lightGreen: '#4CAF50',
    accent: '#D4AF37',
    success: '#4CAF50',
    warning: '#FF9800',
    info: '#2196F3',
    card: '#FFFFFF',
    cardShadow: 'rgba(0, 0, 0, 0.08)',
  },
  roundness: 12,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#4CAF50', // Lighter green for dark mode
    primaryContainer: '#2E7D32',
    secondary: '#FFD700', // Brighter gold
    secondaryContainer: '#B8860B',
    tertiary: '#A1887F', // Lighter brown
    tertiaryContainer: '#5D4037',
    surface: '#1C1C1E',
    surfaceVariant: '#2C2C2E',
    background: '#000000',
    error: '#F44336',
    errorContainer: '#B71C1C',
    onPrimary: '#FFFFFF',
    onSecondary: '#000000',
    onBackground: '#FFFFFF',
    onSurface: '#FFFFFF',
    outline: '#3C3C43',
    // Custom colors for dark mode
    starbucksGreen: '#4CAF50',
    starbucksGold: '#FFD700',
    warmBrown: '#A1887F',
    creamWhite: '#F5F5DC',
    darkBrown: '#8D6E63',
    lightGreen: '#66BB6A',
    accent: '#FFD700',
    success: '#4CAF50',
    warning: '#FFC107',
    info: '#42A5F5',
    card: '#1C1C1E',
    cardShadow: 'rgba(0, 0, 0, 0.4)',
  },
  roundness: 12,
};
