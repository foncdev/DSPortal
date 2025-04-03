import { ApiResponse, PaginationRequest, PaginationResponse, User } from '../../types';
import { httpClient } from '../../api/client';
import { replacePathParams, userEndpoints } from '../../api/endpoints';

/**
 * 프로필 업데이트 요청 인터페이스
 */
export interface UpdateProfileRequest {
    name?: string;
    email?: string;
}

/**
 * 사용자 서비스
 */
export class UserService {
    /**
     * 사용자 목록 조회
     * @param request 페이지네이션 요청
     * @returns 사용자 목록
     */
    async getUsers(request: PaginationRequest): Promise<PaginationResponse<User>> {
        const params: Record<string, string | number | boolean | undefined> = {
            page: request.page,
            limit: request.limit,
            sortBy: request.sortBy,
            sortDirection: request.sortDirection
        };

        const response = await httpClient.get<ApiResponse<PaginationResponse<User>>>(
            userEndpoints.getAll.path,
            params
        );

        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.error?.message || '사용자 목록을 가져오는데 실패했습니다.');
        }

        return response.data.data;
    }

    /**
     * 사용자 상세 조회
     * @param id 사용자 ID
     * @returns 사용자 정보
     */
    async getUserById(id: string): Promise<User> {
        const path = replacePathParams(userEndpoints.getById.path, { id });
        const response = await httpClient.get<ApiResponse<User>>(path);

        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.error?.message || '사용자 정보를 가져오는데 실패했습니다.');
        }

        return response.data.data;
    }

    /**
     * 사용자 생성
     * @param userData 사용자 데이터
     * @returns 생성된 사용자
     */
    async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { password: string }): Promise<User> {
        const response = await httpClient.post<ApiResponse<User>>(
            userEndpoints.create.path,
            userData
        );

        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.error?.message || '사용자 생성에 실패했습니다.');
        }

        return response.data.data;
    }

    /**
     * 사용자 정보 수정
     * @param id 사용자 ID
     * @param userData 수정할 사용자 데이터
     * @returns 수정된 사용자
     */
    async updateUser(id: string, userData: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> {
        const path = replacePathParams(userEndpoints.update.path, { id });
        const response = await httpClient.put<ApiResponse<User>>(
            path,
            userData
        );

        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.error?.message || '사용자 수정에 실패했습니다.');
        }

        return response.data.data;
    }

    /**
     * 사용자 삭제
     * @param id 사용자 ID
     */
    async deleteUser(id: string): Promise<void> {
        const path = replacePathParams(userEndpoints.delete.path, { id });
        const response = await httpClient.delete<ApiResponse<void>>(path);

        if (!response.data.success) {
            throw new Error(response.data.error?.message || '사용자 삭제에 실패했습니다.');
        }
    }

    /**
     * 프로필 업데이트
     * @param data 프로필 데이터
     * @returns 업데이트된 사용자 정보
     */
    async updateProfile(data: UpdateProfileRequest): Promise<User> {
        const response = await httpClient.put<ApiResponse<User>>(
            userEndpoints.updateProfile.path,
            data
        );

        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.error?.message || '프로필 업데이트에 실패했습니다.');
        }

        return response.data.data;
    }

    /**
     * 프로필 이미지 업로드
     * @param file 이미지 파일
     * @returns 업로드된 이미지 URL을 포함한 사용자 정보
     */
    async uploadAvatar(file: File): Promise<User> {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await httpClient.post<ApiResponse<User>>(
            userEndpoints.uploadAvatar.path,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );

        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.error?.message || '프로필 이미지 업로드에 실패했습니다.');
        }

        return response.data.data;
    }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const userService = new UserService();