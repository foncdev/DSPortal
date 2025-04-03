// app/src/layouts/components/Footer/Footer.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import styles from './Footer.module.scss';

const Footer: React.FC = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.copyright}>
                    &copy; {currentYear} DS 매니저. {t('footer.allRightsReserved')}
                </div>

                <div className={styles.links}>
                    <a href="#" className={styles.link}>{t('footer.terms')}</a>
                    <a href="#" className={styles.link}>{t('footer.privacy')}</a>
                    <a href="#" className={styles.link}>{t('footer.help')}</a>
                </div>

                <div className={styles.build}>
                    {t('footer.version')} 1.0.0, {theme === 'dark' ? t('theme.dark') : t('theme.light')}
                </div>
            </div>
        </footer>
    );
};

export default Footer;