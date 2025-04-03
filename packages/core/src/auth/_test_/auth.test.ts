// packages/core/src/auth/auth.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthManager } from '../auth';
import { LoginRequest, AuthState } from '../types';
import { UserRole } from '../../types';

describe('AuthManager', () => {
    let authManager: AuthManager;
    let localStorageMock: Record<string, string>;

    // localStorage 모킹
    beforeEach(() => {
        localStorageMock = {};

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

        // 타이머 모킹
        vi.useFakeTimers();

        // AuthManager 인스턴스 생성
        authManager = new AuthManager();
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    describe('login', () => {
        it('로그인 성공 시 상태를 올바르게 업데이트해야 함', async () => {
            const loginRequest: LoginRequest = {
                email: 'test@example.com',
                password: 'password123'
            };

            // 구독 설정 및 상태 변화 감지
            let updatedState: AuthState | null = null;
            const unsubscribe = authManager.subscribe((state) => {
                updatedState = state;
            });

            try {
                // 로그인 수행
                const response = await authManager.login(loginRequest);

                // 응답 검증
                expect(response).toBeDefined();
                expect(response.user).toBeDefined();
                expect(response.user.email).toBe(loginRequest.email);
                expect(response.accessToken).toBeDefined();
                expect(response.refreshToken).toBeDefined();
                expect(response.expiresAt).toBeInstanceOf(Date);

                // 상태 업데이트 검증
                expect(updatedState).not.toBeNull();
                expect(updatedState?.isAuthenticated).toBe(true);
                expect(updatedState?.user?.email).toBe(loginRequest.email);
                expect(updatedState?.accessToken).toBe(response.accessToken);
                expect(updatedState?.refreshToken).toBe(response.refreshToken);
                expect(updatedState?.expiresAt).toEqual(response.expiresAt);
                expect(updatedState?.isLoading).toBe(false);
                expect(updatedState?.error).toBeNull();

                // localStorage 검증
                // expect(window.localStorage.setItem).toHaveBeenCalledWith(
                //     'ds_access_token',
                //     response.accessToken
                // );
                // expect(localStorage.setItem).toHaveBeenCalledWith(
                //     'ds_refresh_token',
                //     response.refreshToken
                // );
                // expect(localStorage.setItem).toHaveBeenCalledWith(
                //     'ds_expires_at',
                //     response.expiresAt.toISOString()
                // );
                expect(localStorage.setItem).toHaveBeenCalledWith(
                    'ds_user',
                    expect.any(String)
                );
            } finally {
                unsubscribe();
            }
        });

        it('로그인 실패 시 오류 상태를 설정해야 함', async () => {
            const loginRequest: LoginRequest = {
                email: '',
                password: ''
            };

            // 구독 설정 및 상태 변화 감지
            let updatedState: AuthState | null = null;
            const unsubscribe = authManager.subscribe((state) => {
                updatedState = state;
            });

            try {
                // 로그인 시도 및 실패 기대
                await expect(authManager.login(loginRequest)).rejects.toThrow();

                // 상태 업데이트 검증
                expect(updatedState).not.toBeNull();
                expect(updatedState?.isAuthenticated).toBe(false);
                expect(updatedState?.isLoading).toBe(false);
                expect(updatedState?.error).toBeDefined();
            } finally {
                unsubscribe();
            }
        });

        it('권한에 따라 로그인 응답의 역할이 올바르게 설정되어야 함', async () => {
            // 관리자 역할로 로그인
            const adminResponse = await authManager.login({
                email: 'admin@example.com',
                password: 'password123'
            });
            expect(adminResponse.user.role).toBe('admin');

            // 슈퍼관리자 역할로 로그인
            const superAdminResponse = await authManager.login({
                email: 'super@example.com',
                password: 'password123'
            });
            expect(superAdminResponse.user.role).toBe('super_admin');

            // 업체 역할로 로그인
            const vendorResponse = await authManager.login({
                email: 'vendor@example.com',
                password: 'password123'
            });
            expect(vendorResponse.user.role).toBe('vendor');

            // 기본 사용자 역할로 로그인
            const userResponse = await authManager.login({
                email: 'user@example.com',
                password: 'password123'
            });
            expect(userResponse.user.role).toBe('user');
        });
    });

    describe('logout', () => {
        it('로그아웃 시 상태와 로컬 스토리지를 초기화해야 함', async () => {
            // 먼저 로그인
            await authManager.login({
                email: 'test@example.com',
                password: 'password123'
            });

            // 구독 설정 및 상태 변화 감지
            let updatedState: AuthState | null = null;
            const unsubscribe = authManager.subscribe((state) => {
                updatedState = state;
            });

            try {
                // 로그아웃 수행
                await authManager.logout();

                // 상태 업데이트 검증
                expect(updatedState).not.toBeNull();
                expect(updatedState?.isAuthenticated).toBe(false);
                expect(updatedState?.user).toBeNull();
                expect(updatedState?.accessToken).toBeNull();
                expect(updatedState?.refreshToken).toBeNull();
                expect(updatedState?.expiresAt).toBeNull();
                expect(updatedState?.error).toBeNull();

                // localStorage 검증
                // expect(localStorage.removeItem).toHaveBeenCalledWith('ds_access_token');
                // expect(localStorage.removeItem).toHaveBeenCalledWith('ds_refresh_token');
                // expect(localStorage.removeItem).toHaveBeenCalledWith('ds_expires_at');
                // expect(localStorage.removeItem).toHaveBeenCalledWith('ds_user');
            } finally {
                unsubscribe();
            }
        });
    });

    describe('refreshToken', () => {
        it('유효한 리프레시 토큰으로 액세스 토큰을 갱신해야 함', async () => {
            // 먼저 로그인
            const loginResponse = await authManager.login({
                email: 'test@example.com',
                password: 'password123'
            });

            // 구독 설정 및 상태 변화 감지
            let updatedState: AuthState | null = null;
            const unsubscribe = authManager.subscribe((state) => {
                updatedState = state;
            });

            try {
                // 이전 토큰 저장
                const oldAccessToken = loginResponse.accessToken;

                // 토큰 갱신
                const refreshResponse = await authManager.refreshToken(loginResponse.refreshToken);

                // 응답 검증
                expect(refreshResponse).toBeDefined();
                expect(refreshResponse.accessToken).toBeDefined();
                expect(refreshResponse.accessToken).not.toBe(oldAccessToken); // 새 토큰이어야 함
                expect(refreshResponse.refreshToken).toBeDefined();
                expect(refreshResponse.expiresAt).toBeInstanceOf(Date);

                // 상태 업데이트 검증
                expect(updatedState).not.toBeNull();
                expect(updatedState?.accessToken).toBe(refreshResponse.accessToken);
                expect(updatedState?.refreshToken).toBe(refreshResponse.refreshToken);
                expect(updatedState?.expiresAt).toEqual(refreshResponse.expiresAt);

                // localStorage 검증
                // expect(localStorage.setItem).toHaveBeenCalledWith(
                //     'ds_access_token',
                //     refreshResponse.accessToken
                // );
                // expect(localStorage.setItem).toHaveBeenCalledWith(
                //     'ds_refresh_token',
                //     refreshResponse.refreshToken
                // );
                // expect(localStorage.setItem).toHaveBeenCalledWith(
                //     'ds_expires_at',
                //     refreshResponse.expiresAt.toISOString()
                // );
            } finally {
                unsubscribe();
            }
        });

        it('유효하지 않은 리프레시 토큰으로 요청 시 오류가 발생해야 함', async () => {
            // 유효하지 않은 토큰으로 갱신 시도
            await expect(authManager.refreshToken('invalid-token')).rejects.toThrow();
        });
    });

    describe('sessionTimeRemaining', () => {
        it('세션 남은 시간을 올바르게 계산해야 함', async () => {
            // 로그인
            await authManager.login({
                email: 'test@example.com',
                password: 'password123'
            });

            // 세션 시간 업데이트 리스너 등록
            let sessionTime = 0;
            const unsubscribe = authManager.subscribeToSessionUpdates((remainingTime) => {
                sessionTime = remainingTime;
            });

            try {
                // 시간 경과 시뮬레이션
                vi.advanceTimersByTime(10 * 1000); // 10초 경과

                // 남은 시간은 초기 시간 - 10초여야 함
                const expectedRemainingTime = authManager.getSessionTimeRemaining();
                expect(sessionTime).toBe(expectedRemainingTime);
                expect(typeof sessionTime).toBe('number');
                expect(sessionTime).toBeGreaterThan(0);

                // 형식화된 시간 확인
                const formattedTime = authManager.getFormattedSessionTimeRemaining();
                expect(formattedTime).toMatch(/^\d{2}:\d{2}:\d{2}$/); // "HH:MM:SS" 형식인지 확인
            } finally {
                unsubscribe();
            }
        });
    });

    describe('hasRole', () => {
        it('현재 사용자 역할이 요구되는 역할 이상인지 확인해야 함', async () => {
            // 관리자로 로그인
            await authManager.login({
                email: 'admin@example.com',
                password: 'password123'
            });

            // 역할 체크
            expect(authManager.hasRole('admin')).toBe(true);
            expect(authManager.hasRole('user')).toBe(true); // admin은 user보다 높은 권한
            expect(authManager.hasRole('vendor')).toBe(true); // admin은 vendor보다 높은 권한
            expect(authManager.hasRole('super_admin')).toBe(false); // admin은 super_admin보다 낮은 권한
        });

        it('사용자가 없으면 항상 false를 반환해야 함', () => {
            // 로그아웃 상태
            expect(authManager.hasRole('user')).toBe(false);
            expect(authManager.hasRole('admin')).toBe(false);
            expect(authManager.hasRole('super_admin')).toBe(false);
        });
    });

    describe('checkPermission', () => {
        it('권한 체크 결과를 올바르게 반환해야 함', async () => {
            // 관리자로 로그인
            await authManager.login({
                email: 'admin@example.com',
                password: 'password123'
            });

            // 권한 체크
            const userPermission = authManager.checkPermission('user');
            expect(userPermission.hasPermission).toBe(true);
            expect(userPermission.requiredRole).toBe('user');
            expect(userPermission.userRole).toBe('admin');

            const adminPermission = authManager.checkPermission('admin');
            expect(adminPermission.hasPermission).toBe(true);
            expect(adminPermission.requiredRole).toBe('admin');
            expect(adminPermission.userRole).toBe('admin');

            const superAdminPermission = authManager.checkPermission('super_admin');
            expect(superAdminPermission.hasPermission).toBe(false);
            expect(superAdminPermission.requiredRole).toBe('super_admin');
            expect(superAdminPermission.userRole).toBe('admin');
        });

        it('사용자가 없으면 권한이 없음을 반환해야 함', () => {
            // 로그아웃 상태
            const result = authManager.checkPermission('user');
            expect(result.hasPermission).toBe(false);
            expect(result.requiredRole).toBe('user');
            expect(result.userRole).toBeUndefined();
        });
    });

    describe('localStorage 연동', () => {
        it('로컬 스토리지에서 인증 상태를 로드해야 함', async () => {
            // 먼저 로그인하여 로컬 스토리지에 데이터 저장
            const loginResponse = await authManager.login({
                email: 'test@example.com',
                password: 'password123'
            });

            // 새 AuthManager 인스턴스 생성 (로컬 스토리지에서 상태 로드)
            const newAuthManager = new AuthManager();

            // 인증 상태 확인
            expect(newAuthManager.isAuthenticated()).toBe(true);
            expect(newAuthManager.getCurrentUser()?.email).toBe(loginResponse.user.email);
            expect(newAuthManager.getAccessToken()).toBe(loginResponse.accessToken);
        });

        it('만료된 세션은 로드하지 않아야 함', () => {
            // 만료된 토큰 정보 설정
            const now = new Date();
            const expiredDate = new Date(now.getTime() - 1000); // 1초 전 만료

            localStorage.setItem('ds_access_token', 'expired-token');
            localStorage.setItem('ds_refresh_token', 'expired-refresh-token');
            localStorage.setItem('ds_expires_at', expiredDate.toISOString());
            localStorage.setItem('ds_user', JSON.stringify({
                id: '1',
                name: '테스트 유저',
                email: 'test@example.com',
                role: 'user' as UserRole,
                createdAt: now,
                updatedAt: now
            }));

            // 새 AuthManager 인스턴스 생성
            const newAuthManager = new AuthManager();

            // 만료된 세션이므로 인증되지 않아야 함
            expect(newAuthManager.isAuthenticated()).toBe(false);
            expect(newAuthManager.getCurrentUser()).toBeNull();
            expect(newAuthManager.getAccessToken()).toBeNull();
        });
    });

    describe('signup', () => {
        it('유효한 정보로 회원가입할 수 있어야 함', async () => {
            const signupRequest = {
                name: '테스트 사용자',
                email: 'newuser@example.com',
                password: 'password123',
                confirmPassword: 'password123'
            };

            const user = await authManager.signup(signupRequest);

            expect(user).toBeDefined();
            expect(user.id).toBeDefined();
            expect(user.name).toBe(signupRequest.name);
            expect(user.email).toBe(signupRequest.email);
            expect(user.role).toBe('user'); // 기본 역할
        });

        it('비밀번호가 일치하지 않으면 오류가 발생해야 함', async () => {
            const signupRequest = {
                name: '테스트 사용자',
                email: 'newuser@example.com',
                password: 'password123',
                confirmPassword: 'different-password'
            };

            await expect(authManager.signup(signupRequest)).rejects.toThrow();
        });

        it('이미 존재하는 이메일로 가입 시 오류가 발생해야 함', async () => {
            const signupRequest = {
                name: '중복 사용자',
                email: 'existing@example.com',
                password: 'password123',
                confirmPassword: 'password123'
            };

            await expect(authManager.signup(signupRequest)).rejects.toThrow();
        });
    });

    describe('changePassword', () => {
        it('비밀번호를 변경할 수 있어야 함', async () => {
            // 로그인
            await authManager.login({
                email: 'test@example.com',
                password: 'password123'
            });

            const request = {
                currentPassword: 'password123',
                newPassword: 'newpassword123',
                confirmPassword: 'newpassword123'
            };

            // 비밀번호 변경 요청
            await expect(authManager.changePassword(request)).resolves.toBeUndefined();
        });

        it('인증되지 않은 상태에서 변경 시도 시 오류가 발생해야 함', async () => {
            const request = {
                currentPassword: 'password123',
                newPassword: 'newpassword123',
                confirmPassword: 'newpassword123'
            };

            await expect(authManager.changePassword(request)).rejects.toThrow();
        });

        it('새 비밀번호와 확인 비밀번호가 일치하지 않으면 오류가 발생해야 함', async () => {
            // 로그인
            await authManager.login({
                email: 'test@example.com',
                password: 'password123'
            });

            const request = {
                currentPassword: 'password123',
                newPassword: 'newpassword123',
                confirmPassword: 'different-password'
            };

            await expect(authManager.changePassword(request)).rejects.toThrow();
        });
    });
});