// app/src/pages/Error404.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styles from './Error.module.scss';

const Error404: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className={styles.errorPage}>
            <div className={styles.errorContent}>
                <div className={styles.errorCode}>404</div>
                <h1 className={styles.errorTitle}>{t('errors.pageNotFound')}</h1>
                <p className={styles.errorMessage}>
                    {t('errors.pageNotFoundMessage')}
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

export default Error404;