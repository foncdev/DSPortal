// src/components/DesignEditor/context/DesignEditorContext.tsx
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { fabric } from 'fabric';
import {Square} from "lucide-react";
import {CANVAS_PRESETS, DEVICE_FRAMES, RULER_UNITS} from "@/components/DesignEditor/DesignEditor";

// Define object types
export type ObjectType = 'text' | 'image' | 'video' | 'rectangle' | 'circle' | 'triangle';

// 레이어 그룹 타입 정의
export interface LayerGroup {
    id: string;
    name: string;
    parentObject?: FabricObjectWithId;
    objects: FabricObjectWithId[];
    visible: boolean;
    locked: boolean;
    expanded?: boolean;
}

interface CanvasPreset {
    width: number;
    height: number;
    name: string;
    icon: JSX.Element;
}

interface DeviceFrame {
    id: string;
    name: string;
    icon: JSX.Element;
}

interface RulerUnit {
    id: string;
    name: string;
}



interface ObjectStateChangeEvent {
    type: 'lock' | 'unlock' | 'visibility' | 'selection' | 'modification' | 'group';
    objectId: string | number | null;
    groupId?: string;
}

// Define fabric object with custom properties
export interface FabricObjectWithId extends fabric.Object {
    id?: number | string;
    objectType?: ObjectType;
    name?: string;
    // Layout structure properties
    layoutGroup?: string;      // Layout group ID this object belongs to
    isLayoutParent?: boolean;  // Whether this object is a layout parent
    groupOrder?: number;       // Order within group

    // Temporary properties for movement handling
    __oldLeft?: number;        // Previous left position
    __oldTop?: number;         // Previous top position
}

// Define context type
interface DesignEditorContextType {
    // Canvas
    canvas: fabric.Canvas | null;
    setCanvas: (canvas: fabric.Canvas) => void;
    canvasWidth: number;
    canvasHeight: number;

    // Objects
    selectedObject: FabricObjectWithId | null;
    getObjects: () => FabricObjectWithId[];

    // Layer groups
    layerGroups: LayerGroup[];
    activeGroupId: string | null;
    setActiveGroupId: (id: string | null) => void;

    // Layout group functions
    createLayoutGroup: (name: string, options?: any) => string;
    addObjectToGroup: (groupId: string, type: ObjectType, options?: any) => void;
    getObjectsByGroup: (groupId: string) => FabricObjectWithId[];
    deleteLayoutGroup: (groupId: string) => void;
    moveObjectToGroup: (objectId: number | string, groupId: string | null) => void;
    moveGroupTogether: (groupId: string, deltaX: number, deltaY: number) => void;
    toggleGroupVisibility: (groupId: string) => boolean;
    toggleGroupLock: (groupId: string) => boolean;
    renameGroup: (groupId: string, newName: string) => void;

    // Object actions
    addObject: (type: ObjectType, options?: any) => void;
    updateObject: (options: Partial<FabricObjectWithId>) => void;
    deleteObject: () => void;
    cloneObject: () => void;
    moveObjectUp: (object?: FabricObjectWithId) => void;
    moveObjectDown: (object?: FabricObjectWithId) => void;
    moveObjectToTop: (object?: FabricObjectWithId) => void;
    moveObjectToBottom: (object?: FabricObjectWithId) => void;
    setObjectZIndex: (object: FabricObjectWithId, newIndex: number) => void;

    toggleObjectLock: (objectToLock: FabricObjectWithId, newLockState?: boolean) => boolean;
    isObjectLocked: (objectToCheck: FabricObjectWithId) => boolean;

    // Selection
    selectObject: (object: FabricObjectWithId | null) => void;

    // Property updates
    updateObjectProperty: <T extends unknown>(property: string, value: T) => void;

    onObjectStateChange: (callback: (event: ObjectStateChangeEvent) => void) => () => void;
    notifyObjectStateChange: (event: ObjectStateChangeEvent) => void;

    // Canvas settings
    showGrid: boolean;
    toggleGrid: () => void;
    zoomLevel: number;
    setZoomLevel: (level: number) => void;
    snapToGuides: boolean;
    snapToGrid: boolean;
    toggleSnapToGrid: () => void;
    toggleSnapToGuides: () => void;

    // History
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;

    // File operations
    saveAsJSON: () => string;
    loadFromJSON: (json: string) => void;


    // 확장된 기능
    deviceFrame: {
        id: string;
        name: string;
        icon: React.ReactNode;
    } | null;
    showRulers: boolean;
    rulerUnit: {
        id: string;
        name: string;
    };
    showCoordinates: boolean;
    mousePosition: { x: number; y: number };
    canvasPreset: {
        width: number;
        height: number;
        name: string;
        icon: React.ReactNode;
    };
    orientation: 'landscape' | 'portrait';

    // 확장된 액션 메서드
    setDeviceFrame: (frame: { id: string; name: string; icon: React.ReactNode } | null) => void;
    toggleRulers: () => void;
    setRulerUnit: (unit: { id: string; name: string }) => void;
    toggleCoordinates: () => void;
    setMousePosition: (position: { x: number; y: number }) => void;
    setCanvasPreset: (preset: { width: number; height: number; name: string; icon: React.ReactNode }) => void;
    toggleOrientation: () => void;
}

