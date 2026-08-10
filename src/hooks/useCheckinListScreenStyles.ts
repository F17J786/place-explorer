import { useMemo } from 'react';
import { useTheme } from '@/theme/ThemeContext';
import { createCheckinListScreenStyles } from '@/constants/stylesCheckinListScreen';

export const useCheckinListScreenStyles = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => createCheckinListScreenStyles(colors), [colors]);
  return { styles, colors };
};
