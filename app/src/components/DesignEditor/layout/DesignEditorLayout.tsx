// src/components/DesignEditor/layout/DesignEditorLayout.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Maximize, Minimize } from 'lucide-react';

import styles from '../styles/DesignEditor.module.scss';
import EditorToolbar from '../components/toolbar/EditorToolbar';
import LeftPanel from '../components/panels/LeftPanel';
import RightPanel from '../components/panels/RightPanel';
import Canvas from '../components/Canvas/Canvas';
import { useResizablePanel } from '../hooks/useResizablePanel';
import { useDesignEditor } from '../context/DesignEditorContext';

/**
 * DesignEditor의 메인 레이아웃 컴포넌트
 * 레이아웃 구조와 패널 상태 관리
 */
const DesignEditorLayout: React.FC = () => {
    const { t } = useTranslation();
    const { canvas } = useDesignEditor();

    // 패널 상태 관리
    const [leftPanelOpen, setLeftPanelOpen] = useState(true);
    const [rightPanelOpen, setRightPanelOpen] = useState(true);
    const [toolbarOpen, setToolbarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('objects'); // 'objects', 'library', 'filemanager'

    // 왼쪽 패널 리사이징 설정
    const {
        width: leftWidth,
        panelRef: leftPanelRef,
        resizeHandleRef: leftResizeRef,
        startResizing: startLeftResizing
    } = useResizablePanel(280, 200, 400, 'left');

    // 오른쪽 패널 리사이징 설정
    const {
        width: rightWidth,
        panelRef: rightPanelRef,
        resizeHandleRef: rightResizeRef,
        startResizing: startRightResizing
    } = useResizablePanel(280, 200, 400, 'right');

    // 패널 토글 함수
    const toggleLeftPanel = () => setLeftPanelOpen(!leftPanelOpen);
    const toggleRightPanel = () => setRightPanelOpen(!rightPanelOpen);
    const toggleToolbar = () => setToolbarOpen(!toolbarOpen);

    // 캔버스 크기 조절 (패널 상태에 따라)
    useEffect(() => {
        if (!canvas) {return;}

        // 윈도우 리사이즈 시 캔버스 렌더링 갱신
        const handleResize = () => {
            setTimeout(() => {
                canvas.requestRenderAll();
            }, 100);
        };

        window.addEventListener('resize', handleResize);

        // 패널 상태 변경 시 캔버스 렌더링 갱신
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [canvas, leftPanelOpen, rightPanelOpen, leftWidth, rightWidth]);

    // 캔버스 렌더링 문제 해결을 위한 추가 효과
    useEffect(() => {
        if (!canvas) {return;}

        // 캔버스 초기화 후 렌더링 강제화
        const refreshCanvas = () => {
            canvas.requestRenderAll();
        };

        // 주기적으로 캔버스 리프레시 (0.5초마다)
        const renderInterval = setInterval(refreshCanvas, 500);

        return () => {
            clearInterval(renderInterval);
        };
    }, [canvas]);

    // 툴바 토글 버튼 렌더링
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
            {/* 툴바 토글 버튼 - 툴바가 숨겨졌을 때 표시 */}
            {!toolbarOpen && (
                <div className={styles.toolbarToggleContainer}>
                    {renderToolbarToggleButton()}
                </div>
            )}

            {/* 상단 툴바 */}
            {toolbarOpen && (
                <EditorToolbar
                    toggleToolbarButton={renderToolbarToggleButton}
                />
            )}

            <div className={styles.editorMain}>
                {/* 왼쪽 패널 */}
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

                {/* 콘텐츠 영역 */}
                <div className={styles.contentArea}>
                    <Canvas />
                </div>

                {/* 오른쪽 패널 */}
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