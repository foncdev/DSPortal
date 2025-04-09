// src/components/DesignEditor/ObjectsPanel/ObjectsPanel.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
    Text,
    Image,
    Square,
    Circle,
    Triangle,
    Trash2,
    Copy,
    EyeOff,
    Eye,
    ChevronDown,
    ChevronRight,
    Layers,
    Lock,
    Unlock,
    ChevronUp,
    ChevronsUp,
    ChevronDown as ChevronDownIcon,
    ChevronsDown,
    LayoutTemplate,
    Edit2,
    Monitor,
    Film
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDesignEditor, FabricObjectWithId, ObjectType } from '../DesignEditorContext';
import styles from './ObjectsPanel.module.scss';

interface ObjectsPanelProps {
    className?: string;
}

// 레이아웃 그룹을 표현하는 인터페이스
interface LayoutGroup {
    id: string;
    name: string;
    expanded: boolean;
    objects: FabricObjectWithId[];
}

const ObjectsPanel: React.FC<ObjectsPanelProps> = ({ className }) => {
    const { t } = useTranslation();
    const {
        canvas,
        getObjects,
        selectedObject,
        selectObject,
        addObject,
        deleteObject,
        cloneObject,
        updateObjectProperty
    } = useDesignEditor();

    const [objects, setObjects] = useState<FabricObjectWithId[]>([]);
    const [objectsExpanded, setObjectsExpanded] = useState(true);
    const [templatesExpanded, setTemplatesExpanded] = useState(false);
    const [draggingId, setDraggingId] = useState<number | string | null>(null);
    const [dragOverId, setDragOverId] = useState<number | string | null>(null);
    const [editingObjectId, setEditingObjectId] = useState<number | string | null>(null);
    const [editingName, setEditingName] = useState('');
    const editInputRef = useRef<HTMLInputElement>(null);

    // 레이아웃 그룹 관리
    const [layoutGroups, setLayoutGroups] = useState<LayoutGroup[]>([]);
    const [ungroupedObjects, setUngroupedObjects] = useState<FabricObjectWithId[]>([]);
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
    const [editingGroupName, setEditingGroupName] = useState('');
    const [nextGroupId, setNextGroupId] = useState(1);
    const groupEditInputRef = useRef<HTMLInputElement>(null);

    // Update objects list when canvas changes
    useEffect(() => {
        if (!canvas) return;

        const updateObjectsList = () => {
            // 캔버스의 모든 객체 가져오기
            const canvasObjects = getObjects();
            setObjects(canvasObjects);

            // 레이아웃 그룹 구성 업데이트
            organizeObjectsIntoGroups(canvasObjects);
        };

        // Initial update
        updateObjectsList();

        // Listen for object changes
        const events = [
            'object:added',
            'object:removed',
            'object:modified',
            'selection:created',
            'selection:updated',
            'selection:cleared',
        ];

        const handleCanvasEvent = () => {
            updateObjectsList();
        };

        events.forEach(event => {
            canvas.on(event, handleCanvasEvent);
        });

        return () => {
            if (canvas) {
                events.forEach(event => {
                    canvas.off(event, handleCanvasEvent);
                });
            }
        };
    }, [canvas, getObjects]);

    // 객체를 레이아웃 그룹으로 구성하는 함수
    const organizeObjectsIntoGroups = (canvasObjects: FabricObjectWithId[]) => {
        // 기존 레이아웃 그룹의 확장 상태 유지
        const expandedStates: Record<string, boolean> = {};
        layoutGroups.forEach(group => {
            expandedStates[group.id] = group.expanded;
        });

        // 'layout' 태그가 있는 객체는 그룹으로 처리
        const layouts: Record<string, LayoutGroup> = {};
        const unassigned: FabricObjectWithId[] = [];

        // 1단계: 레이아웃 객체(부모) 확인
        canvasObjects.forEach(obj => {
            if (!obj.id) return;

            const layoutTag = obj.layoutGroup as string | undefined;
            const isLayoutParent = obj.isLayoutParent as boolean | undefined;

            if (isLayoutParent) {
                // 이 객체는 레이아웃 부모
                const groupId = layoutTag || `layout_${nextGroupId + Object.keys(layouts).length}`;
                layouts[groupId] = {
                    id: groupId,
                    name: obj.name || `Layout ${Object.keys(layouts).length + 1}`,
                    expanded: expandedStates[groupId] !== undefined ? expandedStates[groupId] : true,
                    objects: [obj]
                };
            }
        });

        // 2단계: 자식 객체 할당
        canvasObjects.forEach(obj => {
            if (!obj.id) return;

            const layoutTag = obj.layoutGroup as string | undefined;
            const isLayoutParent = obj.isLayoutParent as boolean | undefined;

            if (!isLayoutParent) {
                if (layoutTag && layouts[layoutTag]) {
                    // 특정 레이아웃에 속하는 자식 객체
                    layouts[layoutTag].objects.push(obj);
                } else {
                    // 어떤 레이아웃에도 속하지 않는 독립 객체
                    unassigned.push(obj);
                }
            }
        });

        setLayoutGroups(Object.values(layouts));
        setUngroupedObjects(unassigned);

        // 다음 그룹 ID 업데이트
        if (Object.keys(layouts).length > 0) {
            setNextGroupId(prevId => Math.max(prevId, Object.keys(layouts).length + 1));
        }
    };

    // 새 레이아웃 그룹 생성
    const createNewLayoutGroup = () => {
        if (!canvas) return;

        // 레이아웃 부모 객체 생성 (배경 사각형)
        const groupId = `layout_${nextGroupId}`;
        const layoutName = `Layout ${nextGroupId}`;

        // 레이아웃 배경 생성
        addObject('rectangle', {
            name: layoutName,
            width: 500,
            height: 300,
            fill: '#f0f0f0',
            opacity: 0.5,
            isLayoutParent: true,
            layoutGroup: groupId
        });

        setNextGroupId(nextGroupId + 1);
    };

    // 레이아웃 그룹에 새 객체 추가
    const addObjectToGroup = (groupId: string, type: ObjectType) => {
        if (!canvas) return;

        const group = layoutGroups.find(g => g.id === groupId);
        if (!group) return;

        // 레이아웃 부모 객체 찾기
        const parentObject = group.objects.find(obj => obj.isLayoutParent);
        if (!parentObject) return;

        // 레이아웃 내부에 객체 배치를 위한 좌표 계산
        const parentLeft = parentObject.left || 0;
        const parentTop = parentObject.top || 0;
        const parentWidth = parentObject.width || 0;
        const parentHeight = parentObject.height || 0;

        // 부모 내부에 위치하도록 좌표 설정
        const objLeft = parentLeft + parentWidth / 2;
        const objTop = parentTop + parentHeight / 2;

        // 객체 유형별 기본 이름 설정
        let objName = '';
        switch (type) {
            case 'text':
                objName = 'Text';
                break;
            case 'image':
                objName = 'Image';
                break;
            case 'video':
                objName = 'Video';
                break;
            case 'rectangle':
                objName = 'Shape';
                break;
            case 'circle':
                objName = 'Circle';
                break;
            case 'triangle':
                objName = 'Triangle';
                break;
            default:
                objName = 'Object';
        }

        // 그룹 내에서 같은 타입의 객체 수 계산
        const sameTypeCount = group.objects.filter(obj =>
            obj.objectType === type ||
            (obj.type === 'textbox' && type === 'text') ||
            (obj.type === 'rect' && type === 'rectangle')
        ).length;

        // 새 객체 추가
        addObject(type, {
            name: `${objName} ${sameTypeCount + 1}`,
            left: objLeft,
            top: objTop,
            layoutGroup: groupId
        });
    };

    // 레이아웃 그룹 삭제
    const deleteLayoutGroup = (groupId: string) => {
        if (!canvas) return;

        const group = layoutGroups.find(g => g.id === groupId);
        if (!group || !window.confirm(t('editor.deleteGroupConfirmation'))) return;

        // 그룹에 속한 모든 객체 삭제
        group.objects.forEach(obj => {
            canvas.remove(obj);
        });

        // 캔버스 업데이트
        canvas.requestRenderAll();
    };

    // 레이아웃 그룹 이름 편집 시작
    const startEditingGroupName = (groupId: string, e: React.MouseEvent) => {
        e.stopPropagation();

        const group = layoutGroups.find(g => g.id === groupId);
        if (!group) return;

        setEditingGroupId(groupId);
        setEditingGroupName(group.name);

        // 포커스 지연 설정
        setTimeout(() => {
            if (groupEditInputRef.current) {
                groupEditInputRef.current.focus();
                groupEditInputRef.current.select();
            }
        }, 10);
    };

    // 레이아웃 그룹 이름 저장
    const saveGroupName = () => {
        if (!canvas || !editingGroupId) return;

        const group = layoutGroups.find(g => g.id === editingGroupId);
        if (!group) return;

        // 그룹의 부모 객체 찾기
        const parentObject = group.objects.find(obj => obj.isLayoutParent);
        if (parentObject && editingGroupName.trim()) {
            // 현재 선택된 객체 백업
            const currentSelected = selectedObject;

            // 부모 객체 선택하여 이름 업데이트
            selectObject(parentObject);
            updateObjectProperty('name', editingGroupName);

            // 이전 선택 상태로 복원
            if (currentSelected) {
                selectObject(currentSelected);
            } else {
                selectObject(null);
            }

            canvas.requestRenderAll();
        }

        setEditingGroupId(null);
    };

    // 그룹 이름 입력 키 처리
    const handleGroupNameKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            saveGroupName();
        } else if (e.key === 'Escape') {
            setEditingGroupId(null);
        }
    };

    // Get icon for object type
    const getObjectIcon = (obj: FabricObjectWithId) => {
        const type = obj.objectType;
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
                if (obj.type === 'textbox') return <Text size={16} />;
                if (obj.type === 'rect') return <Square size={16} />;
                if (obj.type === 'circle') return <Circle size={16} />;
                if (obj.type === 'triangle') return <Triangle size={16} />;
                return <Square size={16} />;
        }
    };

    // Add a new object
    const handleAddObject = (type: ObjectType) => {
        addObject(type);
    };

    // Toggle layout group expanded state
    const toggleLayoutGroupExpanded = (groupId: string) => {
        setLayoutGroups(groups =>
            groups.map(group =>
                group.id === groupId
                    ? { ...group, expanded: !group.expanded }
                    : group
            )
        );
    };

    // Toggle panels expanded state
    const toggleObjectsExpanded = () => {
        setObjectsExpanded(!objectsExpanded);
    };

    const toggleTemplatesExpanded = () => {
        setTemplatesExpanded(!templatesExpanded);
    };

    // Get object name or default name based on type
    const getObjectName = (object: FabricObjectWithId) => {
        if (object.name) return object.name;

        const type = object.objectType || (
            object.type === 'textbox' ? 'text' :
                object.type === 'rect' ? 'rectangle' :
                    object.type
        );

        return type ? `${type.charAt(0).toUpperCase()}${type.slice(1)}` : 'Object';
    };

    // Start editing object name
    const startEditingName = (object: FabricObjectWithId, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingObjectId(object.id);
        setEditingName(getObjectName(object));

        // Focus 지연 설정 (렌더링 후 포커스)
        setTimeout(() => {
            if (editInputRef.current) {
                editInputRef.current.focus();
                editInputRef.current.select();
            }
        }, 10);
    };

    // Save edited object name
    const saveObjectName = () => {
        if (editingObjectId && canvas) {
            const objToUpdate = objects.find(obj => obj.id === editingObjectId);
            if (objToUpdate) {
                const prevSelected = selectedObject;
                selectObject(objToUpdate);
                updateObjectProperty('name', editingName);

                // 이전 선택 객체 복원
                if (prevSelected) {
                    selectObject(prevSelected);
                } else {
                    selectObject(null);
                }

                canvas.requestRenderAll();
            }
        }
        setEditingObjectId(null);
    };

    // Handle input key press
    const handleNameInputKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            saveObjectName();
        } else if (e.key === 'Escape') {
            setEditingObjectId(null);
        }
    };

    // Delete selected object
    const handleDeleteObject = (object: FabricObjectWithId, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent selecting the object when deleting
        if (canvas) {
            selectObject(object);
            deleteObject();
        }
    };

    // Duplicate object
    const handleDuplicateObject = (object: FabricObjectWithId, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent selecting the object when duplicating
        if (canvas) {
            selectObject(object);
            cloneObject();
        }
    };

    // Toggle object visibility
    const handleToggleVisibility = (object: FabricObjectWithId, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent selecting the object when toggling visibility
        if (canvas) {
            const isVisible = object.visible !== false;

            // 가시성과 함께 선택 가능성(selectable)도 함께 설정
            object.set({
                'visible': !isVisible,
                'selectable': isVisible ? false : object.selectable, // 보이지 않으면 선택도 불가능하게
                'evented': isVisible ? false : object.evented     // 보이지 않으면 이벤트도 받지 않게
            });

            // 객체 좌표 업데이트
            object.setCoords();
            canvas.requestRenderAll(); // renderAll 대신 requestRenderAll 사용

            // 보이지 않게 된 객체가 현재 선택된 상태라면 선택 해제
            if (isVisible && selectedObject && selectedObject.id === object.id) {
                canvas.discardActiveObject();
                canvas.requestRenderAll();
                // 선택 객체 상태도 업데이트
                selectObject(null);
            }
        }
    };

    // Toggle object lock state
    const handleToggleLock = (object: FabricObjectWithId, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent selecting the object when toggling lock
        if (canvas) {
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

            // 잠금된 객체가 현재 선택된 상태라면 선택 해제
            if (!isLocked && selectedObject && selectedObject.id === object.id) {
                canvas.discardActiveObject();
                canvas.requestRenderAll();
                selectObject(null);
            }
        }
    };

    // Move object up in stacking order
    const moveObjectUp = (object: FabricObjectWithId, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!canvas) return;

        canvas.bringForward(object);
        canvas.requestRenderAll();
    };

    // Move object to top of stacking order
    const moveObjectToTop = (object: FabricObjectWithId, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!canvas) return;

        canvas.bringToFront(object);
        canvas.requestRenderAll();
    };

    // Move object down in stacking order
    const moveObjectDown = (object: FabricObjectWithId, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!canvas) return;

        canvas.sendBackwards(object);
        canvas.requestRenderAll();
    };

    // Move object to bottom of stacking order
    const moveObjectToBottom = (object: FabricObjectWithId, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!canvas) return;

        canvas.sendToBack(object);
        canvas.requestRenderAll();
    };

    // 객체 드래그 시작
    const handleObjectDragStart = (object: FabricObjectWithId, e: React.DragEvent) => {
        if (!object.id) return;
        setDraggingId(object.id);
        e.dataTransfer.effectAllowed = 'move';

        // 부분적으로 투명하게 만들기 (드래그 표시)
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '0.5';
        }
    };

    // 객체에 드래그 오버
    const handleObjectDragOver = (object: FabricObjectWithId, e: React.DragEvent) => {
        e.preventDefault();
        if (!object.id || object.id === draggingId) return;
        setDragOverId(object.id);
    };

    // 객체 드래그 종료
    const handleObjectDragEnd = (e: React.DragEvent) => {
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '1';
        }

        setDraggingId(null);
        setDragOverId(null);
    };

    // 객체 드롭
    const handleObjectDrop = (object: FabricObjectWithId, e: React.DragEvent) => {
        e.preventDefault();
        if (!canvas || !draggingId || !object.id || draggingId === object.id) {
            return;
        }

        // 드래그한 객체 찾기
        const draggedObj = objects.find(obj => obj.id === draggingId);
        if (!draggedObj) return;

        // 같은 레이아웃 그룹 내에서의 순서 변경인 경우
        const draggedGroup = layoutGroups.find(g =>
            g.objects.some(obj => obj.id === draggingId)
        );

        const targetGroup = layoutGroups.find(g =>
            g.objects.some(obj => obj.id === object.id)
        );

        if (draggedGroup && targetGroup && draggedGroup.id === targetGroup.id) {
            // 같은 그룹 내 순서 변경
            const allObjects = canvas.getObjects() as FabricObjectWithId[];
            const draggedIndex = allObjects.findIndex(obj => obj.id === draggingId);
            const targetIndex = allObjects.findIndex(obj => obj.id === object.id);

            if (draggedIndex < 0 || targetIndex < 0) return;

            if (targetIndex > draggedIndex) {
                for (let i = draggedIndex; i < targetIndex; i++) {
                    canvas.bringForward(allObjects[i]);
                }
            } else {
                for (let i = draggedIndex; i > targetIndex; i--) {
                    canvas.sendBackwards(allObjects[i]);
                }
            }
        } else {
            // 다른 그룹으로 이동하는 경우 또는 그룹 <-> 비그룹 간 이동
            const targetLayoutGroup = object.isLayoutParent ? object.layoutGroup :
                (object.layoutGroup as string);

            // 레이아웃 부모는 그룹 간 이동 불가
            if (draggedObj.isLayoutParent) return;

            // 레이아웃 그룹 정보 업데이트
            draggedObj.set({
                'layoutGroup': targetLayoutGroup || undefined
            });

            // 기존 위치에서 타겟 위치로 이동
            canvas.bringToFront(draggedObj);
        }

        canvas.requestRenderAll();
        setDragOverId(null);
        setDraggingId(null);
    };

    // 그룹에 드래그 오버
    const handleGroupDragOver = (groupId: string, e: React.DragEvent) => {
        e.preventDefault();
        if (!draggingId) return;

        setDragOverId(`group_${groupId}`);
    };

    // 그룹에 드롭
    const handleGroupDrop = (groupId: string, e: React.DragEvent) => {
        e.preventDefault();
        if (!canvas || !draggingId) return;

        // 드래그한 객체 찾기
        const draggedObj = objects.find(obj => obj.id === draggingId);
        if (!draggedObj) return;

        // 레이아웃 부모는 그룹 간 이동 불가
        if (draggedObj.isLayoutParent) return;

        // 이미 이 그룹에 속해 있는지 확인
        const draggedGroup = draggedObj.layoutGroup;
        if (draggedGroup === groupId) return;

        // 객체를 그룹에 추가
        draggedObj.set({
            'layoutGroup': groupId
        });

        canvas.requestRenderAll();
        setDragOverId(null);
        setDraggingId(null);
    };

    // 빈 공간에 드롭 (그룹에서 제거)
    const handleUnassignedDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (!canvas || !draggingId) return;

        // 드래그한 객체 찾기
        const draggedObj = objects.find(obj => obj.id === draggingId);
        if (!draggedObj || !draggedObj.layoutGroup) return;

        // 레이아웃 부모는 그룹에서 제거할 수 없음
        if (draggedObj.isLayoutParent) return;

        // 객체의 그룹 속성 제거
        draggedObj.set({
            'layoutGroup': undefined
        });

        canvas.requestRenderAll();
        setDragOverId(null);
        setDraggingId(null);
    };

    return (
        <div className={`${styles.objectsPanel} ${className || ''}`}>
            {/* Object tools */}
            <div className={styles.objectTools}>
                <button
                    className={styles.objectToolButton}
                    onClick={createNewLayoutGroup}
                    title={t('editor.addLayoutGroup')}
                >
                    <Monitor size={18} />
                </button>
                <button
                    className={styles.objectToolButton}
                    onClick={() => handleAddObject('text')}
                    title={t('editor.addText')}
                >
                    <Text size={18} />
                </button>
                <button
                    className={styles.objectToolButton}
                    onClick={() => handleAddObject('image')}
                    title={t('editor.addImage')}
                >
                    <Image size={18} />
                </button>
                <button
                    className={styles.objectToolButton}
                    onClick={() => handleAddObject('rectangle')}
                    title={t('editor.addRectangle')}
                >
                    <Square size={18} />
                </button>
                <button
                    className={styles.objectToolButton}
                    onClick={() => handleAddObject('circle')}
                    title={t('editor.addCircle')}
                >
                    <Circle size={18} />
                </button>
                <button
                    className={styles.objectToolButton}
                    onClick={() => handleAddObject('triangle')}
                    title={t('editor.addTriangle')}
                >
                    <Triangle size={18} />
                </button>
            </div>

            {/* Objects list section */}
            <div className={styles.sectionHeader} onClick={toggleObjectsExpanded}>
                <div className={styles.sectionTitle}>
                    {objectsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <Layers size={16} className={styles.sectionIcon} />
                    <span>{t('editor.objects')}</span>
                </div>
                <div className={styles.objectCount}>{objects.length}</div>
            </div>

            {objectsExpanded && (
                <div className={styles.objectsContainer}>
                    {/* 레이아웃 그룹 목록 */}
                    {layoutGroups.length > 0 ? (
                        <div className={styles.layoutGroupsList}>
                            {layoutGroups.map((group) => (
                                <div
                                    key={group.id}
                                    className={`${styles.layoutGroup} ${dragOverId === `group_${group.id}` ? styles.dragOver : ''}`}
                                    onDragOver={(e) => handleGroupDragOver(group.id, e)}
                                    onDrop={(e) => handleGroupDrop(group.id, e)}
                                >
                                    <div
                                        className={styles.layoutGroupHeader}
                                        onClick={() => toggleLayoutGroupExpanded(group.id)}
                                    >
                                        <div className={styles.layoutGroupInfo}>
                                            {group.expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                            <Monitor size={14} className={styles.layoutIcon} />

                                            {editingGroupId === group.id ? (
                                                <input
                                                    ref={groupEditInputRef}
                                                    type="text"
                                                    className={styles.nameInput}
                                                    value={editingGroupName}
                                                    onChange={(e) => setEditingGroupName(e.target.value)}
                                                    onBlur={saveGroupName}
                                                    onKeyDown={handleGroupNameKeyPress}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            ) : (
                                                <span className={styles.layoutGroupName}>
                                                    {group.name}
                                                    <button
                                                        className={styles.editNameButton}
                                                        onClick={(e) => startEditingGroupName(group.id, e)}
                                                        title={t('editor.renameGroup')}
                                                    >
                                                        <Edit2 size={12} />
                                                    </button>
                                                </span>
                                            )}
                                        </div>

                                        <div className={styles.layoutGroupActions}>
                                            <div className={styles.objectTypeButtons}>
                                                <button
                                                    className={styles.objectTypeButton}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addObjectToGroup(group.id, 'text');
                                                    }}
                                                    title={t('editor.addTextToGroup')}
                                                >
                                                    <Text size={12} />
                                                </button>
                                                <button
                                                    className={styles.objectTypeButton}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addObjectToGroup(group.id, 'image');
                                                    }}
                                                    title={t('editor.addImageToGroup')}
                                                >
                                                    <Image size={12} />
                                                </button>
                                                <button
                                                    className={styles.objectTypeButton}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addObjectToGroup(group.id, 'video');
                                                    }}
                                                    title={t('editor.addVideoToGroup')}
                                                >
                                                    <Film size={12} />
                                                </button>
                                            </div>

                                            <button
                                                className={`${styles.objectAction} ${styles.deleteAction}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteLayoutGroup(group.id);
                                                }}
                                                title={t('editor.deleteGroup')}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {group.expanded && (
                                        <div className={styles.layoutGroupContent}>
                                            {group.objects.map((object) => (
                                                <div
                                                    key={object.id}
                                                    className={`${styles.objectItem} ${styles.groupChild} ${selectedObject?.id === object.id ? styles.selected : ''} ${dragOverId === object.id ? styles.dragOver : ''}`}
                                                    onClick={() => selectObject(object)}
                                                    draggable
                                                    onDragStart={(e) => handleObjectDragStart(object, e)}
                                                    onDragOver={(e) => handleObjectDragOver(object, e)}
                                                    onDragEnd={handleObjectDragEnd}
                                                    onDrop={(e) => handleObjectDrop(object, e)}
                                                >
                                                    <div className={styles.objectInfo}>
                                                        {/* 레이아웃 부모는 특별한 아이콘 표시 */}
                                                        <div className={styles.objectIcon}>
                                                            {object.isLayoutParent ?
                                                                <Monitor size={16} /> :
                                                                getObjectIcon(object)}
                                                        </div>

                                                        {editingObjectId === object.id ? (
                                                            <input
                                                                ref={editInputRef}
                                                                type="text"
                                                                className={styles.nameInput}
                                                                value={editingName}
                                                                onChange={(e) => setEditingName(e.target.value)}
                                                                onBlur={saveObjectName}
                                                                onKeyDown={handleNameInputKeyPress}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        ) : (
                                                            <span className={styles.objectName}>
                                                                {getObjectName(object)}
                                                                <button
                                                                    className={styles.editNameButton}
                                                                    onClick={(e) => startEditingName(object, e)}
                                                                    title={t('editor.renameObject')}
                                                                >
                                                                    <Edit2 size={12} />
                                                                </button>
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className={styles.objectActions}>
                                                        {/* 레이아웃 부모가 아닌 경우만 레이어 액션 표시 */}
                                                        {!object.isLayoutParent && (
                                                            <div className={styles.layerActions}>
                                                                <button
                                                                    className={styles.objectAction}
                                                                    onClick={(e) => moveObjectToTop(object, e)}
                                                                    title={t('editor.moveObjectToTop')}
                                                                >
                                                                    <ChevronsUp size={14} />
                                                                </button>
                                                                <button
                                                                    className={styles.objectAction}
                                                                    onClick={(e) => moveObjectUp(object, e)}
                                                                    title={t('editor.moveObjectUp')}
                                                                >
                                                                    <ChevronUp size={14} />
                                                                </button>
                                                                <button
                                                                    className={styles.objectAction}
                                                                    onClick={(e) => moveObjectDown(object, e)}
                                                                    title={t('editor.moveObjectDown')}
                                                                >
                                                                    <ChevronDownIcon size={14} />
                                                                </button>
                                                                <button
                                                                    className={styles.objectAction}
                                                                    onClick={(e) => moveObjectToBottom(object, e)}
                                                                    title={t('editor.moveObjectToBottom')}
                                                                >
                                                                    <ChevronsDown size={14} />
                                                                </button>
                                                            </div>
                                                        )}

                                                        {/* 기본 액션 버튼 */}
                                                        <button
                                                            className={styles.objectAction}
                                                            onClick={(e) => handleToggleVisibility(object, e)}
                                                            title={t('editor.toggleVisibility')}
                                                        >
                                                            {object.visible === false ? <Eye size={14} /> : <EyeOff size={14} />}
                                                        </button>
                                                        <button
                                                            className={styles.objectAction}
                                                            onClick={(e) => handleToggleLock(object, e)}
                                                            title={object.lockMovementX && object.lockMovementY ? t('editor.unlockObject') : t('editor.lockObject')}
                                                        >
                                                            {object.lockMovementX && object.lockMovementY ? <Unlock size={14} /> : <Lock size={14} />}
                                                        </button>
                                                        {!object.isLayoutParent && (
                                                            <button
                                                                className={styles.objectAction}
                                                                onClick={(e) => handleDuplicateObject(object, e)}
                                                                title={t('editor.duplicate')}
                                                            >
                                                                <Copy size={14} />
                                                            </button>
                                                        )}
                                                        <button
                                                            className={`${styles.objectAction} ${styles.deleteAction}`}
                                                            onClick={(e) => handleDeleteObject(object, e)}
                                                            title={t('editor.delete')}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : null}

                    {/* 그룹에 속하지 않은 객체 목록 */}
                    {ungroupedObjects.length > 0 && (
                        <div
                            className={`${styles.ungroupedSection} ${dragOverId === 'unassigned' ? styles.dragOver : ''}`}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDragOverId('unassigned');
                            }}
                            onDrop={handleUnassignedDrop}
                        >
                            <div className={styles.ungroupedHeader}>
                                <span>{t('editor.ungroupedObjects')}</span>
                                <div className={styles.objectCount}>{ungroupedObjects.length}</div>
                            </div>

                            <div className={styles.ungroupedList}>
                                {ungroupedObjects.map((object) => (
                                    <div
                                        key={object.id}
                                        className={`${styles.objectItem} ${selectedObject?.id === object.id ? styles.selected : ''} ${dragOverId === object.id ? styles.dragOver : ''}`}
                                        onClick={() => selectObject(object)}
                                        draggable
                                        onDragStart={(e) => handleObjectDragStart(object, e)}
                                        onDragOver={(e) => handleObjectDragOver(object, e)}
                                        onDragEnd={handleObjectDragEnd}
                                        onDrop={(e) => handleObjectDrop(object, e)}
                                    >
                                        <div className={styles.objectInfo}>
                                            <div className={styles.objectIcon}>
                                                {getObjectIcon(object)}
                                            </div>

                                            {editingObjectId === object.id ? (
                                                <input
                                                    ref={editInputRef}
                                                    type="text"
                                                    className={styles.nameInput}
                                                    value={editingName}
                                                    onChange={(e) => setEditingName(e.target.value)}
                                                    onBlur={saveObjectName}
                                                    onKeyDown={handleNameInputKeyPress}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            ) : (
                                                <span className={styles.objectName}>
                                                    {getObjectName(object)}
                                                    <button
                                                        className={styles.editNameButton}
                                                        onClick={(e) => startEditingName(object, e)}
                                                        title={t('editor.renameObject')}
                                                    >
                                                        <Edit2 size={12} />
                                                    </button>
                                                </span>
                                            )}
                                        </div>

                                        <div className={styles.objectActions}>
                                            <div className={styles.layerActions}>
                                                <button
                                                    className={styles.objectAction}
                                                    onClick={(e) => moveObjectToTop(object, e)}
                                                    title={t('editor.moveObjectToTop')}
                                                >
                                                    <ChevronsUp size={14} />
                                                </button>
                                                <button
                                                    className={styles.objectAction}
                                                    onClick={(e) => moveObjectUp(object, e)}
                                                    title={t('editor.moveObjectUp')}
                                                >
                                                    <ChevronUp size={14} />
                                                </button>
                                                <button
                                                    className={styles.objectAction}
                                                    onClick={(e) => moveObjectDown(object, e)}
                                                    title={t('editor.moveObjectDown')}
                                                >
                                                    <ChevronDownIcon size={14} />
                                                </button>
                                                <button
                                                    className={styles.objectAction}
                                                    onClick={(e) => moveObjectToBottom(object, e)}
                                                    title={t('editor.moveObjectToBottom')}
                                                >
                                                    <ChevronsDown size={14} />
                                                </button>
                                            </div>

                                            <button
                                                className={styles.objectAction}
                                                onClick={(e) => handleToggleVisibility(object, e)}
                                                title={t('editor.toggleVisibility')}
                                            >
                                                {object.visible === false ? <Eye size={14} /> : <EyeOff size={14} />}
                                            </button>
                                            <button
                                                className={styles.objectAction}
                                                onClick={(e) => handleToggleLock(object, e)}
                                                title={object.lockMovementX && object.lockMovementY ? t('editor.unlockObject') : t('editor.lockObject')}
                                            >
                                                {object.lockMovementX && object.lockMovementY ? <Unlock size={14} /> : <Lock size={14} />}
                                            </button>
                                            <button
                                                className={styles.objectAction}
                                                onClick={(e) => handleDuplicateObject(object, e)}
                                                title={t('editor.duplicate')}
                                            >
                                                <Copy size={14} />
                                            </button>
                                            <button
                                                className={`${styles.objectAction} ${styles.deleteAction}`}
                                                onClick={(e) => handleDeleteObject(object, e)}
                                                title={t('editor.delete')}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {layoutGroups.length === 0 && ungroupedObjects.length === 0 && (
                        <div className={styles.emptyState}>
                            {t('editor.noObjects')}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ObjectsPanel;