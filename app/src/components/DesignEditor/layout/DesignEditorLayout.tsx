// src/components/DesignEditor/layout/DesignEditorLayout.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Maximize, Minimize } from 'lucide-react';

import styles from '../styles/DesignEditor.module.scss';
import EditorToolbar from '../components/toolbar/EditorToolbar';
import LeftPanel from '../components/panels/LeftPanel';
import RightPanel from '../components/panels/RightPanel';
import Canvas from '../components/Canvas/Canvas';
import { useResizablePanel } from '../hooks/useResizablePanel';

/**
 * Main layout component for the DesignEditor
 * Manages the layout structure and panel states
 */
const DesignEditorLayout: React.FC = () => {
    const { t } = useTranslation();

    // Panel state management
    const [leftPanelOpen, setLeftPanelOpen] = useState(true);
    const [rightPanelOpen, setRightPanelOpen] = useState(true);
    const [toolbarOpen, setToolbarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('objects'); // 'objects', 'library', 'filemanager'

    // Resizable panels
    const {
        width: leftWidth,
        ref: leftPanelRef,
        resizeHandleRef: leftResizeRef,
        isResizing: isLeftResizing,
        startResizing: startLeftResizing
    } = useResizablePanel(280);

    const {
        width: rightWidth,
        ref: rightPanelRef,
        resizeHandleRef: rightResizeRef,
        isResizing: isRightResizing,
        startResizing: startRightResizing
    } = useResizablePanel(280);

    // Toggle panels
    const toggleLeftPanel = () => setLeftPanelOpen(!leftPanelOpen);
    const toggleRightPanel = () => setRightPanelOpen(!rightPanelOpen);
    const toggleToolbar = () => setToolbarOpen(!toolbarOpen);

    // Render toolbar toggle button
    const renderToolbarToggleButton = () => (
        <button
            className={styles.toolbarToggleButton}
            onClick={toggleToolbar}
            title={toolbarOpen ? t('editor.hideToolbar') : t('editor.showToolbar')}
        >
            {toolbarOpen ? <Minimize size={16} /> : <Maximize size={16} />}
        </button>
    );

    return (
        <div className={styles.editorContainer}>
            {/* Toolbar toggle button - shown when toolbar is hidden */}
            {!toolbarOpen && (
                <div className={styles.toolbarToggleContainer}>
                    {renderToolbarToggleButton()}
                </div>
            )}

            {/* Top Toolbar */}
            {toolbarOpen && (
                <EditorToolbar
                    toggleToolbarButton={renderToolbarToggleButton}
                />
            )}

            <div className={styles.editorMain}>
                {/* Left Panel */}
                <LeftPanel
                    isOpen={leftPanelOpen}
                    width={leftWidth}
                    panelRef={leftPanelRef}
                    resizeHandleRef={leftResizeRef}
                    onToggle={toggleLeftPanel}
                    onStartResize={startLeftResizing}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                {/* Content Area */}
                <div className={styles.contentArea}>
                    <Canvas />
                </div>

                {/* Right Panel */}
                <RightPanel
                    isOpen={rightPanelOpen}
                    width={rightWidth}
                    panelRef={rightPanelRef}
                    resizeHandleRef={rightResizeRef}
                    onToggle={toggleRightPanel}
                    onStartResize={startRightResizing}
                />
            </div>
        </div>
    );
};

export default DesignEditorLayout;