// src/layouts/components/Sidebar/MenuItem.tsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MenuItem as MenuItemType } from '../../../data/menuConfig';
import { authManager } from '@ds/core';
import styles from './Sidebar.module.scss';

interface MenuItemProps {
    item: MenuItemType;
    isCollapsed: boolean;
    onNavigation?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, isCollapsed, onNavigation }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    // Check if user has access to this menu item
    const hasAccess = !item.requiredRole || authManager.hasRole(item.requiredRole);

    // If user doesn't have access, don't render the item
    if (!hasAccess) {return null;}

    // Check if any children are accessible (for parent items)
    const accessibleChildren = item.children?.filter(
        child => !child.requiredRole || authManager.hasRole(child.requiredRole)
    );

    // If parent has no accessible children, don't render it
    const hasChildren = item.children && item.children.length > 0;
    if (hasChildren && (!accessibleChildren || accessibleChildren.length === 0)) {
        return null;
    }

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

    return (
        <li className={styles.navItem}>
            {hasChildren ? (
                // Parent menu item with children
                <>
                    <div
                        className={`${styles.navLink} ${isOpen ? styles.active : ''}`}
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

                    {/* Submenu */}
                    <div className={`${styles.submenu} ${isOpen || isCollapsed ? styles.open : ''}`}>
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