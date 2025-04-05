// src/pages/auth/TestLoginButtons.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authManager } from '@ds/core';
import styles from './TestLoginButtons.module.scss';

interface TestLoginUser {
    email: string;
    password: string;
    role: string;
    icon: string;
}

const TestLoginButtons: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // SVG 아이콘
    const icons = {
        superAdmin: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>',
        admin: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path></svg>',
        vendor: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>',
        user: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
    };

    const testUsers: TestLoginUser[] = [
        {
            email: 'super@example.com',
            password: 'password123',
            role: t('roles.superAdmin'),
            icon: icons.superAdmin
        },
        {
            email: 'admin@example.com',
            password: 'password123',
            role: t('roles.admin'),
            icon: icons.admin
        },
        {
            email: 'vendor@example.com',
            password: 'password123',
            role: t('roles.vendor'),
            icon: icons.vendor
        },
        {
            email: 'user@example.com',
            password: 'password123',
            role: t('roles.user'),
            icon: icons.user
        }
    ];

    const handleTestLogin = async (user: TestLoginUser) => {
        try {
            // Login with the test user
            await authManager.login({
                email: user.email,
                password: user.password
            });

            // Navigate to dashboard
            void navigate('/dashboard');
        } catch (error) {
            console.error('Test login failed:', error);
        }
    };

    return (
        <div className={styles.testLoginContainer}>
            <h3 className={styles.testLoginTitle}>{t('auth.testAccounts')}</h3>
            <div className={styles.testLoginButtonsGrid}>
                {testUsers.map((user) => (
                    <button
                        key={user.email}
                        className={styles.testLoginButton}
                        onClick={() => handleTestLogin(user)}
                        aria-label={`${t('auth.loginAs')} ${user.role}`}
                    >
            <span
                className={styles.testLoginIcon}
                dangerouslySetInnerHTML={{ __html: user.icon }}
            />
                        <span className={styles.testLoginLabel}>{user.role}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TestLoginButtons;