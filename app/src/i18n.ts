// app/src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import translationEN from './locales/en/translation.json';
import translationKO from './locales/ko/translation.json';

// core 패키지에 직접 의존하는 대신 내부 타입 정의
type LanguageCode = 'ko' | 'en';

// Resources for i18next
const resources = {
    en: {
        translation: translationEN
    },
    ko: {
        translation: translationKO
    }
};

// class I18nManager 구현
class I18nManager {
    private currentLanguage: LanguageCode = 'ko';

    getLanguage(): LanguageCode {
        return this.currentLanguage;
    }

    changeLanguage(lang: LanguageCode): void {
        try {
            this.currentLanguage = lang;
            localStorage.setItem('ds_language', lang);
        } catch (e) {
            console.error('Failed to store language preference', e);
        }
    }
}

// i18nManager 인스턴스 생성
export const i18nManager = new I18nManager();

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

// Synchronize with our local i18n manager
const currentLanguage = i18n.language;
if (currentLanguage) {
    i18nManager.changeLanguage(currentLanguage as LanguageCode);
}

// Listen for i18n language changes
i18n.on('languageChanged', (lng) => {
    i18nManager.changeLanguage(lng as LanguageCode);
});

export default i18n;