import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // Aligned with web variables.css (light mode)
    primary: '#00ac45',
    primaryContainer: '#E8F6EE', // subtle tint of primary
    secondary: '#eac784', // accent gold
    secondaryContainer: '#F9E8C0',
    tertiary: '#604c4c', // muted brown for tertiary contexts
    tertiaryContainer: '#F3E7E7',
    background: '#fffcfc',
    surface: '#ffffff',
    surfaceVariant: '#fafafa',
    error: '#ff2222', // bright danger
    errorContainer: '#FFE4E4',
    onPrimary: '#ffffff',
    onSecondary: '#362415',
    onBackground: '#362415', // main text
    onSurface: '#362415',
    onSurfaceVariant: '#604c4c', // muted text
    outline: 'rgba(1,50,55,0.06)',
    // Extended custom tokens
    accent: '#eac784',
    textPrimary: '#362415',
    textSecondary: '#604c4c',
    borderColor: 'rgba(1,50,55,0.06)',
    success: '#00ac45',
    successStrong: '#0b421a',
    warning: '#ffbc00',
    warningLight: '#fff887',
    danger: '#b90000',
    dangerBright: '#ff2222',
    info: '#2196F3',
    card: '#ffffff',
    cardShadow: 'rgba(1,50,55,0.08)',
  },
  roundness: 12,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    // Aligned with web variables.css (dark mode)
    primary: '#eac784',
    primaryContainer: '#5A4A2E',
    secondary: '#eac784',
    secondaryContainer: '#6D572F',
    tertiary: '#d5cfcf',
    tertiaryContainer: '#3A3A3A',
    background: '#0b421a',
    surface: '#183c26',
    surfaceVariant: '#214530',
    error: '#ff2222',
    errorContainer: '#5A1212',
    onPrimary: '#0b421a',
    onSecondary: '#0b421a',
    onBackground: '#fffcfc',
    onSurface: '#fffcfc',
    onSurfaceVariant: '#d5cfcf',
    outline: 'rgba(255,255,255,0.1)',
    // Extended custom tokens
    accent: '#fffcfc',
    textPrimary: '#fffcfc',
    textSecondary: '#d5cfcf',
    borderColor: 'rgba(255,255,255,0.1)',
    success: '#eac784', // reuse accent as success highlight
    successStrong: '#eac784',
    warning: '#ffbc00',
    warningLight: '#fff887',
    danger: '#b90000',
    dangerBright: '#ff2222',
    info: '#42A5F5',
    card: '#183c26',
    cardShadow: 'rgba(0,0,0,0.3)',
  },
  roundness: 12,
};
