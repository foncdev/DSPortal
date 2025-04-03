// app/src/layouts/components/Sidebar/Navigation.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Home,
    FileText,
    Users,
    Settings,
    BarChart2,
    Package,
    Shield,
    Store
} from 'lucide-react';
import { authManager } from '@ds/core';
import styles from './Navigation.module.scss';

// Define navigation item structure
interface NavItem {
    key: string;
    label: string;
    path: string;
    icon: React.ReactNode;
    requiredRole?: 'user' | 'vendor' | 'admin' | 'super_admin';
    children?: NavItem[];
}

interface NavigationProps {
    collapsed: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ collapsed }) => {
    const { t } = useTranslation();
    const [expandedGroups, setExpandedGroups] = React.useState<string[]>([]);

    // Toggle submenu expanded state
    const toggleGroup = (key: string) => {
        setExpandedGroups(prev =>
            prev.includes(key)
                ? prev.filter(item => item !== key)
                : [...prev, key]
        );
    };

    // Navigation items with translations and icons
    const navItems: NavItem[] = [
        {
            key: 'home',
            label: t('nav.home'),
            path: '/',
            icon: <Home size={20} />
        },
        {
            key: 'dashboard',
            label: t('nav.dashboard'),
            path: '/dashboard',
            icon: <BarChart2 size={20} />,
            requiredRole: 'user'
        },
        {
            key: 'documents',
            label: t('nav.documents'),
            path: '/documents',
            icon: <FileText size={20} />,
            requiredRole: 'user',
            children: [
                {
                    key: 'document-list',
                    label: t('nav.documentList'),
                    path: '/documents',
                    icon: <FileText size={20} />,
                    requiredRole: 'user'
                },
                {
                    key: 'create-document',
                    label: t('nav.createDocument'),
                    path: '/documents/create',
                    icon: <FileText size={20} />,
                    requiredRole: 'user'
                }
            ]
        },
        {
            key: 'vendor',
            label: t('nav.vendor'),
            path: '/vendor',
            icon: <Store size={20} />,
            requiredRole: 'vendor'
        },
        {
            key: 'users',
            label: t('nav.users'),
            path: '/users',
            icon: <Users size={20} />,
            requiredRole: 'admin'
        },
        {
            key: 'system',
            label: t('nav.system'),
            path: '/system',
            icon: <Shield size={20} />,
            requiredRole: 'super_admin'
        },
        {
            key: 'settings',
            label: t('nav.settings'),
            path: '/settings',
            icon: <Settings size={20} />,
            requiredRole: 'user'
        }
    ];

    // Filter nav items based on user role
    const filteredNavItems = navItems.filter(item => {
        if (!item.requiredRole) return true;
        return authManager.hasRole(item.requiredRole);
    });

    // Render a single navigation item
    const renderNavItem = (item: NavItem, level = 0) => {
        // Check if item has visible children
        const hasVisibleChildren = item.children?.some(child => {
            if (!child.requiredRole) return true;
            return authManager.hasRole(child.requiredRole);
        });

        // Determine if this group is expanded
        const isExpanded = expandedGroups.includes(item.key);

        // Render item with or without children
        if (hasVisibleChildren) {
            return (
                <div key={item.key} className={`${styles.navGroup} ${isExpanded ? styles.expanded : ''}`}>
                    <button
                        className={styles.navGroupToggle}
                        onClick={() => toggleGroup(item.key)}
                        aria-expanded={isExpanded}
                    >
                        <span className={styles.icon}>{item.icon}</span>
                        {!collapsed && (
                            <>
                                <span className={styles.label}>{item.label}</span>
                                <span className={styles.arrow}>
                  <Package size={14} />
                </span>
                            </>
                        )}
                    </button>

                    {isExpanded && !collapsed && (
                        <div className={styles.subItems}>
                            {item.children?.filter(child => {
                                if (!child.requiredRole) return true;
                                return authManager.hasRole(child.requiredRole);
                            }).map(child => renderNavItem(child, level + 1))}
                        </div>
                    )}
                </div>
            );
        }

        // Regular nav item without children
        return (
            <NavLink
                key={item.key}
                to={item.path}
                className={({ isActive }) => `
          ${styles.navItem} 
          ${isActive ? styles.active : ''} 
          ${level > 0 ? styles.subItem : ''}
        `}
                title={collapsed ? item.label : undefined}
            >
                <span className={styles.icon}>{item.icon}</span>
                {!collapsed && <span className={styles.label}>{item.label}</span>}
            </NavLink>
        );
    };

    return (
        <nav className={`${styles.navigation} ${collapsed ? styles.collapsed : ''}`}>
            {filteredNavItems.map(item => renderNavItem(item))}
        </nav>
    );
};

export default Navigation;