import { User } from '../types';

/**
 * 로그인 요청 인터페이스
 */
export interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
}

/**
 * 로그인 응답 인터페이스
 */
export interface LoginResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
}

/**
 * 토큰 정보 인터페이스
 */
export interface TokenInfo {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
}

/**
 * 토큰 갱신 요청 인터페이스
 */
export interface RefreshTokenRequest {
    refreshToken: string;
}

/**
 * 토큰 갱신 응답 인터페이스
 */
export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
}

/**
 * 비밀번호 변경 요청 인터페이스
 */
export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

/**
 * 비밀번호 재설정 요청 인터페이스
 */
export interface ResetPasswordRequest {
    email: string;
}

/**
 * 회원가입 요청 인터페이스
 */
export interface SignupRequest {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role?: string; // 관리자가 사용자 생성 시 역할 지정 가능
}

/**
 * 인증 세션 상태 인터페이스
 */
export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    expiresAt: Date | null;
    isLoading: boolean;
    error: string | null;
    sessionTimeRemaining?: number; // 세션 만료까지 남은 시간(초)
}

/**
 * 인증 오류 코드 타입
 */
export type AuthErrorCode =
    | 'invalid_credentials'
    | 'account_locked'
    | 'email_not_verified'
    | 'session_expired'
    | 'invalid_token'
    | 'network_error'
    | 'insufficient_permissions'
    | 'unknown_error';

/**
 * 인증 오류 인터페이스
 */
export interface AuthError {
    code: AuthErrorCode;
    message: string;
}

/**
 * 권한 확인 결과 인터페이스
 */
export interface PermissionCheckResult {
    hasPermission: boolean;
    requiredRole?: string;
    userRole?: string;
}