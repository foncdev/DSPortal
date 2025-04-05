// app/src/pages/auth/SignUpSuccess.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';
import styles from './SignUpSuccess.module.scss';

const SignUpSuccess: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className={styles.successContainer}>
            <div className={styles.successIcon}>
                <CheckCircle size={64} />
            </div>
            <h1 className={styles.successTitle}>{t('auth.signupSuccess')}</h1>
            <p className={styles.successMessage}>
                {t('auth.signupSuccessMessage')}
            </p>
            <div className={styles.actions}>
                <Link to="/login" className={styles.loginButton}>
                    {t('auth.proceedToLogin')}
                </Link>
            </div>
        </div>
    );
};

export default SignUpSuccess;