import { useTheme } from '@/theme/ThemeContext';
import { lightAuthColors, darkAuthColors } from '@/constants/authTheme';

export const useAuthColors = () => {
  const { isDark } = useTheme();
  return isDark ? darkAuthColors : lightAuthColors;
};
