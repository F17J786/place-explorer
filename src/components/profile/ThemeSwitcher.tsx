import React, { useMemo } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Animated, {
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useTheme, ThemeMode } from '@/theme/ThemeContext';
import { ThemeColors } from '@/theme/colors';

const MODES: ThemeMode[] = ['system', 'light', 'dark'];
const MODE_ICONS: Record<ThemeMode, string> = {
  system: 'smartphone',
  light: 'sun',
  dark: 'moon',
};

interface ThemeSwitcherProps {
  compact?: boolean;
}

export const ThemeSwitcher = ({ compact = false }: ThemeSwitcherProps) => {
  const { mode, setMode, colors } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const styles = useMemo(
    () => createStyles(colors, compact),
    [colors, compact],
  );

  const internalPadding = 6;
  const controlWidth = compact ? 132 : Math.min(windowWidth - 40, 220);
  const itemWidth = (controlWidth - internalPadding) / MODES.length;

  const rStyle = useAnimatedStyle(() => {
    return {
      left: withTiming(itemWidth * MODES.indexOf(mode) + internalPadding / 2),
    };
  }, [mode, itemWidth]);

  const iconSize = compact ? 18 : 20;

  return (
    <View style={[styles.container, { width: controlWidth }]}>
      <Animated.View style={[{ width: itemWidth }, rStyle, styles.activeBox]} />
      {MODES.map(m => {
        const active = mode === m;
        return (
          <TouchableOpacity
            key={m}
            onPress={() => setMode(m)}
            style={[{ width: itemWidth }, styles.labelContainer]}
            hitSlop={{ top: 6, bottom: 6, left: 2, right: 2 }}
          >
            <Icon
              name={MODE_ICONS[m]}
              size={iconSize}
              color={active ? colors.white : colors.textSecondary}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const createStyles = (colors: ThemeColors, compact: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      height: compact ? 40 : 48,
      borderRadius: compact ? 18 : 22,
      backgroundColor: colors.bg,
      paddingLeft: 3,
    },
    activeBox: {
      position: 'absolute',
      borderRadius: compact ? 14 : 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.1,
      elevation: 3,
      height: '80%',
      top: '10%',
      backgroundColor: colors.primary,
    },
    labelContainer: { justifyContent: 'center', alignItems: 'center' },
  });
