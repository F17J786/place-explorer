import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';

import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthSubmitButton } from '@/components/auth/AuthSubmitButton';
import { AUTH_COLORS } from '@/constants/authTheme';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema } from '@/schemas/auth.schema';
import type { LoginFormValues } from '@/types/auth.types';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '@/constants/colors';

export const LoginForm = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { authError, clearAuthError, handleLogin, isLoginLoading } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    clearAuthError();
    handleLogin(values);
  };

  const handleForgotPassword = () => {
    clearAuthError();
  };

  return (
    <View>
      <AuthErrorBanner message={authError} />

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthInput
            leftSlot={<Icon name="mail" size={18} color={COLORS.placeholder} />}
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

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthInput
            label="Mật khẩu"
            placeholder="••••••••"
            secureTextEntry={!isPasswordVisible}
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={handleSubmit(onSubmit)}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
            leftSlot={<Icon name="lock" size={18} color={COLORS.placeholder} />}
            rightSlot={
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(v => !v)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon
                  name={isPasswordVisible ? 'eye-off' : 'eye'}
                  size={18}
                  color={COLORS.placeholder}
                />
              </TouchableOpacity>
            }
          />
        )}
      />

      <TouchableOpacity
        style={styles.forgotPassword}
        onPress={handleForgotPassword}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      ></TouchableOpacity>

      <AuthSubmitButton
        title="Đăng nhập"
        isLoading={isLoginLoading}
        onPress={handleSubmit(onSubmit)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  forgotPasswordText: {
    fontSize: 12,
    color: AUTH_COLORS.primaryLight,
  },
});
