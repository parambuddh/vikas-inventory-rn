export const COLORS = {
  // Primary
  primary: '#2563eb',
  primaryLight: '#3b82f6',
  primaryDark: '#1e40af',

  // Secondary
  secondary: '#7c3aed',
  secondaryLight: '#a78bfa',
  secondaryDark: '#6d28d9',

  // Accent
  accent: '#f59e0b',
  accentLight: '#fbbf24',
  accentDark: '#d97706',

  // Status Colors
  success: '#10b981',
  successLight: '#6ee7b7',
  successDark: '#059669',

  danger: '#ef4444',
  dangerLight: '#fca5a5',
  dangerDark: '#dc2626',

  warning: '#f97316',
  warningLight: '#fed7aa',
  warningDark: '#ea580c',

  // Neutral
  white: '#ffffff',
  black: '#000000',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',

  // Backgrounds
  background: '#ffffff',
  backgroundAlt: '#f9fafb',
  border: '#e5e7eb',
  divider: '#f3f4f6',
};

export const TYPOGRAPHY = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },
  weights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lg: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
};
