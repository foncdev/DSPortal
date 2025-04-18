// src/layouts/components/Sidebar/Sidebar.tsx
import React, { useCallback, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authManager } from '@ds/core';
import MenuItem from './MenuItem';
import { menuItems } from '@/config/menuConfig';
import styles from './Sidebar.module.scss';

export interface SidebarProps {
    isMobileOpen?: boolean;
    setIsMobileOpen?: ((open: boolean) => void);
    isIconMode?: boolean;
    setIsIconMode?: ((iconMode: boolean) => void);
}

const Sidebar: React.FC<SidebarProps> = ({
                                             isMobileOpen = false,
                                             setIsMobileOpen,
                                             isIconMode = false,
                                             setIsIconMode
                                         }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(isIconMode);
    const [activeParent, setActiveParent] = useState<string | null>(null);

    // Sync props with internal state
    useEffect(() => {
        setCollapsed(isIconMode);
    }, [isIconMode]);

    // Handle logout with useCallback to avoid recreating the function on each render
    const handleLogout = useCallback(async () => {
        try {
            await authManager.logout();
            void navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }, [navigate]);

    // Toggle mobile sidebar
    const toggleMobileSidebar = () => {
        if (setIsMobileOpen) {
            setIsMobileOpen(!isMobileOpen);
        }
    };

    // Toggle sidebar collapse state
    const toggleSidebarCollapse = () => {
        const newCollapsedState = !collapsed;
        setCollapsed(newCollapsedState);

        if (setIsIconMode) {
            setIsIconMode(newCollapsedState);
        }
    };

    // Handle backdrop keydown for accessibility
    const handleBackdropKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            if (setIsMobileOpen) {
                setIsMobileOpen(false);
            }
        }
    };

    // Close mobile sidebar after navigation
    const handleNavigation = () => {
        if (isMobileOpen && setIsMobileOpen) {
            setIsMobileOpen(false);
        }
    };

    // 활성화된 부모 메뉴 설정을 위한 함수
    const handleParentClick = (parentId: string) => {
        // 아이콘 모드에서만 다른 부모 메뉴를 닫음
        if (collapsed) {
            // 같은 메뉴를 클릭하면 토글, 다른 메뉴를 클릭하면 그 메뉴만 열기
            setActiveParent(prev => prev === parentId ? null : parentId);
        }
    };

    // SVG Icons
    const menuIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>';
    const chevronLeft = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"></path></svg>';
    const chevronRight = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"></path></svg>';
    const logOutIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>';

    return (
        <>
            {/* Mobile toggle button */}
            <button
                className={styles.mobileToggle}
                onClick={toggleMobileSidebar}
                aria-label={isMobileOpen ? t('sidebar.close') : t('sidebar.open')}
                dangerouslySetInnerHTML={{ __html: menuIcon }}
            />

            {/* Mobile backdrop */}
            {isMobileOpen && (
                <div
                    className={styles.backdrop}
                    onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
                    onKeyDown={handleBackdropKeyDown}
                    role="button"
                    tabIndex={0}
                    aria-label="Close sidebar"
                ></div>
            )}

            {/* Main sidebar */}
            <aside className={`
                ${styles.sidebar} 
                ${isMobileOpen ? styles.open : ''} 
                ${collapsed ? styles.collapsed : ''}
            `}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logo}>
                        {!collapsed && <span className={styles.logoText}>매니저</span>}
                    </div>

                    {/* Collapse toggle button (desktop only) */}
                    <button
                        className={styles.collapseButton}
                        onClick={toggleSidebarCollapse}
                        aria-label={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
                        dangerouslySetInnerHTML={{ __html: collapsed ? chevronRight : chevronLeft }}
                    />
                </div>

                <nav className={styles.sidebarNav}>
                    <ul className={styles.navList}>
                        {menuItems.map((item) => (
                            <MenuItem
                                key={item.id}
                                item={item}
                                isCollapsed={collapsed}
                                onNavigation={handleNavigation}
                                currentPath={location.pathname}
                                activeParent={activeParent}
                                onParentClick={handleParentClick}
                            />
                        ))}
                    </ul>
                </nav>

                <div className={styles.sidebarFooter}>
                    <button
                        className={styles.logoutButton}
                        onClick={handleLogout}
                    >
                        <span
                            className={styles.logoutIcon}
                            dangerouslySetInnerHTML={{ __html: logOutIcon }}
                        />
                        {!collapsed && <span>{t('auth.logout')}</span>}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;