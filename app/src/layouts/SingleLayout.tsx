// app/src/layouts/SingleLayout.tsx
import React, { ReactNode } from 'react';
import BaseLayout from './BaseLayout';
import './SingleLayout.module.scss';

interface SingleLayoutProps {
    children: ReactNode;
    centered?: boolean;
    maxWidth?: string;
    withHeader?: boolean;
    withFooter?: boolean;
}

/**
 * Simple single-column layout for non-authenticated pages like login, error pages, etc.
 */
const SingleLayout: React.FC<SingleLayoutProps> = ({
                                                       children,
                                                       centered = true,
                                                       maxWidth = '480px',
                                                       withHeader = false,
                                                       withFooter = false
                                                   }) => {
    const containerStyle = {
        maxWidth: maxWidth
    };

    const containerClasses = [
        'single-layout-container',
        centered ? 'centered' : '',
    ].join(' ');

    return (
        <BaseLayout className="single-layout">
            {withHeader && (
                <div className="single-layout-header">
                    <div className="logo">
                        {/* Add your logo here */}
                        <span>DS 매니저</span>
                    </div>
                </div>
            )}
            <div className="single-layout-content">
                <div className={containerClasses} style={containerStyle}>
                    {children}
                </div>
            </div>
            {withFooter && (
                <div className="single-layout-footer">
                    <div className="copyright">
                        © {new Date().getFullYear()} DS Manager. All rights reserved.
                    </div>
                </div>
            )}
        </BaseLayout>
    );
};

export default SingleLayout;