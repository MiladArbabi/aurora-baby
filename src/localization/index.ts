// src/localization/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'react-native-localize'; 
import en from './en.json';
import sv from './sv.json';

i18n
  .use(initReactI18next)
  .init({
    // Remove compatibilityJSON—latest types default to v4 JSON.

    // 1) Determine primary device locale:
    //    getLocales()[0].languageCode yields e.g. 'en' or 'sv'
    lng: (() => {
      const locales = Localization.getLocales();
      if (Array.isArray(locales) && locales.length > 0) {
        return locales[0].languageCode.startsWith('sv') ? 'sv' : 'en';
      }
      return 'en';
    })(),

    // 2) Fallback to English if no Swedish match
    fallbackLng: 'en',

    // 3) Our translation resources
    resources: {
      en: { translation: en },
      sv: { translation: sv },
    },

    interpolation: {
      escapeValue: false, // React already does escaping
    },
  });

export default i18n;
