// src/components/DesignEditor/DesignEditor.tsx
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
    Minus,
    Copy,
    Trash2,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Lock,
    Unlock,
    LayoutTemplate,
    Maximize,
    Minimize,
    FileText
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styles from './DesignEditor.module.scss';
import Canvas from './Canvas/Canvas';
import ObjectsPanel from './ObjectsPanel/ObjectsPanel';
import LibraryPanel from './LibraryPanel/LibraryPanel';
import PropertiesPanel from './PropertiesPanel/PropertiesPanel';
import FileManagerPanel from './FileManagerPanel/FileManagerPanel'; // 새로 추가된 파일매니저 패널
import { DesignEditorProvider, useDesignEditor } from './DesignEditorContext';

// 기본 레이아웃 템플릿 정의
const TEMPLATES = [
    {
        id: 'template-basic',
        name: 'Basic Layout',
        objects: [
            {
                type: 'rectangle',
                name: 'Background',
                properties: { width: 800, height: 600, fill: '#ffffff', selectable: true }
            },
            {
                type: 'text',
                name: 'Title',
                properties: { text: 'Title', fontSize: 32, top: 50, left: 400, textAlign: 'center', originX: 'center' }
            },
            {
                type: 'text',
                name: 'Subtitle',
                properties: { text: 'Subtitle', fontSize: 24, top: 100, left: 400, textAlign: 'center', originX: 'center' }
            }
        ]
    },
    {
        id: 'template-banner',
        name: 'Banner Layout',
        objects: [
            {
                type: 'rectangle',
                name: 'Background',
                properties: { width: 800, height: 600, fill: '#f2f2f2', selectable: true }
            },
            {
                type: 'rectangle',
                name: 'Header',
                properties: { width: 800, height: 100, fill: '#3b82f6', top: 0, left: 0 }
            },
            {
                type: 'text',
                name: 'Header Text',
                properties: { text: 'Header Text', fontSize: 28, top: 50, left: 400, fill: '#ffffff', textAlign: 'center', originX: 'center', originY: 'center' }
            }
        ]
    }
];

