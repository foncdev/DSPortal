// src/components/DesignEditor/ObjectsPanel/ObjectsPanel.tsx
import React, { useState, useEffect } from 'react';
import {
    Layers, ChevronDown, ChevronRight, Monitor
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

    // Update objects list when canvas changes
    useEffect(() => {
        if (!canvas) return;

        const updateObjectsList = () => {
            // Get all canvas objects
            const canvasObjects = getObjects();
            setObjects(canvasObjects);

            // Organize objects into groups
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

    // Organize objects into layout groups
    const organizeObjectsIntoGroups = (canvasObjects: FabricObjectWithId[]) => {
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
            if (!obj.id) return;

            const layoutTag = obj.layoutGroup as string | undefined;
            const isLayoutParent = obj.isLayoutParent as boolean | undefined;

            if (isLayoutParent) {
                // This is a layout parent
                const groupId = layoutTag || `layout_${nextGroupId + Object.keys(layouts).length}`;
                layouts[groupId] = {
                    id: groupId,
                    name: obj.name || `Layout ${Object.keys(layouts).length + 1}`,
                    expanded: expandedStates[groupId] !== undefined ? expandedStates[groupId] : true,
                    objects: [obj]
                };
            }
        });

        // Step 2: Assign child objects
        canvasObjects.forEach(obj => {
            if (!obj.id) return;

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

        setLayoutGroups(Object.values(layouts));
        setUngroupedObjects(unassigned);

        // Update next group ID
        if (Object.keys(layouts).length > 0) {
            setNextGroupId(prevId => Math.max(prevId, Object.keys(layouts).length + 1));
        }
    };

    // Create a new layout group
    const handleCreateNewLayoutGroup = () => {
        if (!canvas) return;

        const groupId = `layout_${nextGroupId}`;
        const layoutName = `Layout ${nextGroupId}`;

        // Create layout background
        addObject('rectangle', {
            name: layoutName,
            width: 500,
            height: 300,
            fill: '#f0f0f0',
            opacity: 0.5,
            isLayoutParent: true,
            layoutGroup: groupId
        });

        setNextGroupId(prevId => prevId + 1);
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

    // Handle group drop (for drag and drop)
    const handleGroupDrop = (groupId: string, e: React.DragEvent) => {
        e.preventDefault();
        if (!canvas || !draggingId) return;

        // Find the dragged object
        const draggedObj = objects.find(obj => obj.id === draggingId);
        if (!draggedObj) return;

        // Layout parents cannot be moved between groups
        if (draggedObj.isLayoutParent) return;

        // Add object to group
        draggedObj.set({
            'layoutGroup': groupId
        });

        canvas.requestRenderAll();
        setDragOverId(null);
        setDraggingId(null);
    };

    // Handle unassigned drop (remove from group)
    const handleUnassignedDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (!canvas || !draggingId) return;

        // Find the dragged object
        const draggedObj = objects.find(obj => obj.id === draggingId);
        if (!draggedObj || !draggedObj.layoutGroup) return;

        // Layout parents cannot be removed from their group
        if (draggedObj.isLayoutParent) return;

        // Remove group property
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
                                    }}
                                    onDragOver={setDragOverId}
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