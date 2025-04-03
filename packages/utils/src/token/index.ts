/**
 * 토큰 스토리지 키
 */
export const TOKEN_STORAGE_KEYS = {
    ACCESS_TOKEN: 'ds_access_token',
    REFRESH_TOKEN: 'ds_refresh_token',
    EXPIRES_AT: 'ds_token_expires_at',
    USER: 'ds_user'
};

/**
 * 토큰 정보 인터페이스
 */
export interface TokenInfo {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
}

/**
 * 로컬 스토리지에 토큰 저장
 * @param tokenInfo 토큰 정보
 */
export function saveToken(tokenInfo: TokenInfo): void {
    localStorage.setItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN, tokenInfo.accessToken);
    localStorage.setItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN, tokenInfo.refreshToken);
    localStorage.setItem(TOKEN_STORAGE_KEYS.EXPIRES_AT, tokenInfo.expiresAt.toISOString());
}

/**
 * 로컬 스토리지에서 토큰 불러오기
 * @returns 토큰 정보 또는 null
 */
export function loadToken(): TokenInfo | null {
    const accessToken = localStorage.getItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
    const expiresAtStr = localStorage.getItem(TOKEN_STORAGE_KEYS.EXPIRES_AT);

    if (!accessToken || !refreshToken || !expiresAtStr) {
        return null;
    }

    try {
        return {
            accessToken,
            refreshToken,
            expiresAt: new Date(expiresAtStr)
        };
    } catch (error) {
        console.error('Failed to parse token expiry date:', error);
        return null;
    }
}

/**
 * 로컬 스토리지에서 토큰 삭제
 */
export function clearToken(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.EXPIRES_AT);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.USER);
}

/**
 * 토큰 만료 여부 확인
 * @param expiresAt 만료 시간
 * @param buffer 만료 전 버퍼 시간(초), 기본값: 60초
 * @returns 만료 여부
 */
export function isTokenExpired(expiresAt: Date, buffer = 60): boolean {
    const now = new Date();
    // 현재 시간 + 버퍼(초)가 만료 시간보다 크면 토큰이 만료됨
    return now.getTime() + buffer * 1000 >= expiresAt.getTime();
}

/**
 * 액세스 토큰에서 페이로드 추출
 * @param accessToken JWT 액세스 토큰
 * @returns 디코딩된 페이로드 또는 null
 */
export function parseAccessToken<T = any>(accessToken: string): T | null {
    if (!accessToken) {
        return null;
    }

    try {
        // JWT는 header.payload.signature 형식
        const parts = accessToken.split('.');

        if (parts.length !== 3) {
            return null;
        }

        // Base64Url 디코딩 (브라우저에서 atob 사용)
        const base64Payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            Array.from(atob(base64Payload))
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Failed to parse access token:', error);
        return null;
    }
}