// Create context with default values
const DesignEditorContext = createContext<DesignEditorContextType | undefined>(undefined);

// Provider component
interface DesignEditorProviderProps {
    children: ReactNode;
    width?: number;
    height?: number;
}

export const DesignEditorProvider: React.FC<DesignEditorProviderProps> = ({
                                                                              children,
                                                                              width = 800,
                                                                              height = 600
                                                                          }) => {

    // Canvas state
    const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
    const [selectedObject, setSelectedObject] = useState<FabricObjectWithId | null>(null);
    const [objectCount, setObjectCount] = useState(0);

    // Layer groups state
    const [layerGroups, setLayerGroups] = useState<LayerGroup[]>([]);
    const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

    // History states
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    // Canvas settings
    const [showGrid, setShowGrid] = useState(false);
    const [snapToGuides, setSnapToGuides] = useState(false);
    const [snapToGrid, setSnapToGrid] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);

    const [deviceFrame, setDeviceFrame] = useState<DeviceFrame | null>(null);
    const [showRulers, setShowRulers] = useState<boolean>(true);
    const [rulerUnit, setRulerUnit] = useState<RulerUnit>({ id: 'px', name: 'Pixels (px)' });
    const [showCoordinates, setShowCoordinates] = useState<boolean>(true);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [canvasPreset, setCanvasPreset] = useState<CanvasPreset>({
        width,
        height,
        name: 'Custom',
        icon: <Square size={14} />
    });
    const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');

    // 상태 변경 리스너 관리
    const stateChangeListenersRef = useRef<((event: ObjectStateChangeEvent) => void)[]>([]);

    // 상태 변경 알림 함수
    const notifyObjectStateChange = (event: ObjectStateChangeEvent) => {
        stateChangeListenersRef.current.forEach(listener => listener(event));
    };

    // 리스너 등록 함수
    const onObjectStateChange = (callback: (event: ObjectStateChangeEvent) => void) => {
        stateChangeListenersRef.current.push(callback);

        // 구독 해제 함수 반환
        return () => {
            stateChangeListenersRef.current = stateChangeListenersRef.current.filter(
                listener => listener !== callback
            );
        };
    };

    // Update layer groups based on canvas objects
    const updateLayerGroups = () => {
        if (!canvas) {return;}

        const canvasObjects = canvas.getObjects() as FabricObjectWithId[];

        // Group objects by layout group
        const groupMap: Record<string, FabricObjectWithId[]> = {};

        // First, find all parent objects
        canvasObjects.forEach(obj => {
            if (obj.layoutGroup && obj.isLayoutParent) {
                if (!groupMap[obj.layoutGroup]) {
                    groupMap[obj.layoutGroup] = [];
                }
                // Add parent first
                groupMap[obj.layoutGroup].unshift(obj);
            }
        });

        // Then find all child objects
        canvasObjects.forEach(obj => {
            if (obj.layoutGroup && !obj.isLayoutParent) {
                if (!groupMap[obj.layoutGroup]) {
                    groupMap[obj.layoutGroup] = [];
                }
                groupMap[obj.layoutGroup].push(obj);
            }
        });

        // Convert to layer groups
        const newLayerGroups: LayerGroup[] = Object.entries(groupMap).map(([groupId, objects]) => {
            const parentObject = objects.find(obj => obj.isLayoutParent);
            const existingGroup = layerGroups.find(g => g.id === groupId);

            return {
                id: groupId,
                name: parentObject?.name || `Layer ${groupId}`,
                parentObject,
                objects,
                visible: parentObject?.visible !== false,
                locked: !!(parentObject?.lockMovementX && parentObject?.lockMovementY),
                expanded: existingGroup?.expanded !== false
            };
        });

        setLayerGroups(newLayerGroups);

        // Set active group if none is selected
        if (!activeGroupId && newLayerGroups.length > 0) {
            setActiveGroupId(newLayerGroups[0].id);
        }
    };

    // Save canvas state to history
    const saveToHistory = () => {
        if (!canvas) {return;}

        // Get canvas JSON
        const json = JSON.stringify(canvas.toJSON(['id', 'objectType', 'name', 'layoutGroup', 'isLayoutParent']));

        // Add to history, removing any future states if we're not at the end
        const newHistory = [...history.slice(0, historyIndex + 1), json];
        const newIndex = newHistory.length - 1;

        setHistory(newHistory);
        setHistoryIndex(newIndex);
        setCanUndo(newIndex > 0);
        setCanRedo(false);
    };


    // Apply grid to canvas
    useEffect(() => {
        if (!canvas) {return;}

        if (showGrid) {
            // Create grid
            const gridSize = 20;
            const gridLines: fabric.Line[] = [];

            // Create vertical lines
            for (let i = 0; i <= width; i += gridSize) {
                gridLines.push(new fabric.Line([i, 0, i, height], {
                    stroke: '#ccc',
                    strokeWidth: 0.5,
                    selectable: false,
                    evented: false,
                    excludeFromExport: true
                }));
            }

            // Create horizontal lines
            for (let i = 0; i <= height; i += gridSize) {
                gridLines.push(new fabric.Line([0, i, width, i], {
                    stroke: '#ccc',
                    strokeWidth: 0.5,
                    selectable: false,
                    evented: false,
                    excludeFromExport: true
                }));
            }

            // Create a group for all grid lines
            const gridGroup = new fabric.Group(gridLines, {
                selectable: false,
                evented: false,
                excludeFromExport: true
            });

            // Add grid to canvas
            canvas.add(gridGroup);
            gridGroup.sendToBack();

            // Store grid reference for removal
            (canvas as any)._gridGroup = gridGroup;
        } else {
            // Remove grid if exists
            const gridGroup = (canvas as any)._gridGroup;
            if (gridGroup) {
                canvas.remove(gridGroup);
                (canvas as any)._gridGroup = null;
            }
        }

        canvas.requestRenderAll();
    }, [canvas, showGrid, width, height]);

    // Set up layout group movement handling
    useEffect(() => {
        if (!canvas) {return;}

        // 객체 이동 처리 함수
        const handleObjectMoving = (e: fabric.IEvent) => {
            const movedObject = e.target as FabricObjectWithId;

            // 레이아웃 부모 객체인 경우에만 처리
            if (movedObject && movedObject.isLayoutParent) {
                const groupId = movedObject.layoutGroup;
                if (!groupId) {return;}

                // 현재 위치 (안전하게 처리)
                const newLeft = typeof movedObject.left === 'number' ? movedObject.left : 0;
                const newTop = typeof movedObject.top === 'number' ? movedObject.top : 0;

                // 이전 위치가 없으면 초기화
                if (typeof movedObject.__oldLeft !== 'number') {
                    movedObject.__oldLeft = newLeft;
                    movedObject.__oldTop = newTop;
                    return; // 초기 설정이면 이동 처리 건너뜀
                }

                // 이동 거리 계산
                const deltaX = newLeft - movedObject.__oldLeft;
                const deltaY = newTop - movedObject.__oldTop;

                // 실제 이동이 있는 경우만 처리
                if (deltaX !== 0 || deltaY !== 0) {
                    // 그룹의 모든 자식 객체 검색 (부모 제외)
                    const childObjects = canvas.getObjects().filter(obj => {
                        const fabricObj = obj as FabricObjectWithId;
                        return fabricObj.layoutGroup === groupId && !fabricObj.isLayoutParent;
                    }) as FabricObjectWithId[];

                    // 모든 자식 객체 이동
                    childObjects.forEach(child => {
                        // 자식 객체 현재 위치 안전하게 가져오기
                        const childLeft = typeof child.left === 'number' ? child.left : 0;
                        const childTop = typeof child.top === 'number' ? child.top : 0;

                        // 새 위치 설정
                        child.set({
                            left: childLeft + deltaX,
                            top: childTop + deltaY
                        });

                        // 좌표 업데이트 (중요!)
                        child.setCoords();
                    });

                    // 현재 위치를 이전 위치로 저장 (다음 이동에 사용)
                    movedObject.__oldLeft = newLeft;
                    movedObject.__oldTop = newTop;

                    // 캔버스 렌더링
                    canvas.requestRenderAll();
                }
            }
        };

        // 객체 수정 완료 처리
        const handleObjectModified = (e: fabric.IEvent) => {
            const modifiedObject = e.target as FabricObjectWithId;

            // 위치 데이터 초기화
            if (modifiedObject) {
                delete modifiedObject.__oldLeft;
                delete modifiedObject.__oldTop;
            }

            // 히스토리에 저장 (상태 저장)
            saveToHistory();

            // Update layer groups
            updateLayerGroups();
        };

        // Handle selection cleared
        const handleBeforeSelectionCleared = (e: fabric.IEvent) => {
            // Clear old position data when selection is cleared
            const activeObjects = canvas.getActiveObjects() as FabricObjectWithId[];
            activeObjects.forEach(obj => {
                delete obj.__oldLeft;
                delete obj.__oldTop;
            });
        };

        // 객체 선택 처리
        const handleObjectSelected = (e: fabric.IEvent) => {
            const selectedObj = e.target as FabricObjectWithId;

            if (selectedObj && selectedObj.isLayoutParent) {
                // 선택 시 현재 위치 저장
                selectedObj.__oldLeft = selectedObj.left;
                selectedObj.__oldTop = selectedObj.top;
            }

            // If object belongs to a group, set that group as active
            if (selectedObj && selectedObj.layoutGroup) {
                setActiveGroupId(selectedObj.layoutGroup as string);
            }
        };

        // Handle object added
        const handleObjectAdded = () => {
            updateLayerGroups();
        };

        // Handle object removed
        const handleObjectRemoved = () => {
            updateLayerGroups();
        };

        // Register event listeners
        canvas.on('object:moving', handleObjectMoving);
        canvas.on('object:modified', handleObjectModified);
        canvas.on('before:selection:cleared', handleBeforeSelectionCleared);
        canvas.on('selection:created', handleObjectSelected);
        canvas.on('selection:updated', handleObjectSelected);
        canvas.on('object:added', handleObjectAdded);
        canvas.on('object:removed', handleObjectRemoved);

        // Cleanup on unmount
        return () => {
            canvas.off('object:moving', handleObjectMoving);
            canvas.off('object:modified', handleObjectModified);
            canvas.off('before:selection:cleared', handleBeforeSelectionCleared);
            canvas.off('selection:created', handleObjectSelected);
            canvas.off('selection:updated', handleObjectSelected);
            canvas.off('object:added', handleObjectAdded);
            canvas.off('object:removed', handleObjectRemoved);
        };
    }, [canvas, activeGroupId]);

    // Update layout groups when canvas objects change
    useEffect(() => {
        if (canvas) {
            updateLayerGroups();
        }
    }, [canvas]);

    // Update selected object when selection changes
    useEffect(() => {
        if (!canvas) {return;}

        const handleSelectionCreated = (e: fabric.IEvent) => {
            const selected = e.selected?.[0] as FabricObjectWithId;
            if (selected) {
                setSelectedObject(selected);
            }
        };

        const handleSelectionUpdated = (e: fabric.IEvent) => {
            const selected = e.selected?.[0] as FabricObjectWithId;
            if (selected) {
                setSelectedObject(selected);
            }
        };

        const handleSelectionCleared = () => {
            setSelectedObject(null);
        };

        canvas.on('selection:created', handleSelectionCreated);
        canvas.on('selection:updated', handleSelectionUpdated);
        canvas.on('selection:cleared', handleSelectionCleared);

        return () => {
            canvas.off('selection:created', handleSelectionCreated);
            canvas.off('selection:updated', handleSelectionUpdated);
            canvas.off('selection:cleared', handleSelectionCleared);
        };
    }, [canvas]);

    // Get all objects from canvas
    const getObjects = (): FabricObjectWithId[] => {
        if (!canvas) {return [];}
        return canvas.getObjects() as FabricObjectWithId[];
    };

    const addObject = (type: ObjectType, options: any = {}) => {
        if (!canvas) {return;}

        let targetGroupId = activeGroupId;
        if ( layerGroups.length == 0 ) {
            targetGroupId = createLayoutGroup('Layer 1');
        }

        if (!targetGroupId) {
            console.error('No active layout group available');
            return;
        }

        const newId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const objcnt = objectCount + 1;
        setObjectCount(objcnt);

        const mergedOptions = {
            ...options,
            layoutGroup: targetGroupId,
            left: options.left || Math.random() * (width - 200) + 100,
            top: options.top || Math.random() * (height - 200) + 100,
            id: newId,
            name: options.name || `${type.charAt(0).toUpperCase() + type.slice(1)} ${objcnt}`
        };

        let object: FabricObjectWithId | null = null;
        switch (type) {
            case 'text':
                object = new fabric.Textbox(options.text || 'New Text', {
                    ...mergedOptions,
                    fontFamily: options.fontFamily || 'Arial',
                    fontSize: options.fontSize || 24,
                    fill: options.fill || '#000000',
                    width: options.width || 200,
                    editable: true,
                    originX: options.originX || 'left',
                    originY: options.originY || 'top',
                    textAlign: options.textAlign || 'left'
                });
                break;

            case 'rectangle':
                object = new fabric.Rect({
                    ...mergedOptions,
                    width: options.width || 150,
                    height: options.height || 100,
                    fill: options.fill || '#3b82f6',
                    rx: options.rx || 0,
                    ry: options.ry || 0,
                    selectable: options.selectable !== undefined ? options.selectable : true
                });
                break;

            case 'circle':
                object = new fabric.Circle({
                    ...mergedOptions,
                    radius: options.radius || 50,
                    fill: options.fill || '#10b981'
                });
                break;

            case 'triangle':
                object = new fabric.Triangle({
                    ...mergedOptions,
                    width: options.width || 100,
                    height: options.height || 100,
                    fill: options.fill || '#f59e0b'
                });
                break;

            case 'image':
                // Create a placeholder image
                fabric.Image.fromURL(options.src || '/api/placeholder/200/200', (img) => {
                    img.set({
                        left: options.left || Math.random() * (width - 200) + 100,
                        top: options.top || Math.random() * (height - 200) + 100,
                        id: newId,
                        objectType: type,
                        name: options.name || `Image ${objcnt}`,
                        layoutGroup: targetGroupId
                    });

                    canvas.add(img);
                    canvas.setActiveObject(img);
                    canvas.requestRenderAll();
                    setSelectedObject(img);
                    saveToHistory();
                    updateLayerGroups();
                });
                return;

            case 'video':
                // Videos require additional implementation - placeholder for now
                object = new fabric.Rect({
                    ...mergedOptions,
                    width: options.width || 320,
                    height: options.height || 240,
                    fill: '#000000'
                });
                break;
        }

        if (object) {
            // Add custom properties
            object.set({
                id: newId,
                objectType: type,
                name: options.name || `${type.charAt(0).toUpperCase() + type.slice(1)} ${objcnt}`
            });

            // Add to canvas, select it, and save to history
            canvas.add(object);
            canvas.setActiveObject(object);
            canvas.requestRenderAll();
            setSelectedObject(object);
            saveToHistory();
            updateLayerGroups();
        }
    };

    // Update the selected object
    const updateObject = (options: Partial<FabricObjectWithId>) => {
        if (!canvas || !selectedObject) {return;}

        selectedObject.set(options);
        selectedObject.setCoords();
        canvas.requestRenderAll();
        saveToHistory();
        updateLayerGroups();
    };

    // Delete the selected object
    const deleteObject = () => {
        if (!canvas || !selectedObject) {return;}

        // If this is a layout parent, delete the whole group
        if (selectedObject.isLayoutParent && selectedObject.layoutGroup) {
            deleteLayoutGroup(selectedObject.layoutGroup as string);
            return;
        }

        canvas.remove(selectedObject);
        setSelectedObject(null);
        canvas.requestRenderAll();
        saveToHistory();
        updateLayerGroups();
    };

    // Clone the selected object
    const cloneObject = () => {
        if (!canvas || !selectedObject) {return;}

        // Don't clone layout parent objects
        if (selectedObject.isLayoutParent) {
            console.warn("Cannot clone layout parent objects");
            return;
        }

        selectedObject.clone((cloned: FabricObjectWithId) => {
            // Generate a new ID for the cloned object
            const newId = `${selectedObject.objectType || 'object'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Offset the cloned object
            cloned.set({
                left: (selectedObject.left || 0) + 20,
                top: (selectedObject.top || 0) + 20,
                id: newId,
                name: `${selectedObject.name || 'Object'} (Copy)`,
                // Keep the same layout group
                layoutGroup: selectedObject.layoutGroup
            });

            canvas.add(cloned);
            canvas.setActiveObject(cloned);
            canvas.requestRenderAll();
            setSelectedObject(cloned);
            saveToHistory();
            updateLayerGroups();
        });
    };

    // Move object up one level
    const moveObjectUp = (object?: FabricObjectWithId) => {
        if (!canvas) {return;}
        const objectToMove = object || selectedObject;
        if (!objectToMove) {return;}

        canvas.bringForward(objectToMove);
        canvas.requestRenderAll();
        saveToHistory();
        updateLayerGroups();
    };

    // Move object down one level
    const moveObjectDown = (object?: FabricObjectWithId) => {
        if (!canvas) {return;}
        const objectToMove = object || selectedObject;
        if (!objectToMove) {return;}

        canvas.sendBackwards(objectToMove);
        canvas.requestRenderAll();
        saveToHistory();
        updateLayerGroups();
    };

    // Move object to the top
    const moveObjectToTop = (object?: FabricObjectWithId) => {
        if (!canvas) {return;}
        const objectToMove = object || selectedObject;
        if (!objectToMove) {return;}

        canvas.bringToFront(objectToMove);
        canvas.requestRenderAll();
        saveToHistory();
        updateLayerGroups();
    };

    // Move object to the bottom
    const moveObjectToBottom = (object?: FabricObjectWithId) => {
        if (!canvas) {return;}
        const objectToMove = object || selectedObject;
        if (!objectToMove) {return;}

        canvas.sendToBack(objectToMove);
        canvas.requestRenderAll();
        saveToHistory();
        updateLayerGroups();
    };

    // Set object z-index directly (for drag & drop ordering)
    const setObjectZIndex = (object: FabricObjectWithId, newIndex: number) => {
        if (!canvas) {return;}

        const objects = canvas.getObjects();
        const currentIndex = objects.indexOf(object);

        if (currentIndex === -1) {return;} // Object not found
        if (currentIndex === newIndex) {return;} // Already at target index

        // Remove from current position
        canvas.remove(object);

        // Insert at new position
        canvas.insertAt(object, newIndex);
        canvas.requestRenderAll();
        saveToHistory();
        updateLayerGroups();
    };

    // Select an object
    const selectObject = (object: FabricObjectWithId | null) => {
        if (!canvas) {return;}

        if (object) {
            // Discard active object before selecting new one
            canvas.discardActiveObject();
            canvas.setActiveObject(object);
            canvas.requestRenderAll();

            // If object belongs to a group, set that group as active
            if (object.layoutGroup) {
                setActiveGroupId(object.layoutGroup as string);
            }
        } else {
            canvas.discardActiveObject();
            canvas.requestRenderAll();
        }

        setSelectedObject(object);
    };

    // Update a property of the selected object
    const updateObjectProperty = <T,>(property: string, value: T) => {
        if (!canvas || !selectedObject) {return;}

        // Handle nested properties (e.g., "border.color")
        if (property.includes('.')) {
            const [parent, child] = property.split('.');
            (selectedObject as any)[parent] = {
                ...(selectedObject as any)[parent],
                [child]: value
            };
        } else {
            (selectedObject as any)[property] = value;
        }

        // Update object coordinates
        selectedObject.setCoords();
        canvas.requestRenderAll();
        saveToHistory();
        updateLayerGroups();
    };

    // Toggle grid display
    const toggleGrid = () => {
        setShowGrid(!showGrid);
    };

    // Undo last action
    const undo = () => {
        if (!canvas || !canUndo) {return;}

        const newIndex = historyIndex - 1;
        const state = history[newIndex];

        canvas.loadFromJSON(state, () => {
            setHistoryIndex(newIndex);
            setCanUndo(newIndex > 0);
            setCanRedo(true);
            canvas.requestRenderAll();
            updateLayerGroups();
        });
    };

    // Redo last undone action
    const redo = () => {
        if (!canvas || !canRedo || historyIndex >= history.length - 1) {return;}

        const newIndex = historyIndex + 1;
        const state = history[newIndex];

        canvas.loadFromJSON(state, () => {
            setHistoryIndex(newIndex);
            setCanUndo(true);
            setCanRedo(newIndex < history.length - 1);
            canvas.requestRenderAll();
            updateLayerGroups();
        });
    };

    // createLayoutGroup: Create a new layout group
    const createLayoutGroup = (name: string, options: any = {}) => {
        if (!canvas) {return '';}

        // Create a unique ID based on timestamp
        const groupId = `layout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const groupWidth = options.width || (canvas.getWidth() * 0.8);
        const groupHeight = options.height || (canvas.getHeight() * 0.8);

        // Create layout parent object (background rectangle)
        const layoutObject = new fabric.Rect({
            left: options.left || (canvas.getWidth() - groupWidth) / 2,
            top: options.top || (canvas.getHeight() - groupHeight) / 2,
            width: groupWidth,
            height: groupHeight,
            fill: options.fill || '#f0f0f0',
            opacity: options.opacity || 0.5,
            rx: options.rx || 0,
            ry: options.ry || 0,
            selectable: true,
            hasControls: true,
            hasBorders: true
        });

        // Add custom properties
        layoutObject.set({
            id: `parent_${groupId}`,
            objectType: 'rectangle',
            name: name || `Layer ${objectCount + 1}`,
            isLayoutParent: true,
            layoutGroup: groupId
        });

        // Update object counter
        setObjectCount(objectCount + 1);

        // Add to canvas
        canvas.add(layoutObject);

        // Set as active object
        canvas.setActiveObject(layoutObject);
        canvas.requestRenderAll();

        // Update selected object state
        setSelectedObject(layoutObject as FabricObjectWithId);

        // Update active group
        setActiveGroupId(groupId);

        // Save canvas state
        saveToHistory();
        updateLayerGroups();

        return groupId;
    };

    // Add object to a group
    const addObjectToGroup = (groupId: string, type: ObjectType, options: any = {}) => {
        if (!canvas) {return;}

        // Find the layer group
        const layerGroup = layerGroups.find(group => group.id === groupId);
        if (!layerGroup) {
            console.error(`Layer group ${groupId} not found`);
            return;
        }

        // Get parent object
        const parentObject = layerGroup.parentObject;
        if (!parentObject) {
            console.error(`Parent object for group ${groupId} not found`);
            return;
        }

        // Calculate position within parent object
        const parentLeft = parentObject.left || 0;
        const parentTop = parentObject.top || 0;
        const parentWidth = parentObject.width || 0;
        const parentHeight = parentObject.height || 0;

        // Default position (center of parent)
        const objLeft = options.left || (parentLeft + parentWidth / 2);
        const objTop = options.top || (parentTop + parentHeight / 2);

        // Count objects of same type in group
        const sameTypeCount = layerGroup.objects.filter(obj =>
            obj.objectType === type ||
            (obj.type === 'textbox' && type === 'text') ||
            (obj.type === 'rect' && type === 'rectangle')
        ).length;

        // Set default name based on object type
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

        // Add object to group with proper states
        addObject(type, {
            ...options,
            left: objLeft,
            top: objTop,
            name: options.name || `${objName} ${sameTypeCount + 1}`,
            layoutGroup: groupId,
            isLayoutParent: false,
            visible: layerGroup.visible,
            selectable: layerGroup.visible && !layerGroup.locked,
            lockMovementX: layerGroup.locked,
            lockMovementY: layerGroup.locked,
            lockRotation: layerGroup.locked,
            lockScalingX: layerGroup.locked,
            lockScalingY: layerGroup.locked
        });
    };

    // Get objects in a group
    const getObjectsByGroup = (groupId: string): FabricObjectWithId[] => {
        if (!canvas) {return [];}

        return canvas.getObjects()
            .filter(obj => (obj as FabricObjectWithId).layoutGroup === groupId) as FabricObjectWithId[];
    };

    // Delete a layout group
    const deleteLayoutGroup = (groupId: string) => {
        if (!canvas) {return;}

        // Find the group to delete
        const groupToDelete = layerGroups.find(group => group.id === groupId);
        if (!groupToDelete) {return;}

        // Remove all objects in the group from canvas
        const groupObjects = getObjectsByGroup(groupId);
        groupObjects.forEach(obj => {
            canvas.remove(obj);
        });

        // Update layer groups
        updateLayerGroups();

        // Auto-create new layout group if none remain
        if (layerGroups.length === 0) {
            setTimeout(() => {
                createLayoutGroup("Layer 1");
            }, 100);
        } else {
            // Set a different active group
            if (activeGroupId === groupId && layerGroups.length > 0) {
                setActiveGroupId(layerGroups[0].id);
            }
        }

        canvas.requestRenderAll();
        // Save canvas state
        saveToHistory();
    };

    // Toggle group visibility
    const toggleGroupVisibility = (groupId: string) => {
        if (!canvas) {return false;}

        const group = layerGroups.find(g => g.id === groupId);
        if (!group) {return false;}

        const newVisibility = !group.visible;

        // Update all objects in the group
        group.objects.forEach(obj => {
            obj.set({
                'visible': newVisibility,
                'evented': newVisibility
            });

            // If hiding, deselect if it's the selected object
            if (!newVisibility && selectedObject && selectedObject.id === obj.id) {
                canvas.discardActiveObject();
                setSelectedObject(null);
            }
        });

        canvas.requestRenderAll();
        saveToHistory();
        updateLayerGroups();

        // Notify state change
        notifyObjectStateChange({
            type: 'visibility',
            objectId: null,
            groupId
        });

        return newVisibility;
    };

    // Toggle group lock
    const toggleGroupLock = (groupId: string) => {
        if (!canvas) {return false;}

        const group = layerGroups.find(g => g.id === groupId);
        if (!group) {return false;}

        const newLockState = !group.locked;

        // Update all objects in the group
        group.objects.forEach(obj => {
            obj.set({
                'lockMovementX': newLockState,
                'lockMovementY': newLockState,
                'lockRotation': newLockState,
                'lockScalingX': newLockState,
                'lockScalingY': newLockState,
                // Keep objects selectable even when locked
                'selectable': group.visible
            });

            obj.setCoords();
        });

        canvas.requestRenderAll();
        saveToHistory();
        updateLayerGroups();

        // Notify state change
        notifyObjectStateChange({
            type: newLockState ? 'lock' : 'unlock',
            objectId: null,
            groupId
        });

        return newLockState;
    };

    // Rename a group
    const renameGroup = (groupId: string, newName: string) => {
        if (!canvas || !newName.trim()) {return;}

        const group = layerGroups.find(g => g.id === groupId);
        if (!group || !group.parentObject) {return;}

        // Update the parent object's name
        group.parentObject.set({ name: newName });

        canvas.requestRenderAll();
        saveToHistory();
        updateLayerGroups();
    };

    // Move object to a different group
    const moveObjectToGroup = (objectId: number | string, groupId: string | null) => {
        if (!canvas) {return;}

        // Find the object to move
        const object = canvas.getObjects().find(
            obj => (obj as FabricObjectWithId).id === objectId
        ) as FabricObjectWithId;

        if (!object) {return;}

        // Don't allow moving layout parent objects
        if (object.isLayoutParent) {return;}

        // Find target group to get visibility and lock state
        const targetGroup = groupId ? layerGroups.find(g => g.id === groupId) : null;

        // Update group property and states based on target group
        if (targetGroup) {
            object.set({
                'layoutGroup': groupId,
                'visible': targetGroup.visible,
                'selectable': targetGroup.visible && !targetGroup.locked,
                'lockMovementX': targetGroup.locked,
                'lockMovementY': targetGroup.locked,
                'lockRotation': targetGroup.locked,
                'lockScalingX': targetGroup.locked,
                'lockScalingY': targetGroup.locked
            });
        } else {
            object.set({
                'layoutGroup': undefined
            });
        }

        canvas.requestRenderAll();
        saveToHistory();
        updateLayerGroups();
    };

    // Move all objects in a group together
    const moveGroupTogether = (groupId: string, deltaX: number, deltaY: number) => {
        if (!canvas) {return;}

        // 그룹의 모든 객체 찾기 (부모와 자식 모두)
        const groupObjects = canvas.getObjects().filter(obj => {
            const fabricObj = obj as FabricObjectWithId;
            return fabricObj.layoutGroup === groupId;
        }) as FabricObjectWithId[];

        // 모든 객체 이동
        groupObjects.forEach(obj => {
            // 안전하게 현재 위치 가져오기
            const objLeft = typeof obj.left === 'number' ? obj.left : 0;
            const objTop = typeof obj.top === 'number' ? obj.top : 0;

            // 새 위치 설정
            obj.set({
                left: objLeft + deltaX,
                top: objTop + deltaY
            });

            // 좌표 업데이트
            obj.setCoords();
        });

        // 캔버스 렌더링
        canvas.requestRenderAll();
    };

    // Toggle object lock state
    const toggleObjectLock = (objectToLock: FabricObjectWithId, newLockState?: boolean) => {
        if (!canvas) {return false;}

        try {
            // If this is a layout parent, toggle lock for the whole group
            if (objectToLock.isLayoutParent && objectToLock.layoutGroup) {
                return toggleGroupLock(objectToLock.layoutGroup as string);
            }

            // 현재 잠금 상태 확인
            const isCurrentlyLocked = isObjectLocked(objectToLock);

            // 새 잠금 상태 결정 (파라미터가 없으면 현재 상태 반전)
            const willBeLocked = newLockState !== undefined ? newLockState : !isCurrentlyLocked;

            // 잠금 속성 설정
            objectToLock.set({
                lockMovementX: willBeLocked,
                lockMovementY: willBeLocked,
                lockRotation: willBeLocked,
                lockScalingX: willBeLocked,
                lockScalingY: willBeLocked,
                selectable: true // 항상 선택 가능하게 유지
            });

            // 캔버스 업데이트
            objectToLock.setCoords();
            canvas.requestRenderAll();

            // Update layer groups
            updateLayerGroups();

            // 상태 변경 알림 발행
            notifyObjectStateChange({
                type: willBeLocked ? 'lock' : 'unlock',
                objectId: objectToLock.id || null
            });

            return willBeLocked;
        } catch (error) {
            console.error("Error toggling object lock:", error);
            return false;
        }
    };


    // Toggle guides snapping
    const toggleSnapToGuides = () => {
        setSnapToGuides(!snapToGuides);
    };

    // Toggle grid snapping
    const toggleSnapToGrid = () => {
        setSnapToGrid(!snapToGrid);
    };

    // 객체의 현재 잠금 상태를 확인하는 유틸리티 함수
    const isObjectLocked = (objectToCheck: FabricObjectWithId) => !!(objectToCheck.lockMovementX && objectToCheck.lockMovementY);

    // JSON Import/Export functions

    // Export canvas as JSON string
    const saveAsJSON = () => {
        if (!canvas) {return '';}

        const json = JSON.stringify(canvas.toJSON([
            'id',
            'objectType',
            'name',
            'layoutGroup',
            'isLayoutParent',
            'visible',
            'lockMovementX',
            'lockMovementY',
            'lockRotation',
            'lockScalingX',
            'lockScalingY'
        ]));

        return json;
    };

    // Load canvas from JSON string
    const loadFromJSON = (json: string) => {
        if (!canvas) {return;}

        try {
            canvas.loadFromJSON(json, () => {
                canvas.requestRenderAll();
                updateLayerGroups();
                saveToHistory();

                // Select first object if available
                const objects = canvas.getObjects() as FabricObjectWithId[];
                if (objects.length > 0) {
                    selectObject(objects[0]);

                    // Set active group to the first parent's group
                    const parent = objects.find(obj => obj.isLayoutParent);
                    if (parent && parent.layoutGroup) {
                        setActiveGroupId(parent.layoutGroup as string);
                    }
                }
            });
        } catch (error) {
            console.error('Error loading from JSON:', error);
        }
    };


    const toggleRulers = () => {
        setShowRulers(!showRulers);
    };

    const toggleCoordinates = () => {
        setShowCoordinates(!showCoordinates);
    };

    const toggleOrientation = () => {
        setOrientation(orientation === 'landscape' ? 'portrait' : 'landscape');

        // 필요하면 캔버스 크기도 조정
        if (canvas) {
            if (orientation === 'landscape' && canvasPreset.width < canvasPreset.height) {
                canvas.setWidth(canvasPreset.height);
                canvas.setHeight(canvasPreset.width);
            } else if (orientation === 'portrait' && canvasPreset.width > canvasPreset.height) {
                canvas.setWidth(canvasPreset.height);
                canvas.setHeight(canvasPreset.width);
            }
            canvas.requestRenderAll();
        }
    };

    // Update canUndo and canRedo when history changes
    useEffect(() => {
        setCanUndo(historyIndex > 0);
        setCanRedo(historyIndex < history.length - 1);
    }, [historyIndex, history]);

    // Save initial canvas state
    useEffect(() => {
        if (canvas && history.length === 0) {
            saveToHistory();
        }
    }, [canvas]);

    const contextValue: DesignEditorContextType = {
        canvas,
        setCanvas,
        canvasWidth: width,
        canvasHeight: height,
        selectedObject,
        getObjects,
        layerGroups,
        activeGroupId,
        setActiveGroupId,
        addObject,
        updateObject,
        deleteObject,
        cloneObject,
        moveObjectUp,
        moveObjectDown,
        moveObjectToTop,
        moveObjectToBottom,
        setObjectZIndex,
        selectObject,
        updateObjectProperty,
        createLayoutGroup,
        addObjectToGroup,
        getObjectsByGroup,
        deleteLayoutGroup,
        moveObjectToGroup,
        moveGroupTogether,
        toggleGroupVisibility,
        toggleGroupLock,
        renameGroup,
        toggleObjectLock,
        isObjectLocked,
        onObjectStateChange,
        notifyObjectStateChange,
        snapToGuides,
        toggleSnapToGuides,
        toggleSnapToGrid,
        snapToGrid,
        showGrid,
        toggleGrid,
        zoomLevel,
        setZoomLevel,
        undo,
        redo,
        canUndo,
        canRedo,
        saveAsJSON,
        loadFromJSON,

        deviceFrame,
        showRulers,
        rulerUnit,
        showCoordinates,
        mousePosition,
        canvasPreset,
        orientation,

        setDeviceFrame,
        toggleRulers,
        setRulerUnit,
        toggleCoordinates,
        setMousePosition,
        setCanvasPreset,
        toggleOrientation
    };

    return (
        <DesignEditorContext.Provider value={contextValue}>
            {children}
        </DesignEditorContext.Provider>
    );
};

// Custom hook to use the design editor context
export const useDesignEditor = () => {
    const context = useContext(DesignEditorContext);

    if (context === undefined) {
        throw new Error('useDesignEditor must be used within a DesignEditorProvider');
    }

    return context;
};