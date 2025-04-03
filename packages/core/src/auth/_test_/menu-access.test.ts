// packages/core/src/auth/menu-access.test.ts
import { describe, it, expect } from 'vitest';
import {
    MenuItem,
    MenuTree,
    filterMenuByPermission,
    hasAccessToMenuItem,
    hasAccessToMenuPath,
    getAccessiblePaths
} from '../menu-access';
import { UserRole } from '../../types';

describe('Menu Access Utils', () => {
    // 테스트용 샘플 메뉴 트리
    const sampleMenuTree: MenuTree = {
        items: [
            {
                id: 'home',
                label: '홈',
                path: '/',
                icon: 'home'
            },
            {
                id: 'dashboard',
                label: '대시보드',
                path: '/dashboard',
                icon: 'dashboard',
                requiredRole: 'user'
            },
            {
                id: 'admin',
                label: '관리',
                icon: 'settings',
                requiredRole: 'admin',
                children: [
                    {
                        id: 'users',
                        label: '사용자 관리',
                        path: '/admin/users',
                        requiredRole: 'admin'
                    },
                    {
                        id: 'reports',
                        label: '보고서',
                        path: '/admin/reports',
                        requiredRole: 'admin'
                    }
                ]
            },
            {
                id: 'system',
                label: '시스템 설정',
                path: '/system',
                icon: 'system',
                requiredRole: 'super_admin'
            },
            {
                id: 'vendor',
                label: '업체 관리',
                path: '/vendor',
                icon: 'store',
                requiredRole: 'vendor'
            },
            {
                id: 'hidden',
                label: '숨김 메뉴',
                path: '/hidden',
                isVisible: false
            }
        ]
    };

    describe('hasAccessToMenuItem', () => {
        it('사용자 역할에 따라 메뉴 항목 접근 권한을 확인해야 함', () => {
            // 권한이 필요하지 않은 항목
            const homeItem = sampleMenuTree.items[0];
            expect(hasAccessToMenuItem(homeItem, 'user')).toBe(true);
            expect(hasAccessToMenuItem(homeItem, undefined)).toBe(true);

            // 사용자 권한이 필요한 항목
            const dashboardItem = sampleMenuTree.items[1];
            expect(hasAccessToMenuItem(dashboardItem, 'user')).toBe(true);
            expect(hasAccessToMenuItem(dashboardItem, 'vendor')).toBe(true); // vendor는 user보다 높은 권한
            expect(hasAccessToMenuItem(dashboardItem, 'admin')).toBe(true);
            expect(hasAccessToMenuItem(dashboardItem, 'super_admin')).toBe(true);
            expect(hasAccessToMenuItem(dashboardItem, undefined)).toBe(false);

            // 관리자 권한이 필요한 항목
            const adminItem = sampleMenuTree.items[2];
            expect(hasAccessToMenuItem(adminItem, 'admin')).toBe(true);
            expect(hasAccessToMenuItem(adminItem, 'super_admin')).toBe(true);
            expect(hasAccessToMenuItem(adminItem, 'vendor')).toBe(false);
            expect(hasAccessToMenuItem(adminItem, 'user')).toBe(false);
            expect(hasAccessToMenuItem(adminItem, undefined)).toBe(false);

            // 슈퍼관리자 권한이 필요한 항목
            const systemItem = sampleMenuTree.items[3];
            expect(hasAccessToMenuItem(systemItem, 'super_admin')).toBe(true);
            expect(hasAccessToMenuItem(systemItem, 'admin')).toBe(false);
            expect(hasAccessToMenuItem(systemItem, 'vendor')).toBe(false);
            expect(hasAccessToMenuItem(systemItem, 'user')).toBe(false);
            expect(hasAccessToMenuItem(systemItem, undefined)).toBe(false);

            // 업체 권한이 필요한 항목
            const vendorItem = sampleMenuTree.items[4];
            expect(hasAccessToMenuItem(vendorItem, 'vendor')).toBe(true);
            expect(hasAccessToMenuItem(vendorItem, 'admin')).toBe(true);
            expect(hasAccessToMenuItem(vendorItem, 'super_admin')).toBe(true);
            expect(hasAccessToMenuItem(vendorItem, 'user')).toBe(false); // user는 vendor보다 낮은 권한
            expect(hasAccessToMenuItem(vendorItem, undefined)).toBe(false);

            // 숨김 처리된 항목
            const hiddenItem = sampleMenuTree.items[5];
            expect(hasAccessToMenuItem(hiddenItem, 'super_admin')).toBe(false);
            expect(hasAccessToMenuItem(hiddenItem, 'admin')).toBe(false);
            expect(hasAccessToMenuItem(hiddenItem, 'vendor')).toBe(false);
            expect(hasAccessToMenuItem(hiddenItem, 'user')).toBe(false);
            expect(hasAccessToMenuItem(hiddenItem, undefined)).toBe(false);
        });
    });

    describe('filterMenuByPermission', () => {
        it('사용자 권한으로 접근 가능한 메뉴만 필터링해야 함', () => {
            // 사용자 권한으로 필터링
            const userFilteredMenu = filterMenuByPermission(sampleMenuTree, 'user' as UserRole);
            expect(userFilteredMenu.items.length).toBe(2); // 홈, 대시보드만 접근 가능 (업체 관리는 접근 불가)
            expect(userFilteredMenu.items.map(item => item.id)).toContain('home');
            expect(userFilteredMenu.items.map(item => item.id)).toContain('dashboard');
            expect(userFilteredMenu.items.map(item => item.id)).not.toContain('vendor'); // 업체 관리는 접근 불가
            expect(userFilteredMenu.items.map(item => item.id)).not.toContain('admin');
            expect(userFilteredMenu.items.map(item => item.id)).not.toContain('system');
            expect(userFilteredMenu.items.map(item => item.id)).not.toContain('hidden');

            // 관리자 권한으로 필터링
            const adminFilteredMenu = filterMenuByPermission(sampleMenuTree, 'admin' as UserRole);
            expect(adminFilteredMenu.items.length).toBe(4); // 홈, 대시보드, 관리, 업체 관리
            expect(adminFilteredMenu.items.map(item => item.id)).toContain('admin');
            expect(adminFilteredMenu.items.map(item => item.id)).not.toContain('system');

            // admin 항목의 하위 메뉴도 포함되어야 함
            const adminItem = adminFilteredMenu.items.find(item => item.id === 'admin');
            expect(adminItem?.children?.length).toBe(2);

            // 슈퍼관리자 권한으로 필터링
            const superAdminFilteredMenu = filterMenuByPermission(sampleMenuTree, 'super_admin' as UserRole);
            expect(superAdminFilteredMenu.items.length).toBe(5); // 홈, 대시보드, 관리, 시스템 설정, 업체 관리
            expect(superAdminFilteredMenu.items.map(item => item.id)).toContain('system');

            // 권한이 없는 경우 필터링
            const unauthFilteredMenu = filterMenuByPermission(sampleMenuTree, undefined);
            expect(unauthFilteredMenu.items.length).toBe(1); // 홈 (권한 없는 메뉴)
            expect(unauthFilteredMenu.items[0].id).toBe('home');
        });
    });

    describe('hasAccessToMenuPath', () => {
        it('경로에 대한 접근 권한을 확인해야 함', () => {
            // 홈 경로 (모든 사용자 접근 가능)
            expect(hasAccessToMenuPath('/', sampleMenuTree, 'user')).toBe(true);
            expect(hasAccessToMenuPath('/', sampleMenuTree, undefined)).toBe(true);

            // 대시보드 경로 (사용자 이상 권한 필요)
            expect(hasAccessToMenuPath('/dashboard', sampleMenuTree, 'user')).toBe(true);
            expect(hasAccessToMenuPath('/dashboard', sampleMenuTree, 'admin')).toBe(true);
            expect(hasAccessToMenuPath('/dashboard', sampleMenuTree, undefined)).toBe(false);

            // 관리자 경로 (관리자 이상 권한 필요)
            expect(hasAccessToMenuPath('/admin/users', sampleMenuTree, 'admin')).toBe(true);
            expect(hasAccessToMenuPath('/admin/users', sampleMenuTree, 'super_admin')).toBe(true);
            expect(hasAccessToMenuPath('/admin/users', sampleMenuTree, 'user')).toBe(false);

            // 시스템 설정 경로 (슈퍼관리자 권한 필요)
            expect(hasAccessToMenuPath('/system', sampleMenuTree, 'super_admin')).toBe(true);
            expect(hasAccessToMenuPath('/system', sampleMenuTree, 'admin')).toBe(false);

            // 업체 관리 경로 (업체 이상 권한 필요)
            expect(hasAccessToMenuPath('/vendor', sampleMenuTree, 'vendor')).toBe(true);
            expect(hasAccessToMenuPath('/vendor', sampleMenuTree, 'user')).toBe(false); // 사용자는 vendor 메뉴에 접근 불가
            expect(hasAccessToMenuPath('/vendor', sampleMenuTree, undefined)).toBe(false);


            // 숨김 메뉴 경로 (항상 접근 불가)
            expect(hasAccessToMenuPath('/hidden', sampleMenuTree, 'super_admin')).toBe(false);

            // 메뉴에 정의되지 않은 경로 (기본적으로 접근 허용)
            expect(hasAccessToMenuPath('/undefined-path', sampleMenuTree, 'user')).toBe(true);
            expect(hasAccessToMenuPath('/undefined-path', sampleMenuTree, undefined)).toBe(true);
        });
    });

    describe('getAccessiblePaths', () => {
        it('접근 가능한 모든 경로 목록을 반환해야 함', () => {
            // 사용자 권한으로 접근 가능한 경로
            const userPaths = getAccessiblePaths(sampleMenuTree, 'user' as UserRole);
            expect(userPaths).toContain('/');
            expect(userPaths).toContain('/dashboard');
            expect(userPaths).not.toContain('/vendor'); // 사용자는 vendor 경로에 접근 불가
            expect(userPaths).not.toContain('/admin/users');
            expect(userPaths).not.toContain('/system');

            // 관리자 권한으로 접근 가능한 경로
            const adminPaths = getAccessiblePaths(sampleMenuTree, 'admin' as UserRole);
            expect(adminPaths).toContain('/');
            expect(adminPaths).toContain('/dashboard');
            expect(adminPaths).toContain('/admin/users');
            expect(adminPaths).toContain('/admin/reports');
            expect(adminPaths).not.toContain('/system');

            // 슈퍼관리자 권한으로 접근 가능한 경로
            const superAdminPaths = getAccessiblePaths(sampleMenuTree, 'super_admin' as UserRole);
            expect(superAdminPaths).toContain('/');
            expect(superAdminPaths).toContain('/dashboard');
            expect(superAdminPaths).toContain('/admin/users');
            expect(superAdminPaths).toContain('/admin/reports');
            expect(superAdminPaths).toContain('/system');

            // 권한이 없는 경우
            const unauthPaths = getAccessiblePaths(sampleMenuTree, undefined);
            expect(unauthPaths).toEqual(['/']);
        });
    });
});