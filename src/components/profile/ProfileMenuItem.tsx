import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import { useTheme } from '@/theme/ThemeContext';
import { ThemeColors } from '@/theme/colors';

interface ProfileMenuItemProps {
  icon: string;
  iconSet?: 'Feather' | 'MaterialIcons';
  label: string;
  subtitle?: string;
  rightText?: string;
  rightComponent?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
}

export const ProfileMenuItem = ({
  icon,
  iconSet = 'Feather',
  label,
  subtitle,
  rightText,
  rightComponent,
  onPress,
  danger = false,
}: ProfileMenuItemProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const IconComponent = iconSet === 'MaterialIcons' ? MaterialIcon : Icon;

  const content = (
    <>
      <View
        style={[
          styles.iconWrapper,
          danger ? styles.iconWrapperDanger : styles.iconWrapperDefault,
        ]}
      >
        <IconComponent
          name={icon}
          size={20}
          color={danger ? colors.error : colors.primary}
        />
      </View>

      <View style={styles.textWrapper}>
        <Text style={[styles.label, danger && styles.labelDanger]}>
          {label}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {rightComponent ? (
        rightComponent
      ) : (
        <>
          {rightText ? <Text style={styles.rightText}>{rightText}</Text> : null}
          {!danger && onPress && (
            <Icon name="chevron-right" size={20} color={colors.placeholder} />
          )}
        </>
      )}
    </>
  );

  // Khi có rightComponent tương tác riêng (VD ThemeSwitcher), không bọc cả row
  // trong TouchableOpacity nữa để tránh xung đột vùng bấm.
  if (rightComponent) {
    return <View style={styles.container}>{content}</View>;
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.6}
    >
      {content}
    </TouchableOpacity>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      backgroundColor: colors.surface,
    },
    iconWrapper: {
      width: 38,
      height: 38,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    iconWrapperDefault: {
      backgroundColor: colors.primaryLight,
    },
    iconWrapperDanger: {
      backgroundColor: '#FDECEC',
    },
    textWrapper: {
      flex: 1,
    },
    label: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    labelDanger: {
      color: colors.error,
    },
    subtitle: {
      marginTop: 2,
      fontSize: 12,
      color: colors.textSecondary,
    },
    rightText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginRight: 4,
    },
  });
