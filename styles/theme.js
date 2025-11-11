// Centralized design tokens and helpers for TheTrois-App-FE (React Native)
// Derived from ChaBa-Web-FE CSS variables (variables.css) and adapted for RN
// Fonts: Inter (load via expo-font in root layout)

export const palette = {
  light: {
    primary: '#00ac45',
    background: '#fffcfc',
    surface: '#ffffff',
    accent: '#eac784',
    textPrimary: '#362415',
    textMuted: '#604c4c',
    border: 'rgba(1,50,55,0.06)',
    successStrong: '#0b421a',
    danger: '#b90000',
    dangerBright: '#ff2222',
    warning: '#ffbc00',
    warningLight: '#fff887',
  },
  dark: {
    primary: '#eac784',
    background: '#0b421a',
    surface: '#183c26',
    accent: '#fffcfc',
    textPrimary: '#fffcfc',
    textMuted: '#d5cfcf',
    border: 'rgba(255,255,255,0.1)',
    successStrong: '#0b421a',
    danger: '#b90000',
    dangerBright: '#ff2222',
    warning: '#ffbc00',
    warningLight: '#fff887',
  },
};

export const radii = {
  lg: 32,
  md: 16,
  sm: 8,
  xs: 4,
};

export const spacing = (factor = 1) => factor * 4;

export const typography = {
  header: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: 0.2,
  },
  subHeader: {
    fontFamily: 'Inter_500Medium',
    fontSize: 18,
    lineHeight: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    lineHeight: 22,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: '#604c4c',
  },
  caption: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    lineHeight: 16,
  },
  button: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    letterSpacing: 0.5,
  },
};

export const shadows = {
  card: {
    shadowColor: '#012037',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
};

export function createTheme(mode = 'light') {
  const colors = palette[mode];
  return {
    mode,
    colors,
    text: {
      header: { color: colors.textPrimary, ...typography.header },
      subHeader: { color: colors.textPrimary, ...typography.subHeader },
      description: { color: colors.textMuted, ...typography.description },
      body: { color: colors.textPrimary, ...typography.body },
      caption: { color: colors.textMuted, ...typography.caption },
    },
    components: {
      card: {
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.card,
      },
      buttonPrimary: (disabled) => ({
        backgroundColor: disabled ? colors.border : colors.primary,
        borderRadius: radii.sm,
        paddingVertical: spacing(3),
      }),
      buttonAccent: {
        backgroundColor: colors.accent,
        borderRadius: radii.sm,
        paddingVertical: spacing(3),
      },
      surface: {
        backgroundColor: colors.surface,
        borderRadius: radii.md,
      },
      input: {
        backgroundColor: colors.surface,
        borderRadius: radii.sm,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing(3),
        paddingVertical: spacing(2),
      },
    },
  };
}

// Utility hook (can be integrated later with context)
export const theme = createTheme('light');

export function applyTextStyle(styleName) {
  return theme.text[styleName] || typography.body;
}

export function mergeStyles(...objs) {
  return Object.assign({}, ...objs);
}
