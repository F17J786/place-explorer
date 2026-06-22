import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';

import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthSubmitButton } from '@/components/auth/AuthSubmitButton';
import { AvatarPicker } from '@/components/auth/AvatarPicker';
import { useAuth } from '@/hooks/useAuth';
import { registerSchema } from '@/schemas/auth.schema';
import type { RegisterFormValues } from '@/types/auth.types';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '@/constants/colors';

export const RegisterForm = () => {
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
    console.log('🔥 onSubmit called:', values);
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
            error={errors.avatar?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="fullName"
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthInput
            leftSlot={<Icon name="user" size={18} color={COLORS.placeholder} />}
            label="Họ và tên"
            placeholder="Nguyễn Văn A"
            autoCapitalize="words"
            autoCorrect={false}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.fullName?.message}
          />
        )}
      />

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
            autoCorrect={false}
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

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <AuthInput
            label="Xác nhận mật khẩu"
            placeholder="••••••••"
            secureTextEntry={!isConfirmPasswordVisible}
            autoCapitalize="none"
            autoCorrect={false}
            value={value}
            onChangeText={v => {
              onChange(v);
              trigger('confirmPassword');
            }}
            onBlur={onBlur}
            error={errors.confirmPassword?.message}
            leftSlot={<Icon name="lock" size={18} color={COLORS.placeholder} />}
            rightSlot={
              <TouchableOpacity
                onPress={() => setIsConfirmPasswordVisible(v => !v)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon
                  name={isConfirmPasswordVisible ? 'eye-off' : 'eye'}
                  size={18}
                  color={COLORS.placeholder}
                />
              </TouchableOpacity>
            }
          />
        )}
      />

      <AuthSubmitButton
        title="Tạo tài khoản"
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
});
