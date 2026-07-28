import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import Icon from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthSubmitButton } from '@/components/auth/AuthSubmitButton';
import { COLORS } from '@/constants/constants';
import { useProfile } from '@/hooks/useProfile';
import { changePasswordSchema } from '@/schemas/profile.schema';
import type { ChangePasswordFormValues } from '@/types/profile.types';
import { showToast } from '@/utils/toast';
import { createErrorTranslator } from '@/utils/formError';

interface ChangePasswordScreenProps {
  navigation?: any;
}

const translateError = createErrorTranslator('profile');

export const ChangePasswordScreen: React.FC<ChangePasswordScreenProps> = ({
  navigation,
}) => {
  const { t } = useTranslation('profile');
  const [isOldVisible, setIsOldVisible] = useState(false);
  const [isNewVisible, setIsNewVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);

  const {
    passwordError,
    clearPasswordError,
    handleChangePassword,
    isChangePasswordLoading,
  } = useProfile();

  const {
    control,
    trigger,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onBlur',
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onSubmit = async (values: ChangePasswordFormValues) => {
    clearPasswordError();
    const success = await handleChangePassword(values);
    if (success) {
      showToast(t('changePassword.successMessage'));
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
        <AuthErrorBanner message={passwordError} />

        <Controller
          control={control}
          name="oldPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthInput
              containerStyle={{ backgroundColor: COLORS.inputBg2 }}
              label={t('changePassword.oldPasswordLabel')}
              placeholder={t('auth:register.passwordPlaceholder')}
              secureTextEntry={!isOldVisible}
              autoCapitalize="none"
              autoCorrect={false}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={translateError(errors.oldPassword?.message)}
              leftSlot={
                <Icon name="lock" size={18} color={COLORS.placeholder} />
              }
              rightSlot={
                <TouchableOpacity
                  onPress={() => setIsOldVisible(v => !v)}
                  hitSlop={styles.hitSlop}
                >
                  <Icon
                    name={isOldVisible ? 'eye-off' : 'eye'}
                    size={18}
                    color={COLORS.placeholder}
                  />
                </TouchableOpacity>
              }
            />
          )}
        />

        <Controller
          control={control}
          name="newPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthInput
              containerStyle={{ backgroundColor: COLORS.inputBg2 }}
              label={t('changePassword.newPasswordLabel')}
              placeholder={t('auth:register.passwordPlaceholder')}
              secureTextEntry={!isNewVisible}
              autoCapitalize="none"
              autoCorrect={false}
              value={value}
              onChangeText={v => {
                onChange(v);
                trigger('confirmNewPassword');
              }}
              onBlur={onBlur}
              error={translateError(errors.newPassword?.message)}
              leftSlot={
                <Icon name="lock" size={18} color={COLORS.placeholder} />
              }
              rightSlot={
                <TouchableOpacity
                  onPress={() => setIsNewVisible(v => !v)}
                  hitSlop={styles.hitSlop}
                >
                  <Icon
                    name={isNewVisible ? 'eye-off' : 'eye'}
                    size={18}
                    color={COLORS.placeholder}
                  />
                </TouchableOpacity>
              }
            />
          )}
        />

        <Controller
          control={control}
          name="confirmNewPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <AuthInput
              containerStyle={{ backgroundColor: COLORS.inputBg2 }}
              label={t('changePassword.confirmNewPasswordLabel')}
              placeholder={t('auth:register.passwordPlaceholder')}
              secureTextEntry={!isConfirmVisible}
              autoCapitalize="none"
              autoCorrect={false}
              value={value}
              onChangeText={v => {
                onChange(v);
                trigger('confirmNewPassword');
              }}
              onBlur={onBlur}
              error={translateError(errors.confirmNewPassword?.message)}
              leftSlot={
                <Icon name="lock" size={18} color={COLORS.placeholder} />
              }
              rightSlot={
                <TouchableOpacity
                  onPress={() => setIsConfirmVisible(v => !v)}
                  hitSlop={styles.hitSlop}
                >
                  <Icon
                    name={isConfirmVisible ? 'eye-off' : 'eye'}
                    size={18}
                    color={COLORS.placeholder}
                  />
                </TouchableOpacity>
              }
            />
          )}
        />

        <AuthSubmitButton
          title={t('changePassword.submitButton')}
          isLoading={isChangePasswordLoading}
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
  hitSlop: {
    top: 8,
    bottom: 8,
    left: 8,
    right: 8,
  },
});
