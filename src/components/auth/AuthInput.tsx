import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

interface AuthInputProps extends TextInputProps {
  label?: string;
  labelSlot?: React.ReactNode;
  error?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

const COLORS = {
  primary: '#1A6BF5',
  inputBg: '#F7F9FC',
  labelText: '#8A96A8',
  placeholder: '#B0BAC9',
  bodyText: '#1C2B4A',
  error: '#E53E3E',
  borderDefault: '#E2E8F4',
  white: '#FFFFFF',
};

export const AuthInput = ({
  label,
  labelSlot,
  error,
  leftSlot,
  rightSlot,
  style,
  onFocus,
  onBlur,
  ...textInputProps
}: AuthInputProps) => {
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
        ]}
      >
        {leftSlot ? <View style={styles.leftSlot}>{leftSlot}</View> : null}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={COLORS.placeholder}
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

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    marginLeft: 7,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.labelText,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 18,
    height: 52,
    paddingHorizontal: 14,
  },
  containerFocused: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOpacity: 0.18,
      },
    }),
  },
  containerError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.bodyText,
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
    color: COLORS.error,
  },
});
