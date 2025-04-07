import React, { ReactNode } from 'react';
import BaseLayout from './BaseLayout';
import styles from './SingleLayout.module.scss';

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
                                                       maxWidth = '640px',
                                                       withHeader = false,
                                                       withFooter = false
                                                   }) => {
    const containerStyle = {
        maxWidth
    };

    return (
        <BaseLayout className={styles.singleLayout}>
            {withHeader && (
                <div className={styles.singleLayoutHeader}>
                    <div className={styles.logo}>
                        <span>DS 매니저</span>
                    </div>
                </div>
            )}
            <div className={styles.singleLayoutContent}>
                <div
                    className={`${styles.singleLayoutContainer} ${centered ? styles.centered : ''}`}
                    style={containerStyle}
                >
                    {children}
                </div>
            </div>
            {withFooter && (
                <div className={styles.singleLayoutFooter}>
                    <div className={styles.copyright}>
                        © {new Date().getFullYear()} DS Manager. All rights reserved.
                    </div>
                </div>
            )}
        </BaseLayout>
    );
};

export default SingleLayout;