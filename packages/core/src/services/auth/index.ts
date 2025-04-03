import {
    ChangePasswordRequest,
    LoginRequest,
    LoginResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    ResetPasswordRequest,
    SignupRequest
} from '../../auth/types';
import { ApiResponse , User } from '../../types';
import { httpClient } from '../../api/client';
import { authEndpoints } from '../../api/endpoints';

/**
 * 인증 서비스
 */
export class AuthService {
    /**
     * 로그인 요청
     * @param request 로그인 요청 데이터
     * @returns 로그인 응답
     */
    async login(request: LoginRequest): Promise<LoginResponse> {
        const response = await httpClient.post<ApiResponse<LoginResponse>>(
            authEndpoints.login.path,
            request
        );

        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.error?.message || '로그인에 실패했습니다.');
        }

        return response.data.data;
    }

    /**
     * 로그아웃 요청
     */
    async logout(): Promise<void> {
        await httpClient.post(authEndpoints.logout.path);
    }

    /**
     * 토큰 갱신
     * @param request 토큰 갱신 요청
     * @returns 갱신된 토큰 정보
     */
    async refreshToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
        const response = await httpClient.post<ApiResponse<RefreshTokenResponse>>(
            authEndpoints.refreshToken.path,
            request
        );

        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.error?.message || '토큰 갱신에 실패했습니다.');
        }

        return response.data.data;
    }

    /**
     * 회원가입
     * @param request 회원가입 요청
     * @returns 생성된 사용자 정보
     */
    async signup(request: SignupRequest): Promise<User> {
        const response = await httpClient.post<ApiResponse<User>>(
            authEndpoints.signup.path,
            request
        );

        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.error?.message || '회원가입에 실패했습니다.');
        }

        return response.data.data;
    }

    /**
     * 비밀번호 재설정 요청
     * @param request 비밀번호 재설정 요청
     */
    async resetPassword(request: ResetPasswordRequest): Promise<void> {
        const response = await httpClient.post<ApiResponse<void>>(
            authEndpoints.resetPassword.path,
            request
        );

        if (!response.data.success) {
            throw new Error(response.data.error?.message || '비밀번호 재설정 요청에 실패했습니다.');
        }
    }

    /**
     * 비밀번호 변경
     * @param request 비밀번호 변경 요청
     */
    async changePassword(request: ChangePasswordRequest): Promise<void> {
        const response = await httpClient.post<ApiResponse<void>>(
            authEndpoints.changePassword.path,
            request
        );

        if (!response.data.success) {
            throw new Error(response.data.error?.message || '비밀번호 변경에 실패했습니다.');
        }
    }

    /**
     * 이메일 인증
     * @param token 인증 토큰
     */
    async verifyEmail(token: string): Promise<void> {
        const response = await httpClient.post<ApiResponse<void>>(
            authEndpoints.verifyEmail.path,
            { token }
        );

        if (!response.data.success) {
            throw new Error(response.data.error?.message || '이메일 인증에 실패했습니다.');
        }
    }

    /**
     * 현재 사용자 정보 조회
     * @returns 현재 사용자 정보
     */
    async getCurrentUser(): Promise<User> {
        const response = await httpClient.get<ApiResponse<User>>(
            authEndpoints.me.path
        );

        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.error?.message || '사용자 정보를 가져오는데 실패했습니다.');
        }

        return response.data.data;
    }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const authService = new AuthService();