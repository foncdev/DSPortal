// app/src/pages/system/SystemSettings.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Shield,
    Users,
    Settings,
    Database,
    Server,
    AlertTriangle,
    Save,
    RefreshCw
} from 'lucide-react';
import PageTitle from '../../layouts/components/common/PageTitle';
import styles from './SystemSettings.module.scss';

const SystemSettings: React.FC = () => {
    const { t } = useTranslation();

    // Form states
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [debugMode, setDebugMode] = useState(false);
    const [sessionTimeout, setSessionTimeout] = useState('60');
    const [maxUploadSize, setMaxUploadSize] = useState('10');

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, these would be sent to an API
        console.log('Saving system settings:', {
            maintenanceMode,
            debugMode,
            sessionTimeout,
            maxUploadSize
        });

        // Show success message or handle errors
    };

    return (
        <div className={styles.systemSettings}>
            <PageTitle
                title={t('system.title')}
                description={t('system.description')}
            />

            <div className={styles.settingsLayout}>
                <div className={styles.settingsSidebar}>
                    <div className={styles.settingsNav}>
                        <a href="#general" className={styles.settingsNavItem}>
                            <Settings size={18} />
                            <span>{t('system.general')}</span>
                        </a>
                        <a href="#security" className={styles.settingsNavItem}>
                            <Shield size={18} />
                            <span>{t('system.security')}</span>
                        </a>
                        <a href="#users" className={styles.settingsNavItem}>
                            <Users size={18} />
                            <span>{t('system.userManagement')}</span>
                        </a>
                        <a href="#database" className={styles.settingsNavItem}>
                            <Database size={18} />
                            <span>{t('system.database')}</span>
                        </a>
                        <a href="#system" className={styles.settingsNavItem}>
                            <Server size={18} />
                            <span>{t('system.systemInfo')}</span>
                        </a>
                    </div>
                </div>

                <div className={styles.settingsContent}>
                    <form onSubmit={handleSubmit}>
                        <section id="general" className={styles.settingsSection}>
                            <h2 className={styles.sectionTitle}>{t('system.general')}</h2>
                            <div className={styles.settingsCard}>
                                <div className={styles.settingItem}>
                                    <div>
                                        <h3 className={styles.settingTitle}>{t('system.maintenanceMode')}</h3>
                                        <p className={styles.settingDescription}>{t('system.maintenanceModeDescription')}</p>
                                    </div>
                                    <label className={styles.switch}>
                                        <input
                                            type="checkbox"
                                            checked={maintenanceMode}
                                            onChange={() => setMaintenanceMode(!maintenanceMode)}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>

                                <div className={styles.settingItem}>
                                    <div>
                                        <h3 className={styles.settingTitle}>{t('system.debugMode')}</h3>
                                        <p className={styles.settingDescription}>{t('system.debugModeDescription')}</p>
                                    </div>
                                    <label className={styles.switch}>
                                        <input
                                            type="checkbox"
                                            checked={debugMode}
                                            onChange={() => setDebugMode(!debugMode)}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>
                            </div>
                        </section>

                        <section id="security" className={styles.settingsSection}>
                            <h2 className={styles.sectionTitle}>{t('system.security')}</h2>
                            <div className={styles.settingsCard}>
                                <div className={styles.settingItem}>
                                    <div>
                                        <h3 className={styles.settingTitle}>{t('system.sessionTimeout')}</h3>
                                        <p className={styles.settingDescription}>{t('system.sessionTimeoutDescription')}</p>
                                    </div>
                                    <div className={styles.inputWrapper}>
                                        <input
                                            type="number"
                                            min="5"
                                            max="1440"
                                            value={sessionTimeout}
                                            onChange={(e) => setSessionTimeout(e.target.value)}
                                            className={styles.formControl}
                                        />
                                        <span className={styles.inputAddon}>{t('system.minutes')}</span>
                                    </div>
                                </div>

                                <div className={styles.settingItem}>
                                    <div>
                                        <h3 className={styles.settingTitle}>{t('system.maxUploadSize')}</h3>
                                        <p className={styles.settingDescription}>{t('system.maxUploadSizeDescription')}</p>
                                    </div>
                                    <div className={styles.inputWrapper}>
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={maxUploadSize}
                                            onChange={(e) => setMaxUploadSize(e.target.value)}
                                            className={styles.formControl}
                                        />
                                        <span className={styles.inputAddon}>MB</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section id="users" className={styles.settingsSection}>
                            <h2 className={styles.sectionTitle}>{t('system.userManagement')}</h2>
                            <div className={styles.settingsCard}>
                                <div className={styles.userManagementActions}>
                                    <button type="button" className="btn btn-outline">
                                        <Users size={16} className="mr-2" />
                                        {t('system.manageUsers')}
                                    </button>
                                    <button type="button" className="btn btn-outline">
                                        <Shield size={16} className="mr-2" />
                                        {t('system.manageRoles')}
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section id="database" className={styles.settingsSection}>
                            <h2 className={styles.sectionTitle}>{t('system.database')}</h2>
                            <div className={styles.settingsCard}>
                                <div className={styles.settingInfo}>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>{t('system.databaseSize')}</span>
                                        <span className={styles.infoValue}>245 MB</span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>{t('system.lastBackup')}</span>
                                        <span className={styles.infoValue}>2023-06-15 09:30</span>
                                    </div>
                                </div>

                                <div className={styles.databaseActions}>
                                    <button type="button" className="btn btn-outline">
                                        <RefreshCw size={16} className="mr-2" />
                                        {t('system.backup')}
                                    </button>
                                </div>

                                <div className={styles.warningBox}>
                                    <AlertTriangle size={18} />
                                    <span>{t('system.backupWarning')}</span>
                                </div>
                            </div>
                        </section>

                        <section id="system" className={styles.settingsSection}>
                            <h2 className={styles.sectionTitle}>{t('system.systemInfo')}</h2>
                            <div className={styles.settingsCard}>
                                <div className={styles.infoList}>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>{t('system.version')}</span>
                                        <span className={styles.infoValue}>1.0.0</span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>{t('system.serverOS')}</span>
                                        <span className={styles.infoValue}>Ubuntu 22.04 LTS</span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>{t('system.nodeVersion')}</span>
                                        <span className={styles.infoValue}>18.16.0</span>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span className={styles.infoLabel}>{t('system.lastUpdated')}</span>
                                        <span className={styles.infoValue}>2023-06-10</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className={styles.formActions}>
                            <button type="submit" className="btn btn-primary">
                                <Save size={16} className="mr-2" />
                                {t('system.saveSettings')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;