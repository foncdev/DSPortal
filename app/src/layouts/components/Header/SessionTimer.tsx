// app/src/layouts/components/Header/SessionTimer.tsx 수정
import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { authManager, SessionState, calculateSessionState } from '@ds/core';
import styles from './SessionTimer.module.scss';

const SessionTimer: React.FC = () => {
    const { t } = useTranslation();
    const [remainingTime, setRemainingTime] = useState<number>(0);
    const [formattedTime, setFormattedTime] = useState<string>('00:00:00');
    const [extending, setExtending] = useState<boolean>(false);

    useEffect(() => {
        // 초기 시간 설정
        const initialTime = authManager.getSessionTimeRemaining();
        setRemainingTime(initialTime);
        setFormattedTime(authManager.getFormattedSessionTimeRemaining());

        // authManager의 세션 업데이트를 구독
        const unsubscribe = authManager.subscribeToSessionUpdates((timeRemaining) => {
            setRemainingTime(timeRemaining);
            setFormattedTime(authManager.getFormattedSessionTimeRemaining());
        });

        // 컴포넌트 언마운트 시 구독 해제
        return () => {
            unsubscribe();
        };
    }, []);

    // 세션 연장 처리
    const extendSession = async () => {
        if (extending) return;

        setExtending(true);
        try {
            const refreshToken = localStorage.getItem('ds_refresh_token');
            if (refreshToken) {
                await authManager.refreshToken(refreshToken);
            }
        } catch (error) {
            console.error('Session extension failed:', error);
        } finally {
            setExtending(false);
        }
    };

    // 세션 상태에 따른 스타일 및 메시지
    const sessionState = calculateSessionState(remainingTime);
    const stateClass = styles[sessionState.toLowerCase()];

    // 사용자가 로그인하지 않았거나 세션 정보가 없으면 표시하지 않음
    if (!authManager.isAuthenticated() || remainingTime <= 0) {
        return null;
    }

    // WARNING 상태 이하일 때만 연장 버튼 표시
    const showExtendButton = sessionState === SessionState.WARNING ||
        sessionState === SessionState.EXPIRING;

    return (
        <div className={`${styles.sessionTimer} ${stateClass}`}>
            <Clock size={16} className={styles.icon} />
            <span className={styles.time} title={t('session.remainingTime')}>
        {formattedTime}
      </span>

            {showExtendButton && (
                <button
                    className={styles.extendButton}
                    onClick={extendSession}
                    disabled={extending}
                    title={t('session.extendSession')}
                >
                    <RefreshCw size={14} className={extending ? styles.spinning : ''} />
                </button>
            )}
        </div>
    );
};

export default SessionTimer;