import React from 'react';
import { useTranslation } from 'react-i18next';
import { User, Clock, Calendar, Settings } from 'lucide-react';
import { authManager } from '@ds/core';
import styles from './Dashboard.module.scss';

const Dashboard: React.FC = () => {
    const { t } = useTranslation();
    const user = authManager.getCurrentUser();

    // Current date and time
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();
    const formattedTime = currentDate.toLocaleTimeString();

    return (
        <div className={styles.dashboard}>
            <h1 className={styles.pageTitle}>
                {t('dashboard.welcome', { name: user?.name || t('common.user') })}
            </h1>

            <div className={styles.overview}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>{t('dashboard.userInfo')}</h2>
                        <User size={24} className={styles.cardIcon} />
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>{t('common.email')}:</span>
                            <span className={styles.value}>{user?.email}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>{t('common.role')}:</span>
                            <span className={styles.value}>{user?.role}</span>
                        </div>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>{t('dashboard.dateTime')}</h2>
                        <Clock size={24} className={styles.cardIcon} />
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>{t('common.date')}:</span>
                            <span className={styles.value}>{formattedDate}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>{t('common.time')}:</span>
                            <span className={styles.value}>{formattedTime}</span>
                        </div>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>{t('dashboard.quickLinks')}</h2>
                        <Settings size={24} className={styles.cardIcon} />
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.linkGrid}>
                            <a href="#" className={styles.quickLink}>
                                <span className={styles.linkText}>{t('dashboard.profile')}</span>
                            </a>
                            <a href="#" className={styles.quickLink}>
                                <span className={styles.linkText}>{t('dashboard.settings')}</span>
                            </a>
                            <a href="#" className={styles.quickLink}>
                                <span className={styles.linkText}>{t('dashboard.help')}</span>
                            </a>
                            <a href="#" className={styles.quickLink}>
                                <span className={styles.linkText}>{t('dashboard.logout')}</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.calendar}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>{t('dashboard.calendar')}</h2>
                        <Calendar size={24} className={styles.cardIcon} />
                    </div>
                    <div className={styles.cardContent}>
                        <p className={styles.calendarMessage}>
                            {t('dashboard.calendarEmpty')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;