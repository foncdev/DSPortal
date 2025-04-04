import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styles from './Error.module.scss';

const Error500: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className={styles.errorPage}>
            <div className={styles.errorContent}>
                <div className={styles.errorCode}>500</div>
                <h1 className={styles.errorTitle}>{t('errors.serverError')}</h1>
                <p className={styles.errorMessage}>
                    {t('errors.serverErrorMessage')}
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

export default Error500;