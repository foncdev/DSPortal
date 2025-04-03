// packages/core/src/api/client.ts
import {
    ApiError,
    ErrorInterceptor,
    HttpClient,
    HttpClientOptions,
    HttpHeaders,
    HttpRequestOptions,
    HttpResponse,
    RequestInterceptor,
    ResponseInterceptor,
} from './types';

/**
 * 기본 API 클라이언트 구현
 */
export class HttpClientImpl implements HttpClient {
    private readonly baseURL: string;
    private readonly defaultTimeout: number;
    private readonly defaultHeaders: HttpHeaders;
    private readonly withCredentials: boolean;

    private requestInterceptors: RequestInterceptor[] = [];
    private responseInterceptors: ResponseInterceptor[] = [];
    private errorInterceptors: ErrorInterceptor[] = [];

    /**
     * HttpClient 생성자
     * @param options 클라이언트 옵션
     */
    constructor(options: HttpClientOptions = {}) {
        this.baseURL = options.baseURL || '';
        this.defaultTimeout = options.timeout || 30000; // 기본 30초 타임아웃
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(options.headers || {})
        };
        this.withCredentials = !!options.withCredentials;
    }

    /**
     * 요청 인터셉터 추가
     * @param interceptor 요청 인터셉터 함수
     * @returns 인터셉터 제거 함수
     */
    addRequestInterceptor(interceptor: RequestInterceptor): () => void {
        this.requestInterceptors.push(interceptor);
        return () => {
            this.requestInterceptors = this.requestInterceptors.filter(i => i !== interceptor);
        };
    }

    /**
     * 응답 인터셉터 추가
     * @param interceptor 응답 인터셉터 함수
     * @returns 인터셉터 제거 함수
     */
    addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
        this.responseInterceptors.push(interceptor);
        return () => {
            this.responseInterceptors = this.responseInterceptors.filter(i => i !== interceptor);
        };
    }

    /**
     * 에러 인터셉터 추가
     * @param interceptor 에러 인터셉터 함수
     * @returns 인터셉터 제거 함수
     */
    addErrorInterceptor(interceptor: ErrorInterceptor): () => void {
        this.errorInterceptors.push(interceptor);
        return () => {
            this.errorInterceptors = this.errorInterceptors.filter(i => i !== interceptor);
        };
    }

    /**
     * 요청 URL 구성
     * @param url 요청 경로
     * @param params 쿼리 파라미터
     * @returns 완성된 URL
     */
    private buildUrl(url: string, params?: Record<string, string | number | boolean | null | undefined>): string {
        // 기본 URL과 요청 경로 결합
        const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;

        // 쿼리 파라미터가 없으면 URL 그대로 반환
        if (!params) {
            return fullUrl;
        }

        // URL 객체 생성
        const urlObj = new URL(fullUrl);

        // 파라미터 추가
        Object.keys(params).forEach(key => {
            const value = params[key];
            if (value !== null && value !== undefined) {
                urlObj.searchParams.append(key, String(value));
            }
        });

        return urlObj.toString();
    }

    /**
     * HTTP 요청 수행
     * @param options 요청 옵션
     * @returns HTTP 응답
     */
    async request<T = any>(options: HttpRequestOptions): Promise<HttpResponse<T>> {
        // 기본 옵션과 병합
        const requestOptions: HttpRequestOptions = {
            ...options,
            timeout: options.timeout || this.defaultTimeout,
            headers: {
                ...this.defaultHeaders,
                ...options.headers
            },
            withCredentials: options.withCredentials !== undefined ? options.withCredentials : this.withCredentials
        };

        // 요청 인터셉터 적용
        let processedOptions = { ...requestOptions };
        for (const interceptor of this.requestInterceptors) {
            processedOptions = await interceptor(processedOptions);
        }

        // URL 구성
        const url = this.buildUrl(processedOptions.url, processedOptions.params);

        try {
            // Fetch API 옵션 구성
            const fetchOptions: RequestInit = {
                method: processedOptions.method,
                headers: processedOptions.headers as HeadersInit,
                credentials: processedOptions.withCredentials ? 'include' : 'same-origin'
            };

            // GET/HEAD 메서드가 아닌 경우 body 추가
            if (processedOptions.method !== 'GET' &&
                processedOptions.method !== 'HEAD' &&
                processedOptions.data !== undefined) {
                fetchOptions.body = typeof processedOptions.data === 'string'
                    ? processedOptions.data
                    : JSON.stringify(processedOptions.data);
            }

            // AbortController 설정 (타임아웃 처리)
            const controller = new AbortController();
            fetchOptions.signal = controller.signal;

            const timeoutId = setTimeout(() => {
                controller.abort();
            }, processedOptions.timeout);

            // Fetch 요청 실행
            const response = await fetch(url, fetchOptions);
            clearTimeout(timeoutId);

            // 응답 데이터 파싱
            let data: T;
            const contentType = response.headers.get('Content-Type');

            if (contentType?.includes('application/json')) {
                data = await response.json();
            } else if (contentType?.includes('text/')) {
                data = await response.text() as unknown as T;
            } else {
                data = await response.blob() as unknown as T;
            }

            // 응답 객체 구성
            const responseObj: HttpResponse<T> = {
                data,
                status: response.status,
                statusText: response.statusText,
                headers: this.parseHeaders(response.headers)
            };

            // 에러 응답 처리
            if (!response.ok) {
                const error = this.createApiError({
                    message: `Request failed with status ${response.status}`,
                    status: response.status,
                    statusText: response.statusText,
                    data
                });

                // 에러 인터셉터 적용
                return await this.processErrorInterceptors(error);
            }

            // 응답 인터셉터 적용
            let processedResponse = responseObj;
            for (const interceptor of this.responseInterceptors) {
                processedResponse = await interceptor(processedResponse) as HttpResponse<T>;
            }

            return processedResponse;
        } catch (error) {
            const apiError = error instanceof Error
                ? this.createApiError({
                    message: error.message,
                    cause: error
                })
                : this.createApiError({
                    message: 'Network error occurred'
                });

            // 에러 인터셉터 적용
            return await this.processErrorInterceptors(apiError);
        }
    }

    /**
     * 에러 인터셉터 적용
     * @param error API 에러
     * @returns 처리된 에러 또는 응답
     */
    private async processErrorInterceptors<T>(error: ApiError): Promise<HttpResponse<T>> {
        let processedError = error;

        // 각 에러 인터셉터 적용
        for (const interceptor of this.errorInterceptors) {
            try {
                const result = await interceptor(processedError);

                // 인터셉터가 응답을 반환하면 성공 응답으로 전환
                if (result && typeof result === 'object' && 'data' in result && 'status' in result) {
                    return result as HttpResponse<T>;
                }

                // 인터셉터가 새 에러를 반환하면 교체
                processedError = result || processedError;
            } catch (innerError) {
                processedError = innerError instanceof Error
                    ? this.createApiError({
                        message: innerError.message,
                        cause: innerError
                    })
                    : processedError;
            }
        }

        throw processedError;
    }

    /**
     * API 에러 객체 생성
     * @param options 에러 옵션
     * @returns API 에러 객체
     */
    private createApiError(options: {
        message: string;
        status?: number;
        statusText?: string;
        data?: any;
        cause?: Error;
    }): ApiError {
        const error = new Error(options.message) as ApiError;
        error.status = options.status;
        error.statusText = options.statusText;
        error.data = options.data;
        error.isApiError = true;

        if (options.cause) {
            error.cause = options.cause;
        }

        return error;
    }

    /**
     * 응답 헤더 파싱
     * @param headers 응답 헤더
     * @returns 파싱된 헤더 객체
     */
    private parseHeaders(headers: Headers): HttpHeaders {
        const result: HttpHeaders = {};

        headers.forEach((value, key) => {
            result[key] = value;
        });

        return result;
    }

    /**
     * GET 요청 수행
     * @param url 요청 URL
     * @param params 쿼리 파라미터
     * @param options 추가 요청 옵션
     * @returns HTTP 응답
     */
    get<T = any>(
        url: string,
        params?: Record<string, string | number | boolean | null | undefined>,
        options?: Omit<HttpRequestOptions, 'method' | 'url' | 'params'>
    ): Promise<HttpResponse<T>> {
        return this.request<T>({
            method: 'GET',
            url,
            params,
            ...options
        });
    }

    /**
     * POST 요청 수행
     * @param url 요청 URL
     * @param data 요청 바디 데이터
     * @param options 추가 요청 옵션
     * @returns HTTP 응답
     */
    post<T = any>(
        url: string,
        data?: any,
        options?: Omit<HttpRequestOptions, 'method' | 'url' | 'data'>
    ): Promise<HttpResponse<T>> {
        return this.request<T>({
            method: 'POST',
            url,
            data,
            ...options
        });
    }

    /**
     * PUT 요청 수행
     * @param url 요청 URL
     * @param data 요청 바디 데이터
     * @param options 추가 요청 옵션
     * @returns HTTP 응답
     */
    put<T = any>(
        url: string,
        data?: any,
        options?: Omit<HttpRequestOptions, 'method' | 'url' | 'data'>
    ): Promise<HttpResponse<T>> {
        return this.request<T>({
            method: 'PUT',
            url,
            data,
            ...options
        });
    }

    /**
     * DELETE 요청 수행
     * @param url 요청 URL
     * @param options 추가 요청 옵션
     * @returns HTTP 응답
     */
    delete<T = any>(
        url: string,
        options?: Omit<HttpRequestOptions, 'method' | 'url'>
    ): Promise<HttpResponse<T>> {
        return this.request<T>({
            method: 'DELETE',
            url,
            ...options
        });
    }

    /**
     * PATCH 요청 수행
     * @param url 요청 URL
     * @param data 요청 바디 데이터
     * @param options 추가 요청 옵션
     * @returns HTTP 응답
     */
    patch<T = any>(
        url: string,
        data?: any,
        options?: Omit<HttpRequestOptions, 'method' | 'url' | 'data'>
    ): Promise<HttpResponse<T>> {
        return this.request<T>({
            method: 'PATCH',
            url,
            data,
            ...options
        });
    }
}

/**
 * API 클라이언트 생성 함수
 * @param options 클라이언트 옵션
 * @returns HttpClient 인스턴스
 */
export function createHttpClient(options?: HttpClientOptions): HttpClient {
    return new HttpClientImpl(options);
}

// 기본 HTTP 클라이언트 인스턴스
export const httpClient = createHttpClient();