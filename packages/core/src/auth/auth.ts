import {
    AuthError,
    AuthState,
    ChangePasswordRequest,
    LoginRequest,
    LoginResponse,
    PermissionCheckResult,
    RefreshTokenRequest,
    RefreshTokenResponse,
    ResetPasswordRequest,
    SignupRequest,
    TokenInfo
} from './types';
import { User, UserRole } from '../types';
import { createPermissionCheckResult, hasRequiredRole } from './permission';

// 로컬 스토리지 키 정의
const STORAGE_KEYS = {
    ACCESS_TOKEN: 'ds_access_token',
    REFRESH_TOKEN: 'ds_refresh_token',
    EXPIRES_AT: 'ds_token_expires_at',
    USER: 'ds_user',
    SESSION_CHECK_INTERVAL: 'ds_session_check_interval',
};

/**
 * 인증 상태 관리를 위한 클래스
 */
export class AuthManager {
    private state: AuthState;
    private tokenRefreshTimer: ReturnType<typeof setTimeout> | null = null;
    private sessionCheckTimer: ReturnType<typeof setInterval> | null = null;
    private listeners: ((state: AuthState) => void)[] = [];
    private sessionUpdateListeners: ((remainingTime: number) => void)[] = [];

    constructor() {
        this.state = this.loadStateFromStorage() || {
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
            expiresAt: null,
            isLoading: false,
            error: null,
            sessionTimeRemaining: 0
        };

        // 토큰이 있으면 자동으로 토큰 갱신 타이머 설정
        if (this.state.accessToken && this.state.expiresAt) {
            this.setupTokenRefreshTimer();
            this.setupSessionCheckTimer();
        }
    }

    /**
     * 인증 상태 변화를 구독
     * @param listener 상태 변화 리스너 함수
     * @returns 구독 해제 함수
     */
    subscribe(listener: (state: AuthState) => void): () => void {
        this.listeners.push(listener);

        // 현재 상태 즉시 전달
        listener({ ...this.state });

        // 구독 해제 함수 반환
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    /**
     * 세션 시간 업데이트를 구독
     * @param listener 세션 시간 업데이트 리스너 함수
     * @returns 구독 해제 함수
     */
    subscribeToSessionUpdates(listener: (remainingTime: number) => void): () => void {
        this.sessionUpdateListeners.push(listener);

        // 현재 세션 남은 시간 즉시 전달
        if (this.state.sessionTimeRemaining !== undefined) {
            listener(this.state.sessionTimeRemaining);
        }

        // 구독 해제 함수 반환
        return () => {
            this.sessionUpdateListeners = this.sessionUpdateListeners.filter(l => l !== listener);
        };
    }

    /**
     * 내부 상태 갱신 및 리스너에게 알림
     * @param updates 업데이트할 상태 부분
     */
    private updateState(updates: Partial<AuthState>): void {
        this.state = { ...this.state, ...updates };

        // 상태 저장
        this.saveStateToStorage();

        // 리스너들에게 알림
        this.notifyListeners();
    }

    /**
     * 모든 리스너에게 현재 상태 변경 알림
     */
    private notifyListeners(): void {
        const stateCopy = { ...this.state };
        this.listeners.forEach(listener => listener(stateCopy));
    }

    /**
     * 세션 시간 업데이트 리스너에게 알림
     * @param remainingTime 남은 시간(초)
     */
    private notifySessionUpdateListeners(remainingTime: number): void {
        this.sessionUpdateListeners.forEach(listener => listener(remainingTime));
    }

    /**
     * 로컬 스토리지에 인증 상태 저장
     */
    private saveStateToStorage(): void {
        if (this.state.accessToken) {
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, this.state.accessToken);
        } else {
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        }

        if (this.state.refreshToken) {
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, this.state.refreshToken);
        } else {
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        }

