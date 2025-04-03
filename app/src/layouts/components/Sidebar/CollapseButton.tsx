// app/src/layouts/components/Sidebar/CollapseButton.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './CollapseButton.module.scss';

interface CollapseButtonProps {
    collapsed: boolean;
    position: 'left' | 'right';
    onToggle: () => void;
}

const CollapseButton: React.FC<CollapseButtonProps> = ({
                                                           collapsed,
                                                           position,
                                                           onToggle
                                                       }) => {
    const { t } = useTranslation();

    // Get the appropriate icon based on sidebar state and position
    const getIcon = () => {
        if (position === 'left') {
            return collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />;
        } else {
            return collapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />;
        }
    };

    // Get appropriate accessibility label
    const getLabel = () => {
        return collapsed
            ? t('sidebar.expand')
            : t('sidebar.collapse');
    };

    return (
        <button
            className={`${styles.collapseButton} ${styles[position]}`}
            onClick={onToggle}
            aria-label={getLabel()}
            title={getLabel()}
        >
            {getIcon()}
        </button>
    );
};

export default CollapseButton;