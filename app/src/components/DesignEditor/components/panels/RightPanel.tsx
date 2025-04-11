// src/components/DesignEditor/components/panels/RightPanel.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';

import styles from '../../styles/DesignEditor.module.scss';
import PropertiesPanel from '../PropertiesPanel/PropertiesPanel';

interface RightPanelProps {
    isOpen: boolean;
    width: number;
    panelRef: React.RefObject<HTMLDivElement>;
    resizeHandleRef: React.RefObject<HTMLDivElement>;
    onToggle: () => void;
    onStartResize: (e: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * 오른쪽 패널 컴포넌트 - 속성 패널 포함
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

                    {/* 개선된 리사이즈 핸들 */}
                    <div
                        className={styles.resizeHandle}
                        ref={resizeHandleRef}
                        onMouseDown={onStartResize}
                    >
                        <div className={styles.resizeButton}>
                            <GripVertical size={12} />
                        </div>
                    </div>
                </>
            )}

            {/* 패널 토글 버튼 */}
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