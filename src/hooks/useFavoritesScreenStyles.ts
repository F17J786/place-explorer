import { useMemo } from 'react';
import { useTheme } from '@/theme/ThemeContext';
import { createFavoritesScreenStyles } from '@/constants/stylesFavoritesScreen';

export const useFavoritesScreenStyles = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => createFavoritesScreenStyles(colors), [colors]);
  return { styles, colors };
};
