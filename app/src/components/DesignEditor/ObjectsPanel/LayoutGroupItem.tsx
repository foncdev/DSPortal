// src/components/DesignEditor/ObjectsPanel/LayoutGroupItem.tsx
import React, { useState, useRef } from 'react';
import {
    ChevronDown, ChevronRight, Monitor, Edit2,
    Text, Image, Film, Trash2
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
    const nameInputRef = useRef<HTMLInputElement>(null);
    const [dragOverObjectIndex, setDragOverObjectIndex] = useState<number | null>(null);
    const isProcessingRef = useRef(false);

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
        if (!canvas) {return;}

        // 현재 선택된 객체 저장
        const currentSelectedObject = canvas.getActiveObject() as FabricObjectWithId;

        // 레이아웃 부모 객체 찾기
        const parentObject = group.objects.find(obj => obj.isLayoutParent);
        if (parentObject && groupName.trim()) {
            selectObject(parentObject);
            updateObjectProperty('name', groupName);

            // 이전에 선택한 객체 복원
            if (currentSelectedObject) {
                selectObject(currentSelectedObject);
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

    // 이름 입력 창 클릭 시 이벤트 전파 방지
    const handleNameInputClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    // Add an object to this group
    const addObjectToGroup = (type: ObjectType, e: React.MouseEvent) => {
        e.stopPropagation();
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

        // Find parent object for positioning
        const parentObj = group.objects.find(obj => obj.isLayoutParent);
        if (!parentObj) {
            isProcessingRef.current = false;
            return;
        }

        // Calculate position within parent
        const left = parentObj.left || 0;
        const top = parentObj.top || 0;
        const width = parentObj.width || 0;
        const height = parentObj.height || 0;

        // 그룹 내 같은 타입의 객체 수 계산
        const sameTypeCount = group.objects.filter(obj =>
            obj.objectType === type ||
            (obj.type === 'textbox' && type === 'text') ||
            (obj.type === 'rect' && type === 'rectangle')
        ).length;

        // 객체 유형별 기본 이름 설정
        let objName = '';
        switch (type) {
            case 'text': objName = 'Text'; break;
            case 'image': objName = 'Image'; break;
            case 'video': objName = 'Video'; break;
            case 'rectangle': objName = 'Shape'; break;
            case 'circle': objName = 'Circle'; break;
            case 'triangle': objName = 'Triangle'; break;
            default: objName = 'Object';
        }

        // Add new object to group with delay
        setTimeout(() => {
            try {
                addObject(type, {
                    left: left + width / 2,
                    top: top + height / 2,
                    name: `${objName} ${sameTypeCount + 1}`,
                    layoutGroup: group.id
                });
            } finally {
                isProcessingRef.current = false;
            }
        }, 50);
    };

    // Delete this layout group
    const handleDeleteGroup = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isProcessingRef.current) return;

        // 삭제 확인 전에 플래그 설정
        isProcessingRef.current = true;

        if (window.confirm(t('editor.deleteGroupConfirmation'))) {
            deleteLayoutGroup(group.id);
        } else {
            // 취소한 경우 플래그 해제
            isProcessingRef.current = false;
        }
    };

    // 드래그 오버 핸들러
    const handleDragOverObject = (index: number, e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverObjectIndex(index);
        onDragOverIndex(index);
    };

    // 드롭 핸들러
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
            <div
                className={styles.layoutGroupHeader}
                onClick={onToggleExpand}
            >
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
                        <span className={styles.layoutGroupName}>
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
                    {/* 첫 번째 드롭 영역 */}
                    <div
                        className={`${styles.dropZone} ${dragOverObjectIndex === 0 ? styles.active : ''}`}
                        onDragOver={(e) => handleDragOverObject(0, e)}
                        onDrop={(e) => handleDropAtIndex(0, e)}
                    />

                    {/* 객체 목록 */}
                    {group.objects.map((object, index) => (
                        <React.Fragment key={object.id}>
                            <ObjectItem
                                object={object}
                                isSelected={selectedObjectId === object.id}
                                isGroupChild={true}
                                isDragOver={false}
                                onSelect={() => selectObject(object)}
                                onDragStart={onDragStart}
                                onDragEnd={onDragEnd}
                                onDragOver={setDragOverId}
                            />

                            {/* 각 객체 아래에 드롭 영역 */}
                            <div
                                className={`${styles.dropZone} ${dragOverObjectIndex === index + 1 ? styles.active : ''}`}
                                onDragOver={(e) => handleDragOverObject(index + 1, e)}
                                onDrop={(e) => handleDropAtIndex(index + 1, e)}
                            />
                        </React.Fragment>
                    ))}

                    {/* 그룹에 객체가 없는 경우 */}
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