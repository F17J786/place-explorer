import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AUTH_COLORS } from '@/constants/authTheme';

interface AuthErrorBannerProps {
  message: string | null;
}

export const AuthErrorBanner = ({ message }: AuthErrorBannerProps) => {
  if (!message) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FEE2E2',
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
