// src/pages/BlankPage.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import styles from './BlankPage.module.scss';

const BlankPage: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();

    // Extract the page title from the location path
    const getPageTitle = () => {
        const path = location.pathname;
        const parts = path.split('/').filter(Boolean);

        if (parts.length === 0) {
            return 'Dashboard';
        }

        // Try to find a corresponding translation key
        const section = parts[0];
        const subsection = parts.length > 1 ? parts[1] : null;

        if (subsection) {
            const key = `menu.${section}.${subsection}`;
            const translation = t(key);
            // If key exists and is not the same as the key itself (fallback behavior)
            if (translation !== key) {
                return translation;
            }
        }

        // Fallback to section title
        const sectionKey = `menu.${section}.title`;
        const sectionTranslation = t(sectionKey);
        if (sectionTranslation !== sectionKey) {
            return sectionTranslation;
        }

        // Last resort: capitalize the path
        return parts[parts.length - 1].charAt(0).toUpperCase() + parts[parts.length - 1].slice(1);
    };

    return (
        <div className={styles.blankPage}>
            <h1 className={styles.title}>{getPageTitle()}</h1>
            <div className={styles.card}>
                <p>{t('common.blankPage')}: {location.pathname}</p>
                <p>{t('common.underConstruction')}</p>
            </div>
        </div>
    );
};

export default BlankPage;