import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './translations/en.json';
import af from './translations/af.json';

i18n
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      af: { translation: af },
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
