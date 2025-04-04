// app/src/layouts/components/Sidebar/Sidebar.tsx
import React, { useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Home,
    LogOut,
    Menu,
    Settings,
    User
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

const Sidebar: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isMobileOpen, setIsMobileOpen] = React.useState(false);

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

    // Toggle mobile sidebar
    const toggleMobileSidebar = () => {
        setIsMobileOpen(!isMobileOpen);
    };

    // Handle backdrop keydown for accessibility
    const handleBackdropKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            setIsMobileOpen(false);
        }
    };

    return (
        <>
            {/* Mobile toggle button */}
            <button
                className={styles.mobileToggle}
                onClick={toggleMobileSidebar}
                aria-label={isMobileOpen ? t('sidebar.close') : t('sidebar.open')}
            >
                <Menu size={24} />
            </button>

            {/* Mobile backdrop */}
            {isMobileOpen && (
                <div
                    className={styles.backdrop}
                    onClick={() => setIsMobileOpen(false)}
                    onKeyDown={handleBackdropKeyDown}
                    role="button"
                    tabIndex={0}
                    aria-label="Close sidebar"
                ></div>
            )}

            {/* Main sidebar */}
            <aside className={`${styles.sidebar} ${isMobileOpen ? styles.open : ''}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logo}>
                        <span className={styles.logoText}>DS 매니저</span>
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
                                    onClick={() => setIsMobileOpen(false)}
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