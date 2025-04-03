// app/src/pages/settings/Settings.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Monitor,
    Moon,
    Sun,
    Globe,
    Bell,
    Shield,
    Palette
} from 'lucide-react';
import PageTitle from '../../layouts/components/common/PageTitle';
import { useTheme } from '../../layouts/context/ThemeContext';
import styles from './Settings.module.scss';

const Settings: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { theme, setTheme } = useTheme();

    // State for notification settings
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);

    // Handle language change
    const changeLanguage = (language: string) => {
        i18n.changeLanguage(language);
    };

    return (
        <div className={styles.settings}>
            <PageTitle
                title={t('settings.title')}
                description={t('settings.description')}
            />

            <div className={styles.settingsLayout}>
                <div className={styles.settingsSidebar}>
                    <div className={styles.settingsNav}>
                        <a href="#appearance" className={styles.settingsNavItem}>
                            <Palette size={18} />
                            <span>{t('settings.appearance')}</span>
                        </a>
                        <a href="#language" className={styles.settingsNavItem}>
                            <Globe size={18} />
                            <span>{t('settings.language')}</span>
                        </a>
                        <a href="#notifications" className={styles.settingsNavItem}>
                            <Bell size={18} />
                            <span>{t('settings.notifications')}</span>
                        </a>
                        <a href="#privacy" className={styles.settingsNavItem}>
                            <Shield size={18} />
                            <span>{t('settings.privacy')}</span>
                        </a>
                    </div>
                </div>

                <div className={styles.settingsContent}>
                    <section id="appearance" className={styles.settingsSection}>
                        <h2 className={styles.sectionTitle}>{t('settings.appearance')}</h2>
                        <div className={styles.settingsCard}>
                            <h3 className={styles.settingsCardTitle}>{t('settings.theme')}</h3>
                            <p className={styles.settingsCardDescription}>
                                {t('settings.themeDescription')}
                            </p>

                            <div className={styles.themeOptions}>
                                <div
                                    className={`${styles.themeOption} ${theme === 'light' ? styles.active : ''}`}
                                    onClick={() => setTheme('light')}
                                >
                                    <div className={styles.themePreview} data-theme="light">
                                        <div className={styles.themePreviewHeader}></div>
                                        <div className={styles.themePreviewSidebar}></div>
                                        <div className={styles.themePreviewContent}></div>
                                    </div>
                                    <div className={styles.themeLabel}>
                                        <Sun size={16} />
                                        <span>{t('theme.light')}</span>
                                    </div>
                                </div>

                                <div
                                    className={`${styles.themeOption} ${theme === 'dark' ? styles.active : ''}`}
                                    onClick={() => setTheme('dark')}
                                >
                                    <div className={styles.themePreview} data-theme="dark">
                                        <div className={styles.themePreviewHeader}></div>
                                        <div className={styles.themePreviewSidebar}></div>
                                        <div className={styles.themePreviewContent}></div>
                                    </div>
                                    <div className={styles.themeLabel}>
                                        <Moon size={16} />
                                        <span>{t('theme.dark')}</span>
                                    </div>
                                </div>

                                <div
                                    className={`${styles.themeOption} ${theme === 'system' ? styles.active : ''}`}
                                    onClick={() => setTheme('system')}
                                >
                                    <div className={styles.themePreview} data-theme="system">
                                        <div className={styles.themePreviewHeader}></div>
                                        <div className={styles.themePreviewSidebar}></div>
                                        <div className={styles.themePreviewContent}></div>
                                    </div>
                                    <div className={styles.themeLabel}>
                                        <Monitor size={16} />
                                        <span>{t('theme.system')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="language" className={styles.settingsSection}>
                        <h2 className={styles.sectionTitle}>{t('settings.language')}</h2>
                        <div className={styles.settingsCard}>
                            <h3 className={styles.settingsCardTitle}>{t('settings.selectLanguage')}</h3>
                            <p className={styles.settingsCardDescription}>
                                {t('settings.languageDescription')}
                            </p>

                            <div className={styles.languageOptions}>
                                <div
                                    className={`${styles.languageOption} ${i18n.language === 'ko' ? styles.active : ''}`}
                                    onClick={() => changeLanguage('ko')}
                                >
                                    <span className={styles.languageFlag}>🇰🇷</span>
                                    <span className={styles.languageName}>한국어</span>
                                </div>
                                <div
                                    className={`${styles.languageOption} ${i18n.language === 'en' ? styles.active : ''}`}
                                    onClick={() => changeLanguage('en')}
                                >
                                    <span className={styles.languageFlag}>🇺🇸</span>
                                    <span className={styles.languageName}>English</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="notifications" className={styles.settingsSection}>
                        <h2 className={styles.sectionTitle}>{t('settings.notifications')}</h2>
                        <div className={styles.settingsCard}>
                            <h3 className={styles.settingsCardTitle}>{t('settings.notificationPreferences')}</h3>
                            <p className={styles.settingsCardDescription}>
                                {t('settings.notificationDescription')}
                            </p>

                            <div className={styles.settingItem}>
                                <div>
                                    <h4 className={styles.settingName}>{t('settings.emailNotifications')}</h4>
                                    <p className={styles.settingDescription}>{t('settings.emailNotificationsDescription')}</p>
                                </div>
                                <label className={styles.switch}>
                                    <input
                                        type="checkbox"
                                        checked={emailNotifications}
                                        onChange={() => setEmailNotifications(!emailNotifications)}
                                    />
                                    <span className={styles.slider}></span>
                                </label>
                            </div>

                            <div className={styles.settingItem}>
                                <div>
                                    <h4 className={styles.settingName}>{t('settings.pushNotifications')}</h4>
                                    <p className={styles.settingDescription}>{t('settings.pushNotificationsDescription')}</p>
                                </div>
                                <label className={styles.switch}>
                                    <input
                                        type="checkbox"
                                        checked={pushNotifications}
                                        onChange={() => setPushNotifications(!pushNotifications)}
                                    />
                                    <span className={styles.slider}></span>
                                </label>
                            </div>
                        </div>
                    </section>

                    <section id="privacy" className={styles.settingsSection}>
                        <h2 className={styles.sectionTitle}>{t('settings.privacy')}</h2>
                        <div className={styles.settingsCard}>
                            <h3 className={styles.settingsCardTitle}>{t('settings.dataPrivacy')}</h3>
                            <p className={styles.settingsCardDescription}>
                                {t('settings.privacyDescription')}
                            </p>

                            <button className="btn btn-outline">
                                {t('settings.downloadData')}
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Settings;