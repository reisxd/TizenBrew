import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import resources from './i18nResources.js';

try {
  tizen.systeminfo.getPropertyValue("LOCALE", function (locale) {
    i18n
      .use(initReactI18next)
      .init({
        lng: locale.language.replace(/(\_.*)/g, ''),
        fallbackLng: 'en',
        resources,
        debug: true,
        interpolation: {
          escapeValue: false,
        }
      });
  }, function (_) {
    i18n
      .use(initReactI18next)
      .init({
        lng: navigator.language.replace(/(\-.*)/g, ''),
        fallbackLng: 'en',
        resources,
        debug: true,
        interpolation: {
          escapeValue: false,
        }
      });
  });
} catch (e) {
  i18n
    .use(initReactI18next)
    .init({
      lng: navigator.language.replace(/(\-.*)/g, '_'),
      fallbackLng: 'en',
      resources,
      debug: true,
      interpolation: {
        escapeValue: false,
      }
    });
}

export default i18n;