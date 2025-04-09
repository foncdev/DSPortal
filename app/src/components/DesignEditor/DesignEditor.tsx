import React, { useState, useRef, useEffect } from 'react';
import {
    Undo2,
    Redo2,
    Grid,
    Save,
    Upload,
    Download,
    ChevronLeft,
    ChevronRight,
    Minus
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styles from './DesignEditor.module.scss';
import Canvas from './Canvas/Canvas';
import ObjectsPanel from './ObjectsPanel/ObjectsPanel';
import LibraryPanel from './LibraryPanel/LibraryPanel';
import PropertiesPanel from './PropertiesPanel/PropertiesPanel';
import { DesignEditorProvider, useDesignEditor } from './DesignEditorContext';

// Design Editor Inner Component (with access to context)
const DesignEditorInner: React.FC = () => {
    const { t } = useTranslation();
    const {
        canUndo,
        canRedo,
        undo,
        redo,
        toggleGrid,
        showGrid
    } = useDesignEditor();

    const [leftPanelOpen, setLeftPanelOpen] = useState(true);
    const [rightPanelOpen, setRightPanelOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('objects');

    // Refs for resizable panels
    const leftPanelRef = useRef<HTMLDivElement>(null);
    const rightPanelRef = useRef<HTMLDivElement>(null);
    const leftResizeRef = useRef<HTMLDivElement>(null);
    const rightResizeRef = useRef<HTMLDivElement>(null);

    // Resize state
    const [isLeftResizing, setIsLeftResizing] = useState(false);
    const [isRightResizing, setIsRightResizing] = useState(false);
    const [leftWidth, setLeftWidth] = useState(250);
    const [rightWidth, setRightWidth] = useState(250);

    // Handle panel resize
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isLeftResizing) {
                const newWidth = e.clientX;
                setLeftWidth(Math.max(200, Math.min(newWidth, 400)));
            } else if (isRightResizing) {
                const containerWidth = document.body.clientWidth;
                const newWidth = containerWidth - e.clientX;
                setRightWidth(Math.max(200, Math.min(newWidth, 400)));
            }
        };

        const handleMouseUp = () => {
            setIsLeftResizing(false);
            setIsRightResizing(false);
        };

        if (isLeftResizing || isRightResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isLeftResizing, isRightResizing]);

    // Toggle panels
    const toggleLeftPanel = () => setLeftPanelOpen(!leftPanelOpen);
    const toggleRightPanel = () => setRightPanelOpen(!rightPanelOpen);

    return (
        <div className={styles.editorContainer}>
            {/* Top Toolbar */}
            <div className={styles.toolbar}>
                <div className={styles.toolGroup}>
                    <button
                        className={`${styles.toolButton} ${!canUndo ? styles.disabled : ''}`}
                        title={t('editor.undo')}
                        onClick={undo}
                        disabled={!canUndo}
                    >
                        <Undo2 size={18} />
                    </button>
                    <button
                        className={`${styles.toolButton} ${!canRedo ? styles.disabled : ''}`}
                        title={t('editor.redo')}
                        onClick={redo}
                        disabled={!canRedo}
                    >
                        <Redo2 size={18} />
                    </button>
                </div>

                <div className={styles.toolGroup}>
                    <button
                        className={`${styles.toolButton} ${showGrid ? styles.active : ''}`}
                        title={t('editor.grid')}
                        onClick={toggleGrid}
                    >
                        <Grid size={18} />
                    </button>
                </div>

                <div className={styles.toolGroup}>
                    <button className={styles.toolButton} title={t('editor.save')}>
                        <Save size={18} />
                    </button>
                    <button className={styles.toolButton} title={t('editor.import')}>
                        <Upload size={18} />
                    </button>
                    <button className={styles.toolButton} title={t('editor.export')}>
                        <Download size={18} />
                    </button>
                </div>
            </div>

            <div className={styles.editorMain}>
                {/* Left Panel */}
                <div
                    className={`${styles.leftPanel} ${leftPanelOpen ? '' : styles.collapsed}`}
                    ref={leftPanelRef}
                    style={{ width: leftPanelOpen ? `${leftWidth}px` : '0' }}
                >
                    {leftPanelOpen && (
                        <>
                            <div className={styles.tabBar}>
                                <button
                                    className={`${styles.tab} ${activeTab === 'objects' ? styles.active : ''}`}
                                    onClick={() => setActiveTab('objects')}
                                >
                                    {t('editor.objectsTab')}
                                </button>
                                <button
                                    className={`${styles.tab} ${activeTab === 'library' ? styles.active : ''}`}
                                    onClick={() => setActiveTab('library')}
                                >
                                    {t('editor.libraryTab')}
                                </button>
                            </div>

                            {activeTab === 'objects' && <ObjectsPanel />}
                            {activeTab === 'library' && <LibraryPanel />}

                            {/* Resize handle */}
                            <div
                                className={styles.resizeHandle}
                                ref={leftResizeRef}
                                onMouseDown={() => setIsLeftResizing(true)}
                            >
                                <Minus size={16} className={styles.resizeIcon} />
                            </div>
                        </>
                    )}

                    {/* Toggle button */}
                    <button
                        className={styles.toggleButton}
                        onClick={toggleLeftPanel}
                        title={leftPanelOpen ? t('editor.closePanel') : t('editor.openPanel')}
                    >
                        {leftPanelOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                    </button>
                </div>

                {/* Content Area */}
                <div className={styles.contentArea}>
                    <Canvas />
                </div>

                {/* Right Panel */}
                <div
                    className={`${styles.rightPanel} ${rightPanelOpen ? '' : styles.collapsed}`}
                    ref={rightPanelRef}
                    style={{ width: rightPanelOpen ? `${rightWidth}px` : '0' }}
                >
                    {rightPanelOpen && (
                        <>
                            <PropertiesPanel />

                            {/* Resize handle */}
                            <div
                                className={styles.resizeHandle}
                                ref={rightResizeRef}
                                onMouseDown={() => setIsRightResizing(true)}
                            >
                                <Minus size={16} className={styles.resizeIcon} />
                            </div>
                        </>
                    )}

                    {/* Toggle button */}
                    <button
                        className={styles.toggleButton}
                        onClick={toggleRightPanel}
                        title={rightPanelOpen ? t('editor.closePanel') : t('editor.openPanel')}
                    >
                        {rightPanelOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main DesignEditor with Provider
const DesignEditor: React.FC = () => {
    // Initial objects setup
    const initialObjects = [
        {
            id: 1,
            type: 'text',
            name: 'Heading',
            x: 300,
            y: 100,
            properties: {
                text: 'Hello World',
                fontSize: 24,
                color: '#000000'
            }
        },
        {
            id: 2,
            type: 'rectangle',
            name: 'Background',
            x: 400,
            y: 300,
            properties: {
                width: 400,
                height: 200,
                color: '#3b82f6',
                radius: 8
            }
        }
    ];

    return (
        <DesignEditorProvider initialObjects={initialObjects}>
            <DesignEditorInner />
        </DesignEditorProvider>
    );
};

export default DesignEditor;