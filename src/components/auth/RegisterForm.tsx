import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';

import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthSubmitButton } from '@/components/auth/AuthSubmitButton';
import { AvatarPicker } from '@/components/auth/AvatarPicker';
import { useAuth } from '@/hooks/useAuth';
import { registerSchema } from '@/schemas/auth.schema';
import type { RegisterFormValues } from '@/types/auth.types';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '@/theme/ThemeContext';
import { createErrorTranslator } from '@/utils/formError';

export const RegisterForm = () => {
  const translateError = createErrorTranslator('auth');
  const { t } = useTranslation('auth');
  const { colors } = useTheme();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const { authError, clearAuthError, handleRegister, isRegisterLoading } =
    useAuth();

  const {
    control,
    trigger,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      avatar: '',
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    clearAuthError();
    handleRegister(values);
  };

  return (
    <View style={styles.container}>
      <AuthErrorBanner message={authError} />

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
        name="fullName"
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthInput
            leftSlot={<Icon name="user" size={18} color={colors.placeholder} />}
            label={t('register.fullNameLabel')}
            placeholder={t('register.fullNamePlaceholder')}
            autoCapitalize="words"
            autoCorrect={false}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={translateError(errors.fullName?.message)}
          />
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthInput
            leftSlot={<Icon name="mail" size={18} color={colors.placeholder} />}
            label={t('register.emailLabel')}
            placeholder={t('register.emailPlaceholder')}
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

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthInput
            label={t('register.passwordLabel')}
            placeholder={t('register.passwordPlaceholder')}
            secureTextEntry={!isPasswordVisible}
            autoCapitalize="none"
            autoCorrect={false}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={translateError(errors.password?.message)}
            leftSlot={<Icon name="lock" size={18} color={colors.placeholder} />}
            rightSlot={
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(v => !v)}
                hitSlop={styles.hitSlop}
              >
                <Icon
                  name={isPasswordVisible ? 'eye-off' : 'eye'}
                  size={18}
                  color={colors.placeholder}
                />
              </TouchableOpacity>
            }
          />
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthInput
            label={t('register.confirmPasswordLabel')}
            placeholder={t('register.confirmPasswordPlaceholder')}
            secureTextEntry={!isConfirmPasswordVisible}
            autoCapitalize="none"
            autoCorrect={false}
            value={value}
            onChangeText={v => {
              onChange(v);
              trigger('confirmPassword');
            }}
            onBlur={onBlur}
            error={translateError(errors.confirmPassword?.message)}
            leftSlot={<Icon name="lock" size={18} color={colors.placeholder} />}
            rightSlot={
              <TouchableOpacity
                onPress={() => setIsConfirmPasswordVisible(v => !v)}
                hitSlop={styles.hitSlop}
              >
                <Icon
                  name={isConfirmPasswordVisible ? 'eye-off' : 'eye'}
                  size={18}
                  color={colors.placeholder}
                />
              </TouchableOpacity>
            }
          />
        )}
      />

      <AuthSubmitButton
        title={t('register.submitButton')}
        isLoading={isRegisterLoading}
        onPress={handleSubmit(onSubmit)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  hitSlop: {
    top: 8,
    bottom: 8,
    left: 8,
    right: 8,
  },
});
