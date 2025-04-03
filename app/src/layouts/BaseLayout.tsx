// app/src/layouts/BaseLayout.tsx
import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import ErrorBoundary from './components/common/ErrorBoundary';
import styles from './BaseLayout.module.scss';

interface BaseLayoutProps {
    children: ReactNode;
    className?: string;
}

/**
 * Base layout component that wraps all other layouts
 * Provides common functionality like error boundaries
 */
const BaseLayout: React.FC<BaseLayoutProps> = ({ children, className = '' }) => {
    const { t } = useTranslation();

    return (
        <ErrorBoundary fallback={<div className="error-container">{t('errors.unexpected')}</div>}>
            <div className={`${styles['base-layout']} ${className}`}>
                {children}
            </div>
        </ErrorBoundary>
    );
};

export default BaseLayout;