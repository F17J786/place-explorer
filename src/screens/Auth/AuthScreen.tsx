import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { AUTH_COLORS } from '@/constants/authTheme';
import type { AuthTab } from '@/types/auth.types';

const TAB_ANIMATION_MS = 100;
const CARD_HORIZONTAL_MARGIN = 24;
const CARD_PADDING = 28;
const LOGO_SQUARE_SIZE = 18;
const LOGO_SQUARE_RADIUS = 6;
const LOGO_SQUARE_OFFSET = 6;

export const AuthScreen = () => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<AuthTab>('login');

  const formOpacity = useRef(new Animated.Value(1)).current;
  const formTranslateY = useRef(new Animated.Value(0)).current;

  const handleTabSwitch = useCallback(
    (tab: AuthTab) => {
      if (tab === activeTab) return;
      setActiveTab(tab);
    },
    [activeTab],
  );

  return (
    <KeyboardAwareScrollView
      style={[styles.screen, { paddingTop: insets.top }]}
      enableOnAndroid
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoArea}>
          <View style={styles.logoSquares}>
            <View style={[styles.logoSquare, styles.logoSquarePrimary]} />
            <View style={[styles.logoSquare, styles.logoSquareAccent]} />
          </View>
          <Text style={styles.appName}>Map Explorer</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'login' ? styles.tabActive : styles.tabInactive,
              ]}
              onPress={() => handleTabSwitch('login')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'login'
                    ? styles.tabTextActive
                    : styles.tabTextInactive,
                ]}
              >
                Đăng nhập
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'register'
                  ? styles.tabActive
                  : styles.tabInactive,
              ]}
              onPress={() => handleTabSwitch('register')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'register'
                    ? styles.tabTextActive
                    : styles.tabTextInactive,
                ]}
              >
                Đăng ký
              </Text>
            </TouchableOpacity>
          </View>

          <Animated.View
            style={{
              opacity: formOpacity,
              transform: [{ translateY: formTranslateY }],
            }}
          >
            {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AUTH_COLORS.screenBackground,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: CARD_HORIZONTAL_MARGIN,
    paddingTop: 32,
  },
  logoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  logoSquares: {
    width: LOGO_SQUARE_SIZE + LOGO_SQUARE_OFFSET,
    height: LOGO_SQUARE_SIZE + LOGO_SQUARE_OFFSET,
    marginRight: 10,
  },
  logoSquare: {
    position: 'absolute',
    width: LOGO_SQUARE_SIZE,
    height: LOGO_SQUARE_SIZE,
    borderRadius: LOGO_SQUARE_RADIUS,
  },
  logoSquarePrimary: {
    backgroundColor: AUTH_COLORS.primary,
    top: 0,
    left: 0,
  },
  logoSquareAccent: {
    backgroundColor: AUTH_COLORS.accent,
    bottom: 0,
    right: 0,
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    color: AUTH_COLORS.primary,
    letterSpacing: 1.5,
  },
  card: {
    backgroundColor: AUTH_COLORS.white,
    borderRadius: 20,
    padding: CARD_PADDING,
    ...Platform.select({
      ios: {
        shadowColor: AUTH_COLORS.primary,
        shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 4,
      },
    }),
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 10,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: AUTH_COLORS.primary,
  },
  tabInactive: {
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 15,
  },
  tabTextActive: {
    color: AUTH_COLORS.primary,
    fontWeight: '600',
  },
  tabTextInactive: {
    color: AUTH_COLORS.tabInactive,
    fontWeight: '400',
  },
});
