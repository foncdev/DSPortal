// packages/core/src/user.test.ts
import { describe, it, expect, vi } from 'vitest';
import {
    getUserInfo,
    updateUserInfo,
    authenticateUser,
    createUser,
    validateUserSession,
    logoutUser
} from './user';
import { User } from './types';

describe('사용자 관리 기능', () => {
    describe('getUserInfo', () => {
        it('사용자 정보를 반환해야 함', () => {
            const user = getUserInfo();

            expect(user).toBeDefined();
            expect(user.id).toBeDefined();
            expect(user.name).toBeDefined();
            expect(user.email).toBeDefined();
            expect(user.role).toEqual('editor');
            expect(user.createdAt).toBeInstanceOf(Date);
            expect(user.updatedAt).toBeInstanceOf(Date);
        });
    });

    describe('updateUserInfo', () => {
        it('사용자 정보를 업데이트해야 함', () => {
            const originalUser = getUserInfo();
            const updates: Partial<User> = {
                name: '업데이트된 이름',
                email: 'updated@example.com'
            };

            const updatedUser = updateUserInfo(updates);

            expect(updatedUser).toBeDefined();
            expect(updatedUser.id).toEqual(originalUser.id);
            expect(updatedUser.name).toEqual(updates.name);
            expect(updatedUser.email).toEqual(updates.email);
            expect(updatedUser.role).toEqual(originalUser.role);

            // 생성일은 동일해야 함
            expect(updatedUser.createdAt).toEqual(originalUser.createdAt);

            // 업데이트 일자는 변경되어야 함
            expect(updatedUser.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUser.updatedAt.getTime());
        });

        it('부분 업데이트가 가능해야 함', () => {
            const originalUser = getUserInfo();
            const updates: Partial<User> = {
                name: '부분 업데이트 이름'
            };

            const updatedUser = updateUserInfo(updates);

            expect(updatedUser.name).toEqual(updates.name);
            expect(updatedUser.email).toEqual(originalUser.email);
        });
    });

    describe('authenticateUser', () => {
        it('올바른 인증 정보로 사용자를 인증해야 함', async () => {
            const email = 'test@example.com';
            const password = 'password123';

            const user = await authenticateUser(email, password);

            expect(user).not.toBeNull();
            expect(user?.email).toEqual(email);
        });

        it('빈 인증 정보로는 인증에 실패해야 함', async () => {
            const user = await authenticateUser('', '');
            expect(user).toBeNull();
        });
    });

    describe('createUser', () => {
        it('새 사용자를 생성해야 함', async () => {
            // console.log spy 생성
            const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

            const name = '새 사용자';
            const email = 'new@example.com';
            const password = 'password123';
            const role = 'viewer' as const;

            const user = await createUser(name, email, password, role);

            expect(user).toBeDefined();
            expect(user.id).toBeDefined();
            expect(user.name).toEqual(name);
            expect(user.email).toEqual(email);
            expect(user.role).toEqual(role);
            expect(user.createdAt).toBeInstanceOf(Date);
            expect(user.updatedAt).toBeInstanceOf(Date);

            // 비밀번호가 로그에 기록되었는지 확인
            expect(consoleSpy).toHaveBeenCalledWith('pwd', password);

            // 스파이 복원
            consoleSpy.mockRestore();
        });

        it('역할을 지정하지 않으면 viewer로 기본 설정되어야 함', async () => {
            const user = await createUser('기본 역할 사용자', 'default@example.com', 'password');
            expect(user.role).toEqual('viewer');
        });
    });

    describe('validateUserSession', () => {
        it('현재 세션이 유효한지 확인해야 함', () => {
            const isValid = validateUserSession();
            expect(isValid).toBe(true);
        });
    });

    describe('logoutUser', () => {
        it('사용자 로그아웃 처리를 해야 함', async () => {
            await expect(logoutUser()).resolves.toBeUndefined();
        });
    });
});