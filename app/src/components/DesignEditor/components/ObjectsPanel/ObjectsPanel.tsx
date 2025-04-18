// src/components/DesignEditor/components/ObjectsPanel/ObjectsPanel.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Layers, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDesignEditor, FabricObjectWithId } from '../../context/DesignEditorContext';
import ObjectToolbar from './ObjectToolbar';
import LayoutGroupItem from './LayoutGroupItem';
import styles from './ObjectsPanel.module.scss';

interface ObjectsPanelProps {
    className?: string;
}

/**
 * ObjectsPanel displays and manages all layers and objects in the canvas
 */
const ObjectsPanel: React.FC<ObjectsPanelProps> = ({ className }) => {
    const { t } = useTranslation();
    const {
        canvas,
        layerGroups,
        selectedObject,
        selectObject,
        activeGroupId,
        setActiveGroupId,
        addObject,
        createLayoutGroup
    } = useDesignEditor();

    const [objectsExpanded, setObjectsExpanded] = useState(true);
    const [draggingId, setDraggingId] = useState<number | string | null>(null);
    const [dragOverId, setDragOverId] = useState<number | string | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Processing flags to prevent concurrent operations
    const isProcessingRef = useRef(false);
    const panelRef = useRef<HTMLDivElement>(null);

    // Clear drag states when mouse leaves the panel or on mouse up
    useEffect(() => {
        const handleMouseLeave = () => {
            resetDragStates();
        };

        const handleMouseUp = () => {
            if (draggingId) {
                // Small delay to allow drop handlers to process first
                setTimeout(resetDragStates, 100);
            }
        };

        const panel = panelRef.current;
        if (panel) {
            panel.addEventListener('mouseleave', handleMouseLeave);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            if (panel) {
                panel.removeEventListener('mouseleave', handleMouseLeave);
            }
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingId]);

    // Reset all drag related states
    const resetDragStates = () => {
        setDraggingId(null);
        setDragOverId(null);
        setDragOverIndex(null);
    };

    // Handle adding an object to the canvas
    const handleAddObject = (type: FabricObjectWithId['objectType'], options?: any) => {
        if (!canvas || isProcessingRef.current) {return;}

        isProcessingRef.current = true;
        setErrorMessage(null);

        try {
            addObject(type, options);
        } catch (error) {
            console.error(`Error adding ${type} to canvas:`, error);
            setErrorMessage(`Failed to add ${type}`);
        } finally {
            isProcessingRef.current = false;
        }
    };

    // Create a new layout group
    const handleCreateNewLayoutGroup = () => {
        if (!canvas || isProcessingRef.current) {return;}

        // Set processing flag to prevent concurrent operations
        isProcessingRef.current = true;
        setErrorMessage(null);

        try {
            // Create new layout group with auto-named layer
            const groupName = `Layer ${layerGroups.length + 1}`;
            createLayoutGroup(groupName);
        } catch (error) {
            console.error('Error creating layout group:', error);
            setErrorMessage('Error creating layer. Please try again.');
        } finally {
            isProcessingRef.current = false;
        }
    };

    // Toggle objects section expanded state
    const toggleObjectsExpanded = () => {
        setObjectsExpanded(!objectsExpanded);
    };

    // Handler for when a layout group is selected
    const handleLayoutGroupSelect = (groupId: string, groupObject: FabricObjectWithId) => {
        // 이미 처리 중이면 중복 실행 방지
        if (isProcessingRef.current) {return;}

        isProcessingRef.current = true;

        try {
            // 해당 레이어의 부모 객체(isLayoutParent가 true인 객체)를 찾습니다
            const parentObject = layerGroups
                .find(group => group.id === groupId)?.objects
                .find(obj => obj.isLayoutParent);

            if (parentObject) {
                // 캔버스에서 해당 객체 선택
                selectObject(parentObject);

                // 캔버스 화면 중앙에 선택된 객체가 보이도록 조정
                if (canvas) {
                    // 선택된 객체의 중심을 계산
                    const center = parentObject.getCenterPoint();

                    // 객체가 화면에 잘 보이도록 캔버스 조정
                    // 필요하다면 여기에 zoom/pan 로직을 추가할 수 있습니다
                    canvas.requestRenderAll();
                }
            }
        } catch (error) {
            console.error('Error selecting layout group:', error);
        } finally {
            isProcessingRef.current = false;
        }
    };

    // Handle drag start - track which object is being dragged
    const handleDragStart = (id: number | string) => {
        setDraggingId(id);
    };

    // Handle drag end - clear all drag states
    const handleDragEnd = () => {
        // Small delay to allow drop handlers to complete first
        setTimeout(resetDragStates, 50);
    };

    // Handle drag over for a group with improved visual feedback
    const handleGroupDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Keep track of what group we're dragging over
        if (e.currentTarget.getAttribute('data-group-id')) {
            const groupId = e.currentTarget.getAttribute('data-group-id');
            setDragOverId(`group_${groupId}`);
        }

        // Set drag effect
        e.dataTransfer.dropEffect = 'move';
    };

    return (
        <div
            className={`${styles.objectsPanel} ${className || ''}`}
            ref={panelRef}
        >
            {/* Object tools */}
            <ObjectToolbar onAddObject={handleAddObject} />

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
                    <span>{t('editor.layers')}</span>
                </div>
                <div className={styles.objectCount}>{layerGroups.length}</div>
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
                        title={t('editor.addNewLayer')}
                        disabled={isProcessingRef.current}
                    >
                        <span>{t('editor.addNewLayer')}</span>
                    </button>

                    {/* Layout groups */}
                    {layerGroups.length > 0 && (
                        <div className={styles.layoutGroupsList}>
                            {layerGroups.map((group, groupIndex) => (
                                <LayoutGroupItem
                                    key={`group_${group.id}_${groupIndex}`}
                                    group={group}
                                    isActive={activeGroupId === group.id}
                                    selectedObjectId={selectedObject?.id}
                                    isDragOver={dragOverId === `group_${group.id}`}
                                    onActivate={() => setActiveGroupId(group.id)}
                                    onToggleExpand={() => {}}
                                    onGroupSelect={() => {
                                        // 그룹의 부모 객체 찾기
                                        const parentObject = group.objects.find(obj => obj.isLayoutParent);
                                        if (parentObject) {
                                            handleLayoutGroupSelect(group.id, parentObject);
                                        }
                                    }}
                                    onDragOver={handleGroupDragOver}
                                    onDrop={(e) => {
                                        // Handle in LayoutGroupItem
                                        setTimeout(resetDragStates, 50);
                                    }}
                                    onDragStart={handleDragStart}
                                    onDragEnd={handleDragEnd}
                                    onDragOverId={setDragOverId}
                                    onDragOverIndex={setDragOverIndex}
                                />
                            ))}
                        </div>
                    )}

                    {/* Empty state */}
                    {layerGroups.length === 0 && (
                        <div className={styles.emptyState}>
                            {t('editor.noLayers')}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ObjectsPanel;