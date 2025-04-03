// app/src/layouts/components/common/PageTitle.tsx
import React, { ReactNode } from 'react';
import Breadcrumbs from './Breadcrumbs';
import styles from './PageTitle.module.scss';

interface PageTitleProps {
    title: string;
    description?: string;
    actions?: ReactNode;
    showBreadcrumbs?: boolean;
    className?: string;
}

const PageTitle: React.FC<PageTitleProps> = ({
                                                 title,
                                                 description,
                                                 actions,
                                                 showBreadcrumbs = true,
                                                 className = '',
                                             }) => {
    return (
        <div className={`${styles.pageTitle} ${className}`}>
            {showBreadcrumbs && <Breadcrumbs />}

            <div className={styles.titleRow}>
                <div className={styles.titleContent}>
                    <h1 className={styles.title}>{title}</h1>
                    {description && <p className={styles.description}>{description}</p>}
                </div>

                {actions && (
                    <div className={styles.actions}>
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageTitle;