// src/components/DesignEditor/ObjectsPanel/ObjectsPanel.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
    Layers, ChevronDown, ChevronRight, Monitor, Plus
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDesignEditor, FabricObjectWithId } from '../DesignEditorContext';
import ObjectToolbar from './ObjectToolbar';
import LayoutGroupItem from './LayoutGroupItem';
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
        addObject,
        createLayoutGroup
    } = useDesignEditor();

    const [objects, setObjects] = useState<FabricObjectWithId[]>([]);
    const [objectsExpanded, setObjectsExpanded] = useState(true);
    const [layoutGroups, setLayoutGroups] = useState<LayoutGroup[]>([]);
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
                if (!obj.id || obj.isLayoutParent) {return;}

                const layoutTag = obj.layoutGroup as string | undefined;

                if (layoutTag && layouts[layoutTag]) {
                    // Child object belonging to a layout
                    layouts[layoutTag].objects.push(obj);
                } else {
                    // Set to first layout group if exists
                    const firstGroupId = Object.keys(layouts)[0];
                    if (firstGroupId) {
                        obj.set({
                            'layoutGroup': firstGroupId
                        });
                        layouts[firstGroupId].objects.push(obj);
                    } else {
                        // Create a default layout group
                        const newGroupId = `layout_${Date.now()}`;
                        const newLayoutGroup = createLayoutGroup(`레이어 1`);

                        obj.set({
                            'layoutGroup': newGroupId
                        });

                        layouts[newGroupId] = {
                            id: newGroupId,
                            name: `레이어 1`,
                            expanded: true,
                            objects: [obj]
                        };
                    }
                }
            });

            const groupsArray = Object.values(layouts);

            // 레이아웃 그룹이 없을 경우 자동으로 생성
            if (groupsArray.length === 0 && canvasObjects.length > 0 && !isProcessingRef.current) {
                // Set flag to prevent recursive call
                isProcessingRef.current = true;

                // Create default layout group with slight delay to avoid state update conflicts
                setTimeout(() => {
                    handleCreateNewLayoutGroup();
                    isProcessingRef.current = false;
                }, 100);
                return;
            }

            setLayoutGroups(groupsArray);

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

        try {
            createLayoutGroup('');

            // Increment next group ID
            setNextGroupId(prevId => prevId + 1);
        } finally {
            // Reset processing flag
            isProcessingRef.current = false;
        }
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
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        if (!canvas || !draggingId) {return;}

                                        // Find the dragged object
                                        const draggedObj = objects.find(obj => obj.id === draggingId);
                                        if (!draggedObj || draggedObj.isLayoutParent) {return;}

                                        // Update object's group
                                        draggedObj.set({
                                            'layoutGroup': group.id
                                        });

                                        canvas.requestRenderAll();
                                        setDragOverId(null);
                                        setDraggingId(null);
                                    }}
                                    onDragStart={setDraggingId}
                                    onDragEnd={() => {
                                        setDraggingId(null);
                                        setDragOverId(null);
                                        setDragOverIndex(null);
                                    }}
                                    onDragOver={setDragOverId}
                                    onDragOverIndex={setDragOverIndex}
                                    onDropAtIndex={(index, e) => {
                                        e.preventDefault();
                                        if (!canvas || !draggingId) return;

                                        const group = layoutGroups.find(g => g.id === group.id);
                                        if (!group) return;

                                        const draggedObj = group.objects.find(o => o.id === draggingId);
                                        if (!draggedObj) return;

                                        // Reorder objects within the group
                                        const currentIndex = group.objects.indexOf(draggedObj);
                                        if (currentIndex === index) return;

                                        const newObjects = [...group.objects];
                                        newObjects.splice(currentIndex, 1);
                                        newObjects.splice(index, 0, draggedObj);

                                        setLayoutGroups(prev => prev.map(g =>
                                            g.id === group.id ? {...g, objects: newObjects} : g
                                        ));

                                        // Update z-index in the canvas
                                        if (canvas) {
                                            const canvasObjects = canvas.getObjects();
                                            const startIndex = canvasObjects.indexOf(draggedObj);

                                            if (startIndex !== -1) {
                                                canvas.remove(draggedObj);
                                                canvas.insertAt(draggedObj, index);
                                                canvas.requestRenderAll();
                                            }
                                        }

                                        setDragOverId(null);
                                        setDragOverIndex(null);
                                        setDraggingId(null);
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Empty state */}
                    {layoutGroups.length === 0 && (
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