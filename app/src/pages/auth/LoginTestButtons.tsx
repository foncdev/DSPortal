// app/src/pages/auth/LoginTestButtons.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole, authManager } from '@ds/core';
import styles from './LoginTestButtons.module.scss';

interface TestUserInfo {
    email: string;
    password: string;
    role: UserRole;
    label: string;
}

const LoginTestButtons: React.FC = () => {
    const navigate = useNavigate();

    // Test user information for quick login
    const testUsers: TestUserInfo[] = [
        {
            email: 'super@example.com',
            password: 'password123',
            role: 'super_admin',
            label: '최고 관리자'
        },
        {
            email: 'admin@example.com',
            password: 'password123',
            role: 'admin',
            label: '관리자'
        },
        {
            email: 'vendor@example.com',
            password: 'password123',
            role: 'vendor',
            label: '업체'
        },
        {
            email: 'user@example.com',
            password: 'password123',
            role: 'user',
            label: '사용자'
        }
    ];

    const handleTestLogin = async (user: TestUserInfo) => {
        try {
            await authManager.login({
                email: user.email,
                password: user.password
            });

            void navigate('/dashboard');
        } catch (error) {
            console.error('Test login failed:', error);
        }
    };

    return (
        <div className={styles.testButtonsContainer}>
            <h3 className={styles.testButtonsTitle}>테스트 로그인</h3>
            <div className={styles.testButtons}>
                {testUsers.map((user) => (
                    <button
                        key={user.role}
                        className={styles.testButton}
                        onClick={() => handleTestLogin(user)}
                        type="button"
                    >
                        {user.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LoginTestButtons;