// packages/core/src/api/interceptors.ts
import { RequestInterceptor, ResponseInterceptor, ErrorInterceptor, HttpRequestOptions, HttpResponse } from './types';
import { authManager } from '../auth/auth';
import { i18nManager } from '../i18n/i18n';

/**
 * 인증 토큰 추가 인터셉터
 * @returns 요청 인터셉터
 */
export const authTokenInterceptor: RequestInterceptor = (request: HttpRequestOptions): HttpRequestOptions => {
    const accessToken = authManager.getAccessToken();

    if (accessToken) {
        return {
            ...request,
            headers: {
                ...request.headers,
                'Authorization': `Bearer ${accessToken}`
            }
        };
    }

    return request;
};

/**
 * 만료된 토큰 갱신 인터셉터
 * @returns 에러 인터셉터
 */
export const refreshTokenInterceptor: ErrorInterceptor = async (error: any) => {
    // 401 에러가 아니거나 리프레시 토큰이 없는 경우 처리 불가
    if (
        !error.isApiError ||
        error.status !== 401 ||
        !authManager.getCurrentUser() ||
        error.config?.url?.includes('/auth/refresh')
    ) {
        throw error;
    }

    try {
        // 토큰 갱신 요청
        const refreshToken = localStorage.getItem('ds_refresh_token');

        if (!refreshToken) {
            throw error;
        }

        // 토큰 갱신
        await authManager.refreshToken(refreshToken);

        // 원래 요청 재시도
        if (error.config) {
            // 갱신된 토큰을 헤더에 추가
            const accessToken = authManager.getAccessToken();

            if (accessToken) {
                const retryRequest: HttpRequestOptions = {
                    ...error.config,
                    headers: {
                        ...error.config.headers,
                        'Authorization': `Bearer ${accessToken}`
                    }
                };

                console.log('retryRequest', retryRequest);

                // 요청 재시도 (비동기 처리를 위해 전역 httpClient 사용 필요)
                // 이 파일에서는 순환 참조 방지를 위해 httpClient를 직접 임포트하지 않음
                // 실제 사용 시 httpClient 참조를 외부에서 주입해야 함
                throw new Error('Request retry needs to be implemented by the consumer');
            }
        }

        throw error;
    } catch (retryError) {
        // 토큰 갱신 실패 시 로그아웃 처리
        if (retryError !== error) {
            await authManager.logout();
        }

        throw error;
    }
};

/**
 * 언어 헤더 추가 인터셉터
 * @returns 요청 인터셉터
 */
export const languageInterceptor: RequestInterceptor = (request: HttpRequestOptions): HttpRequestOptions => {
    const currentLanguage = i18nManager.getLanguage();

    return {
        ...request,
        headers: {
            ...request.headers,
            'Accept-Language': currentLanguage
        }
    };
};

/**
 * 응답 로깅 인터셉터
 * @returns 응답 인터셉터
 */
export const loggingInterceptor: ResponseInterceptor = (response: HttpResponse): HttpResponse => {
    // 개발 환경에서만 로깅
    if (process.env.NODE_ENV !== 'production') {
        console.log(`API Response [${response.status}]`);
        if (response.config) {
            console.log(`Method: ${response.config.method}, URL: ${response.config.url}`);
        }
    }

    return response;
};

/**
 * 에러 로깅 인터셉터
 * @returns 에러 인터셉터
 */
export const errorLoggingInterceptor: ErrorInterceptor = (error: any) => {
    // 개발 환경에서만 로깅
    if (process.env.NODE_ENV !== 'production') {
        console.error('API Error:', error);
    }

    throw error;
};

/**
 * API 응답 표준화 인터셉터
 * @returns 응답 인터셉터
 */
export const standardizeResponseInterceptor: ResponseInterceptor = (response: HttpResponse): HttpResponse => {
    // 데이터 구조 표준화
    if (response.data && typeof response.data === 'object' && !('success' in response.data)) {
        response.data = {
            success: true,
            data: response.data
        };
    }

    return response;
};

/**
 * API 에러 표준화 인터셉터
 * @returns 에러 인터셉터
 */
export const standardizeErrorInterceptor: ErrorInterceptor = (error: any) => {
    if (!error.isApiError) {
        return error;
    }

    // API 에러 응답 구조 표준화
    if (error.data && typeof error.data === 'object' && !('success' in error.data)) {
        error.data = {
            success: false,
            error: {
                code: error.data.code || `ERR_${error.status || 'UNKNOWN'}`,
                message: error.data.message || error.message || '알 수 없는 오류가 발생했습니다.'
            }
        };
    }

    return error;
};