// app/src/layouts/AuthLayout.tsx
import React, { ReactNode, useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BaseLayout from './BaseLayout';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import Footer from './components/Footer/Footer';
import { authManager } from '@ds/core';
import styles from './AuthLayout.module.scss';

interface AuthLayoutProps {
    children: ReactNode;
    requireAuth?: boolean;
    requiredRole?: 'user' | 'vendor' | 'admin' | 'super_admin';
}

/**
 * Layout for authenticated pages with header, sidebar, content area, and footer
 */
const AuthLayout: React.FC<AuthLayoutProps> = ({
                                                   children,
                                                   requireAuth = true,
                                                   requiredRole = 'user'
                                               }) => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Handle navigation with useCallback to avoid re-creation
    const navigateToLogin = useCallback(() => {
        void navigate('/login', { replace: true });
    }, [navigate]);

    const navigateToUnauthorized = useCallback(() => {
        void navigate('/unauthorized', { replace: true });
    }, [navigate]);

    // Toggle sidebar for mobile view
    const toggleSidebar = useCallback(() => {
        setIsSidebarOpen(prev => !prev);
    }, []);

    // Toggle sidebar collapsed state for desktop view
    // const toggleSidebarCollapsed = useCallback(() => {
    //     setIsSidebarCollapsed(prev => !prev);
    // }, []);

    // Check authentication and permissions
    useEffect(() => {
        // Check if authentication is required but user is not authenticated
        if (requireAuth && !authManager.isAuthenticated()) {
            navigateToLogin();
            return;
        }

        // Check role-based permissions if authenticated
        if (requireAuth && authManager.isAuthenticated() && requiredRole) {
            const hasPermission = authManager.hasRole(requiredRole);
            if (!hasPermission) {
                navigateToUnauthorized();
            }
        }
    }, [requireAuth, requiredRole, navigateToLogin, navigateToUnauthorized]);

    return (
        <BaseLayout className={styles.authLayout}>
            <Header
                toggleSidebar={toggleSidebar}
                isMobileSidebarOpen={isSidebarOpen}
            />
            <div className={`${styles.layoutContainer} ${isSidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
                <Sidebar
                    isMobileOpen={isSidebarOpen}
                    setIsMobileOpen={setIsSidebarOpen}
                    isIconMode={isSidebarCollapsed}
                    setIsIconMode={setIsSidebarCollapsed}
                />
                <main className={styles.contentArea}>
                    <div className={styles.contentWrapper}>
                        {children}
                    </div>
                    <Footer />
                </main>
            </div>
        </BaseLayout>
    );
};

export default AuthLayout;