        if (this.state.expiresAt) {
            localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, this.state.expiresAt.toISOString());
        } else {
            localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT);
        }

        if (this.state.user) {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.state.user));
        } else {
            localStorage.removeItem(STORAGE_KEYS.USER);
        }
    }

    /**
     * 로컬 스토리지에서 인증 상태 로드
     */
    private loadStateFromStorage(): AuthState | null {
        const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        const expiresAtStr = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);
        const userStr = localStorage.getItem(STORAGE_KEYS.USER);

        if (!accessToken || !refreshToken || !expiresAtStr || !userStr) {
            return null;
        }

        try {
            const expiresAt = new Date(expiresAtStr);
            const user = JSON.parse(userStr) as User;

            // 토큰이 만료되었는지 확인
            const isExpired = expiresAt.getTime() <= Date.now();

            if (isExpired) {
                return null;
            }

            // 세션 남은 시간 계산 (초)
            const sessionTimeRemaining = Math.floor((expiresAt.getTime() - Date.now()) / 1000);

            return {
                isAuthenticated: true,
                user,
                accessToken,
                refreshToken,
                expiresAt,
                isLoading: false,
                error: null,
                sessionTimeRemaining
            };
        } catch (error) {
            console.error('Failed to parse auth state from storage:', error);
            return null;
        }
    }

    /**
     * 토큰 갱신 타이머 설정
     */
    private setupTokenRefreshTimer(): void {
        if (this.tokenRefreshTimer) {
            clearTimeout(this.tokenRefreshTimer);
        }

        if (!this.state.expiresAt) {
            return;
        }

        // 토큰 만료 5분 전에 갱신 시도
        const timeUntilExpiry = this.state.expiresAt.getTime() - Date.now();
        const refreshThreshold = 5 * 60 * 1000; // 5분
        const timeUntilRefresh = Math.max(0, timeUntilExpiry - refreshThreshold);

        this.tokenRefreshTimer = setTimeout(() => {
            if (this.state.refreshToken) {
                this.refreshToken(this.state.refreshToken).catch(console.error);
            }
        }, timeUntilRefresh);
    }

    /**
     * 세션 체크 타이머 설정 (1초마다 세션 남은 시간 업데이트)
     */
    private setupSessionCheckTimer(): void {
        if (this.sessionCheckTimer) {
            clearInterval(this.sessionCheckTimer);
        }

        // 1초마다 세션 남은 시간 체크
        this.sessionCheckTimer = setInterval(() => {
            if (this.state.expiresAt) {
                const remainingTime = Math.max(0, Math.floor((this.state.expiresAt.getTime() - Date.now()) / 1000));

                // 상태 업데이트
                this.updateState({ sessionTimeRemaining: remainingTime });

                // 세션 업데이트 리스너에게 알림
                this.notifySessionUpdateListeners(remainingTime);

                // 세션이 만료되었으면 로그아웃
                if (remainingTime <= 0) {
                    this.logout().catch(console.error);
                }
            }
        }, 1000);

        // 세션 체크 간격 저장
        localStorage.setItem(STORAGE_KEYS.SESSION_CHECK_INTERVAL, this.sessionCheckTimer.toString());
    }

    /**
     * 사용자 로그인 처리
     * @param loginRequest 로그인 요청 정보
     * @returns 로그인 응답 정보
     */
    async login(loginRequest: LoginRequest): Promise<LoginResponse> {
        this.updateState({ isLoading: true, error: null });

        try {
            // TODO: 실제 API 호출 구현
            // 현재는 목업 데이터로 대체
            const response: LoginResponse = await this.mockLogin(loginRequest);

            this.updateState({
                isAuthenticated: true,
                user: response.user,
                accessToken: response.accessToken,
                refreshToken: response.refreshToken,
                expiresAt: response.expiresAt,
                isLoading: false,
                sessionTimeRemaining: Math.floor((response.expiresAt.getTime() - Date.now()) / 1000)
            });

            // 토큰 갱신 타이머 설정
            this.setupTokenRefreshTimer();
            // 세션 체크 타이머 설정
            this.setupSessionCheckTimer();

            return response;
        } catch (error) {
            const authError = this.handleError(error);
            this.updateState({
                isLoading: false,
                error: authError.message,
                isAuthenticated: false
            });
            throw authError;
        }
    }

    /**
     * 목업 로그인 응답 생성 (실제 구현에서는 API 호출로 대체)
     * @param loginRequest 로그인 요청 정보
     * @returns 로그인 응답 정보
     */
    private async mockLogin(loginRequest: LoginRequest): Promise<LoginResponse> {

        return new Promise((resolve, reject) => {
            if (loginRequest.email && loginRequest.password) {
                const now = new Date();
                // 1시간 후 만료
                const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);

                // 이메일에 따라 다른 역할 부여 (테스트용)
                let role: UserRole = 'user';
                if (loginRequest.email.includes('admin')) {
                    role = 'admin';
                } else if (loginRequest.email.includes('super')) {
                    role = 'super_admin';
                } else if (loginRequest.email.includes('vendor')) {
                    role = 'vendor';
                }

                resolve({
                    user: {
                        id: '1',
                        name: '테스트 유저',
                        email: loginRequest.email,
                        role,
                        createdAt: now,
                        updatedAt: now,
                        lastLoginAt: now
                    },
                    accessToken: 'mock-access-token-' + Math.random().toString(36).substring(2),
                    refreshToken: 'mock-refresh-token-' + Math.random().toString(36).substring(2),
                    expiresAt
                });
            } else {
                reject({
                    code: 'invalid_credentials',
                    message: '이메일 또는 비밀번호가 올바르지 않습니다.'
                });
            }
        });
    }

    /**
     * 사용자 로그아웃 처리
     */
    async logout(): Promise<void> {
        try {
            // TODO: 필요한 경우 서버에 로그아웃 요청

            // 토큰 갱신 타이머 취소
            if (this.tokenRefreshTimer) {
                clearTimeout(this.tokenRefreshTimer);
                this.tokenRefreshTimer = null;
            }

            // 세션 체크 타이머 취소
            if (this.sessionCheckTimer) {
                clearInterval(this.sessionCheckTimer);
                this.sessionCheckTimer = null;
            }

            // 상태 초기화
            this.updateState({
                isAuthenticated: false,
                user: null,
                accessToken: null,
                refreshToken: null,
                expiresAt: null,
                error: null,
                sessionTimeRemaining: 0
            });

            return Promise.resolve();
        } catch (error) {
            const authError = this.handleError(error);
            this.updateState({ error: authError.message });
            throw authError;
        }
    }

    /**
     * 토큰 갱신 처리
     * @param refreshToken 리프레시 토큰
     * @returns 갱신된 토큰 정보
     */
    async refreshToken(refreshToken: string): Promise<TokenInfo> {
        if (!refreshToken) {
            throw {
                code: 'invalid_token',
                message: '리프레시 토큰이 없습니다.'
            };
        }

        try {
            // TODO: 실제 API 호출 구현
            // 현재는 목업 데이터로 대체
            const response: RefreshTokenResponse = await this.mockRefreshToken({ refreshToken });

            this.updateState({
                accessToken: response.accessToken,
                refreshToken: response.refreshToken,
                expiresAt: response.expiresAt,
                sessionTimeRemaining: Math.floor((response.expiresAt.getTime() - Date.now()) / 1000)
            });

            // 토큰 갱신 타이머 재설정
            this.setupTokenRefreshTimer();

            return {
                accessToken: response.accessToken,
                refreshToken: response.refreshToken,
                expiresAt: response.expiresAt
            };
        } catch (error) {
            const authError = this.handleError(error);

            // 토큰 관련 오류면 로그아웃 처리
            if (
                authError.code === 'invalid_token' ||
                authError.code === 'session_expired'
            ) {
                this.logout().catch(console.error);
            }

            throw authError;
        }
    }

    /**
     * 목업 토큰 갱신 응답 생성 (실제 구현에서는 API 호출로 대체)
     * @param request 리프레시 토큰 요청
     * @returns 리프레시 토큰 응답
     */
    private async mockRefreshToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
        return new Promise((resolve, reject) => {
            if (request.refreshToken && request.refreshToken.startsWith('mock-refresh-token-')) {
                const now = new Date();
                // 1시간 후 만료
                const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);

                resolve({
                    accessToken: 'mock-access-token-' + Math.random().toString(36).substring(2),
                    refreshToken: 'mock-refresh-token-' + Math.random().toString(36).substring(2),
                    expiresAt
                });
            } else {
                reject({
                    code: 'invalid_token',
                    message: '유효하지 않은 리프레시 토큰입니다.'
                });
            }
        });
    }

    /**
     * 세션 만료까지 남은 시간 형식화
     * @returns 형식화된 시간 문자열 (예: "00:59:59")
     */
    getFormattedSessionTimeRemaining(): string {
        if (!this.state.sessionTimeRemaining) {
            return "00:00:00";
        }

        const hours = Math.floor(this.state.sessionTimeRemaining / 3600);
        const minutes = Math.floor((this.state.sessionTimeRemaining % 3600) / 60);
        const seconds = this.state.sessionTimeRemaining % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * 세션 만료까지 남은 시간 가져오기 (초)
     * @returns 남은 시간 (초)
     */
    getSessionTimeRemaining(): number {
        return this.state.sessionTimeRemaining || 0;
    }

    /**
     * 비밀번호 변경 처리
     * @param request 비밀번호 변경 요청
     */
    async changePassword(request: ChangePasswordRequest): Promise<void> {
        if (!this.state.isAuthenticated) {
            throw {
                code: 'session_expired',
                message: '로그인이 필요합니다.'
            };
        }

        this.updateState({ isLoading: true, error: null });

        try {
            // 비밀번호 확인 검증
            if (request.newPassword !== request.confirmPassword) {
                throw {
                    code: 'invalid_credentials',
                    message: '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.'
                };
            }

            // TODO: 실제 API 호출 구현
            // 현재는 목업 데이터로 대체
            await this.mockChangePassword(request);

            this.updateState({ isLoading: false });
        } catch (error) {
            const authError = this.handleError(error);
            this.updateState({ isLoading: false, error: authError.message });
            throw authError;
        }
    }

    /**
     * 목업 비밀번호 변경 (실제 구현에서는 API 호출로 대체)
     * @param request 비밀번호 변경 요청
     */
    private async mockChangePassword(request: ChangePasswordRequest): Promise<void> {
        return new Promise((resolve, reject) => {
            if (request.currentPassword === 'wrong-password') {
                reject({
                    code: 'invalid_credentials',
                    message: '현재 비밀번호가 올바르지 않습니다.'
                });
            } else {
                resolve();
            }
        });
    }

    /**
     * 비밀번호 재설정 요청 처리
     * @param request 비밀번호 재설정 요청
     */
    async resetPassword(request: ResetPasswordRequest): Promise<void> {
        this.updateState({ isLoading: true, error: null });

        try {
            // TODO: 실제 API 호출 구현
            // 현재는 목업 데이터로 대체
            await this.mockResetPassword(request);

            this.updateState({ isLoading: false });
        } catch (error) {
            const authError = this.handleError(error);
            this.updateState({ isLoading: false, error: authError.message });
            throw authError;
        }
    }

    /**
     * 목업 비밀번호 재설정 (실제 구현에서는 API 호출로 대체)
     * @param request 비밀번호 재설정 요청
     */
    private async mockResetPassword(request: ResetPasswordRequest): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!request.email) {
                reject({
                    code: 'invalid_credentials',
                    message: '이메일을 입력해주세요.'
                });
            } else {
                resolve();
            }
        });
    }

    /**
     * 회원가입 처리
     * @param request 회원가입 요청
     */
    async signup(request: SignupRequest): Promise<User> {
        this.updateState({ isLoading: true, error: null });

        try {
            // 비밀번호 확인 검증
            if (request.password !== request.confirmPassword) {
                throw {
                    code: 'invalid_credentials',
                    message: '비밀번호와 확인 비밀번호가 일치하지 않습니다.'
                };
            }

            // TODO: 실제 API 호출 구현
            // 현재는 목업 데이터로 대체
            const user = await this.mockSignup(request);

            this.updateState({ isLoading: false });

            return user;
        } catch (error) {
            const authError = this.handleError(error);
            this.updateState({ isLoading: false, error: authError.message });
            throw authError;
        }
    }

    /**
     * 목업 회원가입 (실제 구현에서는 API 호출로 대체)
     * @param request 회원가입 요청
     * @returns 생성된 사용자 정보
     */
    private async mockSignup(request: SignupRequest): Promise<User> {
        return new Promise((resolve, reject) => {
            if (!request.email || !request.password || !request.name) {
                reject({
                    code: 'invalid_credentials',
                    message: '모든 필드를 입력해주세요.'
                });
            } else if (request.email === 'existing@example.com') {
                reject({
                    code: 'invalid_credentials',
                    message: '이미 등록된 이메일입니다.'
                });
            } else {
                const now = new Date();
                // 기본 역할은 user로 설정하지만, request에 역할이 포함되어 있으면 해당 역할 사용
                const role = (request.role as UserRole) || 'user';

                resolve({
                    id: Math.random().toString(36).substring(2),
                    name: request.name,
                    email: request.email,
                    role,
                    createdAt: now,
                    updatedAt: now,
                    lastLoginAt: now
                });
            }
        });
    }

    /**
     * 액세스 토큰 가져오기
     * @returns 현재 액세스 토큰
     */
    getAccessToken(): string | null {
        return this.state.accessToken;
    }

    /**
     * 현재 사용자 정보 가져오기
     * @returns 현재 사용자 정보
     */
    getCurrentUser(): User | null {
        return this.state.user;
    }

    /**
     * 인증 상태 확인
     * @returns 인증되었는지 여부
     */
    isAuthenticated(): boolean {
        return this.state.isAuthenticated && !!this.state.accessToken;
    }

    /**
     * 사용자가 특정 역할을 가지고 있는지 확인
     * @param role 확인할 역할
     * @returns 역할 보유 여부
     */
    hasRole(role: UserRole): boolean {
        if (!this.state.user) {
            return false;
        }

        return hasRequiredRole(this.state.user.role, role);
    }

    /**
     * 사용자가 특정 역할 이상인지 확인
     * @param requiredRole 요구되는 최소 역할
     * @returns 권한 확인 결과
     */
    checkPermission(requiredRole: UserRole): PermissionCheckResult {
        if (!this.state.user) {
            return {
                hasPermission: false,
                requiredRole,
                userRole: undefined
            };
        }

        return createPermissionCheckResult(this.state.user.role, requiredRole);
    }

    /**
     * 오류 처리 및 변환
     * @param error 원본 오류
     * @returns 표준화된 인증 오류
     */
    private handleError(error: any): AuthError {
        if (error?.code && error.message) {
            return error as AuthError;
        }

        console.error('Authentication error:', error);

        return {
            code: 'unknown_error',
            message: '인증 중 오류가 발생했습니다.'
        };
    }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const authManager = new AuthManager();