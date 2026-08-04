import i18n from 'i18next';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/locales';

const LOCALE_BY_LANGUAGE: Record<SupportedLanguage, string> = {
  en: 'en-US',
  vi: 'vi-VN',
  zh: 'zh-CN',
  ja: 'ja-JP',
  ko: 'ko-KR',
};

const getCurrentLocale = (): string => {
  const lang = SUPPORTED_LANGUAGES.includes(i18n.language as SupportedLanguage)
    ? (i18n.language as SupportedLanguage)
    : 'en';
  return LOCALE_BY_LANGUAGE[lang];
};

export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString(getCurrentLocale(), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString(getCurrentLocale());
};

export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const target = new Date(date);
  const diffSeconds = Math.floor((now.getTime() - target.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(getCurrentLocale(), {
    numeric: 'always',
  });

  if (diffSeconds < 60) return rtf.format(-diffSeconds, 'second');
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return rtf.format(-diffMinutes, 'minute');
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return rtf.format(-diffHours, 'hour');
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return rtf.format(-diffDays, 'day');
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return rtf.format(-diffMonths, 'month');
  const diffYears = Math.floor(diffMonths / 12);
  return rtf.format(-diffYears, 'year');
};
