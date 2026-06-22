export const AUTH_COLORS = {
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
  white: '#FFFFFF',
  borderDefault: '#CBD5E1',
  borderFocus: '#3B82F6',
  tabInactive: '#94A3B8',
} as const;

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
