// app/src/layouts/components/Header/NotificationCenter.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { formatDate } from '@ds/utils';
import styles from './NotificationCenter.module.scss';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    createdAt: Date;
}

// Mock notifications - in a real app, this would come from an API
const mockNotifications: Notification[] = [
    {
        id: '1',
        title: '시스템 업데이트',
        message: '시스템이 최신 버전으로 업데이트되었습니다.',
        type: 'info',
        read: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    },
    {
        id: '2',
        title: '문서 업로드 완료',
        message: '문서 "프로젝트 계획서"가 성공적으로 업로드되었습니다.',
        type: 'success',
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
        id: '3',
        title: '세션 만료 경고',
        message: '세션이 10분 후에 만료됩니다. 작업을 저장하세요.',
        type: 'warning',
        read: true,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
];

const NotificationCenter: React.FC = () => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Calculate unread count
    const unreadCount = notifications.filter(notification => !notification.read).length;

    // Mark all as read
    const markAllAsRead = () => {
        setNotifications(prevNotifications =>
            prevNotifications.map(notification => ({
                ...notification,
                read: true
            }))
        );
    };

    // Mark one notification as read
    const markAsRead = (id: string) => {
        setNotifications(prevNotifications =>
            prevNotifications.map(notification =>
                notification.id === id ? { ...notification, read: true } : notification
            )
        );
    };

    // Remove notification
    const removeNotification = (id: string) => {
        setNotifications(prevNotifications =>
            prevNotifications.filter(notification => notification.id !== id)
        );
    };

    // Clear all notifications
    const clearAllNotifications = () => {
        setNotifications([]);
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

    return (
        <div className={styles.notificationCenter} ref={dropdownRef}>
            <button
                className={styles.notificationButton}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-label={t('notifications.toggle')}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className={styles.badge}>{unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.header}>
                        <h3>{t('notifications.title')}</h3>
                        <div className={styles.actions}>
                            {unreadCount > 0 && (
                                <button
                                    className={styles.actionButton}
                                    onClick={markAllAsRead}
                                    title={t('notifications.markAllRead')}
                                >
                                    <Check size={16} />
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    className={styles.actionButton}
                                    onClick={clearAllNotifications}
                                    title={t('notifications.clearAll')}
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                            <button
                                className={styles.actionButton}
                                onClick={() => setIsOpen(false)}
                                title={t('notifications.close')}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    <div className={styles.notificationList}>
                        {notifications.length === 0 ? (
                            <div className={styles.empty}>
                                {t('notifications.empty')}
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`${styles.notification} ${!notification.read ? styles.unread : ''} ${styles[notification.type]}`}
                                >
                                    <div className={styles.content}>
                                        <div className={styles.title}>{notification.title}</div>
                                        <div className={styles.message}>{notification.message}</div>
                                        <div className={styles.time}>{formatDate(notification.createdAt)}</div>
                                    </div>
                                    <div className={styles.notificationActions}>
                                        {!notification.read && (
                                            <button
                                                className={styles.markReadButton}
                                                onClick={() => markAsRead(notification.id)}
                                                title={t('notifications.markRead')}
                                            >
                                                <Check size={14} />
                                            </button>
                                        )}
                                        <button
                                            className={styles.removeButton}
                                            onClick={() => removeNotification(notification.id)}
                                            title={t('notifications.remove')}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className={styles.footer}>
                        <button className={styles.viewAllButton}>
                            {t('notifications.viewAll')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;