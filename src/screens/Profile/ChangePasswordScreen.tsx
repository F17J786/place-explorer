import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import Icon from 'react-native-vector-icons/Feather';

import { AuthErrorBanner } from '@/components/auth/AuthErrorBanner';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthSubmitButton } from '@/components/auth/AuthSubmitButton';
import { COLORS } from '@/constants/colors';
import { useProfile } from '@/hooks/useProfile';
import { changePasswordSchema } from '@/schemas/profile.schema';
import type { ChangePasswordFormValues } from '@/types/profile.types';
import { showToast } from '../Map/MapScreen';

interface ChangePasswordScreenProps {
  navigation?: any;
}

export const ChangePasswordScreen: React.FC<ChangePasswordScreenProps> = ({
  navigation,
}) => {
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
      showToast('Đổi mật khẩu thành công');
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
              label="Mật khẩu hiện tại"
              placeholder="••••••••"
              secureTextEntry={!isOldVisible}
              autoCapitalize="none"
              autoCorrect={false}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.oldPassword?.message}
              leftSlot={
                <Icon name="lock" size={18} color={COLORS.placeholder} />
              }
              rightSlot={
                <TouchableOpacity
                  onPress={() => setIsOldVisible(v => !v)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
              label="Mật khẩu mới"
              placeholder="••••••••"
              secureTextEntry={!isNewVisible}
              autoCapitalize="none"
              autoCorrect={false}
              value={value}
              onChangeText={v => {
                onChange(v);
                trigger('confirmNewPassword');
              }}
              onBlur={onBlur}
              error={errors.newPassword?.message}
              leftSlot={
                <Icon name="lock" size={18} color={COLORS.placeholder} />
              }
              rightSlot={
                <TouchableOpacity
                  onPress={() => setIsNewVisible(v => !v)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
              label="Xác nhận mật khẩu mới"
              placeholder="••••••••"
              secureTextEntry={!isConfirmVisible}
              autoCapitalize="none"
              autoCorrect={false}
              value={value}
              onChangeText={v => {
                onChange(v);
                trigger('confirmNewPassword');
              }}
              onBlur={onBlur}
              error={errors.confirmNewPassword?.message}
              leftSlot={
                <Icon name="lock" size={18} color={COLORS.placeholder} />
              }
              rightSlot={
                <TouchableOpacity
                  onPress={() => setIsConfirmVisible(v => !v)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
          title="Đổi mật khẩu"
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
});
