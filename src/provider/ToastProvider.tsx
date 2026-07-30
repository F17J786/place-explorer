import { registerToastFn } from '@/utils/Toastref';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [message, setMessage] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (msg: string, duration = 2000) => {
      if (hideTimer.current) clearTimeout(hideTimer.current);

      setMessage(msg);
      opacity.setValue(0);
      translateY.setValue(20);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      hideTimer.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 20,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => setMessage(null));
      }, duration);
    },
    [opacity, translateY],
  );

  // Đăng ký hàm thật vào ref module-level khi mount, gỡ khi unmount
  useEffect(() => {
    registerToastFn(showToast);
    return () => registerToastFn(null);
  }, [showToast]);

  return (
    <>
      {children}
      {message && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.container,
            {
              opacity,
              transform: [{ translateY }],
            },
          ]}
        >
          <Text style={styles.text}>{message}</Text>
        </Animated.View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 120, // chỉnh giá trị này để match vị trí trong ảnh
    alignSelf: 'center',
    maxWidth: SCREEN_WIDTH - 80,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  text: {
    color: '#1A1A1A',
    fontSize: 14,
    textAlign: 'center',
  },
});
