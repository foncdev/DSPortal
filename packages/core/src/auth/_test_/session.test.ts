// packages/core/src/auth/session.test.ts
import { describe, it, expect } from 'vitest';
import {
    SessionState,
    SESSION_WARNING_THRESHOLD,
    SESSION_EXPIRING_THRESHOLD,
    formatSessionTime,
    calculateSessionState,
    getSessionStateColorClass,
    createSessionStateMessage
} from '../session';

describe('Session Utils', () => {
    describe('formatSessionTime', () => {
        it('남은 시간을 HH:MM:SS 형식으로 형식화해야 함', () => {
            // 시, 분, 초가 모두 있는 경우
            expect(formatSessionTime(3661)).toBe('01:01:01'); // 1시간 1분 1초

            // 시간이 없는 경우
            expect(formatSessionTime(125)).toBe('00:02:05'); // 2분 5초

            // 분이 없는 경우
            expect(formatSessionTime(3605)).toBe('01:00:05'); // 1시간 0분 5초

            // 초가 없는 경우
            expect(formatSessionTime(3660)).toBe('01:01:00'); // 1시간 1분 0초

            // 0 또는 음수인 경우
            expect(formatSessionTime(0)).toBe('00:00:00');
            expect(formatSessionTime(-10)).toBe('00:00:00');
        });
    });

    describe('calculateSessionState', () => {
        it('남은 시간에 따라 올바른 세션 상태를 반환해야 함', () => {
            // 만료됨
            expect(calculateSessionState(0)).toBe(SessionState.EXPIRED);
            expect(calculateSessionState(-10)).toBe(SessionState.EXPIRED);

            // 만료 임박 (1분 이하)
            expect(calculateSessionState(SESSION_EXPIRING_THRESHOLD)).toBe(SessionState.EXPIRING);
            expect(calculateSessionState(SESSION_EXPIRING_THRESHOLD - 1)).toBe(SessionState.EXPIRING);

            // 경고 (5분 이하)
            expect(calculateSessionState(SESSION_WARNING_THRESHOLD)).toBe(SessionState.WARNING);
            expect(calculateSessionState(SESSION_WARNING_THRESHOLD - 1)).toBe(SessionState.WARNING);
            expect(calculateSessionState(SESSION_EXPIRING_THRESHOLD + 1)).toBe(SessionState.WARNING);

            // 정상 (5분 초과)
            expect(calculateSessionState(SESSION_WARNING_THRESHOLD + 1)).toBe(SessionState.ACTIVE);
            expect(calculateSessionState(3600)).toBe(SessionState.ACTIVE); // 1시간
        });
    });

    describe('getSessionStateColorClass', () => {
        it('세션 상태에 따라 올바른 CSS 클래스를 반환해야 함', () => {
            expect(getSessionStateColorClass(SessionState.EXPIRED)).toBe('text-red-600');
            expect(getSessionStateColorClass(SessionState.EXPIRING)).toBe('text-red-500');
            expect(getSessionStateColorClass(SessionState.WARNING)).toBe('text-yellow-500');
            expect(getSessionStateColorClass(SessionState.ACTIVE)).toBe('text-green-500');
        });
    });

    describe('createSessionStateMessage', () => {
        it('세션 상태와 시간에 따라 올바른 메시지를 생성해야 함', () => {
            const formattedTime = '01:30:00'; // 1시간 30분

            expect(createSessionStateMessage(SessionState.EXPIRED, formattedTime))
                .toContain('만료되었습니다');

            expect(createSessionStateMessage(SessionState.EXPIRING, formattedTime))
                .toContain('곧 만료됩니다');
            expect(createSessionStateMessage(SessionState.EXPIRING, formattedTime))
                .toContain(formattedTime);

            expect(createSessionStateMessage(SessionState.WARNING, formattedTime))
                .toContain('만료 경고');
            expect(createSessionStateMessage(SessionState.WARNING, formattedTime))
                .toContain(formattedTime);

            expect(createSessionStateMessage(SessionState.ACTIVE, formattedTime))
                .toContain('활성 상태');
            expect(createSessionStateMessage(SessionState.ACTIVE, formattedTime))
                .toContain(formattedTime);
        });
    });
});