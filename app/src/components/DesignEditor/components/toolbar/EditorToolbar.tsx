// src/components/DesignEditor/components/toolbar/EditorToolbar.tsx
import React, { useRef, useState } from 'react';
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
    LayoutTemplate
} from 'lucide-react';

import styles from '../../styles/DesignEditor.module.scss';
import { useDesignEditor } from '../../context/DesignEditorContext';
import { useClickOutside } from '../../hooks/useClickOutside';
import ToolGroup from './ToolGroup';
import ToolButton from './ToolButton';
import { TEMPLATES } from '../../constants/templates';

interface EditorToolbarProps {
    toggleToolbarButton: () => React.ReactNode;
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
        addObject
    } = useDesignEditor();

    const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
    const [isObjectLocked, setIsObjectLocked] = useState(false);

    // Ref for template dropdown
    const templateDropdownRef = useRef<HTMLDivElement>(null);

    // Handle click outside to close dropdowns
    useClickOutside(templateDropdownRef, () => {
        setShowTemplateDropdown(false);
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

    const handleToggleLock = () => {
        if (!canvas || !selectedObject) {return;}

        try {
            // Calculate new lock state
            const newLockState = !isObjectLocked;

            // Find target object in canvas
            const targetObj = selectedObject;

            if (!targetObj) {
                throw new Error("Object not found");
            }

            // Set lock properties
            targetObj.set({
                lockMovementX: newLockState,
                lockMovementY: newLockState,
                lockRotation: newLockState,
                lockScalingX: newLockState,
                lockScalingY: newLockState,
                selectable: true
            });

            // Update UI state
            setIsObjectLocked(newLockState);

            // Update canvas
            targetObj.setCoords();
            canvas.renderAll();
        } catch (error) {
            console.error("handleToggleLock error:", error);
            alert("Failed to change object lock state.");
        }
    };

    // Alignment functions
    const alignLeft = () => {
        if (!canvas || !selectedObject) {return;}
        selectedObject.set({ left: 0 });
        canvas.renderAll();
    };

    const alignCenter = () => {
        if (!canvas || !selectedObject) {return;}
        const canvasWidth = canvas.getWidth();
        const objectWidth = selectedObject.getScaledWidth();
        selectedObject.set({ left: (canvasWidth - objectWidth) / 2 });
        canvas.renderAll();
    };

    const alignRight = () => {
        if (!canvas || !selectedObject) {return;}
        const canvasWidth = canvas.getWidth();
        const objectWidth = selectedObject.getScaledWidth();
        selectedObject.set({ left: canvasWidth - objectWidth });
        canvas.renderAll();
    };

    // Save and export functions
    const saveAsImage = () => {
        if (!canvas) {return;}
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

    const exportAsJSON = () => {
        if (!canvas) {return;}
        const json = JSON.stringify(canvas.toJSON(['id', 'objectType', 'name']));
        const blob = new Blob([json], { type: 'application/json' });
        const link = document.createElement('a');
        link.download = 'design.json';
        link.href = URL.createObjectURL(blob);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const importJSON = () => {
        if (!canvas) {return;}
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
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
        input.click();
    };

    // Apply a template
    const applyTemplate = (templateId: string) => {
        if (!canvas) {return;}

        // Find selected template
        const template = TEMPLATES.find(t => t.id === templateId);
        if (!template) {return;}

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
                    title={t('editor.save')}
                    onClick={saveAsImage}
                    icon={<Save size={18} />}
                />
                <ToolButton
                    title={t('editor.import')}
                    onClick={importJSON}
                    icon={<Upload size={18} />}
                />
                <ToolButton
                    title={t('editor.export')}
                    onClick={exportAsJSON}
                    icon={<Download size={18} />}
                />
            </ToolGroup>

            {/* Toolbar toggle button */}
            <ToolGroup>
                {toggleToolbarButton()}
            </ToolGroup>
        </div>
    );
};

export default EditorToolbar;