import { useMemo } from 'react';
import { useTheme } from '@/theme/ThemeContext';
import { createPlaceDetailScreenStyles } from '@/constants/stylesPlaceDetailScreen';

export const usePlaceDetailScreenStyles = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => createPlaceDetailScreenStyles(colors), [colors]);
  return { styles, colors };
};
