// src/components/DesignEditor/ObjectsPanel/ObjectsPanel.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
    Layers, ChevronDown, ChevronRight, Monitor, Plus,
    AlertTriangle
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
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Processing flags to prevent concurrent operations
    const isProcessingRef = useRef(false);
    const initialLoadDoneRef = useRef(false);
    const updateRequiredRef = useRef(false);

    // Update objects list when canvas changes
    useEffect(() => {
        if (!canvas) return;

        const updateObjectsList = () => {
            // Prevent concurrent processing
            if (isProcessingRef.current) {
                updateRequiredRef.current = true;
                return;
            }

            isProcessingRef.current = true;
            updateRequiredRef.current = false;

            try {
                // Get all canvas objects
                const canvasObjects = getObjects();
                setObjects(canvasObjects);

                // First load vs subsequent updates
                if (initialLoadDoneRef.current) {
                    // Organize objects into groups for updates
                    organizeObjectsIntoGroups(canvasObjects);
                } else {
                    // Set initial loaded flag
                    initialLoadDoneRef.current = true;

                    // Process groups after initial render
                    setTimeout(() => {
                        const objects = getObjects();
                        organizeObjectsIntoGroups(objects);
                    }, 100);
                }
            } catch (error) {
                console.error('Error updating objects list:', error);
                setErrorMessage('Error updating objects list. Please try again.');
            } finally {
                isProcessingRef.current = false;

                // If an update was requested during processing, schedule another update
                if (updateRequiredRef.current) {
                    setTimeout(updateObjectsList, 50);
                }
            }
        };

        // Initial update
        updateObjectsList();

        // Canvas event listeners for object changes
        const events = [
            'object:added',
            'object:removed',
            'object:modified',
            'selection:created',
            'selection:updated',
            'selection:cleared',
        ];

        const handleCanvasEvent = () => {
            // Debounce events to prevent multiple rapid updates
            setTimeout(updateObjectsList, 50);
        };

        // Add event listeners
        events.forEach(event => {
            canvas.on(event, handleCanvasEvent);
        });

        // Cleanup on unmount
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
        // Prevent concurrent processing
        if (isProcessingRef.current && !updateRequiredRef.current) return;
        isProcessingRef.current = true;

        try {
            // Preserve expanded state of existing groups
            const expandedStates: Record<string, boolean> = {};
            layoutGroups.forEach(group => {
                expandedStates[group.id] = group.expanded;
            });

            // Process objects with layout tags
            const layouts: Record<string, LayoutGroup> = {};

            // Step 1: Find layout parent objects (containers)
            canvasObjects.forEach(obj => {
                if (!obj.id) return;

                const layoutTag = obj.layoutGroup as string | undefined;
                const isLayoutParent = obj.isLayoutParent as boolean | undefined;

                if (isLayoutParent) {
                    // This is a layout parent container
                    const groupId = layoutTag || `layout_${nextGroupId + Object.keys(layouts).length}`;
                    layouts[groupId] = {
                        id: groupId,
                        name: obj.name || `Layer ${Object.keys(layouts).length + 1}`,
                        expanded: expandedStates[groupId] !== undefined ? expandedStates[groupId] : true,
                        objects: [obj]
                    };
                }
            });

            // Step 2: Assign child objects to their parent layouts
            canvasObjects.forEach(obj => {
                if (!obj.id || obj.isLayoutParent) return;

                const layoutTag = obj.layoutGroup as string | undefined;

                if (layoutTag && layouts[layoutTag]) {
                    // Child object belonging to a layout
                    layouts[layoutTag].objects.push(obj);
                } else if (Object.keys(layouts).length > 0) {
                    // Orphaned object - assign to first layout group
                    const firstGroupId = Object.keys(layouts)[0];
                    obj.set({
                        'layoutGroup': firstGroupId
                    });
                    layouts[firstGroupId].objects.push(obj);
                }
            });

            // Convert to array for rendering
            const groupsArray = Object.values(layouts);

            // Sort objects within each group by z-index
            groupsArray.forEach(group => {
                group.objects.sort((a, b) => {
                    const canvasObjects = canvas?.getObjects() || [];
                    return canvasObjects.indexOf(a) - canvasObjects.indexOf(b);
                });
            });

            // Create default layer if none exists and objects are present
            if (groupsArray.length === 0 && canvasObjects.length > 0) {
                // Schedule layer creation with delay to prevent event conflicts
                setTimeout(() => {
                    if (!isProcessingRef.current) {
                        handleCreateNewLayoutGroup();
                    }
                }, 100);
                return;
            }

            setLayoutGroups(groupsArray);

            // Update next group ID
            if (Object.keys(layouts).length > 0) {
                setNextGroupId(prevId => Math.max(prevId, Object.keys(layouts).length + 1));
            }
        } catch (error) {
            console.error('Error organizing objects into groups:', error);
            setErrorMessage('Error organizing layers. Please try again.');
        } finally {
            isProcessingRef.current = false;
        }
    };

    // Create a new layout group
    const handleCreateNewLayoutGroup = () => {
        if (!canvas || isProcessingRef.current) return;

        // Set processing flag to prevent concurrent operations
        isProcessingRef.current = true;
        setErrorMessage(null);

        try {
            // Create new layout group and get its ID
            const groupId = createLayoutGroup(`Layer ${nextGroupId}`);

            // Increment next group ID
            setNextGroupId(prevId => prevId + 1);

            // Force update objects list after slight delay
            setTimeout(() => {
                const objects = getObjects();
                organizeObjectsIntoGroups(objects);
                isProcessingRef.current = false;
            }, 100);
        } catch (error) {
            console.error('Error creating layout group:', error);
            setErrorMessage('Error creating layer. Please try again.');
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

            {/* Error message display */}
            {errorMessage && (
                <div className={styles.errorMessage}>
                    <AlertTriangle size={16} />
                    <span>{errorMessage}</span>
                    <button onClick={() => setErrorMessage(null)}>×</button>
                </div>
            )}

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
                    {/* "New Layer" button */}
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
                                        if (!canvas || !draggingId) return;

                                        // Find the dragged object
                                        const draggedObj = objects.find(obj => obj.id === draggingId);
                                        if (!draggedObj || draggedObj.isLayoutParent) return;

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

                                        // Find the group
                                        const group = layoutGroups.find(g => g.id === group.id);
                                        if (!group) return;

                                        // Find the dragged object
                                        const draggedObj = group.objects.find(o => o.id === draggingId);
                                        if (!draggedObj) return;

                                        // Reorder objects within the group
                                        const currentIndex = group.objects.indexOf(draggedObj);
                                        if (currentIndex === index) return;

                                        const newObjects = [...group.objects];
                                        newObjects.splice(currentIndex, 1);
                                        newObjects.splice(index, 0, draggedObj);

                                        // Update state
                                        setLayoutGroups(prev => prev.map(g =>
                                            g.id === group.id ? {...g, objects: newObjects} : g
                                        ));

                                        // Update canvas z-index
                                        if (canvas) {
                                            const canvasObjects = canvas.getObjects();
                                            const startIndex = canvasObjects.indexOf(draggedObj);

                                            if (startIndex !== -1) {
                                                canvas.remove(draggedObj);
                                                canvas.insertAt(draggedObj, index);
                                                canvas.requestRenderAll();
                                            }
                                        }

                                        // Reset drag state
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