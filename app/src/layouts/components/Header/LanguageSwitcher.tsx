// app/src/layouts/components/Header/LanguageSwitcher.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import styles from './LanguageSwitcher.module.scss';
import { i18nManager, LanguageCode } from '@ds/core';

interface Language {
    code: LanguageCode;
    name: string;
    nativeName: string;
    flag: string;
}

// Available languages - extend as needed
const languages: Language[] = [
    {
        code: 'ko',
        name: 'Korean',
        nativeName: '한국어',
        flag: '🇰🇷'
    },
    {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸'
    }
];

const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Current language
    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

    // Handle language change
    const changeLanguage = (code: LanguageCode) => {
        i18n.changeLanguage(code);
        i18nManager.changeLanguage(code);
        setIsOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className={styles.languageSwitcher} ref={dropdownRef}>
            <button
                className={styles.languageButton}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-label="Select language"
            >
                <Globe size={20} />
                <span className={styles.currentLanguage}>{currentLanguage.flag}</span>
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <ul className={styles.languageList}>
                        {languages.map((language) => (
                            <li key={language.code}>
                                <button
                                    className={`${styles.languageOption} ${language.code === currentLanguage.code ? styles.active : ''}`}
                                    onClick={() => changeLanguage(language.code)}
                                >
                                    <span className={styles.flag}>{language.flag}</span>
                                    <span className={styles.name}>{language.nativeName}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;