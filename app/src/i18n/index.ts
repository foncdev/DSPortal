import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import translationEN from './locales/en.json';
import translationKO from './locales/ko.json';

// Resources for i18next
const resources = {
    en: {
        translation: translationEN
    },
    ko: {
        translation: translationKO
    }
};

// Initialize i18next
i18n
    // Detect user language
    .use(LanguageDetector)
    // Pass the i18n instance to react-i18next
    .use(initReactI18next)
    // Initialize i18next
    .init({
        resources,
        fallbackLng: 'ko', // Default language
        debug: process.env.NODE_ENV === 'development',
        interpolation: {
            escapeValue: false // React already escapes values
        },
        detection: {
            order: ['localStorage', 'navigator'],
            lookupLocalStorage: 'ds_language',
            caches: ['localStorage']
        }
    });

export default i18n;