import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import hi from './locales/hi.json';
import mr from './locales/mr.json';
import bn from './locales/bn.json';
import ta from './locales/ta.json';
import te from './locales/te.json';
import gu from './locales/gu.json';
import kn from './locales/kn.json';
import ur from './locales/ur.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English', dir: 'ltr' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', dir: 'ltr' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी', dir: 'ltr' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা', dir: 'ltr' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', dir: 'ltr' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', dir: 'ltr' },
  { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી', dir: 'ltr' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ', dir: 'ltr' },
  { code: 'ur', label: 'Urdu', nativeLabel: 'اردو', dir: 'rtl' },
];

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  mr: { translation: mr },
  bn: { translation: bn },
  ta: { translation: ta },
  te: { translation: te },
  gu: { translation: gu },
  kn: { translation: kn },
  ur: { translation: ur },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi', 'mr', 'bn', 'ta', 'te', 'gu', 'kn', 'ur'],
    interpolation: {
      escapeValue: false, // React already protects against XSS
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'mplad_language',
      caches: ['localStorage'],
    },
  });

// Handle RTL direction dynamically
i18n.on('languageChanged', (lng) => {
  const current = SUPPORTED_LANGUAGES.find((l) => l.code === lng);
  const dir = current?.dir || 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
});

export default i18n;
