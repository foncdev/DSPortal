// src/components/DesignEditor/components/panels/RightPanel.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Minus } from 'lucide-react';

import styles from '../../styles/DesignEditor.module.scss';
import PropertiesPanel from '../PropertiesPanel/PropertiesPanel';

interface RightPanelProps {
    isOpen: boolean;
    width: number;
    panelRef: React.RefObject<HTMLDivElement>;
    resizeHandleRef: React.RefObject<HTMLDivElement>;
    onToggle: () => void;
    onStartResize: () => void;
}

/**
 * Right panel component containing the properties panel
 */
const RightPanel: React.FC<RightPanelProps> = ({
                                                   isOpen,
                                                   width,
                                                   panelRef,
                                                   resizeHandleRef,
                                                   onToggle,
                                                   onStartResize
                                               }) => {
    const { t } = useTranslation();

    return (
        <div
            className={`${styles.rightPanel} ${isOpen ? '' : styles.collapsed}`}
            ref={panelRef}
            style={{ width: isOpen ? `${width}px` : '0' }}
        >
            {isOpen && (
                <>
                    <PropertiesPanel />

                    {/* Resize handle */}
                    <div
                        className={styles.resizeHandle}
                        ref={resizeHandleRef}
                        onMouseDown={onStartResize}
                    >
                        <Minus size={16} className={styles.resizeIcon} />
                    </div>
                </>
            )}

            {/* Toggle button */}
            <button
                className={styles.toggleButton}
                onClick={onToggle}
                title={isOpen ? t('editor.closePanel') : t('editor.openPanel')}
            >
                {isOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
        </div>
    );
};

export default RightPanel;