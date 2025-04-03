/**
 * API 요청 메서드 타입
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD';

/**
 * API 요청 헤더 타입
 */
export interface HttpHeaders {
    [key: string]: string;
}

/**
 * API 요청 옵션 인터페이스
 */
export interface HttpRequestOptions {
    method: HttpMethod;
    url: string;
    headers?: HttpHeaders;
    params?: Record<string, string | number | boolean | null | undefined>;
    data?: any;
    timeout?: number;
    withCredentials?: boolean;
}

/**
 * API 응답 인터페이스
 */
export interface HttpResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: HttpHeaders;
    config?: HttpRequestOptions; // 응답에 요청 설정 추가
}

/**
 * API 클라이언트 인터페이스
 */
export interface HttpClient {
    /**
     * HTTP 요청 수행
     * @param options 요청 옵션
     */
    request<T = any>(options: HttpRequestOptions): Promise<HttpResponse<T>>;

    /**
     * GET 요청 수행
     * @param url 요청 URL
     * @param params 쿼리 파라미터
     * @param options 추가 요청 옵션
     */
    get<T = any>(
        url: string,
        params?: Record<string, string | number | boolean | null | undefined>,
        options?: Omit<HttpRequestOptions, 'method' | 'url' | 'params'>
    ): Promise<HttpResponse<T>>;

    /**
     * POST 요청 수행
     * @param url 요청 URL
     * @param data 요청 바디 데이터
     * @param options 추가 요청 옵션
     */
    post<T = any>(
        url: string,
        data?: any,
        options?: Omit<HttpRequestOptions, 'method' | 'url' | 'data'>
    ): Promise<HttpResponse<T>>;

    /**
     * PUT 요청 수행
     * @param url 요청 URL
     * @param data 요청 바디 데이터
     * @param options 추가 요청 옵션
     */
    put<T = any>(
        url: string,
        data?: any,
        options?: Omit<HttpRequestOptions, 'method' | 'url' | 'data'>
    ): Promise<HttpResponse<T>>;

    /**
     * DELETE 요청 수행
     * @param url 요청 URL
     * @param options 추가 요청 옵션
     */
    delete<T = any>(
        url: string,
        options?: Omit<HttpRequestOptions, 'method' | 'url'>
    ): Promise<HttpResponse<T>>;

    /**
     * PATCH 요청 수행
     * @param url 요청 URL
     * @param data 요청 바디 데이터
     * @param options 추가 요청 옵션
     */
    patch<T = any>(
        url: string,
        data?: any,
        options?: Omit<HttpRequestOptions, 'method' | 'url' | 'data'>
    ): Promise<HttpResponse<T>>;
}

/**
 * API 클라이언트 설정 옵션 인터페이스
 */
export interface HttpClientOptions {
    baseURL?: string;
    timeout?: number;
    headers?: HttpHeaders;
    withCredentials?: boolean;
}

/**
 * 요청 인터셉터 타입
 */
export type RequestInterceptor = (
    request: HttpRequestOptions
) => HttpRequestOptions | Promise<HttpRequestOptions>;

/**
 * 응답 인터셉터 타입
 */
export type ResponseInterceptor = (
    response: HttpResponse
) => HttpResponse | Promise<HttpResponse>;

/**
 * 에러 인터셉터 타입
 */
export type ErrorInterceptor = (
    error: any
) => any | Promise<any>;

/**
 * API 에러 인터페이스
 */
export interface ApiError extends Error {
    status?: number;
    statusText?: string;
    data?: any;
    isApiError: true;
    config?: HttpRequestOptions;
}

/**
 * API 엔드포인트 타입
 */
export interface ApiEndpoint {
    path: string;
    method: HttpMethod;
}

/**
 * API 엔드포인트 그룹 타입
 */
export interface ApiEndpointGroup {
    [key: string]: ApiEndpoint;
}

/**
 * API 서비스 구성 타입
 */
export interface ApiServiceConfig {
    baseURL: string;
    endpoints: {
        [key: string]: ApiEndpointGroup;
    };
    timeout?: number;
    withCredentials?: boolean;
}