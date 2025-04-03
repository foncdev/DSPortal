/**
 * 세션 상태 유형
 */
export enum SessionState {
    ACTIVE = 'active',
    WARNING = 'warning',
    EXPIRING = 'expiring',
    EXPIRED = 'expired'
}

/**
 * 세션 경고 임계값 (초)
 */
export const SESSION_WARNING_THRESHOLD = 5 * 60; // 5분

/**
 * 세션 만료 임박 임계값 (초)
 */
export const SESSION_EXPIRING_THRESHOLD = 60; // 1분

/**
 * 세션 관련 헬퍼 함수들
 * 참고: authManager는 실제 사용 시 import하여 사용
 */

/**
 * 세션 만료까지 남은 시간 형식화
 * @param remainingTime 남은 시간 (초)
 * @returns 형식화된 시간 문자열 (예: "00:59:59")
 */
export function formatSessionTime(remainingTime: number): string {
    if (remainingTime <= 0) {
        return "00:00:00";
    }

    const hours = Math.floor(remainingTime / 3600);
    const minutes = Math.floor((remainingTime % 3600) / 60);
    const seconds = remainingTime % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * 세션 상태 계산
 * @param timeRemaining 남은 시간 (초)
 * @returns 세션 상태
 */
export function calculateSessionState(timeRemaining: number): SessionState {
    if (timeRemaining <= 0) {
        return SessionState.EXPIRED;
    }

    if (timeRemaining <= SESSION_EXPIRING_THRESHOLD) {
        return SessionState.EXPIRING;
    }

    if (timeRemaining <= SESSION_WARNING_THRESHOLD) {
        return SessionState.WARNING;
    }

    return SessionState.ACTIVE;
}

/**
 * 세션 상태에 따른 색상 가져오기 (CSS 클래스용)
 * @param state 세션 상태
 * @returns CSS 클래스 이름
 */
export function getSessionStateColorClass(state: SessionState): string {
    switch (state) {
        case SessionState.EXPIRED:
            return 'text-red-600';
        case SessionState.EXPIRING:
            return 'text-red-500';
        case SessionState.WARNING:
            return 'text-yellow-500';
        case SessionState.ACTIVE:
        default:
            return 'text-green-500';
    }
}

/**
 * 세션 상태 메시지 생성
 * @param state 세션 상태
 * @param formattedTime 형식화된 시간
 * @returns 세션 상태 설명 메시지
 */
export function createSessionStateMessage(state: SessionState, formattedTime: string): string {
    switch (state) {
        case SessionState.EXPIRED:
            return '세션이 만료되었습니다. 다시 로그인해주세요.';
        case SessionState.EXPIRING:
            return `세션이 곧 만료됩니다 (${formattedTime}). 작업을 저장하세요.`;
        case SessionState.WARNING:
            return `세션 만료 경고 (${formattedTime}). 세션을 연장하시겠습니까?`;
        case SessionState.ACTIVE:
        default:
            return `세션 활성 상태 (${formattedTime})`;
    }
}