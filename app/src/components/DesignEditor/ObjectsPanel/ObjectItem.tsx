// src/components/DesignEditor/ObjectsPanel/ObjectItem.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
    Text, Image, Square, Circle, Triangle, Trash2, Copy,
    Eye, EyeOff, Lock, Unlock, Edit2, Monitor, Film,
    ChevronUp, ChevronDown, ChevronsUp, ChevronsDown,
    MoreHorizontal
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useDesignEditor, FabricObjectWithId } from '../DesignEditorContext';
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
        selectObject
    } = useDesignEditor();

    // State for editing name and showing action menu
    const [isEditingName, setIsEditingName] = useState(false);
    const [editingName, setEditingName] = useState(object.name || '');
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const nameInputRef = useRef<HTMLInputElement>(null);
    const actionsMenuRef = useRef<HTMLDivElement>(null);
    const actionsButtonRef = useRef<HTMLButtonElement>(null);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

    // Get object type icon
    const getObjectIcon = () => {
        const type = object.objectType;

        if (object.isLayoutParent) {
            return <Monitor size={16} />;
        }

        switch (type) {
            case 'text':
                return <Text size={16} />;
            case 'image':
                return <Image size={16} />;
            case 'video':
                return <Film size={16} />;
            case 'rectangle':
                return <Square size={16} />;
            case 'circle':
                return <Circle size={16} />;
            case 'triangle':
                return <Triangle size={16} />;
            default:
                if (object.type === 'textbox') {return <Text size={16} />;}
                if (object.type === 'rect') {return <Square size={16} />;}
                if (object.type === 'circle') {return <Circle size={16} />;}
                if (object.type === 'triangle') {return <Triangle size={16} />;}
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
        if (!canvas) {return;}

        // 현재 선택된 객체를 저장
        const currentSelectedObject = canvas.getActiveObject();

        // 이름을 변경할 객체 선택
        selectObject(object);

        // 이름 업데이트
        updateObjectProperty('name', editingName);

        // 이전에 선택했던 객체를 다시 선택
        if (currentSelectedObject) {
            selectObject(currentSelectedObject as FabricObjectWithId);
        }

        setIsEditingName(false);
    };

    // Handle keyboard input for name editing
    const handleNameKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            saveObjectName();
        } else if (e.key === 'Escape') {
            setIsEditingName(false);
        }
    };

    // 이름 입력 창 클릭 시 이벤트 전파 방지
    const handleNameInputClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    // Toggle object visibility
    const toggleVisibility = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!canvas) {return;}

        const isVisible = object.visible !== false;

        object.set({
            'visible': !isVisible,
            'selectable': isVisible ? false : object.selectable,
            'evented': isVisible ? false : object.evented
        });

        object.setCoords();
        canvas.requestRenderAll();

        // Deselect if hiding currently selected object
        if (isVisible && isSelected) {
            canvas.discardActiveObject();
            canvas.requestRenderAll();
            selectObject(null);
        }

        setShowActionsMenu(false);
    };

    // Toggle object lock state
    const toggleLocked = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!canvas) {return;}

        const isLocked = object.lockMovementX && object.lockMovementY;

        object.set({
            'lockMovementX': !isLocked,
            'lockMovementY': !isLocked,
            'lockRotation': !isLocked,
            'lockScalingX': !isLocked,
            'lockScalingY': !isLocked,
            'selectable': isLocked
        });

        canvas.requestRenderAll();

        // Deselect if locking currently selected object
        if (!isLocked && isSelected) {
            canvas.discardActiveObject();
            canvas.requestRenderAll();
            selectObject(null);
        }

        setShowActionsMenu(false);
    };

    // Delete this object
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        selectObject(object);
        deleteObject();
        setShowActionsMenu(false);
    };

    // Duplicate this object
    const handleDuplicate = (e: React.MouseEvent) => {
        e.stopPropagation();
        selectObject(object);
        cloneObject();
        setShowActionsMenu(false);
    };

    // Move this object up one level
    const handleMoveUp = (e: React.MouseEvent) => {
        e.stopPropagation();
        moveObjectUp(object);
        setShowActionsMenu(false);
    };

    // Move this object to the top
    const handleMoveToTop = (e: React.MouseEvent) => {
        e.stopPropagation();
        moveObjectToTop(object);
        setShowActionsMenu(false);
    };

    // Move this object down one level
    const handleMoveDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        moveObjectDown(object);
        setShowActionsMenu(false);
    };

    // Move this object to the bottom
    const handleMoveToBottom = (e: React.MouseEvent) => {
        e.stopPropagation();
        moveObjectToBottom(object);
        setShowActionsMenu(false);
    };

    // Toggle the actions menu
    const toggleActionsMenu = (e: React.MouseEvent) => {
        e.stopPropagation();

        // Calculate menu position relative to the button and screen
        if (actionsButtonRef.current) {
            const buttonRect = actionsButtonRef.current.getBoundingClientRect();
            const menuLeft = buttonRect.left;
            const menuTop = buttonRect.bottom;

            setMenuPosition({ top: menuTop, left: menuLeft });
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
        if (!object.id) {return;}
        onDragStart(object.id);

        // Make the element semi-transparent while dragging
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '0.5';
        }
    };

    // Handle drag over
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!object.id) {return;}
        onDragOver(object.id);
    };

    // Handle drag end
    const handleDragEnd = (e: React.DragEvent) => {
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '1';
        }
        onDragEnd();
    };

    // Check if object is locked
    const isLocked = object.lockMovementX && object.lockMovementY;

    // Check if object is visible
    const isVisible = object.visible !== false;

    // Render actions menu as a portal
    const renderActionsMenu = () => {
        if (!showActionsMenu) return null;

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
                className={`global-actions-dropdown`}
                style={{
                    ...menuStyle,
                    backgroundColor: 'var(--color-bg-primary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '0.375rem',
                    boxShadow: 'var(--shadow-md)',
                    overflow: 'hidden',
                    display: 'flex',
                    padding: '5px'
                }}
            >
                {!object.isLayoutParent && (
                    <>
                        <button
                            className={`global-actions-dropdown actionItem`}
                            onClick={handleMoveToTop}
                            title={t('editor.moveObjectToTop')}
                        >
                            <ChevronsUp size={16} />
                            <span>{t('editor.moveObjectToTop')}</span>
                        </button>

                        <button
                            className={`global-actions-dropdown actionItem`}
                            onClick={handleMoveUp}
                            title={t('editor.moveObjectUp')}
                        >
                            <ChevronUp size={16} />
                            <span>{t('editor.moveObjectUp')}</span>
                        </button>

                        <button
                            className={`global-actions-dropdown actionItem`}
                            onClick={handleMoveDown}
                            title={t('editor.moveObjectDown')}
                        >
                            <ChevronDown size={16} />
                            <span>{t('editor.moveObjectDown')}</span>
                        </button>

                        <button
                            className={`global-actions-dropdown actionItem`}
                            onClick={handleMoveToBottom}
                            title={t('editor.moveObjectToBottom')}
                        >
                            <ChevronsDown size={16} />
                            <span>{t('editor.moveObjectToBottom')}</span>
                        </button>

                        <div className={`global-actions-dropdown actionDivider`}></div>
                    </>
                )}

                {!object.isLayoutParent && (
                    <button
                        className={`global-actions-dropdown actionItem`}
                        onClick={handleDuplicate}
                        title={t('editor.duplicate')}
                    >
                        <Copy size={16} />
                        <span>{t('editor.duplicate')}</span>
                    </button>
                )}

                <button
                    className={`global-actions-dropdown actionItem deleteAction`}
                    onClick={handleDelete}
                    title={t('editor.delete')}
                >
                    <Trash2 size={16} />
                    <span>{t('editor.delete')}</span>
                </button>
            </div>,
            document.body
        );
    };

    return (
        <div
            className={`${styles.objectItem} 
                      ${isGroupChild ? styles.groupChild : ''} 
                      ${isSelected ? styles.selected : ''} 
                      ${isDragOver ? styles.dragOver : ''}`}
            onClick={onSelect}
            draggable={!object.isLayoutParent}
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
                        <button
                            className={styles.editNameButton}
                            onClick={startEditingName}
                            title={t('editor.renameObject')}
                        >
                            <Edit2 size={14} /> {/* 아이콘 크기 증가 */}
                        </button>
                    </span>
                )}
            </div>

            <div className={styles.objectActions}>
                {/* Limited action buttons that are always visible */}
                <button
                    className={styles.objectAction}
                    onClick={toggleVisibility}
                    title={isVisible ? t('editor.toggleVisibility') : t('editor.toggleVisibility')}
                >
                    {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>

                <button
                    className={styles.objectAction}
                    onClick={toggleLocked}
                    title={isLocked ? t('editor.unlockObject') : t('editor.lockObject')}
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
                    >
                        <MoreHorizontal size={16} />
                    </button>

                    {renderActionsMenu()}
                </div>
            </div>
        </div>
    );
};

export default ObjectItem;