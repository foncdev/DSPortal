// app/src/pages/Unauthorized.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';
import styles from './Error.module.scss';

const Unauthorized: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className={styles.errorPage}>
            <div className={styles.errorContent}>
                <div className={styles.errorIcon}>
                    <ShieldOff size={48} />
                </div>
                <h1 className={styles.errorTitle}>{t('errors.unauthorized')}</h1>
                <p className={styles.errorMessage}>
                    {t('errors.unauthorizedMessage')}
                </p>
                <div className={styles.errorActions}>
                    <Link to="/" className="btn btn-primary">
                        {t('errors.backToHome')}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;