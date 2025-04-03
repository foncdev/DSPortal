// app/src/layouts/components/Header/Header.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLayout } from '../../context/LayoutContext';
import UserMenu from './UserMenu';
import NotificationCenter from './NotificationCenter';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { authManager } from '@ds/core';
import styles from './Header.module.scss';

// Import icons
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

const Header: React.FC = () => {
    const { t } = useTranslation();
    const {
        sidebarCollapsed,
        toggleSidebar,
        sidebarPosition,
        mobileSidebarOpen,
        setMobileSidebarOpen
    } = useLayout();

    // 미사용 변수 제거 (isDarkMode)
    // const { theme } = useTheme();

    const user = authManager.getCurrentUser();

    // Toggle mobile sidebar
    const handleMobileMenuToggle = () => {
        setMobileSidebarOpen(!mobileSidebarOpen);
    };

    // Icon for sidebar toggle based on state and position
    const getSidebarToggleIcon = () => {
        if (sidebarPosition === 'left') {
            return sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />;
        } else {
            return sidebarCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />;
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.headerContainer}>
                {/* Mobile menu toggle - only visible on small screens */}
                <button
                    className={styles.mobileMenuToggle}
                    onClick={handleMobileMenuToggle}
                    aria-label={mobileSidebarOpen ? t('header.closeSidebar') : t('header.openSidebar')}
                >
                    {mobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Logo area */}
                <div className={styles.logo}>
                    <span className={styles.logoText}>DS 매니저</span>
                </div>

                {/* Desktop sidebar toggle - hidden on mobile */}
                <button
                    className={styles.sidebarToggle}
                    onClick={toggleSidebar}
                    aria-label={sidebarCollapsed ? t('header.expandSidebar') : t('header.collapseSidebar')}
                >
                    {getSidebarToggleIcon()}
                </button>

                {/* Spacer */}
                <div className={styles.spacer}></div>

                {/* Right-side actions */}
                <div className={styles.actions}>
                    {/* Theme toggle */}
                    <ThemeToggle />

                    {/* Language switcher */}
                    <LanguageSwitcher />

                    {/* Notification center */}
                    <NotificationCenter />

                    {/* User menu */}
                    <UserMenu user={user} />
                </div>
            </div>
        </header>
    );
};

export default Header;