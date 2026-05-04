import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { env } from '@/config/env';
import en from './locales/en.json';
import ru from './locales/ru.json';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: env.defaultLang,
    supportedLngs: ['ru', 'en'],
    resources: {
      ru: { translation: ru },
      en: { translation: en },
    },
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export { i18n };
