import React from 'react';
import { useTranslation } from 'react-i18next';
import { LogOut, User, Moon, Sun, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authManager } from '@ds/core';
import { useTheme } from '../../../contexts/ThemeContext';
import SessionTimer from './SessionTimer';
import LanguageSwitcher from './LanguageSwitcher';
import styles from './Header.module.scss';

interface HeaderProps {
    toggleSidebar: () => void;
    isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { toggleTheme, isDarkMode } = useTheme();
    const user = authManager.getCurrentUser();

    const handleLogout = async () => {
        try {
            await authManager.logout();
            void navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.headerContainer}>
                {/* Mobile Sidebar Toggle Button - Now part of the header */}
                <button
                    className={styles.mobileToggle}
                    onClick={toggleSidebar}
                    aria-label={isSidebarOpen ? t('sidebar.close') : t('sidebar.open')}
                >
                    <Menu size={24} />
                </button>

                {/* Logo - Desktop only */}
                <div className={styles.logo}>
                    <span className={styles.logoText}>DS 매니저</span>
                </div>

                {/* Spacer */}
                <div className={styles.spacer}></div>

                {/* Right-side actions */}
                <div className={styles.actions}>
                    {/* Always visible items (mobile and desktop) */}
                    <SessionTimer />
                    <LanguageSwitcher />
                    <button
                        className={styles.actionButton}
                        onClick={toggleTheme}
                        aria-label={t('header.toggleTheme')}
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {/* Only visible on desktop */}
                    <div className={styles.desktopOnly}>
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
                                            <span>{t('header.profile')}</span>
                                        </button>
                                    </li>
                                    <li>
                                        <button className={styles.dropdownItem} onClick={handleLogout}>
                                            <LogOut size={16} />
                                            <span>{t('auth.logout')}</span>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;