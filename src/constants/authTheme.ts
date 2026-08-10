// src/constants/authTheme.ts
export const AUTH_TYPOGRAPHY = {
  heading: {
    fontSize: 22,
    fontWeight: '700' as const,
  },
  label: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
  },
  button: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
} as const;

export const lightAuthColors = {
  primary: '#1D4ED8',
  primaryLight: '#3B82F6',
  primaryPale: '#DBEAFE',
  accent: '#06B6D4',
  surface: '#F0F7FF',
  screenBackground: '#EFF6FF',
  textPrimary: '#0F172A',
  textMuted: '#64748B',
  label: '#374151',
  error: '#EF4444',
  errorBg: '#FEE2E2',
  white: '#FFFFFF',
  borderDefault: '#CBD5E1',
  borderFocus: '#3B82F6',
  tabInactive: '#94A3B8',
  placeholder: '#B0BAC9',
  avatarPlaceholderIcon: '#9CA3AF',
  avatarPlaceholderBg: '#E5E7EB',
};

export const darkAuthColors: typeof lightAuthColors = {
  primary: '#5B8DEF',
  primaryLight: '#3B82F6',
  primaryPale: '#1E2A4A',
  accent: '#22D3EE',
  surface: '#1A1D23',
  screenBackground: '#0F1115',
  textPrimary: '#E8EAED',
  textMuted: '#9AA4B2',
  label: '#B0B8C4',
  error: '#EF4444',
  errorBg: '#3A1B1E',
  white: '#1E1E1E',
  borderDefault: '#3A3F4A',
  borderFocus: '#5B8DEF',
  tabInactive: '#6B7480',
  placeholder: '#5A6272',
  avatarPlaceholderIcon: '#6B7280',
  avatarPlaceholderBg: '#2A2E36',
};

export type AuthColors = typeof lightAuthColors;
