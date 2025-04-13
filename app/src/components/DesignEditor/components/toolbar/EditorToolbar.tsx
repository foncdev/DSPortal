// src/components/DesignEditor/components/toolbar/EditorToolbar.tsx
import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Undo2,
    Redo2,
    Grid,
    Save,
    Upload,
    Download,
    Copy,
    Trash2,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Lock,
    Unlock,
    LayoutTemplate,
    Layers
} from 'lucide-react';

import styles from '../../styles/DesignEditor.module.scss';
import { useDesignEditor } from '../../context/DesignEditorContext';
import { useClickOutside } from '../../hooks/useClickOutside';
import ToolGroup from './ToolGroup';
import ToolButton from './ToolButton';
import { TEMPLATES } from '../../constants/templates';

interface EditorToolbarProps {
    toggleToolbarButton: React.ReactNode;
}

/**
 * Toolbar component for the DesignEditor
 * Contains tools for manipulating the canvas and objects
 */
const EditorToolbar: React.FC<EditorToolbarProps> = ({ toggleToolbarButton }) => {
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
        addObject,
        toggleObjectLock,
        isObjectLocked: checkObjectLock,
        createLayoutGroup,
        onObjectStateChange,
        saveAsJSON,
        loadFromJSON
    } = useDesignEditor();

    const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
    const [showLayersDropdown, setShowLayersDropdown] = useState(false);
    const [isObjectLocked, setIsObjectLocked] = useState(false);

    // Refs for dropdowns
    const templateDropdownRef = useRef<HTMLDivElement>(null);
    const layersDropdownRef = useRef<HTMLDivElement>(null);

    // 선택된 객체가 변경될 때마다 잠금 상태 확인
    useEffect(() => {
        if (selectedObject) {
            // Context 함수로 잠금 상태 확인
            const locked = checkObjectLock(selectedObject);
            setIsObjectLocked(locked);
        } else {
            setIsObjectLocked(false);
        }
    }, [selectedObject, isObjectLocked]);

    // 객체 상태 변경 이벤트 구독
    useEffect(() => {
        // 상태 변경 이벤트 핸들러
        const handleStateChange = (event: {
            type: 'lock' | 'unlock' | 'visibility' | 'selection' | 'modification' | 'group';
            objectId: string | number | null;
        }) => {
            // 선택된 객체의 상태가 변경된 경우에만 처리
            if (
                selectedObject &&
                selectedObject.id === event.objectId &&
                (event.type === 'lock' || event.type === 'unlock')
            ) {
                // 잠금 상태 업데이트
                const newLockState = event.type === 'lock';
                setIsObjectLocked(newLockState);
            }
        };

        // 이벤트 구독 및 구독 해제 함수 저장
        const unsubscribe = onObjectStateChange(handleStateChange);

        // 컴포넌트 언마운트 시 구독 해제
        return unsubscribe;
    }, [selectedObject, onObjectStateChange]);

    // Handle click outside to close dropdowns
    useClickOutside(templateDropdownRef, () => {
        setShowTemplateDropdown(false);
    });

    useClickOutside(layersDropdownRef, () => {
        setShowLayersDropdown(false);
    });

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

    // 개선된 잠금 토글 함수
    const handleToggleLock = () => {
        if (!canvas || !selectedObject) return;

        try {
            // Context 함수 사용하여 잠금 상태 토글
            toggleObjectLock(selectedObject);
        } catch (error) {
            console.error("handleToggleLock error:", error);
            alert("Failed to change object lock state.");
        }
    };

    // Alignment functions
    const alignLeft = () => {
        if (!canvas || !selectedObject) return;
        selectedObject.set({ left: 0 });
        canvas.renderAll();
    };

    const alignCenter = () => {
        if (!canvas || !selectedObject) return;
        const canvasWidth = canvas.getWidth();
        const objectWidth = selectedObject.getScaledWidth();
        selectedObject.set({ left: (canvasWidth - objectWidth) / 2 });
        canvas.renderAll();
    };

    const alignRight = () => {
        if (!canvas || !selectedObject) return;
        const canvasWidth = canvas.getWidth();
        const objectWidth = selectedObject.getScaledWidth();
        selectedObject.set({ left: canvasWidth - objectWidth });
        canvas.renderAll();
    };

    // Add new layer
    const handleAddNewLayer = () => {
        if (!canvas) return;
        const layerName = `Layer ${Date.now()}`;
        createLayoutGroup(layerName);
        setShowLayersDropdown(false);
    };

    // Save and export functions
    const handleSaveAsImage = () => {
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = 'design.png';
        link.href = canvas.toDataURL({
            format: 'png',
            quality: 1
        });
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportAsJSON = () => {
        if (!canvas) return;
        const json = saveAsJSON();
        const blob = new Blob([json], { type: 'application/json' });
        const link = document.createElement('a');
        link.download = 'design.json';
        link.href = URL.createObjectURL(blob);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportJSON = () => {
        if (!canvas) return;
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (!files || files.length === 0) return;

            const file = files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result;
                if (typeof result === 'string') {
                    try {
                        loadFromJSON(result);
                    } catch (error) {
                        console.error('Error parsing JSON:', error);
                        alert('Failed to import JSON. The file might be corrupted or in an invalid format.');
                    }
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    // Apply a template
    const applyTemplate = (templateId: string) => {
        if (!canvas) return;

        // Find selected template
        const template = TEMPLATES.find(t => t.id === templateId);
        if (!template) return;

        // Confirm if canvas has objects
        if (canvas.getObjects().length > 0) {
            if (!window.confirm(t('editor.templateConfirmation'))) {
                return;
            }
        }

        // Clear canvas
        canvas.clear();

        // Create new layout group
        const layoutGroupId = `layout_${Date.now()}`;

        // Add template objects
        template.objects.forEach((obj, index) => {
            const objOptions = {
                ...obj.properties,
                name: obj.name
            };

            // First object is layout parent
            if (index === 0 && obj.type === 'rectangle') {
                objOptions.isLayoutParent = true;
                objOptions.layoutGroup = layoutGroupId;
            } else if (index > 0) {
                // Child objects
                objOptions.layoutGroup = layoutGroupId;
            }

            // @ts-ignore - Add object to canvas
            addObject(obj.type, objOptions);
        });

        // Close dropdown
        setShowTemplateDropdown(false);
    };

    return (
        <div className={styles.toolbar}>
            {/* History tools */}
            <ToolGroup>
                <ToolButton
                    title={t('editor.undo')}
                    onClick={undo}
                    disabled={!canUndo}
                    icon={<Undo2 size={18} />}
                />
                <ToolButton
                    title={t('editor.redo')}
                    onClick={redo}
                    disabled={!canRedo}
                    icon={<Redo2 size={18} />}
                />
            </ToolGroup>

            {/* Canvas tools */}
            <ToolGroup>
                <ToolButton
                    title={t('editor.grid')}
                    onClick={toggleGrid}
                    active={showGrid}
                    icon={<Grid size={18} />}
                />
            </ToolGroup>

            {/* Layers dropdown */}
            <ToolGroup ref={layersDropdownRef}>
                <ToolButton
                    title={t('editor.layers')}
                    onClick={() => setShowLayersDropdown(!showLayersDropdown)}
                    active={showLayersDropdown}
                    icon={<Layers size={18} />}
                />

                {showLayersDropdown && (
                    <div className={styles.templateDropdown}>
                        <div className={styles.dropdownTitle}>{t('editor.layers')}</div>
                        <button
                            className={styles.templateButton}
                            onClick={handleAddNewLayer}
                        >
                            {t('editor.addNewLayer')}
                        </button>
                    </div>
                )}
            </ToolGroup>

            {/* Templates dropdown */}
            <ToolGroup ref={templateDropdownRef}>
                <ToolButton
                    title={t('editor.layoutTemplates')}
                    onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                    active={showTemplateDropdown}
                    icon={<LayoutTemplate size={18} />}
                />

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
            </ToolGroup>

            {/* Object tools - only show when an object is selected */}
            {selectedObject && (
                <ToolGroup>
                    <ToolButton
                        title={t('editor.delete')}
                        onClick={handleDeleteObject}
                        icon={<Trash2 size={18} />}
                    />
                    <ToolButton
                        title={t('editor.duplicate')}
                        onClick={handleDuplicateObject}
                        icon={<Copy size={18} />}
                    />
                    <ToolButton
                        title={isObjectLocked ? t('editor.unlock') : t('editor.lock')}
                        onClick={handleToggleLock}
                        active={isObjectLocked}
                        icon={isObjectLocked ? <Lock size={18} /> : <Unlock size={18} />}
                    />
                </ToolGroup>
            )}

            {/* Alignment tools - only show when an object is selected */}
            {selectedObject && (
                <ToolGroup>
                    <ToolButton
                        title={t('editor.alignLeft')}
                        onClick={alignLeft}
                        icon={<AlignLeft size={18} />}
                    />
                    <ToolButton
                        title={t('editor.alignCenter')}
                        onClick={alignCenter}
                        icon={<AlignCenter size={18} />}
                    />
                    <ToolButton
                        title={t('editor.alignRight')}
                        onClick={alignRight}
                        icon={<AlignRight size={18} />}
                    />
                </ToolGroup>
            )}

            {/* File tools */}
            <ToolGroup>
                <ToolButton
                    title={t('editor.saveAsImage')}
                    onClick={handleSaveAsImage}
                    icon={<Save size={18} />}
                />
                <ToolButton
                    title={t('editor.importJSON')}
                    onClick={handleImportJSON}
                    icon={<Upload size={18} />}
                />
                <ToolButton
                    title={t('editor.exportJSON')}
                    onClick={handleExportAsJSON}
                    icon={<Download size={18} />}
                />
            </ToolGroup>

            {/* Toolbar toggle button */}
            <ToolGroup>
                {toggleToolbarButton}
            </ToolGroup>
        </div>
    );
};

export default EditorToolbar;