import { UserRole } from '../types';
import { hasRequiredRole } from './permission';

/**
 * 메뉴 항목 인터페이스
 */
export interface MenuItem {
    id: string;
    label: string;
    path?: string;
    icon?: string;
    children?: MenuItem[];
    requiredRole?: UserRole;
    isActive?: boolean;
    isVisible?: boolean;
}

/**
 * 메뉴 트리 인터페이스
 */
export interface MenuTree {
    items: MenuItem[];
}

/**
 * 권한 기반 메뉴 필터링
 * @param menuTree 전체 메뉴 트리
 * @param userRole 사용자 역할
 * @returns 필터링된 메뉴 트리
 */
export function filterMenuByPermission(menuTree: MenuTree, userRole: UserRole | undefined): MenuTree {
    return {
        items: filterMenuItems(menuTree.items, userRole)
    };
}

/**
 * 메뉴 항목 배열을 권한에 따라 필터링
 * @param items 메뉴 항목 배열
 * @param userRole 사용자 역할
 * @returns 필터링된 메뉴 항목 배열
 */
function filterMenuItems(items: MenuItem[], userRole: UserRole | undefined): MenuItem[] {
    return items
        .filter(item => hasAccessToMenuItem(item, userRole))
        .map(item => ({
            ...item,
            children: item.children ? filterMenuItems(item.children, userRole) : undefined
        }));
}

/**
 * 특정 메뉴 항목에 대한 접근 권한 확인
 * @param item 메뉴 항목
 * @param userRole 사용자 역할
 * @returns 접근 가능 여부
 */
export function hasAccessToMenuItem(item: MenuItem, userRole: UserRole | undefined): boolean {
    // 명시적으로 숨김 설정된 경우
    if (item.isVisible === false) {
        return false;
    }

    // 필요 권한이 정의되지 않은 경우 접근 허용
    if (!item.requiredRole) {
        return true;
    }

    // 사용자 역할이 없으면 접근 불가
    if (!userRole) {
        return false;
    }

    // 권한 확인
    return hasRequiredRole(userRole, item.requiredRole);
}

/**
 * 단일 메뉴 항목의 접근 권한 확인 (경로 기반)
 * @param path 확인할 메뉴 경로
 * @param menuTree 메뉴 트리
 * @param userRole 사용자 역할
 * @returns 접근 가능 여부
 */
export function hasAccessToMenuPath(path: string, menuTree: MenuTree, userRole: UserRole | undefined): boolean {
    if (!path) {
        return true;
    }

    // 메뉴 트리에서 해당 경로 찾기
    const findMenuItem = (items: MenuItem[]): MenuItem | undefined => {
        for (const item of items) {
            if (item.path === path) {
                return item;
            }

            if (item.children && item.children.length > 0) {
                const found = findMenuItem(item.children);
                if (found) {
                    return found;
                }
            }
        }

        return undefined;
    };

    const menuItem = findMenuItem(menuTree.items);

    // 메뉴 항목이 없으면 접근 허용 (메뉴에 없는 경로일 수 있음)
    if (!menuItem) {
        return true;
    }

    return hasAccessToMenuItem(menuItem, userRole);
}

/**
 * 사용자 역할에 따라 접근 가능한 메뉴 경로 가져오기
 * @param menuTree 메뉴 트리
 * @param userRole 사용자 역할
 * @returns 접근 가능한 경로 목록
 */
export function getAccessiblePaths(menuTree: MenuTree, userRole: UserRole | undefined): string[] {
    const paths: string[] = [];

    const collectPaths = (items: MenuItem[]) => {
        for (const item of items) {
            if (hasAccessToMenuItem(item, userRole) && item.path) {
                paths.push(item.path);
            }

            if (item.children && item.children.length > 0) {
                collectPaths(item.children);
            }
        }
    };

    collectPaths(menuTree.items);
    return paths;
}