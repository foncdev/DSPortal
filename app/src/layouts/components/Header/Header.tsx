import React from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, LogOut, User, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authManager } from '@ds/core';
import { useTheme } from '@/contexts/ThemeContext';
import styles from './Header.module.scss';

const Header: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { toggleTheme, isDarkMode } = useTheme();
    const user = authManager.getCurrentUser();

    const handleLogout = async () => {
        try {
            await authManager.logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.headerContainer}>
                {/* Logo */}
                <div className={styles.logo}>
                    <span className={styles.logoText}>DS 매니저</span>
                </div>

                {/* Spacer */}
                <div className={styles.spacer}></div>

                {/* Right-side actions */}
                <div className={styles.actions}>
                    {/* Theme toggle */}
                    <button
                        className={styles.actionButton}
                        onClick={toggleTheme}
                        aria-label={t('header.toggleTheme')}
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
        </header>
    );
};

export default Header;