// src/components/DesignEditor/components/toolbar/ToolButton.tsx
import React from 'react';
import styles from '../../styles/DesignEditor.module.scss';

interface ToolButtonProps {
    title: string;
    onClick: () => void;
    icon: React.ReactNode;
    disabled?: boolean;
    active?: boolean;
    className?: string;
}

/**
 * Reusable button component for toolbar items
 */
const ToolButton: React.FC<ToolButtonProps> = ({
                                                   title,
                                                   onClick,
                                                   icon,
                                                   disabled = false,
                                                   active = false,
                                                   className = ''
                                               }) => (
        <button
            className={`${styles.toolButton} ${active ? styles.active : ''} ${disabled ? styles.disabled : ''} ${className}`}
            title={title}
            onClick={onClick}
            disabled={disabled}
        >
            {icon}
        </button>
    );

export default ToolButton;