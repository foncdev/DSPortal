// src/components/DesignEditor/components/toolbar/ToolGroup.tsx
import React, { forwardRef } from 'react';
import styles from '../../styles/DesignEditor.module.scss';

interface ToolGroupProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Component for grouping related toolbar buttons
 */
const ToolGroup = forwardRef<HTMLDivElement, ToolGroupProps>(
    ({ children, className = '' }, ref) => {
        return (
            <div ref={ref} className={`${styles.toolGroup} ${className}`}>
                {children}
            </div>
        );
    }
);

ToolGroup.displayName = 'ToolGroup';

export default ToolGroup;