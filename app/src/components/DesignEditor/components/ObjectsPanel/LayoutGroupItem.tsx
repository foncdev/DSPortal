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
        addObjectToGroup
    } = useDesignEditor();

    const [editingName, setEditingName] = useState(false);
    const [groupName, setGroupName] = useState(group.name);
    const [dragOverObjectIndex, setDragOverObjectIndex] = useState<number | null>(null);
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [actionsMenuPosition, setActionsMenuPosition] = useState({ top: 0, left: 0 });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const nameInputRef = useRef<HTMLInputElement>(null);
    const actionsButtonRef = useRef<HTMLButtonElement>(null);
    const actionsMenuRef = useRef<HTMLDivElement>(null);
    const isProcessingRef = useRef(false);

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

    // Handle drag over for object reordering
    const handleDragOverObject = (index: number, e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverObjectIndex(index);
        onDragOverIndex(index);
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

    // Filter out parent object when rendering child objects
    const childObjects = group.objects.filter(obj => !obj.isLayoutParent);

    // 레이어 그룹의 부모 객체 찾기
    const parentObject = group.objects.find(obj => obj.isLayoutParent);

    // 현재 그룹이 선택되었는지 여부 확인
    const isGroupSelected = parentObject && selectedObjectId === parentObject.id;

    return (
        <div
            className={`${styles.layoutGroup} ${isDragOver ? styles.dragOver : ''} ${isGroupSelected ? styles.selected : ''}`}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onClick={onActivate}
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
                    {/* Object Type Buttons */}
                    <div className={styles.objectTypeButtons}>
                        <button
                            className={styles.objectTypeButton}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAddObjectToGroup('text');
                            }}
                            title={t('editor.addTextToLayer')}
                            disabled={isProcessingRef.current}
                        >
                            <Text size={12} />
                        </button>
                        <button
                            className={styles.objectTypeButton}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAddObjectToGroup('rectangle');
                            }}
                            title={t('editor.addShapeToLayer')}
                            disabled={isProcessingRef.current}
                        >
                            <Square size={12} />
                        </button>
                        <button
                            className={styles.objectTypeButton}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleAddObjectToGroup('image');
                            }}
                            title={t('editor.addImageToLayer')}
                            disabled={isProcessingRef.current}
                        >
                            <Image size={12} />
                        </button>
                    </div>

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
                        className={`${styles.dropZone} ${dragOverObjectIndex === 0 ? styles.active : ''}`}
                        onDragOver={(e) => handleDragOverObject(0, e)}
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
                                />

                                {/* Drop zone after each object */}
                                <div
                                    className={`${styles.dropZone} ${dragOverObjectIndex === index + 1 ? styles.active : ''}`}
                                    onDragOver={(e) => handleDragOverObject(index + 1, e)}
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