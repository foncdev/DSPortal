// app/src/layouts/components/Header/Header.tsx
import React, { useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LogOut, User, Moon, Sun, Menu, Globe, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authManager } from '@ds/core';
import { useTheme } from '../../../contexts/ThemeContext';
import styles from './Header.module.scss';

interface HeaderProps {
    toggleSidebar: () => void;
    isMobileSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isMobileSidebarOpen }) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { toggleTheme, isDarkMode } = useTheme();
    const user = authManager.getCurrentUser();
    const [sessionTime, setSessionTime] = useState<string>('');
    const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
    // Update session time every second
    useEffect(() => {
        const updateSessionTime = () => {
            const timeRemaining = authManager.getFormattedSessionTimeRemaining();
            setSessionTime(timeRemaining);
        };

        updateSessionTime(); // Initial update
        const timer = setInterval(updateSessionTime, 1000);

        return () => clearInterval(timer);
    }, []);

    // Toggle language
    const changeLanguage = (lng: string) => {
        void i18n.changeLanguage(lng);
        setLanguageMenuOpen(false);
    };

    const handleLogout = useCallback(async () => {
        try {
            await authManager.logout();
            void navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }, [navigate]);

    return (
        <header className={styles.header}>
            <div className={styles.headerContainer}>
                {/* Desktop menu toggle */}
                <button
                    className={styles.desktopMenuToggle}
                    onClick={toggleSidebar}
                    aria-label={t('sidebar.toggle', 'Toggle Sidebar')} // Default fallback
                >
                    <Menu size={20} />
                </button>

                {/* Mobile menu toggle */}
                <button
                    className={styles.mobileMenuToggle}
                    onClick={toggleSidebar}
                    aria-label={t('sidebar.toggle', 'Toggle Sidebar')} // Default fallback
                >
                    <Menu size={20} />
                </button>

                {/* Logo */}
                <div className={styles.logo}>
                    <span className={styles.logoText}>DS 매니저</span>
                </div>

                {/* Spacer */}
                <div className={styles.spacer}></div>

                {/* Right-side actions */}
                <div className={styles.actions}>
                    {/* Session timer */}
                    <div className={styles.sessionTimer}>
                        <Clock size={16} />
                        <span>{sessionTime}</span>
                    </div>

                    {/* Language switcher */}
                    <div className={styles.languageSwitcher}>
                        <button
                            className={styles.actionButton}
                            onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                            aria-label={t('header.changeLanguage', 'Change Language')}
                        >
                            <Globe size={20} />
                        </button>

                        {languageMenuOpen && (
                            <div className={styles.languageDropdown}>
                                <button
                                    onClick={() => changeLanguage('ko')}
                                    className={i18n.language === 'ko' ? styles.active : ''}
                                >
                                    한국어
                                </button>
                                <button
                                    onClick={() => changeLanguage('en')}
                                    className={i18n.language === 'en' ? styles.active : ''}
                                >
                                    English
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Theme toggle */}
                    <button
                        className={styles.actionButton}
                        onClick={toggleTheme}
                        aria-label={t('header.toggleTheme', 'Toggle Theme')}
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {/* User menu */}
                    <div className={styles.userMenu}>
                        <div className={styles.userInfo}>
                            <span className={styles.userName}>{user?.name || t('common.guest')}</span>
                            <button className={styles.userAvatar}>
                                <User size={20} />
                            </button>
                        </div>
                        <div className={styles.dropdown}>
                            <div className={styles.dropdownHeader}>
                                <div className={styles.userDetails}>
                                    <span className={styles.userFullName}>{user?.name}</span>
                                    <span className={styles.userEmail}>{user?.email}</span>
                                </div>
                            </div>
                            <div className={styles.dropdownDivider}></div>
                            <ul className={styles.dropdownMenu}>
                                <li>
                                    <button className={styles.dropdownItem} onClick={() => navigate('/profile')}>
                                        <User size={16} />
                                        <span>{t('header.profile', 'Profile')}</span>
                                    </button>
                                </li>
                                <li>
                                    <button className={styles.dropdownItem} onClick={handleLogout}>
                                        <LogOut size={16} />
                                        <span>{t('auth.logout', 'Logout')}</span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;