// src/components/DesignEditor/components/panels/LeftPanel.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, GripVertical, FileText } from 'lucide-react';

import styles from '../../styles/DesignEditor.module.scss';
import ObjectsPanel from '../ObjectsPanel/ObjectsPanel';
import LibraryPanel from '../LibraryPanel/LibraryPanel';
import FileManagerPanel from '../FileManagerPanel/FileManagerPanel';
import { useDesignEditor } from '../../context/DesignEditorContext';

interface LeftPanelProps {
    isOpen: boolean;
    width: number;
    panelRef: React.RefObject<HTMLDivElement>;
    resizeHandleRef: React.RefObject<HTMLDivElement>;
    onToggle: () => void;
    onStartResize: (e: React.MouseEvent<HTMLDivElement>) => void;
    activeTab: string;
    onTabChange: (tab: string) => void;
}

/**
 * 왼쪽 패널 컴포넌트 - 객체 패널, 라이브러리 패널, 파일 매니저 포함
 */
const LeftPanel: React.FC<LeftPanelProps> = ({
                                                 isOpen,
                                                 width,
                                                 panelRef,
                                                 resizeHandleRef,
                                                 onToggle,
                                                 onStartResize,
                                                 activeTab,
                                                 onTabChange
                                             }) => {
    const { t } = useTranslation();
    const { addObject } = useDesignEditor();

    // 파일 매니저에서 컴포넌트 추가 핸들러
    const handleAddComponent = (component: any) => {
        if (component.type === 'image') {
            addObject('image', {
                src: component.url,
                name: component.name,
                left: Math.random() * 400 + 200,
                top: Math.random() * 300 + 150
            });
        } else if (component.type === 'video') {
            addObject('video', {
                src: component.url,
                name: component.name,
                left: Math.random() * 400 + 200,
                top: Math.random() * 300 + 150,
                width: 320,
                height: 240
            });
        } else if (component.type === 'text') {
            addObject('text', {
                text: component.content || 'Text Component',
                name: component.name,
                left: Math.random() * 400 + 200,
                top: Math.random() * 300 + 150
            });
        } else if (component.type === 'layout') {
            // 레이아웃 컴포넌트 추가
            const groupId = `layout_${Date.now()}`;

            // 레이아웃 배경 추가
            addObject('rectangle', {
                name: component.name || 'Layout Component',
                width: component.width || 500,
                height: component.height || 300,
                fill: component.backgroundColor || '#f0f0f0',
                opacity: 0.5,
                isLayoutParent: true,
                layoutGroup: groupId,
                left: Math.random() * 300 + 150,
                top: Math.random() * 200 + 100
            });

            // 레이아웃 자식 요소 추가
            if (component.children && Array.isArray(component.children)) {
                component.children.forEach((child: any) => {
                    addObject(child.type as any, {
                        ...child.properties,
                        name: child.name,
                        layoutGroup: groupId
                    });
                });
            }
        }
    };

    return (
        <div
            className={`${styles.leftPanel} ${isOpen ? '' : styles.collapsed}`}
            ref={panelRef}
            style={{ width: isOpen ? `${width}px` : '0' }}
        >
            {isOpen && (
                <>
                    <div className={styles.tabBar}>
                        <button
                            className={`${styles.tab} ${activeTab === 'objects' ? styles.active : ''}`}
                            onClick={() => onTabChange('objects')}
                        >
                            {t('editor.objectsTab')}
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'library' ? styles.active : ''}`}
                            onClick={() => onTabChange('library')}
                        >
                            {t('editor.libraryTab')}
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'filemanager' ? styles.active : ''}`}
                            onClick={() => onTabChange('filemanager')}
                        >
                            <FileText size={16} className={styles.tabIcon} />
                            {t('editor.components')}
                        </button>
                    </div>

                    {activeTab === 'objects' && <ObjectsPanel />}
                    {activeTab === 'library' && <LibraryPanel />}
                    {activeTab === 'filemanager' && <FileManagerPanel onAddComponent={handleAddComponent} />}

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
                {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
        </div>
    );
};

export default LeftPanel;