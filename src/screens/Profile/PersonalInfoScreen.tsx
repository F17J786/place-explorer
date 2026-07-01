import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import Icon from 'react-native-vector-icons/Feather';

import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthSubmitButton } from '@/components/auth/AuthSubmitButton';
import { AvatarPicker } from '@/components/auth/AvatarPicker';
import { COLORS } from '@/constants/colors';
import { useProfile } from '@/hooks/useProfile';
import { updateProfileSchema } from '@/schemas/profile.schema';
import type { UpdateProfileFormValues } from '@/types/profile.types';
import { showToast } from '../Map/MapScreen';

interface PersonalInfoScreenProps {
  navigation?: any;
}

export const PersonalInfoScreen: React.FC<PersonalInfoScreenProps> = ({
  navigation,
}) => {
  const {
    user,
    profileError,
    clearProfileError,
    handleUpdateProfile,
    isUpdateProfileLoading,
  } = useProfile();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    mode: 'onBlur',
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      avatar: user?.avatar ?? '',
    },
  });

  const onSubmit = async (values: UpdateProfileFormValues) => {
    clearProfileError();
    const success = await handleUpdateProfile(values);
    if (success) {
      showToast('Cập nhật thông tin thành công');
      navigation.goBack();
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <AuthErrorBanner message={profileError} />

        <Controller
          control={control}
          name="avatar"
          render={({ field: { onChange, value } }) => (
            <AvatarPicker
              value={value}
              onChange={onChange}
              error={errors.avatar?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthInput
              containerStyle={{ backgroundColor: COLORS.inputBg2 }}
              leftSlot={
                <Icon name="user" size={18} color={COLORS.placeholder} />
              }
              label="Họ và tên"
              placeholder="Nguyễn Văn A"
              autoCapitalize="words"
              autoCorrect={false}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.name?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthInput
              containerStyle={{ backgroundColor: COLORS.inputBg2 }}
              leftSlot={
                <Icon name="mail" size={18} color={COLORS.placeholder} />
              }
              label="Email"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.email?.message}
            />
          )}
        />

        <AuthSubmitButton
          title="Lưu thay đổi"
          isLoading={isUpdateProfileLoading}
          onPress={handleSubmit(onSubmit)}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: 20,
  },
});
