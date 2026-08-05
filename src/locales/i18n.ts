import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

import enCommon from './en/common.json';
import enAuth from './en/auth.json';
import enProfile from './en/profile.json';
import enFavorites from './en/favorites.json';
import enPlaceDetail from './en/placeDetail.json';
import enReview from './en/review.json';
import enCheckin from './en/checkin.json';
import enProfileReview from './en/profileReview.json';

import viCommon from './vi/common.json';
import viAuth from './vi/auth.json';
import viProfile from './vi/profile.json';
import viFavorites from './vi/favorites.json';
import viPlaceDetail from './vi/placeDetail.json';
import viReview from './vi/review.json';
import viCheckin from './vi/checkin.json';
import viProfileReview from './vi/profileReview.json';
import enMap from './en/map.json';
import viMap from './vi/map.json';

import zhCommon from './zh/common.json';
import zhAuth from './zh/auth.json';
import zhProfile from './zh/profile.json';
import zhFavorites from './zh/favorites.json';
import zhPlaceDetail from './zh/placeDetail.json';
import zhReview from './zh/review.json';
import zhCheckin from './zh/checkin.json';
import zhProfileReview from './zh/profileReview.json';
import zhMap from './zh/map.json';

import jaCommon from './ja/common.json';
import jaAuth from './ja/auth.json';
import jaProfile from './ja/profile.json';
import jaFavorites from './ja/favorites.json';
import jaPlaceDetail from './ja/placeDetail.json';
import jaReview from './ja/review.json';
import jaCheckin from './ja/checkin.json';
import jaProfileReview from './ja/profileReview.json';
import jaMap from './ja/map.json';

import koCommon from './ko/common.json';
import koAuth from './ko/auth.json';
import koProfile from './ko/profile.json';
import koFavorites from './ko/favorites.json';
import koPlaceDetail from './ko/placeDetail.json';
import koReview from './ko/review.json';
import koCheckin from './ko/checkin.json';
import koProfileReview from './ko/profileReview.json';
import koMap from './ko/map.json';

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
    profileReview: enProfileReview,
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
    profileReview: viProfileReview,
    map: viMap,
  },
  zh: {
    common: zhCommon,
    auth: zhAuth,
    profile: zhProfile,
    favorites: zhFavorites,
    placeDetail: zhPlaceDetail,
    review: zhReview,
    checkin: zhCheckin,
    profileReview: zhProfileReview,
    map: zhMap,
  },
  ja: {
    common: jaCommon,
    auth: jaAuth,
    profile: jaProfile,
    favorites: jaFavorites,
    placeDetail: jaPlaceDetail,
    review: jaReview,
    checkin: jaCheckin,
    profileReview: jaProfileReview,
    map: jaMap,
  },
  ko: {
    common: koCommon,
    auth: koAuth,
    profile: koProfile,
    favorites: koFavorites,
    placeDetail: koPlaceDetail,
    review: koReview,
    checkin: koCheckin,
    profileReview: koProfileReview,
    map: koMap,
  },
} as const;

export const SUPPORTED_LANGUAGES = ['en', 'vi', 'zh', 'ja', 'ko'] as const;
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
      'profileReview',
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
