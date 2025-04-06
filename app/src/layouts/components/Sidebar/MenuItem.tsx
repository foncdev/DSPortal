// src/layouts/components/Sidebar/MenuItem.tsx
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MenuItem as MenuItemType } from '@/config/menuConfig';
import { authManager } from '@ds/core';
import styles from './Sidebar.module.scss';

interface MenuItemProps {
    item: MenuItemType;
    isCollapsed: boolean;
    onNavigation?: () => void;
    currentPath?: string;
    activeParent?: string | null;
    onParentClick?: (parentId: string) => void;
}

const MenuItem: React.FC<MenuItemProps> = ({
                                               item,
                                               isCollapsed,
                                               onNavigation,
                                               currentPath = '',
                                               activeParent,
                                               onParentClick
                                           }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const path = currentPath || location.pathname;

    // 비아이콘 모드에서는 내부 상태를 사용하고, 아이콘 모드에서는 부모로부터 제어
    const [isOpenInNormalMode, setIsOpenInNormalMode] = useState(false);

    // 아이콘 모드와 일반 모드에 따라 isOpen 결정
    const isOpen = isCollapsed
        ? activeParent === item.id
        : isOpenInNormalMode;

    // Check if user has access to this menu item
    const hasAccess = !item?.requiredRole || authManager.hasRole(item.requiredRole);

    // Check if any children are accessible (for parent items)
    const accessibleChildren = item.children?.filter(
        child => !child?.requiredRole || authManager.hasRole(child.requiredRole)
    );

    // If parent has no accessible children, don't render it
    const hasChildren = item.children && accessibleChildren && accessibleChildren.length > 0;

    // Always declare all hooks unconditionally at the top level
    // Check if current item or any of its children is active
    const isActive = item.path === path;
    const isChildActive = hasChildren && accessibleChildren?.some(child => child.path === path);

    // Open submenu if a child is active - moved inside useEffect
    useEffect(() => {
        if (isChildActive && !isCollapsed) {
            setIsOpenInNormalMode(true);
        }
    }, [isChildActive, isCollapsed]);

    // If user doesn't have access, don't render the item
    if (!hasAccess) {
        return null;
    }

    // If parent has no accessible children, don't render it
    if (item.children && (!accessibleChildren || accessibleChildren.length === 0)) {
        return null;
    }

    // Toggle submenu
    const toggleSubmenu = (e: React.MouseEvent) => {
        if (hasChildren) {
            e.preventDefault();
            if (isCollapsed) {
                // 아이콘 모드에서는 부모 컴포넌트의 상태를 업데이트
                onParentClick?.(item.id);
            } else {
                // 일반 모드에서는 내부 상태를 토글
                setIsOpenInNormalMode(!isOpenInNormalMode);
            }
        }
    };

    // Handle navigation for items without children
    const handleItemClick = () => {
        if (!hasChildren && onNavigation) {
            onNavigation();
        }
    };

    return (
        <li className={styles.navItem}>
            {hasChildren ? (
                // Parent menu item with children
                <>
                    <div
                        className={`${styles.navLink} ${isActive ? styles.active : ''} ${isChildActive ? styles.childActive : ''}`}
                        onClick={toggleSubmenu}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                toggleSubmenu(e as any);
                            }
                        }}
                    >
                        <span
                            className={styles.navIcon}
                            dangerouslySetInnerHTML={{ __html: item.icon }}
                        />
                        {!isCollapsed && (
                            <>
                                <span className={styles.navLabel}>{t(item.label)}</span>
                                <span
                                    className={styles.navArrow}
                                    dangerouslySetInnerHTML={{
                                        __html: isOpen ?
                                            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"></path></svg>' :
                                            '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"></path></svg>'
                                    }}
                                />
                            </>
                        )}
                    </div>

                    {/* Submenu - always use same style but conditional classes based on collapsed state */}
                    <div className={`${styles.submenu} ${isCollapsed ? styles.iconModeSubmenu : ''} ${isOpen ? styles.open : ''}`}>
                        <ul className={styles.submenuList}>
                            {accessibleChildren?.map(child => (
                                <li key={child.id} className={`${styles.submenuItem} ${isCollapsed ? styles.iconModeItem : ''}`}>
                                    <NavLink
                                        to={child.path}
                                        className={({ isActive }) =>
                                            `${styles.submenuLink} ${isActive ? styles.active : ''}`
                                        }
                                        onClick={onNavigation}
                                        title={isCollapsed ? t(child.label) : undefined}
                                    >
                                        <span
                                            className={styles.submenuIcon}
                                            dangerouslySetInnerHTML={{ __html: child.icon }}
                                        />
                                        {!isCollapsed && (
                                            <span className={styles.submenuLabel}>{t(child.label)}</span>
                                        )}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            ) : (
                // Simple menu item without children
                <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                        `${styles.navLink} ${isActive ? styles.active : ''}`
                    }
                    onClick={handleItemClick}
                    title={isCollapsed ? t(item.label) : undefined}
                >
                    <span
                        className={styles.navIcon}
                        dangerouslySetInnerHTML={{ __html: item.icon }}
                    />
                    {!isCollapsed && <span className={styles.navLabel}>{t(item.label)}</span>}
                </NavLink>
            )}
        </li>
    );
};

export default MenuItem;