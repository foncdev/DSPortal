import { ApiEndpointGroup, ApiServiceConfig } from './types';

/**
 * 인증 관련 API 엔드포인트
 */
export const authEndpoints: ApiEndpointGroup = {
    login: {
        path: '/auth/login',
        method: 'POST'
    },
    logout: {
        path: '/auth/logout',
        method: 'POST'
    },
    refreshToken: {
        path: '/auth/refresh',
        method: 'POST'
    },
    signup: {
        path: '/auth/signup',
        method: 'POST'
    },
    resetPassword: {
        path: '/auth/reset-password',
        method: 'POST'
    },
    changePassword: {
        path: '/auth/change-password',
        method: 'POST'
    },
    verifyEmail: {
        path: '/auth/verify-email',
        method: 'POST'
    },
    me: {
        path: '/auth/me',
        method: 'GET'
    }
};

/**
 * 사용자 관련 API 엔드포인트
 */
export const userEndpoints: ApiEndpointGroup = {
    getAll: {
        path: '/users',
        method: 'GET'
    },
    getById: {
        path: '/users/:id',
        method: 'GET'
    },
    create: {
        path: '/users',
        method: 'POST'
    },
    update: {
        path: '/users/:id',
        method: 'PUT'
    },
    delete: {
        path: '/users/:id',
        method: 'DELETE'
    },
    updateProfile: {
        path: '/users/profile',
        method: 'PUT'
    },
    uploadAvatar: {
        path: '/users/avatar',
        method: 'POST'
    }
};

/**
 * 문서 관련 API 엔드포인트
 */
export const documentEndpoints: ApiEndpointGroup = {
    getAll: {
        path: '/documents',
        method: 'GET'
    },
    getById: {
        path: '/documents/:id',
        method: 'GET'
    },
    create: {
        path: '/documents',
        method: 'POST'
    },
    update: {
        path: '/documents/:id',
        method: 'PUT'
    },
    delete: {
        path: '/documents/:id',
        method: 'DELETE'
    },
    search: {
        path: '/documents/search',
        method: 'GET'
    },
    getByTag: {
        path: '/documents/tags/:tag',
        method: 'GET'
    }
};

/**
 * 프로젝트 관련 API 엔드포인트
 */
export const projectEndpoints: ApiEndpointGroup = {
    getAll: {
        path: '/projects',
        method: 'GET'
    },
    getById: {
        path: '/projects/:id',
        method: 'GET'
    },
    create: {
        path: '/projects',
        method: 'POST'
    },
    update: {
        path: '/projects/:id',
        method: 'PUT'
    },
    delete: {
        path: '/projects/:id',
        method: 'DELETE'
    },
    addMember: {
        path: '/projects/:id/members',
        method: 'POST'
    },
    removeMember: {
        path: '/projects/:id/members/:userId',
        method: 'DELETE'
    },
    getDocuments: {
        path: '/projects/:id/documents',
        method: 'GET'
    }
};

/**
 * API 서비스 구성
 */
export const apiConfig: ApiServiceConfig = {
    baseURL: process.env.API_URL || 'http://localhost:8080/api',
    endpoints: {
        auth: authEndpoints,
        users: userEndpoints,
        documents: documentEndpoints,
        projects: projectEndpoints
    },
    timeout: 30000, // 30초
    withCredentials: true
};

/**
 * URL 경로 파라미터 대체 함수
 * @param path URL 경로 템플릿
 * @param params 파라미터 객체
 * @returns 완성된 URL 경로
 */
export function replacePathParams(path: string, params: Record<string, string | number>): string {
    let result = path;

    Object.keys(params).forEach(key => {
        result = result.replace(`:${key}`, String(params[key]));
    });

    return result;
}