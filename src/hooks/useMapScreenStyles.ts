import { useMemo } from 'react';
import { useTheme } from '@/theme/ThemeContext';
import { createMapScreenStyles } from '@/constants/stylesMapScreen';

export const useMapScreenStyles = () => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => createMapScreenStyles(colors), [colors]);
  return { styles, colors, isDark };
};
