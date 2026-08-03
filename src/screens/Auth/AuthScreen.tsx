import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import CountryFlag from 'react-native-country-flag';
import Icon from 'react-native-vector-icons/Feather';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import {
  FLAG_MAP,
  LanguagePickerSheet,
} from '@/components/profile/LanguagePickerSheet';
import { AUTH_COLORS } from '@/constants/authTheme';
import type { AuthTab } from '@/types/auth.types';
import { useLanguage } from '@/hooks/useLanguage';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SupportedLanguage } from '@/locales';

const CARD_HORIZONTAL_MARGIN = 24;
const CARD_PADDING = 28;
const LOGO_SQUARE_SIZE = 18;
const LOGO_SQUARE_RADIUS = 6;
const LOGO_SQUARE_OFFSET = 6;

type AuthRouteProp = RouteProp<RootStackParamList, 'Auth'>;
type AuthNavProp = NativeStackNavigationProp<RootStackParamList, 'Auth'>;

export const AuthScreen = () => {
  const { t } = useTranslation('auth');
  const route = useRoute<AuthRouteProp>();
  const navigation = useNavigation<AuthNavProp>();
  const redirectTo = route.params?.redirectTo;

  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<AuthTab>('login');

  const { currentLanguage, setLanguage } = useLanguage();
  const languageSheetRef = useRef<BottomSheetModal>(null);

  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const openLanguageSheet = () => {
    setIsKeyboardOpen(Keyboard.isVisible());
    languageSheetRef.current?.present();
  };

  const handleSelectLanguage = async (lang: SupportedLanguage) => {
    await setLanguage(lang);
    languageSheetRef.current?.dismiss();
  };

  const formOpacity = useRef(new Animated.Value(1)).current;
  const formTranslateY = useRef(new Animated.Value(0)).current;

  const handleTabSwitch = useCallback(
    (tab: AuthTab) => {
      if (tab === activeTab) return;
      setActiveTab(tab);
    },
    [activeTab],
  );

  const onAuthSuccess = () => {
    if (redirectTo) {
      navigation.reset({
        index: 0,
        routes: [{ name: redirectTo.screen, params: redirectTo.params }],
      });
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    }
  };

  return (
    <KeyboardAwareScrollView
      style={[styles.screen, { paddingTop: insets.top }]}
      enableOnAndroid={false}
      keyboardShouldPersistTaps="always"
      contentContainerStyle={styles.keyboardScrollContent}
    >
      <TouchableOpacity
        style={[styles.langButton, { top: insets.top - 10 }]}
        onPress={openLanguageSheet}
        hitSlop={styles.hitSlop}
      >
        <View style={styles.langFlagWrapper}>
          <CountryFlag isoCode={FLAG_MAP[currentLanguage]} size={23} />
        </View>
        <Icon name="chevron-down" size={16} color={AUTH_COLORS.tabInactive} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoArea}>
          <View style={styles.logoSquares}>
            <View style={[styles.logoSquare, styles.logoSquarePrimary]} />
            <View style={[styles.logoSquare, styles.logoSquareAccent]} />
          </View>
          <Text style={styles.appName}>Place Explorer</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'login' ? styles.tabActive : styles.tabInactive,
              ]}
              onPress={() => handleTabSwitch('login')}
              hitSlop={styles.hitSlop}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'login'
                    ? styles.tabTextActive
                    : styles.tabTextInactive,
                ]}
              >
                {t('tabs.login')}
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
              hitSlop={styles.hitSlop}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'register'
                    ? styles.tabTextActive
                    : styles.tabTextInactive,
                ]}
              >
                {t('tabs.register')}
              </Text>
            </TouchableOpacity>
          </View>

          <Animated.View
            style={{
              opacity: formOpacity,
              transform: [{ translateY: formTranslateY }],
            }}
          >
            {activeTab === 'login' ? (
              <LoginForm onSuccess={onAuthSuccess} />
            ) : (
              <RegisterForm />
            )}
          </Animated.View>
        </View>
      </ScrollView>
      <LanguagePickerSheet
        ref={languageSheetRef}
        currentLanguage={currentLanguage}
        onSelect={handleSelectLanguage}
        isKeyboardOpen={isKeyboardOpen}
      />
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
  keyboardScrollContent: {
    flexGrow: 1,
  },
  hitSlop: {
    top: 8,
    bottom: 8,
    left: 8,
    right: 8,
  },
  langButton: {
    position: 'absolute',
    right: 20,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  langFlagWrapper: {
    width: 21,
    height: 21,
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
