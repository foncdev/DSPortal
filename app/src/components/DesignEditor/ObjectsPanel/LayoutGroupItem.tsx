// src/components/DesignEditor/ObjectsPanel/LayoutGroupItem.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
    ChevronDown, ChevronRight, Monitor, Edit2,
    Text, Image, Square, Trash2, Eye, EyeOff,
    Lock, Unlock, AlertTriangle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDesignEditor, FabricObjectWithId, ObjectType } from '../DesignEditorContext';
import ObjectItem from './ObjectItem';
import styles from './ObjectsPanel.module.scss';

interface LayoutGroup {
    id: string;
    name: string;
    expanded: boolean;
    objects: FabricObjectWithId[];
}

interface LayoutGroupItemProps {
    group: LayoutGroup;
    selectedObjectId?: number | string;
    isDragOver: boolean;
    onToggleExpand: () => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onDragStart: (id: number | string) => void;
    onDragEnd: () => void;
    onDragOver: (id: number | string | null) => void;
    onDragOverIndex: (index: number | null) => void;
    onDropAtIndex: (index: number, e: React.DragEvent) => void;
}

const LayoutGroupItem: React.FC<LayoutGroupItemProps> = ({
                                                             group,
                                                             selectedObjectId,
                                                             isDragOver,
                                                             onToggleExpand,
                                                             onDragOver,
                                                             onDrop,
                                                             onDragStart,
                                                             onDragEnd,
                                                             onDragOver: setDragOverId,
                                                             onDragOverIndex,
                                                             onDropAtIndex
                                                         }) => {
    const { t } = useTranslation();
    const {
        canvas,
        addObject,
        selectObject,
        deleteLayoutGroup,
        updateObjectProperty
    } = useDesignEditor();

    const [editingName, setEditingName] = useState(false);
    const [groupName, setGroupName] = useState(group.name);
    const [dragOverObjectIndex, setDragOverObjectIndex] = useState<number | null>(null);
    const [isLayerVisible, setIsLayerVisible] = useState(true);
    const [isLayerLocked, setIsLayerLocked] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const nameInputRef = useRef<HTMLInputElement>(null);
    const isProcessingRef = useRef(false);

    // Update layer visibility and lock state on mount and when parent object changes
    useEffect(() => {
        if (!group.objects.length) return;

        const parentObject = group.objects.find(obj => obj.isLayoutParent);
        if (parentObject) {
            setIsLayerVisible(parentObject.visible !== false);
            setIsLayerLocked(!!parentObject.lockMovementX && !!parentObject.lockMovementY);
        }
    }, [group.objects]);

    // Start editing group name
    const startEditingName = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingName(true);
        setGroupName(group.name);

        // Focus the input after rendering
        setTimeout(() => {
            if (nameInputRef.current) {
                nameInputRef.current.focus();
                nameInputRef.current.select();
            }
        }, 10);
    };

    // Save group name
    const saveGroupName = () => {
        if (!canvas) return;

        setErrorMessage(null);

        // Find layout parent object
        const parentObject = group.objects.find(obj => obj.isLayoutParent);
        if (parentObject && groupName.trim()) {
            // Store currently selected object
            const currentSelectedObject = canvas.getActiveObject() as FabricObjectWithId;

            try {
                // Select parent to update its name
                selectObject(parentObject);
                updateObjectProperty('name', groupName);

                // Restore previous selection
                if (currentSelectedObject) {
                    selectObject(currentSelectedObject);
                }
            } catch (error) {
                console.error('Error saving group name:', error);
                setErrorMessage('Failed to update layer name');
            }
        }

        setEditingName(false);
    };

    // Handle keyboard input for name editing
    const handleNameKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            saveGroupName();
        } else if (e.key === 'Escape') {
            setEditingName(false);
            setGroupName(group.name);
        }
    };

    // Prevent event propagation when clicking on input field
    const handleNameInputClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    // Toggle layer visibility
    const toggleLayerVisibility = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!canvas || isProcessingRef.current) return;

        isProcessingRef.current = true;
        setErrorMessage(null);

        try {
            // Find all objects in this group
            const groupObjects = group.objects;
            if (!groupObjects.length) {
                isProcessingRef.current = false;
                return;
            }

            // Toggle visibility state
            const newVisibility = !isLayerVisible;

            // Update all objects in the group
            groupObjects.forEach(obj => {
                obj.set({
                    'visible': newVisibility,
                    'selectable': newVisibility ? obj.selectable : false,
                    'evented': newVisibility ? obj.evented : false
                });
                obj.setCoords();
            });

            // Update visibility state
            setIsLayerVisible(newVisibility);

            // Deselect if currently selected object is in this group and we're hiding it
            if (!newVisibility) {
                const selectedObj = canvas.getActiveObject() as FabricObjectWithId;
                if (selectedObj && groupObjects.some(obj => obj.id === selectedObj.id)) {
                    canvas.discardActiveObject();
                    selectObject(null);
                }
            }

            canvas.requestRenderAll();
        } catch (error) {
            console.error('Error toggling layer visibility:', error);
            setErrorMessage('Failed to toggle layer visibility');
        } finally {
            isProcessingRef.current = false;
        }
    };

    // Toggle layer lock state
    const toggleLayerLock = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!canvas || isProcessingRef.current) return;

        isProcessingRef.current = true;
        setErrorMessage(null);

        try {
            // Find all objects in this group
            const groupObjects = group.objects;
            if (!groupObjects.length) {
                isProcessingRef.current = false;
                return;
            }

            // Toggle lock state
            const newLockState = !isLayerLocked;

            // Update all objects in the group
            groupObjects.forEach(obj => {
                obj.set({
                    'lockMovementX': newLockState,
                    'lockMovementY': newLockState,
                    'lockRotation': newLockState,
                    'lockScalingX': newLockState,
                    'lockScalingY': newLockState,
                    'selectable': !newLockState
                });
                obj.setCoords();
            });

            // Update lock state
            setIsLayerLocked(newLockState);

            // Deselect if currently selected object is in this group and we're locking it
            if (newLockState) {
                const selectedObj = canvas.getActiveObject() as FabricObjectWithId;
                if (selectedObj && groupObjects.some(obj => obj.id === selectedObj.id)) {
                    canvas.discardActiveObject();
                    selectObject(null);
                }
            }

            canvas.requestRenderAll();
        } catch (error) {
            console.error('Error toggling layer lock state:', error);
            setErrorMessage('Failed to toggle layer lock state');
        } finally {
            isProcessingRef.current = false;
        }
    };

    // Add an object to this group
    const addObjectToGroup = (type: ObjectType, e: React.MouseEvent) => {
        e.stopPropagation();
        if (isProcessingRef.current) return;

        isProcessingRef.current = true;
        setErrorMessage(null);

        // Find parent object for positioning
        const parentObj = group.objects.find(obj => obj.isLayoutParent);
        if (!parentObj) {
            isProcessingRef.current = false;
            return;
        }

        try {
            // Calculate position within parent
            const left = parentObj.left || 0;
            const top = parentObj.top || 0;
            const width = parentObj.width || 400;
            const height = parentObj.height || 300;

            // Count objects of same type for naming
            const sameTypeCount = group.objects.filter(obj =>
                obj.objectType === type ||
                (obj.type === 'textbox' && type === 'text') ||
                (obj.type === 'rect' && type === 'rectangle')
            ).length;

            // Set object name based on type
            let objName = '';
            switch (type) {
                case 'text': objName = 'Text'; break;
                case 'image': objName = 'Image'; break;
                case 'video': objName = 'Video'; break;
                case 'rectangle': objName = 'Rectangle'; break;
                case 'circle': objName = 'Circle'; break;
                case 'triangle': objName = 'Triangle'; break;
                default: objName = 'Object';
            }

            // Add new object to group with delay to avoid event conflicts
            setTimeout(() => {
                try {
                    // Center the object in the parent
                    addObject(type, {
                        left: left + width / 2,
                        top: top + height / 2,
                        name: `${objName} ${sameTypeCount + 1}`,
                        layoutGroup: group.id,
                        // Inherit visibility and lock state from layer
                        visible: isLayerVisible,
                        selectable: isLayerVisible && !isLayerLocked,
                        lockMovementX: isLayerLocked,
                        lockMovementY: isLayerLocked,
                        lockRotation: isLayerLocked,
                        lockScalingX: isLayerLocked,
                        lockScalingY: isLayerLocked
                    });
                } catch (error) {
                    console.error('Error adding object to group:', error);
                    setErrorMessage('Failed to add object to layer');
                } finally {
                    isProcessingRef.current = false;
                }
            }, 50);
        } catch (error) {
            console.error('Error setting up object addition:', error);
            setErrorMessage('Failed to add object to layer');
            isProcessingRef.current = false;
        }
    };

    // Delete this layout group
    const handleDeleteGroup = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isProcessingRef.current) return;

        // Set flag to prevent concurrent operations
        isProcessingRef.current = true;
        setErrorMessage(null);

        try {
            // Confirm deletion
            if (window.confirm(t('editor.deleteGroupConfirmation'))) {
                deleteLayoutGroup(group.id);
            } else {
                // If cancelled, release processing flag
                isProcessingRef.current = false;
            }
        } catch (error) {
            console.error('Error deleting layer group:', error);
            setErrorMessage('Failed to delete layer');
            isProcessingRef.current = false;
        }
    };

    // Handle drag over for object reordering
    const handleDragOverObject = (index: number, e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverObjectIndex(index);
        onDragOverIndex(index);
    };

    // Handle drop for object reordering
    const handleDropAtIndex = (index: number, e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onDropAtIndex(index, e);
        setDragOverObjectIndex(null);
    };

    return (
        <div
            className={`${styles.layoutGroup} ${isDragOver ? styles.dragOver : ''}`}
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            {/* Error message display */}
            {errorMessage && (
                <div className={styles.errorMessage}>
                    <AlertTriangle size={14} />
                    <span>{errorMessage}</span>
                    <button onClick={() => setErrorMessage(null)}>×</button>
                </div>
            )}

            <div className={styles.layoutGroupHeader} onClick={onToggleExpand}>
                <div className={styles.layoutGroupInfo}>
                    {group.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <Monitor size={16} className={styles.layoutIcon} />

                    {editingName ? (
                        <input
                            ref={nameInputRef}
                            type="text"
                            className={styles.nameInput}
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            onBlur={saveGroupName}
                            onKeyDown={handleNameKeyPress}
                            onClick={handleNameInputClick}
                        />
                    ) : (
                        <span className={`${styles.layoutGroupName} ${!isLayerVisible ? styles.hidden : ''}`}>
                            {group.name}
                            <button
                                className={styles.editNameButton}
                                onClick={startEditingName}
                                title={t('editor.renameGroup')}
                            >
                                <Edit2 size={14} />
                            </button>
                        </span>
                    )}
                </div>

                <div className={styles.layoutGroupActions}>
                    {/* Layer visibility toggle */}
                    <button
                        className={styles.objectAction}
                        onClick={toggleLayerVisibility}
                        title={isLayerVisible ? t('editor.hideLayer') : t('editor.showLayer')}
                        disabled={isProcessingRef.current}
                    >
                        {isLayerVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>

                    {/* Layer lock toggle */}
                    <button
                        className={styles.objectAction}
                        onClick={toggleLayerLock}
                        title={isLayerLocked ? t('editor.unlockLayer') : t('editor.lockLayer')}
                        disabled={isProcessingRef.current}
                    >
                        {isLayerLocked ? <Unlock size={16} /> : <Lock size={16} />}
                    </button>

                    {/* Quick add object buttons */}
                    <div className={styles.objectTypeButtons}>
                        <button
                            className={styles.objectTypeButton}
                            onClick={(e) => addObjectToGroup('text', e)}
                            title={t('editor.addTextToGroup')}
                            disabled={isProcessingRef.current || !isLayerVisible}
                        >
                            <Text size={14} />
                        </button>
                        <button
                            className={styles.objectTypeButton}
                            onClick={(e) => addObjectToGroup('rectangle', e)}
                            title={t('editor.addShapeToGroup')}
                            disabled={isProcessingRef.current || !isLayerVisible}
                        >
                            <Square size={14} />
                        </button>
                        <button
                            className={styles.objectTypeButton}
                            onClick={(e) => addObjectToGroup('image', e)}
                            title={t('editor.addImageToGroup')}
                            disabled={isProcessingRef.current || !isLayerVisible}
                        >
                            <Image size={14} />
                        </button>
                    </div>

                    {/* Delete layer button */}
                    <button
                        className={`${styles.objectAction} ${styles.deleteAction}`}
                        onClick={handleDeleteGroup}
                        title={t('editor.deleteGroup')}
                        disabled={isProcessingRef.current}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {group.expanded && (
                <div className={styles.layoutGroupContent}>
                    {/* First drop zone for reordering */}
                    <div
                        className={`${styles.dropZone} ${dragOverObjectIndex === 0 ? styles.active : ''}`}
                        onDragOver={(e) => handleDragOverObject(0, e)}
                        onDrop={(e) => handleDropAtIndex(0, e)}
                    />

                    {/* Render objects in the group */}
                    {group.objects.map((object, index) => (
                        <React.Fragment key={object.id}>
                            <ObjectItem
                                object={object}
                                isSelected={selectedObjectId === object.id}
                                isGroupChild={!object.isLayoutParent} // Only treat non-parent objects as children
                                isDragOver={false}
                                onSelect={() => selectObject(object)}
                                onDragStart={onDragStart}
                                onDragEnd={onDragEnd}
                                onDragOver={setDragOverId}
                            />

                            {/* Drop zone after each object */}
                            <div
                                className={`${styles.dropZone} ${dragOverObjectIndex === index + 1 ? styles.active : ''}`}
                                onDragOver={(e) => handleDragOverObject(index + 1, e)}
                                onDrop={(e) => handleDropAtIndex(index + 1, e)}
                            />
                        </React.Fragment>
                    ))}

                    {/* Empty group message */}
                    {group.objects.length === 0 && (
                        <div className={styles.emptyGroupMessage}>
                            {t('editor.groupEmpty')}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LayoutGroupItem;