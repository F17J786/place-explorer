import React, { useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';

import { AUTH_TYPOGRAPHY, AuthColors } from '@/constants/authTheme';
import { useAuthColors } from '@/hooks/useAuthColors';

interface AuthSubmitButtonProps {
  title: string;
  isLoading: boolean;
  onPress: () => void;
}

export const AuthSubmitButton = ({
  title,
  isLoading,
  onPress,
}: AuthSubmitButtonProps) => {
  const AUTH_COLORS = useAuthColors();
  const styles = useMemo(() => createStyles(AUTH_COLORS), [AUTH_COLORS]);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      friction: 8,
      tension: 200,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 200,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isLoading}
        hitSlop={styles.hitSlop}
      >
        {isLoading ? (
          <ActivityIndicator color={AUTH_COLORS.white} />
        ) : (
          <Text style={styles.text}>{title}</Text>
        )}
      </Pressable>
    </Animated.View>
  );
};

const createStyles = (AUTH_COLORS: AuthColors) =>
  StyleSheet.create({
    button: {
      backgroundColor: AUTH_COLORS.primary,
      borderRadius: 12,
      height: 52,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    text: {
      ...AUTH_TYPOGRAPHY.button,
      color: AUTH_COLORS.white,
    },
    hitSlop: {
      top: 8,
      bottom: 8,
      left: 8,
      right: 8,
    },
  });
