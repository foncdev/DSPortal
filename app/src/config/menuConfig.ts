// app/src/config/menuConfig.ts
import {
    LayoutDashboard,
    Users,
    UserCircle,
    UserMinus,
    Clock,
    FolderTree,
    Smartphone,
    FileText,
    Trash2,
    LayoutTemplate,
    List,
    Upload,
    Plus
} from 'lucide-react';
import { UserRole } from '@ds/core';
import { TFunction } from 'i18next';

export interface MenuItem {
    id: string;
    label: string;
    path?: string;
    icon?: React.ElementType;
    children?: MenuItem[];
    requiredRole?: UserRole;
    translationKey?: string;
}

export interface MenuConfig {
    items: MenuItem[];
}

// Menu configuration with role-based access control
export const menuItems = [
    {
        id: 'dashboard',
        translationKey: 'menu.dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
        children: [
            {
                id: 'dashboard-all',
                translationKey: 'menu.dashboardAll',
                path: '/dashboard/all',
                requiredRole: 'admin'
            },
            {
                id: 'dashboard-data-usage',
                translationKey: 'menu.dataUsage',
                path: '/dashboard/data-usage'
            },
            {
                id: 'dashboard-device-status',
                translationKey: 'menu.deviceStatus',
                path: '/dashboard/device-status'
            },
            {
                id: 'dashboard-log-status',
                translationKey: 'menu.logStatus',
                path: '/dashboard/log-status'
            }
        ]
    },
    {
        id: 'user-management',
        translationKey: 'menu.userManagement',
        icon: Users,
        children: [
            {
                id: 'admin-info',
                translationKey: 'menu.adminInfo',
                path: '/user-management/admin-info',
                icon: UserCircle,
                requiredRole: 'admin'
            },
            {
                id: 'vendor-info',
                translationKey: 'menu.vendorInfo',
                path: '/user-management/vendor-info',
                requiredRole: 'admin'
            },
            {
                id: 'user-info',
                translationKey: 'menu.userInfo',
                path: '/user-management/user-info'
            },
            {
                id: 'withdrawal-scheduled',
                translationKey: 'menu.withdrawalScheduled',
                path: '/user-management/withdrawal-scheduled',
                icon: UserMinus,
                requiredRole: 'admin'
            },
            {
                id: 'inactive-users',
                translationKey: 'menu.inactiveUsers',
                path: '/user-management/inactive-users',
                icon: Clock,
                requiredRole: 'admin'
            }
        ]
    },
    {
        id: 'group-management',
        translationKey: 'menu.groupManagement',
        path: '/group-management',
        icon: FolderTree
    },
    {
        id: 'device-management',
        translationKey: 'menu.deviceManagement',
        icon: Smartphone,
        children: [
            {
                id: 'new-device',
                translationKey: 'menu.newDevice',
                path: '/device-management/new-device',
                icon: Plus,
                requiredRole: 'admin'
            },
            {
                id: 'device-management',
                translationKey: 'menu.deviceManage',
                path: '/device-management/manage'
            },
            {
                id: 'device-list',
                translationKey: 'menu.deviceList',
                path: '/device-management/device-list'
            }
        ]
    },
    {
        id: 'file-management',
        translationKey: 'menu.fileManagement',
        icon: FileText,
        children: [
            {
                id: 'file-list',
                translationKey: 'menu.fileList',
                path: '/file-management/file-list'
            },
            {
                id: 'deleted-files',
                translationKey: 'menu.deletedFiles',
                path: '/file-management/deleted-files',
                icon: Trash2
            }
        ]
    },
    {
        id: 'layout-management',
        translationKey: 'menu.layoutManagement',
        icon: LayoutTemplate,
        children: [
            {
                id: 'template-creation',
                translationKey: 'menu.templateCreation',
                path: '/layout-management/template-creation'
            },
            {
                id: 'layout-list',
                translationKey: 'menu.layoutList',
                path: '/layout-management/layout-list',
                icon: List
            }
        ]
    },
    {
        id: 'deployment-management',
        translationKey: 'menu.deploymentManagement',
        path: '/deployment-management',
        icon: Upload
    }
];

// Function to get translated menu configuration
export const getMenuConfig = (t: TFunction): MenuConfig => {
    // Deep clone the menu items and translate all labels
    const translateMenuItem = (item: any): MenuItem => {
        const translatedItem = { ...item };

        // Set the label from translation
        if (item.translationKey) {
            translatedItem.label = t(item.translationKey);
        }

        // Recursively translate children if they exist
        if (item.children && item.children.length > 0) {
            translatedItem.children = item.children.map(translateMenuItem);
        }

        return translatedItem;
    };

    // Return the translated menu config
    return {
        items: menuItems.map(translateMenuItem)
    };
};

// Default menu config (fallback for when translation function is not available)
export const menuConfig: MenuConfig = {
    items: menuItems.map(item => ({
        ...item,
        label: item.translationKey || item.id,
        children: item.children?.map(child => ({
            ...child,
            label: child.translationKey || child.id
        }))
    }))
};