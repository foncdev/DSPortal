// packages/core/src/auth/integration.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authManager } from '../auth';
import { hasRequiredRole, ROLE_HIERARCHY } from '../permission';
import {
    calculateSessionState,
    SessionState,
    formatSessionTime
} from '../session';
import {
    filterMenuByPermission,
    MenuItem,
    MenuTree
} from '../menu-access';
import { UserRole } from '../../types';

// 모의 메뉴 데이터
const testMenuTree: MenuTree = {
    items: [
        {
            id: 'home',
            label: '홈',
            path: '/'
        },
        {
            id: 'admin',
            label: '관리',
            requiredRole: 'admin',
            children: [
                {
                    id: 'users',
                    label: '사용자 관리',
                    path: '/admin/users',
                    requiredRole: 'admin'
                }
            ]
        }
    ]
};

describe('Auth System Integration', () => {
    // 테스트용 로컬 스토리지 모의 구현
    let localStorageMock: Record<string, string> = {};

    beforeEach(() => {
        // localStorage 모킹
        global.localStorage = {
            getItem: vi.fn((key) => localStorageMock[key] || null),
            setItem: vi.fn((key, value) => {
                localStorageMock[key] = value.toString();
            }),
            removeItem: vi.fn((key) => {
                delete localStorageMock[key];
            }),
            clear: vi.fn(() => {
                localStorageMock = {};
            }),
            key: vi.fn((index) => Object.keys(localStorageMock)[index] || null),
            length: Object.keys(localStorageMock).length
        };

        vi.useFakeTimers();
        localStorageMock = {};
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    it('로그인-메뉴 필터링-권한 검사 통합 테스트', async () => {
        // 1. 일반 사용자로 로그인
        const userLoginResponse = await authManager.login({
            email: 'user@example.com',
            password: 'password123'
        });

        expect(userLoginResponse.user.role).toBe('user');
        expect(authManager.isAuthenticated()).toBe(true);

        // 2. 사용자 권한으로 메뉴 필터링
        const userFilteredMenu = filterMenuByPermission(testMenuTree, authManager.getCurrentUser()?.role);

        // 사용자는 홈 메뉴만 접근 가능
        expect(userFilteredMenu.items.length).toBe(1);
        expect(userFilteredMenu.items[0].id).toBe('home');

        // 3. 권한 체크
        expect(authManager.hasRole('user')).toBe(true);
        expect(authManager.hasRole('admin')).toBe(false);

        // 4. 로그아웃
        await authManager.logout();
        expect(authManager.isAuthenticated()).toBe(false);

        // 5. 관리자로 로그인
        const adminLoginResponse = await authManager.login({
            email: 'admin@example.com',
            password: 'password123'
        });

        expect(adminLoginResponse.user.role).toBe('admin');
        expect(authManager.isAuthenticated()).toBe(true);

        // 6. 관리자 권한으로 메뉴 필터링
        const adminFilteredMenu = filterMenuByPermission(testMenuTree, authManager.getCurrentUser()?.role);

        // 관리자는 모든 메뉴에 접근 가능
        expect(adminFilteredMenu.items.length).toBe(2);

        // 관리자 메뉴의 하위 메뉴도 접근 가능
        const adminMenu = adminFilteredMenu.items.find(item => item.id === 'admin');
        expect(adminMenu).toBeDefined();
        expect(adminMenu?.children?.length).toBe(1);

        // 7. 권한 체크
        expect(authManager.hasRole('user')).toBe(true); // 관리자는 사용자 권한도 가짐
        expect(authManager.hasRole('admin')).toBe(true);
        expect(authManager.hasRole('super_admin')).toBe(false);
    });

    it('세션 타이머 및 만료 통합 테스트', async () => {
        // 1. 로그인
        const loginResponse = await authManager.login({
            email: 'test@example.com',
            password: 'password123'
        });

        // 세션 만료 시간 가져오기 (1시간 = 3600초)
        const sessionTime = authManager.getSessionTimeRemaining();
        expect(sessionTime).toBeGreaterThan(0);

        // 세션 상태 확인
        const sessionState = calculateSessionState(sessionTime);
        expect(sessionState).toBe(SessionState.ACTIVE);

        // 2. 시간 경과 시뮬레이션 (55분 = 3300초)
        vi.advanceTimersByTime(3300 * 1000);

        // 남은 시간 (약 5분 = 300초)
        const remainingTime = authManager.getSessionTimeRemaining();
        expect(remainingTime).toBeLessThanOrEqual(300);

        // 세션 상태 다시 확인 (경고 상태여야 함)
        const warningState = calculateSessionState(remainingTime);
        expect(warningState).toBe(SessionState.WARNING);

        // 3. 토큰 갱신
        const refreshToken = localStorage.getItem('ds_refresh_token');
        expect(refreshToken).toBeDefined();

        if (refreshToken) {
            await authManager.refreshToken(refreshToken);

            // 갱신 후 세션 시간 확인 (다시 1시간)
            const refreshedTime = authManager.getSessionTimeRemaining();
            expect(refreshedTime).toBeGreaterThan(3000);

            // 세션 상태 확인 (다시 활성 상태)
            const refreshedState = calculateSessionState(refreshedTime);
            expect(refreshedState).toBe(SessionState.ACTIVE);
        }
    });

    it('권한에 따른 접근 제어 통합 테스트', async () => {
        // 역할 계층 확인
        const roles = Object.keys(ROLE_HIERARCHY) as UserRole[];

        // 슈퍼관리자 권한으로 로그인
        await authManager.login({
            email: 'super@example.com',
            password: 'password123'
        });

        // 슈퍼관리자는 모든 권한에 접근 가능
        for (const role of roles) {
            expect(authManager.hasRole(role)).toBe(role === 'super_admin' || hasRequiredRole('super_admin', role));
        }

        // 로그아웃 후 관리자로 로그인
        await authManager.logout();
        await authManager.login({
            email: 'admin@example.com',
            password: 'password123'
        });

        // 관리자는 admin 이하 권한에 접근 가능
        expect(authManager.hasRole('super_admin')).toBe(false);
        expect(authManager.hasRole('admin')).toBe(true);
        expect(authManager.hasRole('user')).toBe(true);
        expect(authManager.hasRole('vendor')).toBe(true);


        // 로그아웃 후 업체로 로그인
        await authManager.logout();
        await authManager.login({
            email: 'vendor@example.com',
            password: 'password123'
        });

        // 업체는 vendor 권한만 접근 가능
        expect(authManager.hasRole('super_admin')).toBe(false);
        expect(authManager.hasRole('admin')).toBe(false);
        expect(authManager.hasRole('vendor')).toBe(true);
        expect(authManager.hasRole('user')).toBe(true);

        // 로그아웃 후 일반 사용자로 로그인
        await authManager.logout();
        await authManager.login({
            email: 'user@example.com',
            password: 'password123'
        });

        // 일반 사용자는 user 이하 권한에 접근 가능
        expect(authManager.hasRole('super_admin')).toBe(false);
        expect(authManager.hasRole('admin')).toBe(false);
        expect(authManager.hasRole('vendor')).toBe(false);
        expect(authManager.hasRole('user')).toBe(true);

    });
});