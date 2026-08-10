import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthColors } from '@/constants/authTheme';
import { useAuthColors } from '@/hooks/useAuthColors';

interface AuthErrorBannerProps {
  message: string | null;
}

export const AuthErrorBanner = ({ message }: AuthErrorBannerProps) => {
  const AUTH_COLORS = useAuthColors();
  const styles = useMemo(() => createStyles(AUTH_COLORS), [AUTH_COLORS]);

  if (!message) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const createStyles = (AUTH_COLORS: AuthColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: AUTH_COLORS.errorBg,
      borderRadius: 10,
      padding: 12,
      marginBottom: 16,
    },
    text: {
      fontSize: 13,
      color: AUTH_COLORS.error,
      textAlign: 'center',
    },
  });
