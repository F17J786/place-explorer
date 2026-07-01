import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import { COLORS } from '@/constants/colors';

interface ProfileMenuItemProps {
  icon: string;
  label: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
}

export const ProfileMenuItem = ({
  icon,
  label,
  subtitle,
  onPress,
  danger = false,
}: ProfileMenuItemProps) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View
        style={[
          styles.iconWrapper,
          danger ? styles.iconWrapperDanger : styles.iconWrapperDefault,
        ]}
      >
        <Icon
          name={icon}
          size={20}
          color={danger ? COLORS.error : COLORS.primary}
        />
      </View>

      <View style={styles.textWrapper}>
        <Text style={[styles.label, danger && styles.labelDanger]}>
          {label}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {!danger && (
        <Icon name="chevron-right" size={20} color={COLORS.placeholder} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
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
    backgroundColor: '#E8EEFB',
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
    color: COLORS.text,
  },
  labelDanger: {
    color: COLORS.error,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
