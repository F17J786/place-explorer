import React from 'react';
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

import { COLORS } from '@/constants/colors';
import { ProfileMenuItem } from '@/components/profile/ProfileMenuItem';
import { useProfile } from '@/hooks/useProfile';

interface ProfileScreenProps {
  navigation?: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, handleLogout } = useProfile();

  const confirmLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: handleLogout,
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Tài khoản</Text>
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
            label="Thông tin cá nhân"
            subtitle="Cập nhật họ tên, email, ảnh đại diện"
            onPress={() => navigation.navigate('PersonalInfo')}
          />
          <View style={styles.divider} />
          <ProfileMenuItem
            icon="lock"
            label="Đổi mật khẩu"
            subtitle="Thay đổi mật khẩu đăng nhập"
            onPress={() => navigation.navigate('ChangePassword')}
          />
        </View>

        <View style={styles.menuGroup}>
          <ProfileMenuItem
            icon="log-out"
            label="Đăng xuất"
            onPress={confirmLogout}
            danger
          />
        </View>
      </ScrollView>
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
