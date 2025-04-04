// app/src/layouts/components/Sidebar/Sidebar.tsx
import React, { useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Home,
    LogOut,
    Settings,
    User,
    X
} from 'lucide-react';
import { authManager } from '@ds/core';
import styles from './Sidebar.module.scss';

// Define navigation item structure
interface NavItem {
    path: string;
    label: string;
    icon: React.ReactNode;
    requiredRole?: string;
}

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const user = authManager.getCurrentUser();

    // Handle logout with useCallback to avoid recreating the function on each render
    const handleLogout = useCallback(async () => {
        try {
            await authManager.logout();
            void navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }, [navigate]);

    // Navigation items
    const navItems: NavItem[] = [
        {
            path: '/',
            label: t('nav.home'),
            icon: <Home size={20} />
        },
        {
            path: '/profile',
            label: t('nav.profile'),
            icon: <User size={20} />
        },
        {
            path: '/settings',
            label: t('nav.settings'),
            icon: <Settings size={20} />
        }
    ];

    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div
                    className={styles.backdrop}
                    onClick={onClose}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            onClose();
                        }
                    }}
                    aria-label="Close sidebar"
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.headerContent}>
                        {/* Logo - Mobile only */}
                        <div className={styles.logo}>
                            <span className={styles.logoText}>DS 매니저</span>
                        </div>
                        <button className={styles.closeButton} onClick={onClose} aria-label={t('sidebar.close')}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* Mobile only: User info */}
                    <div className={styles.userInfoMobile}>
                        <div className={styles.userAvatar}>
                            <User size={24} />
                        </div>
                        <div className={styles.userDetails}>
                            <div className={styles.userName}>{user?.name || t('common.guest')}</div>
                            <div className={styles.userEmail}>{user?.email}</div>
                        </div>
                    </div>
                </div>

                <nav className={styles.sidebarNav}>
                    <ul className={styles.navList}>
                        {navItems.map((item) => (
                            <li key={item.path} className={styles.navItem}>
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `${styles.navLink} ${isActive ? styles.active : ''}`
                                    }
                                    onClick={onClose}
                                >
                                    <span className={styles.navIcon}>{item.icon}</span>
                                    <span className={styles.navLabel}>{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className={styles.sidebarFooter}>
                    <button
                        className={styles.logoutButton}
                        onClick={handleLogout}
                    >
                        <LogOut size={20} />
                        <span>{t('auth.logout')}</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;