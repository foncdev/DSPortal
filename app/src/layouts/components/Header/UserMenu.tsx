// app/src/layouts/components/Header/UserMenu.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, LogOut, Settings, UserCircle, ChevronDown } from 'lucide-react';
import styles from './UserMenu.module.scss';
import { authManager } from '@ds/core';
import type { User as UserType } from '@ds/core';

interface UserMenuProps {
    user: UserType | null;
}

const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Handle logout
    const handleLogout = async () => {
        try {
            await authManager.logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Navigate to profile page
    const goToProfile = () => {
        navigate('/profile');
        setIsOpen(false);
    };

    // Navigate to settings page
    const goToSettings = () => {
        navigate('/settings');
        setIsOpen(false);
    };

    // If no user, show login button
    if (!user) {
        return (
            <button
                className={styles.loginButton}
                onClick={() => navigate('/login')}
            >
                {t('auth.login')}
            </button>
        );
    }

    return (
        <div className={styles.userMenu} ref={dropdownRef}>
            <button
                className={styles.userButton}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <div className={styles.avatar}>
                    <UserCircle size={24} />
                </div>
                <span className={styles.userName}>{user.name}</span>
                <ChevronDown size={16} className={`${styles.chevron} ${isOpen ? styles.open : ''}`} />
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>
                            <UserCircle size={40} />
                        </div>
                        <div className={styles.userDetails}>
                            <div className={styles.name}>{user.name}</div>
                            <div className={styles.email}>{user.email}</div>
                            <div className={styles.role}>{user.role}</div>
                        </div>
                    </div>

                    <ul className={styles.menu}>
                        <li>
                            <button onClick={goToProfile}>
                                <User size={16} />
                                <span>{t('userMenu.profile')}</span>
                            </button>
                        </li>
                        <li>
                            <button onClick={goToSettings}>
                                <Settings size={16} />
                                <span>{t('userMenu.settings')}</span>
                            </button>
                        </li>
                        <li className={styles.divider}></li>
                        <li>
                            <button onClick={handleLogout} className={styles.logout}>
                                <LogOut size={16} />
                                <span>{t('auth.logout')}</span>
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default UserMenu;