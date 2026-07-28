import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

// English resources
import enCommon from './en/common.json';
import enAuth from './en/auth.json';
import enProfile from './en/profile.json';
import enFavorites from './en/favorites.json';
import enPlaceDetail from './en/placeDetail.json';
import enReview from './en/review.json';
import enCheckin from './en/checkin.json';
import enProfileReview from './en/profileReview.json'; // mới

// Vietnamese resources
import viCommon from './vi/common.json';
import viAuth from './vi/auth.json';
import viProfile from './vi/profile.json';
import viFavorites from './vi/favorites.json';
import viPlaceDetail from './vi/placeDetail.json';
import viReview from './vi/review.json';
import viCheckin from './vi/checkin.json';
import viProfileReview from './vi/profileReview.json'; // mới
import enMap from './en/map.json'; // mới
import viMap from './vi/map.json'; // mới

export const LANGUAGE_STORAGE_KEY = '@app_language';

export const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    profile: enProfile,
    favorites: enFavorites,
    placeDetail: enPlaceDetail,
    review: enReview,
    checkin: enCheckin,
    profileReview: enProfileReview, // mới
    map: enMap,
  },
  vi: {
    common: viCommon,
    auth: viAuth,
    profile: viProfile,
    favorites: viFavorites,
    placeDetail: viPlaceDetail,
    review: viReview,
    checkin: viCheckin,
    profileReview: viProfileReview, // mới
    map: viMap,
  },
} as const;

export const SUPPORTED_LANGUAGES = ['en', 'vi'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const getDeviceLanguage = (): SupportedLanguage => {
  const locales = RNLocalize.getLocales();
  if (locales.length > 0) {
    const deviceLang = locales[0].languageCode;
    if (SUPPORTED_LANGUAGES.includes(deviceLang as SupportedLanguage)) {
      return deviceLang as SupportedLanguage;
    }
  }
  return 'en';
};

const initI18n = async () => {
  let savedLanguage: string | null = null;

  try {
    savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch (error) {
    console.warn('[i18n] Failed to read saved language:', error);
  }

  const initialLanguage =
    (savedLanguage as SupportedLanguage) || getDeviceLanguage();

  await i18n.use(initReactI18next).init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: [
      'common',
      'auth',
      'profile',
      'favorites',
      'placeDetail',
      'review',
      'checkin',
      'profileReview', // mới
      'map',
    ],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    compatibilityJSON: 'v4',
  });

  return i18n;
};

export const changeLanguage = async (lang: SupportedLanguage) => {
  await i18n.changeLanguage(lang);
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch (error) {
    console.warn('[i18n] Failed to save language:', error);
  }
};

export default initI18n;
