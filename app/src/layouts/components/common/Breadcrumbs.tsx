// app/src/layouts/components/common/Breadcrumbs.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Home } from 'lucide-react';
import styles from './Breadcrumbs.module.scss';

interface BreadcrumbItem {
    path: string;
    label: string;
    icon?: React.ReactNode;
}

interface BreadcrumbsProps {
    items?: BreadcrumbItem[];
    // homeLabel 파라미터는 generateBreadcrumbsFromPath에 전달되도록 수정
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
                                                     items
                                                 }) => {
    const { t } = useTranslation();
    const location = useLocation();

    // Generate breadcrumb items from current path if not provided
    const breadcrumbItems = items || generateBreadcrumbsFromPath(location.pathname, t);

    if (breadcrumbItems.length <= 1) {
        return null; // Don't show breadcrumbs for home page only
    }

    return (
        <nav className={styles.breadcrumbs} aria-label="Breadcrumbs">
            <ol className={styles.list}>
                {breadcrumbItems.map((item, index) => {
                    const isLast = index === breadcrumbItems.length - 1;

                    return (
                        <li key={item.path} className={styles.item}>
                            {isLast ? (
                                <span className={styles.current}>
                  {item.icon && <span className={styles.icon}>{item.icon}</span>}
                                    {item.label}
                </span>
                            ) : (
                                <>
                                    <Link to={item.path} className={styles.link}>
                                        {item.icon && <span className={styles.icon}>{item.icon}</span>}
                                        {item.label}
                                    </Link>
                                    <span className={styles.separator}>
                    <ChevronRight size={16} />
                  </span>
                                </>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

// Generate breadcrumb items from URL path
const generateBreadcrumbsFromPath = (path: string, t: any): BreadcrumbItem[] => {
    const pathSegments = path.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
        {
            path: '/',
            label: t('breadcrumbs.home'),
            icon: <Home size={16} />
        }
    ];

    let currentPath = '';

    pathSegments.forEach((segment) => {
        currentPath += `/${segment}`;

        // Convert kebab-case or snake_case to title case for display
        const label = segment
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());

        breadcrumbs.push({
            path: currentPath,
            label: t(`breadcrumbs.${segment}`, label)
        });
    });

    return breadcrumbs;
};

export default Breadcrumbs;