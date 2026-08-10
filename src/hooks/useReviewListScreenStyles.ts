import { useMemo } from 'react';
import { useTheme } from '@/theme/ThemeContext';
import { createReviewListScreenStyles } from '@/constants/stylesReviewListScreen';

export const useReviewListScreenStyles = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => createReviewListScreenStyles(colors), [colors]);
  return { styles, colors };
};
