// app/src/components/SessionExpiryAlert.tsx 수정
import React, { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { authManager, SessionState } from '@ds/core';
import styles from './SessionExpiryAlert.module.scss';

const SessionExpiryAlert: React.FC = () => {
    const { t } = useTranslation();
    const [visible, setVisible] = useState<boolean>(false);
    const [extending, setExtending] = useState<boolean>(false);
    const [formattedTime, setFormattedTime] = useState<string>('');

    useEffect(() => {
        const handleSessionUpdate = (time: number) => {
            setFormattedTime(authManager.getFormattedSessionTimeRemaining());

            // 세션 상태에 따라 알림 표시 설정
            const state = time <= 60 ? SessionState.EXPIRING :
                time <= 300 ? SessionState.WARNING :
                    SessionState.ACTIVE;

            // EXPIRING 상태일 때만 알림 표시
            setVisible(state === SessionState.EXPIRING);
        };

        // 세션 업데이트 구독
        const unsubscribe = authManager.subscribeToSessionUpdates(handleSessionUpdate);

        return () => {
            unsubscribe();
        };
    }, []);

    const extendSession = async () => {
        if (extending) return;

        setExtending(true);
        try {
            const refreshToken = localStorage.getItem('ds_refresh_token');
            if (refreshToken) {
                await authManager.refreshToken(refreshToken);
                setVisible(false);
            }
        } catch (error) {
            console.error('Session extension failed:', error);
        } finally {
            setExtending(false);
        }
    };

    if (!visible) {
        return null;
    }

    return (
        <div className={styles.alertContainer}>
            <div className={styles.alert}>
                <AlertTriangle className={styles.icon} />
                <div className={styles.message}>
                    <p className={styles.title}>{t('session.expiring')}</p>
                    <p>{t('session.expiringMessage', { time: formattedTime })}</p>
                </div>
                <button
                    className={styles.extendButton}
                    onClick={extendSession}
                    disabled={extending}
                >
                    {extending ? (
                        <>
                            <RefreshCw className={styles.spinning} />
                            {t('session.extending')}
                        </>
                    ) : (
                        t('session.extendSession')
                    )}
                </button>
            </div>
        </div>
    );
};

export default SessionExpiryAlert;