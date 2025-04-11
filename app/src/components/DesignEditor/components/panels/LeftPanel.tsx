// src/components/DesignEditor/components/panels/LeftPanel.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Minus, FileText } from 'lucide-react';

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
    onStartResize: () => void;
    activeTab: string;
    onTabChange: (tab: string) => void;
}

/**
 * Left panel component containing the object panel, library panel, and file manager
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

    // Handle adding a component from the file manager
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
            // Add layout component
            const groupId = `layout_${Date.now()}`;

            // Add layout background
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

            // Add layout children
            if (component.children && Array.isArray(component.children)) {
                component.children.forEach((child: any) => {
                    // @ts-ignore
                    addObject(child.type, {
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
                {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
        </div>
    );
};

export default LeftPanel;