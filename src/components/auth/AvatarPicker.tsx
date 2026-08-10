import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { AUTH_TYPOGRAPHY, AuthColors } from '@/constants/authTheme';
import { useAuthColors } from '@/hooks/useAuthColors';
import { useImagePicker } from '@/hooks/useImagePicker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface AvatarPickerProps {
  value?: string;
  onChange: (uri: string) => void;
  error?: string;
}

export const AvatarPicker = ({ value, onChange, error }: AvatarPickerProps) => {
  const { t } = useTranslation('auth');
  const AUTH_COLORS = useAuthColors();
  const styles = useMemo(() => createStyles(AUTH_COLORS), [AUTH_COLORS]);
  const { pickFromGallery, pickFromCamera } = useImagePicker();
  const avatarUri = value;

  const handlePickFromGallery = async () => {
    const uri = await pickFromGallery();
    if (uri) {
      onChange(uri);
    }
  };

  const handlePickFromCamera = async () => {
    const uri = await pickFromCamera();
    if (uri) {
      onChange(uri);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{t('register.avatarLabel')}</Text>
      <View style={styles.row}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        ) : (
          <View style={styles.defaultAvatar}>
            <MaterialCommunityIcons
              name="image-outline"
              size={40}
              color={AUTH_COLORS.avatarPlaceholderIcon}
            />
          </View>
        )}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handlePickFromGallery}
            hitSlop={styles.hitSlop}
          >
            <Text style={styles.actionButtonText}>
              {t('register.avatarPickGallery')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonOutline]}
            onPress={handlePickFromCamera}
            hitSlop={styles.hitSlop}
          >
            <Text style={styles.actionButtonOutlineText}>
              {t('register.avatarPickCamera')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const AVATAR_SIZE = 72;

const createStyles = (AUTH_COLORS: AuthColors) =>
  StyleSheet.create({
    wrapper: {
      marginBottom: 16,
    },
    label: {
      ...AUTH_TYPOGRAPHY.label,
      color: AUTH_COLORS.label,
      marginBottom: 6,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatar: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
      backgroundColor: AUTH_COLORS.primaryPale,
      borderWidth: 2,
      borderColor: AUTH_COLORS.borderDefault,
    },
    defaultAvatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: AUTH_COLORS.avatarPlaceholderBg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    actions: {
      flex: 1,
      marginLeft: 16,
      gap: 8,
    },
    actionButton: {
      backgroundColor: AUTH_COLORS.primaryPale,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 14,
      alignItems: 'center',
    },
    actionButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: AUTH_COLORS.primary,
    },
    actionButtonOutline: {
      backgroundColor: AUTH_COLORS.white,
      borderWidth: 1.5,
      borderColor: AUTH_COLORS.borderDefault,
    },
    actionButtonOutlineText: {
      fontSize: 13,
      fontWeight: '500',
      color: AUTH_COLORS.textMuted,
    },
    error: {
      fontSize: 12,
      color: AUTH_COLORS.error,
      marginTop: 4,
    },
    hitSlop: {
      top: 8,
      bottom: 8,
      left: 8,
      right: 8,
    },
  });
