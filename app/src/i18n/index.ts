// app/src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { treeTranslations } from '@ds/ui';


// Import translations
import baseEnTranslations from './locales/en.json';
import baseKoTranslations from './locales/ko.json';
import {dataTableEnTranslations} from "@/components/DataTable";

const enTranslations = {
    ...baseEnTranslations,
    ...dataTableEnTranslations.en,
    ...treeTranslations.en
};

const koTranslations = {
    ...baseKoTranslations,
    ...dataTableEnTranslations.ko,
    ...treeTranslations.ko
};

void i18n
    // Detect user language
    .use(LanguageDetector)
    // Pass the i18n instance to react-i18next
    .use(initReactI18next)
    // Initialize i18next
    .init({
        resources: {
            en: {
                translation: enTranslations
            },
            ko: {
                translation: koTranslations
            }
        },
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