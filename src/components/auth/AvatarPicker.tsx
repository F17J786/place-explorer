import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { AUTH_COLORS, AUTH_TYPOGRAPHY } from '@/constants/authTheme';
import { DEFAULT_AVATAR_URL } from '@/constants/api';
import { useImagePicker } from '@/hooks/useImagePicker';

interface AvatarPickerProps {
  value?: string;
  onChange: (uri: string) => void;
  error?: string;
}

export const AvatarPicker = ({ value, onChange, error }: AvatarPickerProps) => {
  const { pickFromGallery, pickFromCamera } = useImagePicker();
  const avatarUri = value || DEFAULT_AVATAR_URL;

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
      <Text style={styles.label}>Ảnh đại diện</Text>
      <View style={styles.row}>
        <Image source={{ uri: avatarUri }} style={styles.avatar} />
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handlePickFromGallery}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.actionButtonText}>Chọn ảnh</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonOutline]}
            onPress={handlePickFromCamera}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.actionButtonOutlineText}>Chụp ảnh</Text>
          </TouchableOpacity>
        </View>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const AVATAR_SIZE = 72;

const styles = StyleSheet.create({
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
});
