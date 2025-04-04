// app/src/contexts/I18nContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { i18nManager, LanguageCode } from '@ds/core';

interface I18nContextProps {
    currentLanguage: string;
    changeLanguage: (lang: string) => void;
}

const I18nContext = createContext<I18nContextProps | undefined>(undefined);

interface I18nProviderProps {
    children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
    const { i18n } = useTranslation();
    const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

    // @ds/core의 i18n 모듈과 동기화
    useEffect(() => {
        // i18n 변경 시 core 모듈도 업데이트
        const syncLanguage = () => {
            i18nManager.changeLanguage(i18n.language as LanguageCode);
        };

        // 초기 동기화
        syncLanguage();

        // i18n 언어 변경 감지
        const handleLanguageChanged = (lng: string) => {
            setCurrentLanguage(lng);
            syncLanguage();
        };

        i18n.on('languageChanged', handleLanguageChanged);

        return () => {
            i18n.off('languageChanged', handleLanguageChanged);
        };
    }, [i18n]);

    // 언어 변경 함수
    const changeLanguage = (lang: string) => {
        void i18n.changeLanguage(lang);
    };

    return (
        <I18nContext.Provider value={{ currentLanguage, changeLanguage }}>
            {children}
        </I18nContext.Provider>
    );
};

// 사용자 정의 훅
export const useI18n = (): I18nContextProps => {
    const context = useContext(I18nContext);
    if (context === undefined) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
};