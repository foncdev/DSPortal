import React, { ReactNode, useEffect } from 'react';
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

    // Check authentication and permissions
    useEffect(() => {
        if (requireAuth && !authManager.isAuthenticated()) {
            navigate('/login', { replace: true });
            return;
        }

        // Check role-based permissions if authenticated
        if (requireAuth && authManager.isAuthenticated() && requiredRole) {
            const hasPermission = authManager.hasRole(requiredRole);
            if (!hasPermission) {
                navigate('/unauthorized', { replace: true });
            }
        }
    }, [requireAuth, requiredRole, navigate]);

    return (
        <BaseLayout className={styles.authLayout}>
            <Header />
            <div className={styles.layoutContainer}>
                <Sidebar />
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