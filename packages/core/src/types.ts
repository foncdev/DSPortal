// packages/core/src/types.ts

/**
 * 사용자 정보 인터페이스
 */
export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'editor' | 'viewer';
    createdAt: Date;
    updatedAt: Date;
}

/**
 * 문서 정보 인터페이스
 */
export interface Document {
    id: string;
    title: string;
    content: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    status?: 'draft' | 'published' | 'archived';
    tags?: string[];
}

/**
 * 프로젝트 정보 인터페이스
 */
export interface Project {
    id: string;
    name: string;
    description: string;
    ownerId: string;
    members: string[];
    createdAt: Date;
    updatedAt: Date;
}

/**
 * 인증 응답 인터페이스
 */
export interface AuthResponse {
    user: User;
    token: string;
    expiresAt: Date;
}

/**
 * API 응답 인터페이스
 */
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
}

/**
 * 페이지네이션 요청 인터페이스
 */
export interface PaginationRequest {
    page: number;
    limit: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
}

/**
 * 페이지네이션 응답 인터페이스
 */
export interface PaginationResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}