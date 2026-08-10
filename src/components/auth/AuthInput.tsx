import React, { useMemo, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ViewStyle,
  type TextInputProps,
} from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { ThemeColors } from '@/theme/colors';

interface AuthInputProps extends TextInputProps {
  label?: string;
  labelSlot?: React.ReactNode;
  error?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const AuthInput = ({
  label,
  labelSlot,
  error,
  leftSlot,
  rightSlot,
  style,
  containerStyle,
  onFocus,
  onBlur,
  ...textInputProps
}: AuthInputProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus: TextInputProps['onFocus'] = event => {
    setIsFocused(true);
    onFocus?.(event);
  };

  const handleBlur: TextInputProps['onBlur'] = event => {
    setIsFocused(false);
    onBlur?.(event);
  };

  return (
    <View style={styles.wrapper}>
      {labelSlot ?? (label ? <Text style={styles.label}>{label}</Text> : null)}
      <View
        style={[
          styles.container,
          isFocused && styles.containerFocused,
          error ? styles.containerError : undefined,
          containerStyle,
        ]}
      >
        {leftSlot ? <View style={styles.leftSlot}>{leftSlot}</View> : null}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.placeholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...textInputProps}
        />
        {rightSlot ? <View style={styles.rightSlot}>{rightSlot}</View> : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrapper: {
      marginBottom: 16,
    },
    label: {
      marginLeft: 7,
      fontSize: 11,
      fontWeight: '700',
      color: colors.labelText,
      letterSpacing: 0.8,
      marginBottom: 8,
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBg,
      borderRadius: 18,
      height: 52,
      paddingHorizontal: 14,
    },
    containerFocused: {
      borderWidth: 1,
      borderColor: colors.primaryAlt,
      ...Platform.select({
        ios: {
          shadowColor: colors.primaryAlt,
          shadowOpacity: 0.18,
        },
      }),
    },
    containerError: {
      borderColor: colors.error2,
    },
    input: {
      flex: 1,
      fontSize: 15,
      fontWeight: 'bold',
      color: colors.bodyText,
      padding: 0,
    },
    leftSlot: {
      marginLeft: 2,
      marginRight: 10,
    },
    rightSlot: {
      marginLeft: 8,
    },
    errorText: {
      marginLeft: 7,
      marginTop: 4,
      fontSize: 12,
      color: colors.error2,
    },
  });
