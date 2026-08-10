import { useMemo } from 'react';
import { useTheme } from '@/theme/ThemeContext';
import { createProfileReviewScreenStyles } from '@/constants/stylesProfileReviewScreen';

export const useProfileReviewScreenStyles = () => {
  const { colors } = useTheme();
  const styles = useMemo(
    () => createProfileReviewScreenStyles(colors),
    [colors],
  );
  return { styles, colors };
};
