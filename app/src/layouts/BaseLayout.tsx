import React, { ReactNode } from 'react';
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
const BaseLayout: React.FC<BaseLayoutProps> = ({ children, className = '' }) => (
        <ErrorBoundary>
            <div className={`${styles.baseLayout} ${className}`}>
                {children}
            </div>
        </ErrorBoundary>
    );

export default BaseLayout;