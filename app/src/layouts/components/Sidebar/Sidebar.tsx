// app/src/layouts/components/Sidebar/Sidebar.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useLayout } from '../../context/LayoutContext';
import { useViewport } from '../../context/ViewportContext';
import Navigation from './Navigation';
// import SidebarFooter from './SidebarFooter';
import CollapseButton from './CollapseButton';
import { X } from 'lucide-react';
import styles from './Sidebar.module.scss';

const Sidebar: React.FC = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const {
        sidebarCollapsed,
        toggleSidebar,
        sidebarPosition,
        mobileSidebarOpen,
        setMobileSidebarOpen
    } = useLayout();
    const { isMobile } = useViewport();

    // Compute sidebar classes
    const sidebarClasses = [
        styles.sidebar,
        sidebarCollapsed ? styles.collapsed : '',
        sidebarPosition === 'right' ? styles.right : styles.left,
        mobileSidebarOpen ? styles.mobileOpen : ''
    ].filter(Boolean).join(' ');

    // Close mobile sidebar
    const closeMobileSidebar = () => {
        setMobileSidebarOpen(false);
    };

    // Close sidebar on mobile when route changes
    React.useEffect(() => {
        if (isMobile && mobileSidebarOpen) {
            closeMobileSidebar();
        }
    }, [location.pathname, isMobile]);

    return (
        <>
            {/* Backdrop overlay for mobile */}
            {isMobile && mobileSidebarOpen && (
                <div className={styles.backdrop} onClick={closeMobileSidebar} />
            )}

            {/* Main sidebar */}
            <aside className={sidebarClasses}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logoContainer}>
                        <div className={styles.logo}>
                            {/* Logo or app name */}
                            {!sidebarCollapsed && <span>DS 매니저</span>}
                        </div>
                    </div>

                    {/* Mobile close button */}
                    {isMobile && (
                        <button
                            className={styles.closeButton}
                            onClick={closeMobileSidebar}
                            aria-label={t('sidebar.close')}
                        >
                            <X size={24} />
                        </button>
                    )}
                </div>

                {/* Navigation links */}
                <div className={styles.sidebarContent}>
                    <Navigation collapsed={sidebarCollapsed} />
                </div>

                {/* Sidebar footer with collapse button */}
                <div className={styles.sidebarFooter}>
                    {/*<SidebarFooter collapsed={sidebarCollapsed} />*/}
                    {!isMobile && (
                        <CollapseButton
                            collapsed={sidebarCollapsed}
                            position={sidebarPosition}
                            onToggle={toggleSidebar}
                        />
                    )}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;