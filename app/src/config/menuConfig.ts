// src/data/menuConfig.ts
import { UserRole } from '@ds/core';

export interface MenuItem {
    id: string;
    path: string;
    label: string;
    icon: string; // SVG string
    requiredRole?: UserRole;
    children?: MenuItem[];
}

// SVG 아이콘 문자열
const icons = {
    dashboard: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></svg>',
    users: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
    userAdmin: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M19.7 12.8a3 3 0 0 0 0-5.6"></path><path d="m22 18-3-3-3 3"></path><path d="M19 15v6"></path></svg>',
    building: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>',
    user: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
    userMinus: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="22" x2="16" y1="11" y2="11"></line></svg>',
    clock: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
    usersRound: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 21a8 8 0 0 0-16 0"></path><circle cx="10" cy="8" r="5"></circle><path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-8 6"></path></svg>',
    smartphone: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect><path d="M12 18h.01"></path></svg>',
    plus: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>',
    list: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"></line><line x1="8" x2="21" y1="12" y2="12"></line><line x1="8" x2="21" y1="18" y2="18"></line><line x1="3" x2="3.01" y1="6" y2="6"></line><line x1="3" x2="3.01" y1="12" y2="12"></line><line x1="3" x2="3.01" y1="18" y2="18"></line></svg>',
    fileText: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" x2="8" y1="13" y2="13"></line><line x1="16" x2="8" y1="17" y2="17"></line><line x1="10" x2="8" y1="9" y2="9"></line></svg>',
    trash: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>',
    layout: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><line x1="3" x2="21" y1="9" y2="9"></line><line x1="9" x2="9" y1="21" y2="9"></line></svg>',
    layoutTemplate: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="9" y="3" width="6" height="18"></rect></svg>',
    send: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" x2="11" y1="2" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>',
    chevronRight: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"></path></svg>',
    chevronDown: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"></path></svg>',
    logOut: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>',
    menu: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>',
    components: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="2"></rect><rect x="13" y="3" width="8" height="8" rx="2"></rect><rect x="3" y="13" width="8" height="8" rx="2"></rect><rect x="13" y="13" width="8" height="8" rx="2"></rect></svg>'

};

// 메뉴 데이터
export const menuItems: MenuItem[] = [
    {
        id: 'dashboard',
        path: '/dashboard',
        label: 'menu.dashboard.title',
        icon: icons.dashboard,
        children: [
            {
                id: 'dashboard-all',
                path: '/dashboard/all',
                label: 'menu.dashboard.all',
                icon: icons.dashboard,
                requiredRole: 'admin'
            },
            {
                id: 'dashboard-data-usage',
                path: '/dashboard/data-usage',
                label: 'menu.dashboard.dataUsage',
                icon: icons.fileText
            },
            {
                id: 'dashboard-device-status',
                path: '/dashboard/device-status',
                label: 'menu.dashboard.deviceStatus',
                icon: icons.smartphone
            },
            {
                id: 'dashboard-logs',
                path: '/dashboard/logs',
                label: 'menu.dashboard.logs',
                icon: icons.list
            }
        ]
    },
    {
        id: 'user-management',
        path: '/users',
        label: 'menu.users.title',
        icon: icons.users,
        children: [
            {
                id: 'users-admin',
                path: '/users/admin',
                label: 'menu.users.adminInfo',
                icon: icons.userAdmin,
                requiredRole: 'admin'
            },
            {
                id: 'users-vendors',
                path: '/users/vendors',
                label: 'menu.users.vendorInfo',
                icon: icons.building,
                requiredRole: 'admin'
            },
            {
                id: 'users-regular',
                path: '/users/regular',
                label: 'menu.users.userInfo',
                icon: icons.user
            },
            {
                id: 'users-pending-withdrawal',
                path: '/users/pending-withdrawal',
                label: 'menu.users.pendingWithdrawal',
                icon: icons.userMinus,
                requiredRole: 'admin'
            },
            {
                id: 'users-inactive',
                path: '/users/inactive',
                label: 'menu.users.inactiveUsers',
                icon: icons.clock,
                requiredRole: 'admin'
            }
        ]
    },
    {
        id: 'group-management',
        path: '/groups',
        label: 'menu.groups.title',
        icon: icons.usersRound
    },
    {
        id: 'device-management',
        path: '/devices',
        label: 'menu.devices.title',
        icon: icons.smartphone,
        children: [
            {
                id: 'devices-new',
                path: '/devices/new',
                label: 'menu.devices.new',
                icon: icons.plus,
                requiredRole: 'admin'
            },
            {
                id: 'devices-management',
                path: '/devices/management',
                label: 'menu.devices.management',
                icon: icons.smartphone
            },
            {
                id: 'devices-list',
                path: '/devices/list',
                label: 'menu.devices.list',
                icon: icons.list
            }
        ]
    },
    {
        id: 'file-management',
        path: '/files',
        label: 'menu.files.title',
        icon: icons.fileText,
        children: [
            {
                id: 'files-list',
                path: '/files/list',
                label: 'menu.files.list',
                icon: icons.fileText
            },
            {
                id: 'files-deleted',
                path: '/files/deleted',
                label: 'menu.files.deleted',
                icon: icons.trash
            }
        ]
    },
    {
        id: 'layout-management',
        path: '/layouts',
        label: 'menu.layouts.title',
        icon: icons.layout,
        children: [
            {
                id: 'layouts-template',
                path: '/layouts/template',
                label: 'menu.layouts.createTemplate',
                icon: icons.layoutTemplate
            },
            {
                id: 'layouts-list',
                path: '/layouts/list',
                label: 'menu.layouts.list',
                icon: icons.list
            }
        ]
    },
    {
        id: 'deployment',
        path: '/deployment',
        label: 'menu.deployment.title',
        icon: icons.send
    },
    {
        id: 'components-demo',
        path: '/components',
        label: 'menu.test.demo1',
        icon: icons.components
    },
];