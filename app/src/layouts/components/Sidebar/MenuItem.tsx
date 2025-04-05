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
}

const MenuItem: React.FC<MenuItemProps> = ({
                                               item,
                                               isCollapsed,
                                               onNavigation,
                                               currentPath = ''
                                           }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const path = currentPath || location.pathname;

    // Check if user has access to this menu item
    // Use optional chaining to safely access requiredRole
    const hasAccess = !item?.requiredRole || authManager.hasRole(item.requiredRole);

    // If user doesn't have access, don't render the item
    if (!hasAccess) {return null;}

    // Check if any children are accessible (for parent items)
    const accessibleChildren = item.children?.filter(
        child => !child?.requiredRole || authManager.hasRole(child.requiredRole)
    );

    // If parent has no accessible children, don't render it
    const hasChildren = item.children && accessibleChildren && accessibleChildren.length > 0;
    if (item.children && (!accessibleChildren || accessibleChildren.length === 0)) {
        return null;
    }

    // Check if current item or any of its children is active
    const isActive = item.path === path;
    const isChildActive = hasChildren && accessibleChildren?.some(child => child.path === path);

    // Open submenu if a child is active
    useEffect(() => {
        if (isChildActive && !isOpen) {
            setIsOpen(true);
        }
    }, [isChildActive, path, isOpen]);

    const toggleSubmenu = (e: React.MouseEvent) => {
        if (hasChildren) {
            e.preventDefault();
            setIsOpen(!isOpen);
        }
    };

    const handleItemClick = () => {
        if (!hasChildren && onNavigation) {
            onNavigation();
        }
    };

    // When in collapsed mode, we need to determine if the menu should show children on hover
    const showSubMenuOnHover = isCollapsed && hasChildren;

    return (
        <li className={`${styles.navItem} ${showSubMenuOnHover ? styles.hasSubmenu : ''}`}>
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

                    {/* Submenu - different rendering based on collapsed state */}
                    {isCollapsed ? (
                        // When collapsed, show submenu on hover as a dropdown
                        <div className={styles.submenuDropdown}>
                            <div className={styles.submenuHeader}>
                                {t(item.label)}
                            </div>
                            <ul className={styles.submenuList}>
                                {accessibleChildren?.map(child => (
                                    <li key={child.id} className={styles.submenuItem}>
                                        <NavLink
                                            to={child.path}
                                            className={({ isActive }) =>
                                                `${styles.submenuLink} ${isActive ? styles.active : ''}`
                                            }
                                            onClick={onNavigation}
                                        >
                                            <span
                                                className={styles.submenuIcon}
                                                dangerouslySetInnerHTML={{ __html: child.icon }}
                                            />
                                            <span className={styles.submenuLabel}>{t(child.label)}</span>
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        // When expanded, show submenu as collapsible
                        <div className={`${styles.submenu} ${isOpen ? styles.open : ''}`}>
                            <ul className={styles.submenuList}>
                                {accessibleChildren?.map(child => (
                                    <li key={child.id} className={styles.submenuItem}>
                                        <NavLink
                                            to={child.path}
                                            className={({ isActive }) =>
                                                `${styles.submenuLink} ${isActive ? styles.active : ''}`
                                            }
                                            onClick={onNavigation}
                                        >
                                            <span
                                                className={styles.submenuIcon}
                                                dangerouslySetInnerHTML={{ __html: child.icon }}
                                            />
                                            <span className={styles.submenuLabel}>{t(child.label)}</span>
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            ) : (
                // Simple menu item without children
                <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                        `${styles.navLink} ${isActive ? styles.active : ''}`
                    }
                    onClick={handleItemClick}
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