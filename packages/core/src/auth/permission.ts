import { UserRole } from '../types';
import { PermissionCheckResult } from './types';

/**
 * 역할 계층 구조 정의 (높은 권한 -> 낮은 권한)
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
    'super_admin': 100, // 모든 기능 접근 가능
    'admin': 75,        // 관리 기능 접근 가능
    'vendor': 50,        // 업체 전용 기능 접근 가능
    'user': 10,         // 일반 사용자 기능 접근 가능
};

/**
 * 역할별 권한 표시 이름
 */
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
    'super_admin': '슈퍼관리자',
    'admin': '관리자',
    'vendor': '업체',
    'user': '일반 사용자'
};

/**
 * 역할별 권한 설명
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
    'super_admin': '모든 시스템 기능에 접근할 수 있는 최고 권한입니다.',
    'admin': '대부분의 관리 기능에 접근할 수 있지만, 시스템 설정 변경은 제한됩니다.',
    'vendor': '업체 관련 기능에 접근할 수 있습니다.',
    'user': '기본적인 사용자 기능에 접근할 수 있습니다.',
};

/**
 * 역할 목록 가져오기
 * @returns 역할 목록
 */
export function getRoles(): UserRole[] {
    return Object.keys(ROLE_HIERARCHY) as UserRole[];
}

/**
 * 역할 계층 비교
 * @param role1 첫 번째 역할
 * @param role2 두 번째 역할
 * @returns 역할 비교 결과 (양수: role1이 높은 권한, 0: 같은 권한, 음수: role2가 높은 권한)
 */
export function compareRoles(role1: UserRole, role2: UserRole): number {
    const level1 = ROLE_HIERARCHY[role1] || 0;
    const level2 = ROLE_HIERARCHY[role2] || 0;
    return level1 - level2;
}

/**
 * 사용자 역할이 필요한 역할 이상인지 확인
 * @param userRole 사용자 역할
 * @param requiredRole 필요한 역할
 * @returns 권한 보유 여부
 */
export function hasRequiredRole(userRole: UserRole, requiredRole: UserRole): boolean {
    const userRoleLevel = ROLE_HIERARCHY[userRole] || 0;
    const requiredRoleLevel = ROLE_HIERARCHY[requiredRole] || 0;

    // 사용자의 역할 레벨이 요구되는 역할 레벨 이상인지 확인
    return userRoleLevel >= requiredRoleLevel;
}

/**
 * 권한 확인 결과 생성
 * @param userRole 사용자 역할
 * @param requiredRole 필요한 역할
 * @returns 권한 확인 결과
 */
export function createPermissionCheckResult(userRole: UserRole | undefined, requiredRole: UserRole): PermissionCheckResult {
    if (!userRole) {
        return {
            hasPermission: false,
            requiredRole,
            userRole: undefined
        };
    }

    const hasPermission = hasRequiredRole(userRole, requiredRole);

    return {
        hasPermission,
        requiredRole,
        userRole
    };
}

/**
 * 역할 표시 이름 가져오기
 * @param role 역할
 * @returns 역할 표시 이름
 */
export function getRoleDisplayName(role: UserRole): string {
    return ROLE_DISPLAY_NAMES[role] || role;
}

/**
 * 역할 설명 가져오기
 * @param role 역할
 * @returns 역할 설명
 */
export function getRoleDescription(role: UserRole): string {
    return ROLE_DESCRIPTIONS[role] || '';
}