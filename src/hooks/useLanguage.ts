import { useTranslation } from 'react-i18next';
import { changeLanguage, SupportedLanguage } from '@/locales';

export const useLanguage = () => {
  const { i18n } = useTranslation();

  const currentLanguage = i18n.language as SupportedLanguage;

  const setLanguage = async (lang: SupportedLanguage) => {
    await changeLanguage(lang);
  };

  return { currentLanguage, setLanguage };
};
