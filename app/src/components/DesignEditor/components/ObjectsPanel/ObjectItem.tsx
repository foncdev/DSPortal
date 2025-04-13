// src/components/DesignEditor/components/ObjectsPanel/ObjectItem.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
    Text, Image, Square, Circle, Triangle, Trash2, Copy,
    Eye, EyeOff, Lock, Unlock, Edit2, Monitor, Film,
    ChevronUp, ChevronDown, ChevronsUp, ChevronsDown,
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
                                                   onDragOver
                                               }) => {
    const {t} = useTranslation();
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
        toggleObjectLock,  // 추가된 함수
        isObjectLocked: checkObjectLock  // 이름 변경
    } = useDesignEditor();

    // State for editing name and showing action menu
    const [isEditingName, setIsEditingName] = useState(false);
    const [editingName, setEditingName] = useState(object.name || '');
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [isVisible, setIsVisible] = useState(object.visible !== false);
    const [isLocked, setIsLocked] = useState(!!object.lockMovementX && !!object.lockMovementY);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Refs for DOM elements
    const nameInputRef = useRef<HTMLInputElement>(null);
    const actionsMenuRef = useRef<HTMLDivElement>(null);
    const actionsButtonRef = useRef<HTMLButtonElement>(null);
    const isProcessingRef = useRef(false);

    // State for menu position
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({top: 0, left: 0});

    // Update visibility and lock states when object properties change
    useEffect(() => {
        const newVisibleState = object.visible !== false;
        const newLockedState = checkObjectLock(object); // 이름 변경된 함수 사용

        // 상태가 변경된 경우에만 업데이트
        if (isVisible !== newVisibleState) {
            setIsVisible(newVisibleState);
        }

        if (isLocked !== newLockedState) {
            setIsLocked(newLockedState);
        }
    }, [object, checkObjectLock]);

    // Get object type icon
    const getObjectIcon = () => {
        const type = object.objectType;

        if (object.isLayoutParent) {
            return <Monitor size={16}/>;
        }

        switch (type) {
            case 'text':
                return <Text size={16}/>;
            case 'image':
                return <Image size={16}/>;
            case 'video':
                return <Film size={16}/>;
            case 'rectangle':
                return <Square size={16}/>;
            case 'circle':
                return <Circle size={16}/>;
            case 'triangle':
                return <Triangle size={16}/>;
            default:
                if (object.type === 'textbox') {return <Text size={16}/>;}
                if (object.type === 'rect') {return <Square size={16}/>;}
                if (object.type === 'circle') {return <Circle size={16}/>;}
                if (object.type === 'triangle') {return <Triangle size={16}/>;}
                return <Square size={16}/>;
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
            // Store current selected object
            const currentSelectedObject = canvas.getActiveObject();

            // Select the object to rename
            selectObject(object);

            // Update name property
            updateObjectProperty('name', editingName);

            // Restore previous selection
            if (currentSelectedObject) {
                selectObject(currentSelectedObject as FabricObjectWithId);
            }
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

        if (!canvas || !object || isProcessingRef.current) {return;}

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
    const toggleLocked = (e: React.MouseEvent) => {
        // 이벤트 전파 중지
        e.preventDefault();
        e.stopPropagation();

        if (!canvas || !object || isProcessingRef.current) {return;}

        // 처리 중 플래그 설정
        isProcessingRef.current = true;
        setErrorMessage(null);
        setShowActionsMenu(false);

        try {
            // Context 함수 사용하여 잠금 상태 토글
            const newLockState = toggleObjectLock(object);

            // UI 상태 업데이트
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
        if (isProcessingRef.current) {return;}

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
        if (isProcessingRef.current) {return;}

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
        if (isProcessingRef.current) {return;}

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

    // Move this object to the top
    const handleMoveToTop = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isProcessingRef.current) {return;}

        isProcessingRef.current = true;
        setErrorMessage(null);
        setShowActionsMenu(false);

        try {
            moveObjectToTop(object);
        } catch (error) {
            console.error('Error moving object to top:', error);
            setErrorMessage('Failed to move object to top');
        } finally {
            isProcessingRef.current = false;
        }
    };

    // Move this object down one level
    const handleMoveDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isProcessingRef.current) {return;}

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

    // Move this object to the bottom
    const handleMoveToBottom = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isProcessingRef.current) {return;}

        isProcessingRef.current = true;
        setErrorMessage(null);
        setShowActionsMenu(false);

        try {
            moveObjectToBottom(object);
        } catch (error) {
            console.error('Error moving object to bottom:', error);
            setErrorMessage('Failed to move object to bottom');
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

        // console.log('Drag Start:', {
        //     objectId: object.id,
        //     isLocked,
        //     isVisible,
        //     isLayoutParent: object.isLayoutParent
        // });

        if (!object.id || isLocked || !isVisible || object.isLayoutParent) {
            console.warn('Drag prevented due to conditions');
            return;
        }

        onDragStart(object.id);

        // Make the element semi-transparent while dragging
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '0.5';
        }
    };

    // Handle drag over
    const handleDragOver = (e: React.DragEvent) => {
        // console.log('Drag Over:', {
        //     objectId: object.id,
        //     event: e
        // });
        e.preventDefault();
        if (!object.id) {
            console.warn('No object ID for drag over');
            return;
        }
        onDragOver(object.id);
    };

    // Handle drag end
    const handleDragEnd = (e: React.DragEvent) => {
        // console.log('Drag End:', {
        //     objectId: object.id
        // });
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '1';
        }
        onDragEnd();
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
                {!object.isLayoutParent && (
                    <>
                        {/* Z-index control actions */}
                        <button
                            className="actionItem"
                            onClick={handleMoveToTop}
                            title={t('editor.moveObjectToTop')}
                            disabled={isProcessingRef.current}
                        >
                            <ChevronsUp size={16}/>
                            <span>{t('editor.moveObjectToTop')}</span>
                        </button>

                        <button
                            className="actionItem"
                            onClick={handleMoveUp}
                            title={t('editor.moveObjectUp')}
                            disabled={isProcessingRef.current}
                        >
                            <ChevronUp size={16}/>
                            <span>{t('editor.moveObjectUp')}</span>
                        </button>

                        <button
                            className="actionItem"
                            onClick={handleMoveDown}
                            title={t('editor.moveObjectDown')}
                            disabled={isProcessingRef.current}
                        >
                            <ChevronDown size={16}/>
                            <span>{t('editor.moveObjectDown')}</span>
                        </button>

                        <button
                            className="actionItem"
                            onClick={handleMoveToBottom}
                            title={t('editor.moveObjectToBottom')}
                            disabled={isProcessingRef.current}
                        >
                            <ChevronsDown size={16}/>
                            <span>{t('editor.moveObjectToBottom')}</span>
                        </button>

                        <div className="actionDivider"></div>

                        {/* Duplicate action */}
                        <button
                            className="actionItem"
                            onClick={handleDuplicate}
                            title={t('editor.duplicate')}
                            disabled={isProcessingRef.current}
                        >
                            <Copy size={16}/>
                            <span>{t('editor.duplicate')}</span>
                        </button>
                    </>
                )}

                {/* Delete action */}
                <button
                    className="actionItem deleteAction"
                    onClick={handleDelete}
                    title={t('editor.delete')}
                    disabled={isProcessingRef.current || object.isLayoutParent}
                >
                    <Trash2 size={16}/>
                    <span>{t('editor.delete')}</span>
                </button>
            </div>,
            document.body
        );
    };

    // Determine if this object can be dragged
    const isDraggable = !object.isLayoutParent && isVisible && !isLocked;

    return (
        <>
            {/* Error message display */}
            {errorMessage && (
                <div className={styles.errorMessage}>
                    <AlertTriangle size={14}/>
                    <span>{errorMessage}</span>
                    <button onClick={() => setErrorMessage(null)}>×</button>
                </div>
            )}

            <div
                className={`${styles.objectItem} 
                    ${isGroupChild ? styles.groupChild : ''} 
                    ${isSelected ? styles.selected : ''} 
                    ${isDragOver ? styles.dragOver : ''}
                    ${!isVisible ? styles.hidden : ''}
                    ${isLocked ? styles.locked : ''}`}
                onClick={onSelect}
                draggable={isDraggable}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
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
                            {!object.isLayoutParent && (
                                <button
                                    className={styles.editNameButton}
                                    onClick={startEditingName}
                                    title={t('editor.renameObject')}
                                >
                                    <Edit2 size={14}/>
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
                        disabled={isProcessingRef.current}
                    >
                        {isVisible ? <Eye size={16}/> : <EyeOff size={16}/>}
                    </button>

                    <button
                        className={`${styles.objectAction} ${isLocked ? styles.active : ''}`}
                        onClick={toggleLocked}
                        title={isLocked ? t('editor.unlockObject') : t('editor.lockObject')}
                        disabled={isProcessingRef.current || !isVisible}
                    >
                        {isLocked ? <Unlock size={16}/> : <Lock size={16}/>}
                    </button>

                    {/* More actions button with dropdown menu */}
                    <div className={styles.actionsMenuContainer}>
                        <button
                            ref={actionsButtonRef}
                            className={`${styles.objectAction} ${showActionsMenu ? styles.active : ''}`}
                            onClick={toggleActionsMenu}
                            title={t('editor.moreActions')}
                            disabled={isProcessingRef.current}
                        >
                            <MoreHorizontal size={16}/>
                        </button>

                        {renderActionsMenu()}
                    </div>
                </div>
            </div>
        </>
    );
}

export default ObjectItem;