// src/components/DesignEditor/components/ObjectsPanel/ObjectItem.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
    Text, Image, Square, Circle, Triangle, Trash2, Copy,
    Eye, EyeOff, Lock, Unlock, Edit2, Monitor, Film,
    MoreHorizontal, AlertTriangle
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useDesignEditor, FabricObjectWithId } from '../../context/DesignEditorContext';
import styles from './ObjectsPanel.module.scss';

interface ObjectItemProps {
    object: FabricObjectWithId;
    isSelected: boolean;
    isGroupChild?: boolean;
    isDragOver: boolean;
    onSelect: () => void;
    onDragStart: (id: number | string) => void;
    onDragEnd: () => void;
    onDragOver: (id: number | string | null) => void;
    groupLocked?: boolean;
    groupVisible?: boolean;
    index?: number; // Add index prop to know the object's position in the list
}

/**
 * Component to display and manage individual objects in the objects panel
 */
const ObjectItem: React.FC<ObjectItemProps> = ({
                                                   object,
                                                   isSelected,
                                                   isGroupChild = false,
                                                   isDragOver,
                                                   onSelect,
                                                   onDragStart,
                                                   onDragEnd,
                                                   onDragOver,
                                                   groupLocked = false,
                                                   groupVisible = true,
                                                   index
                                               }) => {
    const { t } = useTranslation();
    const {
        canvas,
        deleteObject,
        cloneObject,
        updateObjectProperty,
        moveObjectUp,
        moveObjectDown,
        moveObjectToTop,
        moveObjectToBottom,
        selectObject,
        toggleObjectLock,
        isObjectLocked: checkObjectLock,
        onObjectStateChange,
        setObjectZIndex // Required for drag and drop reordering
    } = useDesignEditor();

    // State for editing name and showing action menu
    const [isEditingName, setIsEditingName] = useState(false);
    const [editingName, setEditingName] = useState(object.name || '');
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [isVisible, setIsVisible] = useState(object.visible !== false);
    const [isLocked, setIsLocked] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false); // Track if this item is being dragged

    // Refs for DOM elements
    const nameInputRef = useRef<HTMLInputElement>(null);
    const actionsMenuRef = useRef<HTMLDivElement>(null);
    const actionsButtonRef = useRef<HTMLButtonElement>(null);
    const itemRef = useRef<HTMLDivElement>(null); // Reference to the item element
    const isProcessingRef = useRef(false);

    // State for menu position
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

    // Update visibility and lock states when object properties change
    useEffect(() => {
        const newVisibleState = object.visible !== false;
        const newLockedState = checkObjectLock(object);

        // 상태가 변경된 경우에만 업데이트
        if (isVisible !== newVisibleState) {
            setIsVisible(newVisibleState);
        }

        if (isLocked !== newLockedState) {
            setIsLocked(newLockedState);
        }
    }, [object, checkObjectLock]);

    // Update name when object name changes
    useEffect(() => {
        if (!isEditingName && object.name) {
            setEditingName(object.name);
        }
    }, [object.name, isEditingName]);

    // 객체 상태 변경 이벤트 구독
    useEffect(() => {
        // 상태 변경 이벤트 핸들러
        const handleStateChange = (event: {
            type: 'lock' | 'unlock' | 'visibility' | 'selection' | 'modification' | 'group';
            objectId: string | number | null;
            groupId?: string;
        }) => {
            // 이 객체의 상태가 변경된 경우에만 처리
            if (
                object.id === event.objectId &&
                (event.type === 'lock' || event.type === 'unlock')
            ) {
                // 잠금 상태 업데이트
                const newLockState = event.type === 'lock';
                setIsLocked(newLockState);
            }
        };

        // 이벤트 구독 및 구독 해제 함수 저장
        const unsubscribe = onObjectStateChange(handleStateChange);

        // 컴포넌트 언마운트 시 구독 해제
        return unsubscribe;
    }, [object.id, onObjectStateChange]);

    // Add effect to clean up drag states when component unmounts
    useEffect(() => {
        return () => {
            if (isDragging) {
                // Clean up drag states if this component is unmounted while dragging
                onDragEnd();
            }
        };
    }, [isDragging, onDragEnd]);

    // Get object type icon
    const getObjectIcon = () => {
        const type = object.objectType || object.type;

        if (object.isLayoutParent) {
            return <Monitor size={16} />;
        }

        switch (type) {
            case 'text':
            case 'textbox':
                return <Text size={16} />;
            case 'image':
                return <Image size={16} />;
            case 'video':
                return <Film size={16} />;
            case 'rectangle':
            case 'rect':
                return <Square size={16} />;
            case 'circle':
                return <Circle size={16} />;
            case 'triangle':
                return <Triangle size={16} />;
            default:
                return <Square size={16} />;
        }
    };

    // Get object name or default name
    const getObjectName = () => {
        if (object.name) {return object.name;}

        const type = object.objectType || (
            object.type === 'textbox' ? 'text' :
                object.type === 'rect' ? 'rectangle' :
                    object.type
        );

        return type ? `${type.charAt(0).toUpperCase()}${type.slice(1)}` : 'Object';
    };

    // Start editing object name
    const startEditingName = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditingName(true);
        setEditingName(getObjectName());
        setErrorMessage(null);

        // Focus input after rendering
        setTimeout(() => {
            if (nameInputRef.current) {
                nameInputRef.current.focus();
                nameInputRef.current.select();
            }
        }, 10);
    };

    // Save the edited name
    const saveObjectName = () => {
        if (!canvas || isProcessingRef.current) {return;}

        isProcessingRef.current = true;
        setErrorMessage(null);

        try {
            // Update name property
            updateObjectProperty('name', editingName);
        } catch (error) {
            console.error('Error saving object name:', error);
            setErrorMessage('Failed to update object name');
        } finally {
            setIsEditingName(false);
            isProcessingRef.current = false;
        }
    };

    // Handle keyboard input for name editing
    const handleNameKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            saveObjectName();
        } else if (e.key === 'Escape') {
            setIsEditingName(false);
            setEditingName(getObjectName());
        }
    };

    // Prevent event propagation when clicking on input field
    const handleNameInputClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    // Toggle object visibility
    const toggleVisibility = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!canvas || !object || isProcessingRef.current || groupLocked) {return;}

        isProcessingRef.current = true;
        setErrorMessage(null);
        setShowActionsMenu(false);

        try {
            // 새 가시성 상태 계산
            const newVisibility = !isVisible;

            // 객체 ID로 직접 캔버스에서 객체 찾기
            const targetObj = object.id ?
                canvas.getObjects().find(obj => (obj as FabricObjectWithId).id === object.id) as FabricObjectWithId :
                null;

            if (!targetObj) {
                throw new Error("객체를 찾을 수 없습니다");
            }

            // 객체 속성 업데이트
            targetObj.set({
                'visible': newVisibility,
                'evented': newVisibility
            });

            // 보이지 않는 상태로 변경 시 선택 해제
            if (!newVisibility && isSelected) {
                canvas.discardActiveObject();
                canvas.requestRenderAll();
                selectObject(null);
            }

            targetObj.setCoords();
            canvas.requestRenderAll();

            // UI 상태 업데이트
            setIsVisible(newVisibility);
        } catch (error) {
            console.error('Error toggling visibility:', error);
            setErrorMessage('가시성 전환에 실패했습니다');
        } finally {
            isProcessingRef.current = false;
        }
    };

    // Toggle object lock state
    const handleToggleLock = (e: React.MouseEvent) => {
        // 이벤트 전파 중지
        e.preventDefault();
        e.stopPropagation();

        if (!canvas || !object || isProcessingRef.current || groupLocked) {return;}

        // 처리 중 플래그 설정
        isProcessingRef.current = true;
        setErrorMessage(null);
        setShowActionsMenu(false);

        try {
            // Context 함수 사용하여 잠금 상태 토글
            const newLockState = toggleObjectLock(object);

            // UI 상태 업데이트 - 이제 이벤트 시스템이 처리하므로 필요하지 않을 수 있지만
            // 확실한 상태 동기화를 위해 유지
            setIsLocked(newLockState);
        } catch (error) {
            console.error("toggleLocked 에러:", error);
            setErrorMessage("잠금 상태 변경에 실패했습니다");
        } finally {
            // 처리 플래그 초기화
            isProcessingRef.current = false;
        }
    };

    // Delete this object
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isProcessingRef.current || groupLocked) {return;}

        isProcessingRef.current = true;
        setErrorMessage(null);
        setShowActionsMenu(false);

        try {
            // Check if this is a layout parent - then prevent deletion
            if (object.isLayoutParent) {
                alert(t('editor.cannotDeleteParent'));
                isProcessingRef.current = false;
                return;
            }

            // Select and delete the object
            selectObject(object);
            deleteObject();
        } catch (error) {
            console.error('Error deleting object:', error);
            setErrorMessage('Failed to delete object');
            isProcessingRef.current = false;
        }
    };

    // Duplicate this object
    const handleDuplicate = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isProcessingRef.current || groupLocked) {return;}

        isProcessingRef.current = true;
        setErrorMessage(null);
        setShowActionsMenu(false);

        try {
            // Check if this is a layout parent - then prevent duplication
            if (object.isLayoutParent) {
                alert(t('editor.cannotDuplicateParent'));
                isProcessingRef.current = false;
                return;
            }

            // Select and clone the object
            selectObject(object);
            cloneObject();
        } catch (error) {
            console.error('Error duplicating object:', error);
            setErrorMessage('Failed to duplicate object');
            isProcessingRef.current = false;
        }
    };

    // Move this object up one level
    const handleMoveUp = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isProcessingRef.current || groupLocked) {return;}

        isProcessingRef.current = true;
        setErrorMessage(null);
        setShowActionsMenu(false);

        try {
            moveObjectUp(object);
        } catch (error) {
            console.error('Error moving object up:', error);
            setErrorMessage('Failed to move object up');
        } finally {
            isProcessingRef.current = false;
        }
    };

    // Move this object down one level
    const handleMoveDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isProcessingRef.current || groupLocked) {return;}

        isProcessingRef.current = true;
        setErrorMessage(null);
        setShowActionsMenu(false);

        try {
            moveObjectDown(object);
        } catch (error) {
            console.error('Error moving object down:', error);
            setErrorMessage('Failed to move object down');
        } finally {
            isProcessingRef.current = false;
        }
    };

    // Toggle the actions menu
    const toggleActionsMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setErrorMessage(null);

        // Calculate menu position relative to the button and screen
        if (actionsButtonRef.current) {
            const buttonRect = actionsButtonRef.current.getBoundingClientRect();

            // Position menu below the button
            const menuLeft = buttonRect.left;
            const menuTop = buttonRect.bottom;

            setMenuPosition({top: menuTop, left: menuLeft});
        }

        setShowActionsMenu(!showActionsMenu);
    };

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

    // Handle drag start
    const handleDragStart = (e: React.DragEvent) => {
        // Parent objects and locked/hidden objects cannot be dragged
        if (!object.id || isLocked || !isVisible || object.isLayoutParent || groupLocked || !groupVisible) {
            e.preventDefault();
            return;
        }

        // Store the dragged object's ID
        onDragStart(object.id);
        setIsDragging(true);

        // Make the element semi-transparent while dragging
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '0.5';
        }

        // Store data in the dataTransfer object to use during drop
        if (e.dataTransfer) {
            e.dataTransfer.setData('text/plain', object.id.toString());
            e.dataTransfer.effectAllowed = 'move';
        }
    };

    // Handle drag over
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!object.id) {return;}

        // Indicate that a drop is allowed
        e.dataTransfer.dropEffect = 'move';

        // Notify parent component about which object we're dragging over
        onDragOver(object.id);
    };

    // Handle drop
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Get the dragged item's ID from dataTransfer
        const draggedItemId = e.dataTransfer.getData('text/plain');

        if (!draggedItemId || !canvas) {
            return;
        }

        try {
            // Find both objects in the canvas
            const draggedObject = canvas.getObjects().find(
                obj => (obj as FabricObjectWithId).id?.toString() === draggedItemId
            ) as FabricObjectWithId;

            const targetObject = object;

            if (!draggedObject || !targetObject) {
                return;
            }

            // Prevent dragging onto itself
            if (draggedObject.id === targetObject.id) {
                return;
            }

            // Find indexes of both objects in the canvas
            const allObjects = canvas.getObjects() as FabricObjectWithId[];
            const draggedObjectIndex = allObjects.findIndex(obj => obj.id === draggedObject.id);
            const targetObjectIndex = allObjects.findIndex(obj => obj.id === targetObject.id);

            if (draggedObjectIndex === -1 || targetObjectIndex === -1) {
                return;
            }

            // Reorder the objects in the canvas
            setObjectZIndex(draggedObject, targetObjectIndex);

            // Reset drag states - this is crucial to clear any visual feedback
            onDragOver(null);

            // Update canvas
            canvas.requestRenderAll();
        } catch (error) {
            console.error('Error during drop operation:', error);
            setErrorMessage('Failed to reorder objects');
        } finally {
            // Ensure all drag states are reset
            setIsDragging(false);
            onDragEnd();
        }
    };

    // Handle drag end
    const handleDragEnd = (e: React.DragEvent) => {
        // Reset opacity of the dragged element
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '1';
        }

        // Reset all drag states
        setIsDragging(false);
        onDragEnd();
        onDragOver(null);
    };

    // Handle drag enter - apply visual feedback
    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (itemRef.current) {
            itemRef.current.classList.add(styles.dragOver);
        }
    };

    // Handle drag leave - remove visual feedback
    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (itemRef.current) {
            itemRef.current.classList.remove(styles.dragOver);
        }
    };

    // Render actions menu as a portal
    const renderActionsMenu = () => {
        if (!showActionsMenu) {return null;}

        const menuStyle: React.CSSProperties = {
            position: 'fixed',
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            zIndex: 1000,
            transform: 'translateY(5px)'  // Slight offset from the button
        };

        return createPortal(
            <div
                ref={actionsMenuRef}
                className="global-actions-dropdown"
                style={menuStyle}
            >
                {/* Object position control actions */}
                <button
                    className="actionItem"
                    onClick={handleMoveUp}
                    title={t('editor.moveObjectUp')}
                    disabled={isProcessingRef.current || groupLocked}
                >
                    <span>{t('editor.moveObjectUp')}</span>
                </button>

                <button
                    className="actionItem"
                    onClick={handleMoveDown}
                    title={t('editor.moveObjectDown')}
                    disabled={isProcessingRef.current || groupLocked}
                >
                    <span>{t('editor.moveObjectDown')}</span>
                </button>

                <div className="actionDivider"></div>

                {/* Duplicate action */}
                <button
                    className="actionItem"
                    onClick={handleDuplicate}
                    title={t('editor.duplicate')}
                    disabled={isProcessingRef.current || groupLocked}
                >
                    <Copy size={16} />
                    <span>{t('editor.duplicate')}</span>
                </button>

                {/* Delete action */}
                <button
                    className="actionItem deleteAction"
                    onClick={handleDelete}
                    title={t('editor.delete')}
                    disabled={isProcessingRef.current || groupLocked || object.isLayoutParent}
                >
                    <Trash2 size={16} />
                    <span>{t('editor.delete')}</span>
                </button>
            </div>,
            document.body
        );
    };

    // Determine if this object can be dragged
    const isDraggable = !object.isLayoutParent && isVisible && !isLocked && !groupLocked && groupVisible;

    return (
        <>
            {/* Error message display */}
            {errorMessage && (
                <div className={styles.errorMessage}>
                    <AlertTriangle size={14} />
                    <span>{errorMessage}</span>
                    <button onClick={() => setErrorMessage(null)}>×</button>
                </div>
            )}

            <div
                ref={itemRef}
                className={`${styles.objectItem} 
                  ${isGroupChild ? styles.groupChild : ''} 
                  ${isSelected ? styles.selected : ''} 
                  ${isDragOver ? styles.dragOver : ''}
                  ${isDragging ? styles.dragging : ''}
                  ${!isVisible || !groupVisible ? styles.hidden : ''}
                  ${isLocked || groupLocked ? styles.locked : ''}`}
                onClick={onSelect}
                draggable={isDraggable}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                data-index={index}
                data-object-id={object.id}
            >
                <div className={styles.objectInfo}>
                    <div className={styles.objectIcon}>
                        {getObjectIcon()}
                    </div>

                    {isEditingName ? (
                        <input
                            ref={nameInputRef}
                            type="text"
                            className={styles.nameInput}
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onBlur={saveObjectName}
                            onKeyDown={handleNameKeyPress}
                            onClick={handleNameInputClick}
                        />
                    ) : (
                        <span className={styles.objectName}>
                          {getObjectName()}
                            {!object.isLayoutParent && !groupLocked && isSelected && (
                                <button
                                    className={styles.editNameButton}
                                    onClick={startEditingName}
                                    title={t('editor.renameObject')}
                                >
                                    <Edit2 size={14} />
                                </button>
                            )}
                        </span>
                    )}
                </div>

                <div className={styles.objectActions}>
                    {/* Limited action buttons that are always visible */}
                    <button
                        className={styles.objectAction}
                        onClick={toggleVisibility}
                        title={isVisible ? t('editor.hideObject') : t('editor.showObject')}
                        disabled={isProcessingRef.current || groupLocked || !groupVisible}
                    >
                        {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>

                    <button
                        className={`${styles.objectAction} ${isLocked ? styles.active : ''}`}
                        onClick={handleToggleLock}
                        title={isLocked ? t('editor.unlockObject') : t('editor.lockObject')}
                        disabled={isProcessingRef.current || !isVisible || groupLocked || !groupVisible}
                    >
                        {isLocked ? <Unlock size={16} /> : <Lock size={16} />}
                    </button>

                    {/* More actions button with dropdown menu */}
                    <div className={styles.actionsMenuContainer}>
                        <button
                            ref={actionsButtonRef}
                            className={`${styles.objectAction} ${showActionsMenu ? styles.active : ''}`}
                            onClick={toggleActionsMenu}
                            title={t('editor.moreActions')}
                            disabled={isProcessingRef.current || groupLocked || !groupVisible}
                        >
                            <MoreHorizontal size={16} />
                        </button>

                        {renderActionsMenu()}
                    </div>
                </div>
            </div>
        </>
    );
}

export default ObjectItem;