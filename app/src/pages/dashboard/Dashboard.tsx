// app/src/pages/dashboard/Dashboard.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart2, FileText, Download, Upload, Users, Clock } from 'lucide-react';
import PageTitle from '../../layouts/components/common/PageTitle';
import { authManager } from '@ds/core';
import styles from './Dashboard.module.scss';

const Dashboard: React.FC = () => {
    const { t } = useTranslation();
    const user = authManager.getCurrentUser();

    // Mock statistics data
    const stats = [
        {
            title: t('dashboard.totalDocuments'),
            value: '254',
            icon: <FileText size={20} />,
            change: '+12% from last month',
            positive: true
        },
        {
            title: t('dashboard.uploads'),
            value: '32',
            icon: <Upload size={20} />,
            change: '+5% from last month',
            positive: true
        },
        {
            title: t('dashboard.downloads'),
            value: '128',
            icon: <Download size={20} />,
            change: '-3% from last month',
            positive: false
        },
        {
            title: t('dashboard.activeUsers'),
            value: '18',
            icon: <Users size={20} />,
            change: 'Same as last month',
            positive: true
        }
    ];

    // Mock recent documents
    const recentDocuments = [
        {
            id: '1',
            title: '프로젝트 계획서',
            updatedAt: new Date(),
            status: 'published'
        },
        {
            id: '2',
            title: '디자인 가이드',
            updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            status: 'published'
        },
        {
            id: '3',
            title: 'API 명세서',
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            status: 'draft'
        }
    ];

    return (
        <div className={styles.dashboard}>
            <PageTitle
                title={t('dashboard.welcome', { name: user?.name || 'User' })}
                description={t('dashboard.summary')}
                actions={
                    <button className="btn btn-primary">
                        <BarChart2 size={16} className="mr-2" />
                        {t('dashboard.generateReport')}
                    </button>
                }
            />

            <div className={styles.statsGrid}>
                {stats.map((stat, index) => (
                    <div key={index} className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <h3 className={styles.statTitle}>{stat.title}</h3>
                            <div className={styles.statIcon}>{stat.icon}</div>
                        </div>
                        <div className={styles.statValue}>{stat.value}</div>
                        <div className={`${styles.statChange} ${stat.positive ? styles.positive : styles.negative}`}>
                            {stat.change}
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.documentSection}>
                <div className={styles.sectionHeader}>
                    <h2>{t('dashboard.recentDocuments')}</h2>
                    <button className="btn btn-sm btn-outline">
                        {t('dashboard.viewAll')}
                    </button>
                </div>

                <div className={styles.documentList}>
                    {recentDocuments.map((doc) => (
                        <div key={doc.id} className={styles.documentItem}>
                            <div className={styles.documentIcon}>
                                <FileText size={24} />
                            </div>
                            <div className={styles.documentInfo}>
                                <h4 className={styles.documentTitle}>{doc.title}</h4>
                                <div className={styles.documentMeta}>
                  <span className={styles.documentTime}>
                    <Clock size={14} />
                      {doc.updatedAt.toLocaleTimeString()} - {doc.updatedAt.toLocaleDateString()}
                  </span>
                                    <span className={`${styles.documentStatus} ${styles[doc.status]}`}>
                    {doc.status}
                  </span>
                                </div>
                            </div>
                            <div className={styles.documentActions}>
                                <button className="btn btn-sm btn-outline">
                                    {t('dashboard.view')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;