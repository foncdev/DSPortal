// src/components/DesignEditor/components/ObjectsPanel/LayoutGroupItem.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
    ChevronDown, ChevronRight, Monitor, Edit2,
    Text, Image, Square, Circle, Triangle, Trash2, Eye, EyeOff,
    Lock, Unlock, AlertTriangle, Film, MoreHorizontal
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDesignEditor, FabricObjectWithId, LayerGroup, ObjectType } from '../../context/DesignEditorContext';
import ObjectItem from './ObjectItem';
import styles from './ObjectsPanel.module.scss';

interface LayoutGroupItemProps {
    group: LayerGroup;
    isActive: boolean;
    selectedObjectId?: number | string;
    isDragOver: boolean;
    onToggleExpand: () => void;
    onGroupSelect: () => void;
    onActivate: () => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onDragStart: (id: number | string) => void;
    onDragEnd: () => void;
    onDragOverId: (id: number | string | null) => void;
    onDragOverIndex: (index: number | null) => void;
}

/**
 * Component to display and manage layout groups in the objects panel
 */
const LayoutGroupItem: React.FC<LayoutGroupItemProps> = ({
                                                             group,
                                                             isActive,
                                                             selectedObjectId,
                                                             onToggleExpand,
                                                             onGroupSelect,
                                                             isDragOver,
                                                             onActivate,
                                                             onDragOver,
                                                             onDrop,
                                                             onDragStart,
                                                             onDragEnd,
                                                             onDragOverId,
                                                             onDragOverIndex
                                                         }) => {
    const { t } = useTranslation();
    const {
        canvas,
        addObject,
        selectObject,
        deleteLayoutGroup,
        toggleGroupVisibility,
        toggleGroupLock,
        renameGroup,
        addObjectToGroup,
        moveObjectToGroup, // Added for drag and drop between groups
        setObjectZIndex // Added for reordering objects within groups
    } = useDesignEditor();

    const [editingName, setEditingName] = useState(false);
    const [groupName, setGroupName] = useState(group.name);
    const [dragOverObjectIndex, setDragOverObjectIndex] = useState<number | null>(null);
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [actionsMenuPosition, setActionsMenuPosition] = useState({ top: 0, left: 0 });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isGroupDragging, setIsGroupDragging] = useState(false);

    const nameInputRef = useRef<HTMLInputElement>(null);
    const actionsButtonRef = useRef<HTMLButtonElement>(null);
    const actionsMenuRef = useRef<HTMLDivElement>(null);
    const groupRef = useRef<HTMLDivElement>(null);
    const isProcessingRef = useRef(false);
    const dropZonesRef = useRef<HTMLDivElement[]>([]);

    // Update group name when group changes
    useEffect(() => {
        setGroupName(group.name);
    }, [group.name]);

    // Handle click outside to close actions menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                actionsMenuRef.current &&
                !actionsMenuRef.current.contains(event.target as Node) &&
                actionsButtonRef.current &&
                !actionsButtonRef.current.contains(event.target as Node)
            ) {
                setShowActionsMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Add effect to clean up drag states when component unmounts
    useEffect(() => {
        return () => {
            resetAllDragStates();
        };
    }, []);

    // Reset all drag-related states
    const resetAllDragStates = () => {
        setDragOverObjectIndex(null);
        onDragOverIndex(null);
        onDragOverId(null);
        setIsGroupDragging(false);

        // Reset any active drop zones
        dropZonesRef.current.forEach(zone => {
            if (zone) {
                zone.classList.remove(styles.active);
            }
        });

        // Remove drag over styling from group
        if (groupRef.current) {
            groupRef.current.classList.remove(styles.dragOver);
        }
    };

    // Start editing group name
    const startEditingName = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingName(true);
        setGroupName(group.name);
        setErrorMessage(null);

        // Focus input after rendering
        setTimeout(() => {
            if (nameInputRef.current) {
                nameInputRef.current.focus();
                nameInputRef.current.select();
            }
        }, 10);
    };

    // Save group name
    const saveGroupName = () => {
        if (!canvas || isProcessingRef.current) {return;}

        isProcessingRef.current = true;
        setErrorMessage(null);

        try {
            if (groupName.trim()) {
                renameGroup(group.id, groupName);
            }
        } catch (error) {
            console.error('Error saving group name:', error);
            setErrorMessage('Failed to update layer name');
        } finally {
            setEditingName(false);
            isProcessingRef.current = false;
        }
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
    const handleToggleVisibility = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!canvas || isProcessingRef.current) {return;}

        isProcessingRef.current = true;
        setErrorMessage(null);

        try {
            toggleGroupVisibility(group.id);
        } catch (error) {
            console.error('Error toggling layer visibility:', error);
            setErrorMessage('Failed to toggle layer visibility');
        } finally {
            isProcessingRef.current = false;
        }
    };

    // Toggle layer lock state
    const handleToggleLock = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!canvas || isProcessingRef.current) {return;}

        isProcessingRef.current = true;
        setErrorMessage(null);

        try {
            toggleGroupLock(group.id);
        } catch (error) {
            console.error('Error toggling layer lock:', error);
            setErrorMessage('Failed to toggle layer lock');
        } finally {
            isProcessingRef.current = false;
        }
    };

    // Add an object to this group
    const handleAddObjectToGroup = (type: ObjectType) => {
        if (isProcessingRef.current) {return;}

        isProcessingRef.current = true;
        setErrorMessage(null);
        setShowActionsMenu(false);

        try {
            addObjectToGroup(group.id, type);
        } catch (error) {
            console.error(`Error adding ${type} to group:`, error);
            setErrorMessage(`Failed to add ${type}`);
        } finally {
            isProcessingRef.current = false;
        }
    };

    // Delete this layout group
    const handleDeleteGroup = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isProcessingRef.current) {return;}

        setShowActionsMenu(false);

        // Confirm deletion
        if (window.confirm(t('editor.deleteGroupConfirmation'))) {
            isProcessingRef.current = true;
            setErrorMessage(null);

            try {
                deleteLayoutGroup(group.id);
            } catch (error) {
                console.error('Error deleting layer group:', error);
                setErrorMessage('Failed to delete layer');
                isProcessingRef.current = false;
            }
        }
    };

    // Toggle actions menu
    const toggleActionsMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setErrorMessage(null);

        // Calculate menu position relative to the button
        if (actionsButtonRef.current) {
            const buttonRect = actionsButtonRef.current.getBoundingClientRect();
            setActionsMenuPosition({
                top: buttonRect.bottom,
                left: buttonRect.left
            });
        }

        setShowActionsMenu(!showActionsMenu);
    };

    // Handle drag over for object reordering with improved visual feedback
    const handleDragOverObject = (index: number, e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Apply visual feedback to the specific drop zone
        const dropZone = dropZonesRef.current[index];
        if (dropZone) {
            // Remove active class from all drop zones first
            dropZonesRef.current.forEach(zone => {
                if (zone && zone !== dropZone) {
                    zone.classList.remove(styles.active);
                }
            });

            // Add active class to current drop zone
            dropZone.classList.add(styles.active);
        }

        setDragOverObjectIndex(index);
        onDragOverIndex(index);
    };

    // Enhanced drop zone for better reordering and moving objects between groups
    const handleDropOnZone = (dropIndex: number, e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!canvas) return;

        // Get dragged item ID from dataTransfer
        const draggedItemId = e.dataTransfer.getData('text/plain');
        if (!draggedItemId) return;

        try {
            // Find the dragged object in the canvas
            const draggedObj = canvas.getObjects().find(
                obj => (obj as FabricObjectWithId).id?.toString() === draggedItemId
            ) as FabricObjectWithId;

            if (!draggedObj) return;

            // Check if the object is from a different group
            if (draggedObj.layoutGroup !== group.id) {
                // Move object to this group
                moveObjectToGroup(draggedObj.id as string | number, group.id);

                // Now position it at the correct index within the new group
                const childObjects = group.objects.filter(obj => !obj.isLayoutParent);
                const targetIndex = Math.min(dropIndex, childObjects.length);

                // Find the canvas index of the object at the target position
                if (targetIndex < childObjects.length) {
                    const targetObject = childObjects[targetIndex];
                    const allObjects = canvas.getObjects() as FabricObjectWithId[];
                    const targetObjectIndex = allObjects.findIndex(obj => obj.id === targetObject.id);

                    if (targetObjectIndex !== -1) {
                        // Set z-index of dragged object
                        setObjectZIndex(draggedObj, targetObjectIndex);
                    }
                }
            } else {
                // Object is in the same group, just reorder it
                const childObjects = group.objects.filter(obj => !obj.isLayoutParent);
                const currentIndex = childObjects.findIndex(obj => obj.id === draggedObj.id);

                if (currentIndex !== -1 && currentIndex !== dropIndex) {
                    // Calculate the target index in the canvas
                    let targetCanvasIndex = -1;

                    // Find the canvas index of the object at the target position
                    if (dropIndex < childObjects.length) {
                        const targetObject = childObjects[dropIndex];
                        const allObjects = canvas.getObjects() as FabricObjectWithId[];
                        targetCanvasIndex = allObjects.findIndex(obj => obj.id === targetObject.id);
                    } else {
                        // Drop at the end
                        // Find the last object in this group
                        const lastObject = childObjects[childObjects.length - 1];
                        const allObjects = canvas.getObjects() as FabricObjectWithId[];
                        const lastObjectIndex = allObjects.findIndex(obj => obj.id === lastObject.id);
                        targetCanvasIndex = lastObjectIndex + 1;
                    }

                    if (targetCanvasIndex !== -1) {
                        // Set z-index of dragged object
                        setObjectZIndex(draggedObj, targetCanvasIndex);
                    }
                }
            }

            // Update canvas
            canvas.requestRenderAll();
        } catch (error) {
            console.error('Error handling drop:', error);
            setErrorMessage('Failed to reorder objects');
        } finally {
            // Reset all drag-related states after drop is complete
            resetAllDragStates();
        }
    };

    // Handle drop when an object is dragged onto the group itself
    const handleGroupDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!canvas) return;

        // Get the dragged item ID from dataTransfer
        const draggedItemId = e.dataTransfer.getData('text/plain');

        if (!draggedItemId) return;

        try {
            // Find the dragged object
            const draggedObj = canvas.getObjects().find(
                obj => (obj as FabricObjectWithId).id?.toString() === draggedItemId
            ) as FabricObjectWithId;

            if (!draggedObj || draggedObj.isLayoutParent) return;

            // Move object to this group
            if (draggedObj.layoutGroup !== group.id) {
                moveObjectToGroup(draggedObj.id as string | number, group.id);
                canvas.requestRenderAll();
            }
        } catch (error) {
            console.error('Error during group drop:', error);
            setErrorMessage('Failed to move object to layer');
        } finally {
            // Reset all drag-related states after drop is complete
            resetAllDragStates();
        }
    };

    // Handle drag enter to apply visual feedback
    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (groupRef.current) {
            groupRef.current.classList.add(styles.dragOver);
        }
    };

    // Handle drag leave to remove visual feedback
    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Only remove the dragOver class if the leave is to an element outside the group
        // Check if the relatedTarget is outside this group
        if (groupRef.current && !groupRef.current.contains(e.relatedTarget as Node)) {
            groupRef.current.classList.remove(styles.dragOver);
        }
    };

    // Save dropZone reference
    const saveDropZoneRef = (el: HTMLDivElement | null, index: number) => {
        if (el) {
            dropZonesRef.current[index] = el;
        }
    };

    // Filter out parent object when rendering child objects
    const childObjects = group.objects.filter(obj => !obj.isLayoutParent);

    // 레이어 그룹의 부모 객체 찾기
    const parentObject = group.objects.find(obj => obj.isLayoutParent);

    // 현재 그룹이 선택되었는지 여부 확인
    const isGroupSelected = parentObject && selectedObjectId === parentObject.id;

    return (
        <div
            ref={groupRef}
            className={`${styles.layoutGroup} ${isDragOver ? styles.dragOver : ''} ${isGroupSelected ? styles.selected : ''}`}
            onDragOver={onDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleGroupDrop}
            onClick={onActivate}
            data-group-id={group.id}
        >
            {/* Error message display */}
            {errorMessage && (
                <div className={styles.errorMessage}>
                    <AlertTriangle size={14} />
                    <span>{errorMessage}</span>
                    <button onClick={() => setErrorMessage(null)}>×</button>
                </div>
            )}

            <div className={styles.layoutGroupHeader} onClick={(e) => {
                onToggleExpand();
                onGroupSelect();}}>
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
                        <span className={`${styles.layoutGroupName} ${!group.visible ? styles.hidden : ''}`} onClick={(e) => {
                            onToggleExpand();
                            onGroupSelect();
                        }}>
                            {group.name}
                            {
                                isGroupSelected && (
                                    <button
                                        className={styles.editNameButton}
                                        onClick={startEditingName}
                                        title={t('editor.renameGroup')}
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                )
                            }
                        </span>
                    )}
                </div>

                <div className={styles.layoutGroupActions}>
                    {/* Layer visibility toggle */}
                    <button
                        className={styles.objectAction}
                        onClick={handleToggleVisibility}
                        title={group.visible ? t('editor.hideLayer') : t('editor.showLayer')}
                        disabled={isProcessingRef.current}
                    >
                        {group.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>

                    {/* Layer lock toggle */}
                    <button
                        className={styles.objectAction}
                        onClick={handleToggleLock}
                        title={group.locked ? t('editor.unlockLayer') : t('editor.lockLayer')}
                        disabled={isProcessingRef.current}
                    >
                        {group.locked ? <Unlock size={16} /> : <Lock size={16} />}
                    </button>

                    {/* More actions button with dropdown */}
                    <button
                        ref={actionsButtonRef}
                        className={`${styles.objectAction} ${showActionsMenu ? styles.active : ''}`}
                        onClick={toggleActionsMenu}
                        title={t('editor.moreActions')}
                        disabled={isProcessingRef.current}
                    >
                        <MoreHorizontal size={16} />
                    </button>

                    {showActionsMenu && (
                        <div
                            ref={actionsMenuRef}
                            className="global-actions-dropdown"
                            style={{
                                position: 'fixed',
                                top: `${actionsMenuPosition.top}px`,
                                left: `${actionsMenuPosition.left}px`,
                                zIndex: 1000
                            }}
                        >
                            {/* Add object actions */}
                            <button
                                className="actionItem"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddObjectToGroup('text');
                                }}
                                title={t('editor.addTextToLayer')}
                                disabled={isProcessingRef.current}
                            >
                                <Text size={16} />
                                <span>{t('editor.addText')}</span>
                            </button>

                            <button
                                className="actionItem"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddObjectToGroup('rectangle');
                                }}
                                title={t('editor.addRectangleToLayer')}
                                disabled={isProcessingRef.current}
                            >
                                <Square size={16} />
                                <span>{t('editor.addRectangle')}</span>
                            </button>

                            <button
                                className="actionItem"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddObjectToGroup('circle');
                                }}
                                title={t('editor.addCircleToLayer')}
                                disabled={isProcessingRef.current}
                            >
                                <Circle size={16} />
                                <span>{t('editor.addCircle')}</span>
                            </button>

                            <button
                                className="actionItem"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddObjectToGroup('triangle');
                                }}
                                title={t('editor.addTriangleToLayer')}
                                disabled={isProcessingRef.current}
                            >
                                <Triangle size={16} />
                                <span>{t('editor.addTriangle')}</span>
                            </button>

                            <button
                                className="actionItem"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddObjectToGroup('image');
                                }}
                                title={t('editor.addImageToLayer')}
                                disabled={isProcessingRef.current}
                            >
                                <Image size={16} />
                                <span>{t('editor.addImage')}</span>
                            </button>

                            <button
                                className="actionItem"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddObjectToGroup('video');
                                }}
                                title={t('editor.addVideoToLayer')}
                                disabled={isProcessingRef.current}
                            >
                                <Film size={16} />
                                <span>{t('editor.addVideo')}</span>
                            </button>

                            <div className="actionDivider"></div>

                            {/* Delete action */}
                            <button
                                className="actionItem deleteAction"
                                onClick={handleDeleteGroup}
                                title={t('editor.deleteLayer')}
                                disabled={isProcessingRef.current}
                            >
                                <Trash2 size={16} />
                                <span>{t('editor.deleteLayer')}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {group.expanded && (
                <div className={styles.layoutGroupContent}>
                    {/* First drop zone for reordering */}
                    <div
                        ref={(el) => saveDropZoneRef(el, 0)}
                        className={`${styles.dropZone} ${dragOverObjectIndex === 0 ? styles.active : ''}`}
                        onDragOver={(e) => handleDragOverObject(0, e)}
                        onDragEnter={(e) => handleDragOverObject(0, e)}
                        onDrop={(e) => handleDropOnZone(0, e)}
                    />

                    {/* Render objects in the group */}
                    {childObjects.length > 0 ? (
                        childObjects.map((object, index) => (
                            <React.Fragment key={`${object.id}_${index}`}>
                                <ObjectItem
                                    object={object}
                                    isSelected={selectedObjectId === object.id}
                                    isGroupChild={true}
                                    isDragOver={false}
                                    onSelect={() => selectObject(object)}
                                    onDragStart={onDragStart}
                                    onDragEnd={onDragEnd}
                                    onDragOver={onDragOverId}
                                    groupLocked={group.locked}
                                    groupVisible={group.visible}
                                    index={index} // Pass index for better reordering
                                />

                                {/* Drop zone after each object */}
                                <div
                                    ref={(el) => saveDropZoneRef(el, index + 1)}
                                    className={`${styles.dropZone} ${dragOverObjectIndex === index + 1 ? styles.active : ''}`}
                                    onDragOver={(e) => handleDragOverObject(index + 1, e)}
                                    onDragEnter={(e) => handleDragOverObject(index + 1, e)}
                                    onDrop={(e) => handleDropOnZone(index + 1, e)}
                                />
                            </React.Fragment>
                        ))
                    ) : (
                        <div className={styles.emptyGroupMessage}>
                            {t('editor.layerEmpty')}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LayoutGroupItem;