// Design Editor Inner Component (with access to context)
const DesignEditorInner: React.FC = () => {
    const { t } = useTranslation();
    const {
        canvas,
        canUndo,
        canRedo,
        undo,
        redo,
        showGrid,
        toggleGrid,
        selectedObject,
        deleteObject,
        cloneObject,
        addObject
    } = useDesignEditor();

    // 패널 상태 관리
    const [leftPanelOpen, setLeftPanelOpen] = useState(true);
    const [rightPanelOpen, setRightPanelOpen] = useState(true);
    const [toolbarOpen, setToolbarOpen] = useState(true); // 툴바 표시 여부 상태
    const [activeTab, setActiveTab] = useState('objects'); // 'objects', 'library', 'filemanager'
    const [isObjectLocked, setIsObjectLocked] = useState(false);
    const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);

    // Template dropdown reference
    const templateDropdownRef = useRef<HTMLDivElement>(null);

    // Close template dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                templateDropdownRef.current &&
                !templateDropdownRef.current.contains(event.target as Node)
            ) {
                setShowTemplateDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Refs for resizable panels
    const leftPanelRef = useRef<HTMLDivElement>(null);
    const rightPanelRef = useRef<HTMLDivElement>(null);
    const leftResizeRef = useRef<HTMLDivElement>(null);
    const rightResizeRef = useRef<HTMLDivElement>(null);

    // Resize state
    const [isLeftResizing, setIsLeftResizing] = useState(false);
    const [isRightResizing, setIsRightResizing] = useState(false);
    const [leftWidth, setLeftWidth] = useState(280); // 왼쪽 패널 너비 증가
    const [rightWidth, setRightWidth] = useState(280); // 오른쪽 패널 너비 증가

    // Handle panel resize
    React.useEffect(() => {
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
    const toggleToolbar = () => setToolbarOpen(!toolbarOpen); // 툴바 표시 여부 전환

    // Object manipulation functions
    const handleDeleteObject = () => {
        if (selectedObject) {
            deleteObject();
        }
    };

    const handleDuplicateObject = () => {
        if (selectedObject) {
            cloneObject();
        }
    };

    const handleToggleLock = () => {
        if (!canvas || !selectedObject) {return;}

        const newLockState = !isObjectLocked;
        setIsObjectLocked(newLockState);

        // Update the object's selectable and lockMovementX/Y properties
        selectedObject.set({
            selectable: !newLockState,
            lockMovementX: newLockState,
            lockMovementY: newLockState,
            lockRotation: newLockState,
            lockScalingX: newLockState,
            lockScalingY: newLockState
        });

        canvas.renderAll();
    };

    // Alignment functions
    const alignLeft = () => {
        if (!canvas || !selectedObject) {return;}

        selectedObject.set({
            left: 0
        });
        canvas.renderAll();
    };

    const alignCenter = () => {
        if (!canvas || !selectedObject) {return;}

        const canvasWidth = canvas.getWidth();
        const objectWidth = selectedObject.getScaledWidth();

        selectedObject.set({
            left: (canvasWidth - objectWidth) / 2
        });
        canvas.renderAll();
    };

    const alignRight = () => {
        if (!canvas || !selectedObject) {return;}

        const canvasWidth = canvas.getWidth();
        const objectWidth = selectedObject.getScaledWidth();

        selectedObject.set({
            left: canvasWidth - objectWidth
        });
        canvas.renderAll();
    };

    // Save canvas as image
    const saveAsImage = () => {
        if (!canvas) {return;}

        // Create a temporary link element
        const link = document.createElement('a');
        link.download = 'design.png';

        // Convert canvas to data URL and set as link href
        link.href = canvas.toDataURL({
            format: 'png',
            quality: 1
        });

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Export canvas as JSON
    const exportAsJSON = () => {
        if (!canvas) {return;}

        // Convert canvas to JSON
        const json = JSON.stringify(canvas.toJSON(['id', 'objectType', 'name']));

        // Create a temporary link element
        const link = document.createElement('a');
        link.download = 'design.json';

        // Convert JSON to data URL and set as link href
        const blob = new Blob([json], { type: 'application/json' });
        link.href = URL.createObjectURL(blob);

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Import JSON
    const importJSON = () => {
        if (!canvas) {return;}

        // Create a file input element
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        // Handle file selection
        input.onchange = (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (!files || files.length === 0) {return;}

            const file = files[0];
            const reader = new FileReader();

            reader.onload = (event) => {
                const result = event.target?.result;
                if (typeof result === 'string') {
                    try {
                        const json = JSON.parse(result);
                        canvas.loadFromJSON(json, () => {
                            canvas.renderAll();
                        });
                    } catch (error) {
                        console.error('Error parsing JSON:', error);
                    }
                }
            };

            reader.readAsText(file);
        };

        // Trigger file selection dialog
        input.click();
    };

    // Apply a template
    const applyTemplate = (templateId: string) => {
        if (!canvas) {return;}

        // 선택한 템플릿 찾기
        const template = TEMPLATES.find(t => t.id === templateId);
        if (!template) {return;}

        // 확인 대화상자
        if (canvas.getObjects().length > 0) {
            if (!window.confirm(t('editor.templateConfirmation'))) {
                return;
            }
        }

        // 현재 캔버스에 있는 모든 객체 제거
        canvas.clear();

        // 새 레이아웃 그룹 생성
        const layoutGroupId = `layout_${Date.now()}`;
        let layoutObject: FabricObjectWithId | null = null;

        // 템플릿의 객체들 추가
        template.objects.forEach((obj, index) => {
            const objOptions = {
                ...obj.properties,
                name: obj.name
            };

            // 템플릿의 첫 번째 객체를 레이아웃 부모로 설정 (보통 배경 객체)
            if (index === 0 && obj.type === 'rectangle') {
                // Add layout parent flag
                objOptions.isLayoutParent = true;
                objOptions.layoutGroup = layoutGroupId;
            } else if (index > 0) {
                // Add child objects to layout group
                objOptions.layoutGroup = layoutGroupId;
            }

            // @ts-ignore - obj.type과 ObjectType 타입 일치 문제
            addObject(obj.type, objOptions);
        });

        // 템플릿 드롭다운 닫기
        setShowTemplateDropdown(false);
    };

    // 컴포넌트를 캔버스에 추가하는 함수 - 파일매니저 패널에서 호출됨
    const addComponentToCanvas = (component: any) => {
        if (!canvas) {return;}

        // 컴포넌트 유형에 따라 다르게 처리
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

            // 레이아웃에 포함된 객체들 추가
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

    // Check if selected object is locked
    useEffect(() => {
        if (selectedObject) {
            setIsObjectLocked(
                !!(selectedObject.lockMovementX && selectedObject.lockMovementY)
            );
        } else {
            setIsObjectLocked(false);
        }
    }, [selectedObject]);

    // 툴바 토글 버튼
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

            {/* Top Toolbar */}
            {toolbarOpen && (
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

                    {/* Templates dropdown */}
                    <div className={styles.toolGroup} ref={templateDropdownRef}>
                        <button
                            className={`${styles.toolButton} ${showTemplateDropdown ? styles.active : ''}`}
                            title={t('editor.layoutTemplates')}
                            onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                        >
                            <LayoutTemplate size={18} />
                        </button>

                        {showTemplateDropdown && (
                            <div className={styles.templateDropdown}>
                                <div className={styles.dropdownTitle}>{t('editor.layoutTemplates')}</div>
                                {TEMPLATES.map(template => (
                                    <button
                                        key={template.id}
                                        className={styles.templateButton}
                                        onClick={() => applyTemplate(template.id)}
                                    >
                                        {t(`editor.${template.id.replace('-', '')}`)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {selectedObject && (
                        <div className={styles.toolGroup}>
                            <button
                                className={styles.toolButton}
                                title={t('editor.delete')}
                                onClick={handleDeleteObject}
                            >
                                <Trash2 size={18} />
                            </button>
                            <button
                                className={styles.toolButton}
                                title={t('editor.duplicate')}
                                onClick={handleDuplicateObject}
                            >
                                <Copy size={18} />
                            </button>
                            <button
                                className={`${styles.toolButton} ${isObjectLocked ? styles.active : ''}`}
                                title={isObjectLocked ? t('editor.unlock') : t('editor.lock')}
                                onClick={handleToggleLock}
                            >
                                {isObjectLocked ? <Lock size={18} /> : <Unlock size={18} />}
                            </button>
                        </div>
                    )}

                    {selectedObject && (
                        <div className={styles.toolGroup}>
                            <button
                                className={styles.toolButton}
                                title={t('editor.alignLeft')}
                                onClick={alignLeft}
                            >
                                <AlignLeft size={18} />
                            </button>
                            <button
                                className={styles.toolButton}
                                title={t('editor.alignCenter')}
                                onClick={alignCenter}
                            >
                                <AlignCenter size={18} />
                            </button>
                            <button
                                className={styles.toolButton}
                                title={t('editor.alignRight')}
                                onClick={alignRight}
                            >
                                <AlignRight size={18} />
                            </button>
                        </div>
                    )}

                    <div className={styles.toolGroup}>
                        <button className={styles.toolButton} title={t('editor.save')} onClick={saveAsImage}>
                            <Save size={18} />
                        </button>
                        <button className={styles.toolButton} title={t('editor.import')} onClick={importJSON}>
                            <Upload size={18} />
                        </button>
                        <button className={styles.toolButton} title={t('editor.export')} onClick={exportAsJSON}>
                            <Download size={18} />
                        </button>
                    </div>

                    {/* 툴바 토글 버튼 - 툴바가 표시되었을 때 */}
                    <div className={styles.toolGroup}>
                        {renderToolbarToggleButton()}
                    </div>
                </div>
            )}

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
                                <button
                                    className={`${styles.tab} ${activeTab === 'filemanager' ? styles.active : ''}`}
                                    onClick={() => setActiveTab('filemanager')}
                                >
                                    <FileText size={16} className={styles.tabIcon} />
                                    {t('editor.components')}
                                </button>
                            </div>

                            {activeTab === 'objects' && <ObjectsPanel />}
                            {activeTab === 'library' && <LibraryPanel />}
                            {activeTab === 'filemanager' && <FileManagerPanel onAddComponent={addComponentToCanvas} />}

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
const DesignEditor: React.FC = () => (
    <DesignEditorProvider>
        <DesignEditorInner />
    </DesignEditorProvider>
);

export default DesignEditor;