import React, { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthSubmitButton } from '@/components/auth/AuthSubmitButton';
import { AvatarPicker } from '@/components/auth/AvatarPicker';
import { useTheme } from '@/theme/ThemeContext';
import { ThemeColors } from '@/theme/colors';
import { useProfile } from '@/hooks/useProfile';
import { updateProfileSchema } from '@/schemas/profile.schema';
import type { UpdateProfileFormValues } from '@/types/profile.types';
import { showToast } from '@/utils/toast';
import { createErrorTranslator } from '@/utils/formError';

interface PersonalInfoScreenProps {
  navigation?: any;
}

const translateError = createErrorTranslator('profile');

export const PersonalInfoScreen: React.FC<PersonalInfoScreenProps> = ({
  navigation,
}) => {
  const { t } = useTranslation('profile');
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
    const { success, queued } = await handleUpdateProfile(values);
    if (success) {
      if (!queued) {
        showToast(t('personalInfo.updateSuccess'));
      }
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
              error={translateError(errors.avatar?.message)}
            />
          )}
        />

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthInput
              containerStyle={{ backgroundColor: colors.inputBg2 }}
              leftSlot={
                <Icon name="user" size={18} color={colors.placeholder} />
              }
              label={t('auth:register.fullNameLabel')}
              placeholder={t('auth:register.fullNamePlaceholder')}
              autoCapitalize="words"
              autoCorrect={false}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={translateError(errors.name?.message)}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthInput
              containerStyle={{ backgroundColor: colors.inputBg2 }}
              leftSlot={
                <Icon name="mail" size={18} color={colors.placeholder} />
              }
              label={t('auth:register.emailLabel')}
              placeholder={t('auth:register.emailPlaceholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={translateError(errors.email?.message)}
            />
          )}
        />

        <AuthSubmitButton
          title={t('personalInfo.submitButton')}
          isLoading={isUpdateProfileLoading}
          onPress={handleSubmit(onSubmit)}
        />
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    content: {
      padding: 20,
    },
  });
