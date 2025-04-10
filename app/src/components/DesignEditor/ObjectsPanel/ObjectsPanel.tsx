// src/components/DesignEditor/ObjectsPanel/ObjectsPanel.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
    Layers, ChevronDown, ChevronRight, Monitor, Plus
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDesignEditor, FabricObjectWithId } from '../DesignEditorContext';
import ObjectToolbar from './ObjectToolbar';
import LayoutGroupItem from './LayoutGroupItem';
import ObjectItem from './ObjectItem';
import styles from './ObjectsPanel.module.scss';

interface ObjectsPanelProps {
    className?: string;
}

// Layout group interface
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
        addObject
    } = useDesignEditor();

    const [objects, setObjects] = useState<FabricObjectWithId[]>([]);
    const [objectsExpanded, setObjectsExpanded] = useState(true);
    const [layoutGroups, setLayoutGroups] = useState<LayoutGroup[]>([]);
    const [ungroupedObjects, setUngroupedObjects] = useState<FabricObjectWithId[]>([]);
    const [nextGroupId, setNextGroupId] = useState(1);
    const [draggingId, setDraggingId] = useState<number | string | null>(null);
    const [dragOverId, setDragOverId] = useState<number | string | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    // 중복 처리 방지를 위한 플래그
    const isProcessingRef = useRef(false);
    const initialLoadDoneRef = useRef(false);

    // Update objects list when canvas changes
    useEffect(() => {
        if (!canvas) {return;}

        const updateObjectsList = () => {
            // 중복 처리 방지
            if (isProcessingRef.current) return;
            isProcessingRef.current = true;

            try {
                // Get all canvas objects
                const canvasObjects = getObjects();
                setObjects(canvasObjects);

                // 첫 로드 후에 객체를 정리
                if (initialLoadDoneRef.current) {
                    // Organize objects into groups
                    organizeObjectsIntoGroups(canvasObjects);
                } else {
                    // 첫 로드 시에는 단순히 객체만 설정
                    initialLoadDoneRef.current = true;

                    // 첫 로드 이후에 그룹 구성
                    setTimeout(() => {
                        const objects = getObjects();
                        organizeObjectsIntoGroups(objects);
                    }, 100);
                }
            } finally {
                isProcessingRef.current = false;
            }
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
            // 이벤트 발생 시 일정 시간 후에 처리 (연속 이벤트 방지)
            setTimeout(updateObjectsList, 50);
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
            initialLoadDoneRef.current = false;
        };
    }, [canvas, getObjects]);

    // Organize objects into layout groups
    const organizeObjectsIntoGroups = (canvasObjects: FabricObjectWithId[]) => {
        // 중복 처리 방지
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

        try {
            // Preserve expanded state of existing groups
            const expandedStates: Record<string, boolean> = {};
            layoutGroups.forEach(group => {
                expandedStates[group.id] = group.expanded;
            });

            // Process objects with layout tags
            const layouts: Record<string, LayoutGroup> = {};
            const unassigned: FabricObjectWithId[] = [];

            // Step 1: Find layout parent objects
            canvasObjects.forEach(obj => {
                if (!obj.id) {return;}

                const layoutTag = obj.layoutGroup as string | undefined;
                const isLayoutParent = obj.isLayoutParent as boolean | undefined;

                if (isLayoutParent) {
                    // This is a layout parent
                    const groupId = layoutTag || `layout_${nextGroupId + Object.keys(layouts).length}`;
                    layouts[groupId] = {
                        id: groupId,
                        name: obj.name || `레이어 ${Object.keys(layouts).length + 1}`,
                        expanded: expandedStates[groupId] !== undefined ? expandedStates[groupId] : true,
                        objects: [obj]
                    };
                }
            });

            // Step 2: Assign child objects
            canvasObjects.forEach(obj => {
                if (!obj.id) {return;}

                const layoutTag = obj.layoutGroup as string | undefined;
                const isLayoutParent = obj.isLayoutParent as boolean | undefined;

                if (!isLayoutParent) {
                    if (layoutTag && layouts[layoutTag]) {
                        // Child object belonging to a layout
                        layouts[layoutTag].objects.push(obj);
                    } else {
                        // Independent object
                        unassigned.push(obj);
                    }
                }
            });

            const groupsArray = Object.values(layouts);

            // 레이아웃 그룹이 없을 경우 자동으로 생성
            if (groupsArray.length === 0 && canvasObjects.length > 0 && !isProcessingRef.current) {
                // 재귀 호출 방지
                isProcessingRef.current = false;
                handleCreateNewLayoutGroup();
                return;
            }

            setLayoutGroups(groupsArray);
            setUngroupedObjects(unassigned);

            // Update next group ID
            if (Object.keys(layouts).length > 0) {
                setNextGroupId(prevId => Math.max(prevId, Object.keys(layouts).length + 1));
            }
        } finally {
            isProcessingRef.current = false;
        }
    };

    // Create a new layout group
    const handleCreateNewLayoutGroup = () => {
        if (!canvas || isProcessingRef.current) {return;}
        isProcessingRef.current = true;

        // 고유한 ID 생성
        const timestamp = Date.now();
        const groupId = `layout_${timestamp}`;
        const layoutName = `레이어 ${nextGroupId}`;

        // Create layout background with delayed processing
        setTimeout(() => {
            try {
                addObject('rectangle', {
                    name: layoutName,
                    width: 500,
                    height: 300,
                    fill: '#f0f0f0',
                    opacity: 0.5,
                    isLayoutParent: true,
                    layoutGroup: groupId,
                    left: Math.random() * 300 + 150,
                    top: Math.random() * 200 + 100
                });

                setNextGroupId(prevId => prevId + 1);
            } finally {
                isProcessingRef.current = false;
            }
        }, 100);
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

    // Toggle objects section expanded state
    const toggleObjectsExpanded = () => {
        setObjectsExpanded(!objectsExpanded);
    };

    // 그룹 내 오브젝트 순서 변경
    const handleReorderObjectWithinGroup = (groupId: string, objectId: number | string, targetIndex: number) => {
        if (!canvas) return;

        // 현재 그룹 찾기
        const group = layoutGroups.find(g => g.id === groupId);
        if (!group) return;

        // 움직이려는 객체 찾기
        const objectToMove = group.objects.find(o => o.id === objectId);
        if (!objectToMove) return;

        // 현재 객체의 인덱스
        const currentIndex = group.objects.indexOf(objectToMove);
        if (currentIndex === targetIndex) return; // 위치 변화 없음

        // 캔버스에서 객체 재정렬
        // 먼저 모든 그룹 객체의 zIndex 가져오기
        const groupObjects = canvas.getObjects().filter(
            obj => (obj as FabricObjectWithId).layoutGroup === groupId
        ) as FabricObjectWithId[];

        // 객체 재정렬
        if (currentIndex < targetIndex) {
            // 아래로 이동
            for (let i = currentIndex; i < targetIndex; i++) {
                canvas.bringForward(objectToMove);
            }
        } else {
            // 위로 이동
            for (let i = currentIndex; i > targetIndex; i--) {
                canvas.sendBackwards(objectToMove);
            }
        }

        canvas.requestRenderAll();
    };

    // Handle group drop (for drag and drop)
    const handleGroupDrop = (groupId: string, e: React.DragEvent) => {
        e.preventDefault();
        if (!canvas || !draggingId) {return;}

        // Find the dragged object
        const draggedObj = objects.find(obj => obj.id === draggingId);
        if (!draggedObj) {return;}

        // Layout parents cannot be moved between groups
        if (draggedObj.isLayoutParent) {return;}

        // Add object to group
        draggedObj.set({
            'layoutGroup': groupId
        });

        canvas.requestRenderAll();
        setDragOverId(null);
        setDragOverIndex(null);
        setDraggingId(null);
    };

    // Handle unassigned drop (remove from group)
    const handleUnassignedDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (!canvas || !draggingId) {return;}

        // Find the dragged object
        const draggedObj = objects.find(obj => obj.id === draggingId);
        if (!draggedObj || !draggedObj.layoutGroup) {return;}

        // Layout parents cannot be removed from their group
        if (draggedObj.isLayoutParent) {return;}

        // Remove group property
        draggedObj.set({
            'layoutGroup': undefined
        });

        canvas.requestRenderAll();
        setDragOverId(null);
        setDragOverIndex(null);
        setDraggingId(null);
    };

    // Handle object drop within group (reordering)
    const handleObjectDropWithinGroup = (groupId: string, targetIndex: number, e: React.DragEvent) => {
        e.preventDefault();
        if (!canvas || !draggingId) return;

        const group = layoutGroups.find(g => g.id === groupId);
        if (!group) return;

        const draggedObj = group.objects.find(o => o.id === draggingId);
        if (!draggedObj) return;

        handleReorderObjectWithinGroup(groupId, draggingId, targetIndex);

        setDragOverId(null);
        setDragOverIndex(null);
        setDraggingId(null);
    };

    return (
        <div className={`${styles.objectsPanel} ${className || ''}`}>
            {/* Object tools */}
            <ObjectToolbar
                onCreateLayoutGroup={handleCreateNewLayoutGroup}
                onAddObject={addObject}
            />

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
                    {/* "새 레이어 추가" 버튼 */}
                    <button
                        className={styles.addLayerButton}
                        onClick={() => {
                            if (!isProcessingRef.current) {
                                handleCreateNewLayoutGroup();
                            }
                        }}
                        title={t('editor.addLayoutGroup')}
                        disabled={isProcessingRef.current}
                    >
                        <Plus size={16} />
                        <span>{t('editor.addLayoutGroup')}</span>
                    </button>

                    {/* Layout groups */}
                    {layoutGroups.length > 0 && (
                        <div className={styles.layoutGroupsList}>
                            {layoutGroups.map((group) => (
                                <LayoutGroupItem
                                    key={group.id}
                                    group={group}
                                    selectedObjectId={selectedObject?.id}
                                    isDragOver={dragOverId === `group_${group.id}`}
                                    onToggleExpand={() => toggleLayoutGroupExpanded(group.id)}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setDragOverId(`group_${group.id}`);
                                    }}
                                    onDrop={(e) => handleGroupDrop(group.id, e)}
                                    onDragStart={setDraggingId}
                                    onDragEnd={() => {
                                        setDraggingId(null);
                                        setDragOverId(null);
                                        setDragOverIndex(null);
                                    }}
                                    onDragOver={setDragOverId}
                                    onDragOverIndex={setDragOverIndex}
                                    onDropAtIndex={(index, e) => handleObjectDropWithinGroup(group.id, index, e)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Ungrouped objects */}
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
                                    <ObjectItem
                                        key={object.id}
                                        object={object}
                                        isSelected={selectedObject?.id === object.id}
                                        isDragOver={dragOverId === object.id}
                                        onSelect={() => selectObject(object)}
                                        onDragStart={(id) => setDraggingId(id)}
                                        onDragEnd={() => {
                                            setDraggingId(null);
                                            setDragOverId(null);
                                            setDragOverIndex(null);
                                        }}
                                        onDragOver={(id) => setDragOverId(id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
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