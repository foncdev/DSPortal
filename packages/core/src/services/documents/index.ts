import { ApiResponse, Document, PaginationRequest, PaginationResponse } from '../../types';
import { httpClient } from '../../api/client';
import { documentEndpoints, replacePathParams } from '../../api/endpoints';

/**
 * 문서 서비스
 */
export class DocumentService {
    /**
     * 문서 목록 조회
     * @param request 페이지네이션 요청
     * @returns 문서 목록
     */
    async getDocuments(request: PaginationRequest): Promise<PaginationResponse<Document>> {
        const params: Record<string, string | number | boolean | undefined> = {
            page: request.page,
            limit: request.limit,
            sortBy: request.sortBy,
            sortDirection: request.sortDirection
        };

        const response = await httpClient.get<ApiResponse<PaginationResponse<Document>>>(
            documentEndpoints.getAll.path,
            params
        );

        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.error?.message || '문서 목록을 가져오는데 실패했습니다.');
        }

        return response.data.data;
    }

    /**
     * 문서 상세 조회
     * @param id 문서 ID
     * @returns 문서 정보
     */
    async getDocumentById(id: string): Promise<Document> {
        const path = replacePathParams(documentEndpoints.getById.path, { id });
        const response = await httpClient.get<ApiResponse<Document>>(path);

        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.error?.message || '문서를 가져오는데 실패했습니다.');
        }

        return response.data.data;
    }

    /**
     * 문서 생성
     * @param documentData 문서 데이터
     * @returns 생성된 문서
     */
    async createDocument(documentData: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document> {
        const response = await httpClient.post<ApiResponse<Document>>(
            documentEndpoints.create.path,
            documentData
        );

        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.error?.message || '문서 생성에 실패했습니다.');
        }

        return response.data.data;
    }

    /**
     * 문서 수정
     * @param id 문서 ID
     * @param documentData 수정할 문서 데이터
     * @returns 수정된 문서
     */
    async updateDocument(id: string, documentData: Partial<Omit<Document, 'id' | 'createdAt' | 'createdBy'>>): Promise<Document> {
        const path = replacePathParams(documentEndpoints.update.path, { id });
        const response = await httpClient.put<ApiResponse<Document>>(
            path,
            documentData
        );

        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.error?.message || '문서 수정에 실패했습니다.');
        }

        return response.data.data;
    }

    /**
     * 문서 삭제
     * @param id 문서 ID
     */
    async deleteDocument(id: string): Promise<void> {
        const path = replacePathParams(documentEndpoints.delete.path, { id });
        const response = await httpClient.delete<ApiResponse<void>>(path);

        if (!response.data.success) {
            throw new Error(response.data.error?.message || '문서 삭제에 실패했습니다.');
        }
    }

    /**
     * 문서 검색
     * @param query 검색어
     * @param request 페이지네이션 요청
     * @returns 검색 결과
     */
    async searchDocuments(query: string, request: PaginationRequest): Promise<PaginationResponse<Document>> {
        const params: Record<string, string | number | boolean | undefined> = {
            query,
            page: request.page,
            limit: request.limit,
            sortBy: request.sortBy,
            sortDirection: request.sortDirection
        };

        const response = await httpClient.get<ApiResponse<PaginationResponse<Document>>>(
            documentEndpoints.search.path,
            params
        );

        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.error?.message || '문서 검색에 실패했습니다.');
        }

        return response.data.data;
    }

    /**
     * 태그로 문서 조회
     * @param tag 태그
     * @param request 페이지네이션 요청
     * @returns 태그가 포함된 문서 목록
     */
    async getDocumentsByTag(tag: string, request: PaginationRequest): Promise<PaginationResponse<Document>> {
        const path = replacePathParams(documentEndpoints.getByTag.path, { tag });

        const params: Record<string, string | number | boolean | undefined> = {
            page: request.page,
            limit: request.limit,
            sortBy: request.sortBy,
            sortDirection: request.sortDirection
        };

        const response = await httpClient.get<ApiResponse<PaginationResponse<Document>>>(
            path,
            params
        );

        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.error?.message || '태그로 문서를 가져오는데 실패했습니다.');
        }

        return response.data.data;
    }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const documentService = new DocumentService();