import { describe, it, expect } from 'vitest';
import {
    ROLE_HIERARCHY,
    ROLE_DISPLAY_NAMES,
    ROLE_DESCRIPTIONS,
    getRoles,
    compareRoles,
    hasRequiredRole,
    createPermissionCheckResult,
    getRoleDisplayName,
    getRoleDescription
} from '../permission';
import { UserRole } from '../../types';

describe('Permission Utils', () => {
    describe('ROLE_HIERARCHY', () => {
        it('역할 계층 구조가 올바르게 정의되어야 함', () => {
            // 슈퍼관리자가 가장 높은 권한, 일반 사용자가 가장 낮은 권한
            expect(ROLE_HIERARCHY['super_admin']).toBeGreaterThan(ROLE_HIERARCHY['admin']);
            expect(ROLE_HIERARCHY['admin']).toBeGreaterThan(ROLE_HIERARCHY['vendor']);
            expect(ROLE_HIERARCHY['vendor']).toBeGreaterThan(ROLE_HIERARCHY['user']);
        });
    });

    describe('getRoles', () => {
        it('모든 역할 목록을 반환해야 함', () => {
            const roles = getRoles();

            expect(roles).toEqual(expect.arrayContaining(['super_admin', 'admin', 'user', 'vendor']));
            expect(roles.length).toBe(4); // 정의된 역할 수
        });
    });

    describe('compareRoles', () => {
        it('두 역할을 비교하여 올바른 결과를 반환해야 함', () => {
            // 높은 권한 vs 낮은 권한
            expect(compareRoles('super_admin', 'admin')).toBeGreaterThan(0);
            expect(compareRoles('admin', 'vendor')).toBeGreaterThan(0);
            expect(compareRoles('vendor', 'user')).toBeGreaterThan(0);

            // 낮은 권한 vs 높은 권한
            expect(compareRoles('user', 'vendor')).toBeLessThan(0);
            expect(compareRoles('vendor', 'admin')).toBeLessThan(0);
            expect(compareRoles('admin', 'super_admin')).toBeLessThan(0);

            // 동일한 권한
            expect(compareRoles('admin', 'admin')).toBe(0);
            expect(compareRoles('user', 'user')).toBe(0);
        });
    });

    describe('hasRequiredRole', () => {
        it('사용자 역할이 요구되는 역할 이상인지 확인해야 함', () => {
            // 동일한 권한
            expect(hasRequiredRole('admin', 'admin')).toBe(true);
            expect(hasRequiredRole('user', 'user')).toBe(true);

            // 상위 권한에서 하위 권한으로의 접근
            expect(hasRequiredRole('super_admin', 'admin')).toBe(true);
            expect(hasRequiredRole('admin', 'vendor')).toBe(true);
            expect(hasRequiredRole('vendor', 'user')).toBe(true);
            expect(hasRequiredRole('super_admin', 'user')).toBe(true);

            // 하위 권한에서 상위 권한으로의 접근
            expect(hasRequiredRole('user', 'vendor')).toBe(false);
            expect(hasRequiredRole('vendor', 'admin')).toBe(false);
            expect(hasRequiredRole('admin', 'super_admin')).toBe(false);
        });
    });

    describe('createPermissionCheckResult', () => {
        it('권한 체크 결과를 올바르게 생성해야 함', () => {
            // 권한이 있는 경우
            const adminResult = createPermissionCheckResult('admin' as UserRole, 'user' as UserRole);
            expect(adminResult.hasPermission).toBe(true);
            expect(adminResult.requiredRole).toBe('user');
            expect(adminResult.userRole).toBe('admin');

            // 권한이 없는 경우
            const userResult = createPermissionCheckResult('user' as UserRole, 'admin' as UserRole);
            expect(userResult.hasPermission).toBe(false);
            expect(userResult.requiredRole).toBe('admin');
            expect(userResult.userRole).toBe('user');

            // 사용자 역할이 없는 경우
            const noUserResult = createPermissionCheckResult(undefined, 'user' as UserRole);
            expect(noUserResult.hasPermission).toBe(false);
            expect(noUserResult.requiredRole).toBe('user');
            expect(noUserResult.userRole).toBeUndefined();
        });
    });

    describe('getRoleDisplayName', () => {
        it('각 역할에 대한 표시 이름을 반환해야 함', () => {
            // 각 역할의 표시 이름 확인
            expect(getRoleDisplayName('super_admin')).toBe(ROLE_DISPLAY_NAMES['super_admin']);
            expect(getRoleDisplayName('admin')).toBe(ROLE_DISPLAY_NAMES['admin']);
            expect(getRoleDisplayName('user')).toBe(ROLE_DISPLAY_NAMES['user']);
            expect(getRoleDisplayName('vendor')).toBe(ROLE_DISPLAY_NAMES['vendor']);

            // 정의되지 않은 역할인 경우 원래 값 반환
            const undefinedRole = 'undefined_role' as UserRole;
            expect(getRoleDisplayName(undefinedRole)).toBe(undefinedRole);
        });

        it('모든 역할에 대한 표시 이름이 정의되어 있어야 함', () => {
            // 모든 역할에 대한 표시 이름 존재 확인
            const roles = getRoles();
            roles.forEach(role => {
                expect(ROLE_DISPLAY_NAMES[role]).toBeDefined();
                expect(typeof ROLE_DISPLAY_NAMES[role]).toBe('string');
            });
        });
    });

    describe('getRoleDescription', () => {
        it('각 역할에 대한 설명을 반환해야 함', () => {
            // 각 역할의 설명 확인
            expect(getRoleDescription('super_admin')).toBe(ROLE_DESCRIPTIONS['super_admin']);
            expect(getRoleDescription('admin')).toBe(ROLE_DESCRIPTIONS['admin']);
            expect(getRoleDescription('user')).toBe(ROLE_DESCRIPTIONS['user']);
            expect(getRoleDescription('vendor')).toBe(ROLE_DESCRIPTIONS['vendor']);

            // 정의되지 않은 역할인 경우 빈 문자열 반환
            const undefinedRole = 'undefined_role' as UserRole;
            expect(getRoleDescription(undefinedRole)).toBe('');
        });

        it('모든 역할에 대한 설명이 정의되어 있어야 함', () => {
            // 모든 역할에 대한 설명 존재 확인
            const roles = getRoles();
            roles.forEach(role => {
                expect(ROLE_DESCRIPTIONS[role]).toBeDefined();
                expect(typeof ROLE_DESCRIPTIONS[role]).toBe('string');
                expect(ROLE_DESCRIPTIONS[role].length).toBeGreaterThan(0);
            });
        });
    });
});