// app/src/pages/Terms.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './Terms.module.scss';

const Terms: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className={styles.termsContainer}>
            <div className={styles.termsHeader}>
                <Link to="/signup" className={styles.backButton}>
                    <ArrowLeft size={20} />
                    <span>{t('common.back')}</span>
                </Link>
                <h1 className={styles.termsTitle}>{t('terms.title')}</h1>
            </div>

            <div className={styles.termsContent}>
                <section className={styles.termsSection}>
                    <h2>{t('terms.serviceTerms')}</h2>
                    <p>{t('terms.lastUpdated', { date: '2025-04-01' })}</p>

                    <h3>{t('terms.sections.acceptance')}</h3>
                    <p>{t('terms.content.acceptance')}</p>

                    <h3>{t('terms.sections.services')}</h3>
                    <p>{t('terms.content.services')}</p>

                    <h3>{t('terms.sections.userAccount')}</h3>
                    <p>{t('terms.content.userAccount')}</p>

                    <h3>{t('terms.sections.privacy')}</h3>
                    <p>{t('terms.content.privacy')}</p>

                    <h3>{t('terms.sections.content')}</h3>
                    <p>{t('terms.content.content')}</p>

                    <h3>{t('terms.sections.termination')}</h3>
                    <p>{t('terms.content.termination')}</p>

                    <h3>{t('terms.sections.changes')}</h3>
                    <p>{t('terms.content.changes')}</p>

                    <h3>{t('terms.sections.contact')}</h3>
                    <p>{t('terms.content.contact')}</p>
                </section>

                <section className={styles.termsSection}>
                    <h2>{t('terms.privacyPolicy')}</h2>

                    <h3>{t('terms.sections.dataCollection')}</h3>
                    <p>{t('terms.content.dataCollection')}</p>

                    <h3>{t('terms.sections.dataUsage')}</h3>
                    <p>{t('terms.content.dataUsage')}</p>

                    <h3>{t('terms.sections.cookies')}</h3>
                    <p>{t('terms.content.cookies')}</p>

                    <h3>{t('terms.sections.thirdParty')}</h3>
                    <p>{t('terms.content.thirdParty')}</p>

                    <h3>{t('terms.sections.security')}</h3>
                    <p>{t('terms.content.security')}</p>
                </section>
            </div>

            <div className={styles.termsFooter}>
                <Link to="/signup" className={styles.backToSignupButton}>
                    {t('terms.backToSignup')}
                </Link>
            </div>
        </div>
    );
};

export default Terms;