import React, { useRef } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';

import { COLORS } from '@/constants/constants';
import { ProfileMenuItem } from '@/components/profile/ProfileMenuItem';
import { LanguagePickerSheet } from '@/components/profile/LanguagePickerSheet';
import { useProfile } from '@/hooks/useProfile';
import { useLanguage } from '@/hooks/useLanguage';
import { SupportedLanguage } from '@/locales';

interface ProfileScreenProps {
  navigation?: any;
}

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  vi: 'Tiếng Việt',
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('profile');
  const { user, handleLogout } = useProfile();
  const { currentLanguage, setLanguage } = useLanguage();
  const languageSheetRef = useRef<BottomSheetModal>(null);

  const confirmLogout = () => {
    Alert.alert(t('logout.title'), t('logout.message'), [
      { text: t('logout.cancel'), style: 'cancel' },
      {
        text: t('logout.confirm'),
        style: 'destructive',
        onPress: handleLogout,
      },
    ]);
  };

  const handleSelectLanguage = async (lang: SupportedLanguage) => {
    await setLanguage(lang);
    languageSheetRef.current?.dismiss();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>{t('title')}</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.userCard}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Icon name="user" size={28} color={COLORS.white} />
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.name ?? '—'}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user?.email ?? '—'}
            </Text>
          </View>
        </View>

        <View style={styles.menuGroup}>
          <ProfileMenuItem
            icon="user"
            label={t('menu.personalInfo')}
            subtitle={t('menu.personalInfoSubtitle')}
            onPress={() => navigation.navigate('PersonalInfo')}
          />
          <View style={styles.divider} />
          <ProfileMenuItem
            icon="lock"
            label={t('menu.changePassword')}
            subtitle={t('menu.changePasswordSubtitle')}
            onPress={() => navigation.navigate('ChangePassword')}
          />
          <View style={styles.divider} />
          <ProfileMenuItem
            icon="translate"
            iconSet="MaterialIcons"
            label={t('menu.language')}
            rightText={LANGUAGE_LABELS[currentLanguage]}
            onPress={() => languageSheetRef.current?.present()}
          />
        </View>

        <View style={styles.menuGroup}>
          <ProfileMenuItem
            icon="log-out"
            label={t('menu.logout')}
            onPress={confirmLogout}
            danger
          />
        </View>
      </ScrollView>

      <LanguagePickerSheet
        ref={languageSheetRef}
        currentLanguage={currentLanguage}
        onSelect={handleSelectLanguage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingHorizontal: 16,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 125,
    zIndex: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  content: {
    zIndex: 10,
    marginTop: 80,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: -24,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  userEmail: {
    marginTop: 2,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  menuGroup: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border ?? '#E5E7EB',
  },
});
