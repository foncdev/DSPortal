// src/components/DesignEditor/DesignEditorContext.tsx
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { fabric } from 'fabric';

// Define object types
export type ObjectType = 'text' | 'image' | 'video' | 'rectangle' | 'circle' | 'triangle';

// Define fabric object with custom properties
export interface FabricObjectWithId extends fabric.Object {
    id?: number | string;
    objectType?: ObjectType;
    name?: string;
    // 계층 구조를 위한 추가 속성
    layoutGroup?: string;      // 이 객체가 속한 레이아웃 그룹 ID
    isLayoutParent?: boolean;  // 이 객체가 레이아웃의 부모 객체인지 여부
    groupOrder?: number;       // 그룹 내에서의 순서

    // 이동 처리를 위한 임시 속성 추가
    __oldLeft?: number;        // 이동 전 left 위치
    __oldTop?: number;         // 이동 전 top 위치
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

    // 레이아웃 그룹 관련 함수
    createLayoutGroup: (name: string, options?: any) => string;
    addObjectToGroup: (groupId: string, type: ObjectType, options?: any) => void;
    getObjectsByGroup: (groupId: string) => FabricObjectWithId[];
    deleteLayoutGroup: (groupId: string) => void;
    moveObjectToGroup: (objectId: number | string, groupId: string | null) => void;
    moveGroupTogether: (groupId: string, deltaX: number, deltaY: number) => void;

    // Actions
    addObject: (type: ObjectType, options?: any) => void;
    updateObject: (options: Partial<FabricObjectWithId>) => void;
    deleteObject: () => void;
    cloneObject: () => void;
    moveObjectUp: (object?: FabricObjectWithId) => void;
    moveObjectDown: (object?: FabricObjectWithId) => void;
    moveObjectToTop: (object?: FabricObjectWithId) => void;
    moveObjectToBottom: (object?: FabricObjectWithId) => void;
    setObjectZIndex: (object: FabricObjectWithId, newIndex: number) => void;

    // Selection
    selectObject: (object: FabricObjectWithId | null) => void;

    // Property updates
    updateObjectProperty: <T extends unknown>(property: string, value: T) => void;

    // Canvas settings
    showGrid: boolean;
    toggleGrid: () => void;
    zoomLevel: number;
    setZoomLevel: (level: number) => void;

    // History
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
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
    // Canvas ref and state
    const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
    const [selectedObject, setSelectedObject] = useState<FabricObjectWithId | null>(null);
    const [objectCount, setObjectCount] = useState(0);

    // History states
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    // Canvas settings
    const [showGrid, setShowGrid] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);

    // Save canvas state to history
    const saveToHistory = () => {
        if (!canvas) {return;}

        // Get canvas JSON
        const json = JSON.stringify(canvas.toJSON(['id', 'objectType', 'name']));

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

    // Update selected object when selection changes
    useEffect(() => {
        if (!canvas) {return;}

        const handleObjectMoving = (e: fabric.IEvent) => {
            const movedObject = e.target as FabricObjectWithId;

            // 현재 이동 중인 객체가 레이어 부모인지 확인
            if (movedObject && movedObject.isLayoutParent) {
                // 이전 위치와 현재 위치의 차이 계산
                const oldLeft = movedObject.__oldLeft || 0;
                const oldTop = movedObject.__oldTop || 0;
                const newLeft = movedObject.left || 0;
                const newTop = movedObject.top || 0;

                // 이동한 거리 계산
                const deltaX = newLeft - oldLeft;
                const deltaY = newTop - oldTop;

                // 이동량이 없으면 처리하지 않음
                if (deltaX === 0 && deltaY === 0) return;

                // 레이어 그룹 ID 가져오기
                const groupId = movedObject.layoutGroup;
                if (!groupId) return;

                // 해당 그룹의 모든 자식 객체 찾기 (부모 제외)
                const childObjects = canvas.getObjects().filter(obj => {
                    const fabricObj = obj as FabricObjectWithId;
                    return fabricObj.layoutGroup === groupId && !fabricObj.isLayoutParent;
                }) as FabricObjectWithId[];

                // 모든 자식 객체 함께 이동
                childObjects.forEach(child => {
                    child.set({
                        left: (child.left || 0) + deltaX,
                        top: (child.top || 0) + deltaY
                    });
                    child.setCoords();
                });

                // 현재 위치를 이전 위치로 저장 (다음 이동 계산용)
                movedObject.__oldLeft = newLeft;
                movedObject.__oldTop = newTop;

                // 캔버스 렌더링
                canvas.requestRenderAll();
            }
        };

        const handleObjectModified = (e: fabric.IEvent) => {
            const modifiedObject = e.target as FabricObjectWithId;

            // 객체가 수정 완료되면 이전 위치 정보 삭제
            if (modifiedObject) {
                delete modifiedObject.__oldLeft;
                delete modifiedObject.__oldTop;
            }
        };

        const handleBeforeSelectionCleared = (e: fabric.IEvent) => {
            // 선택이 해제되기 전에 이전 위치 기록 삭제
            const activeObjects = canvas.getActiveObjects() as FabricObjectWithId[];
            activeObjects.forEach(obj => {
                delete obj.__oldLeft;
                delete obj.__oldTop;
            });
        };

        const handleObjectSelected = (e: fabric.IEvent) => {
            const selectedObject = e.target as FabricObjectWithId;

            if (selectedObject && selectedObject.isLayoutParent) {
                // 선택 시 현재 위치 저장
                selectedObject.__oldLeft = selectedObject.left;
                selectedObject.__oldTop = selectedObject.top;
            }
        };

        // 이벤트 리스너 등록
        canvas.on('object:moving', handleObjectMoving);
        canvas.on('object:modified', handleObjectModified);
        canvas.on('before:selection:cleared', handleBeforeSelectionCleared);
        canvas.on('selection:created', handleObjectSelected);
        canvas.on('selection:updated', handleObjectSelected);

        // 정리 함수
        return () => {
            canvas.off('object:moving', handleObjectMoving);
            canvas.off('object:modified', handleObjectModified);
            canvas.off('before:selection:cleared', handleBeforeSelectionCleared);
            canvas.off('selection:created', handleObjectSelected);
            canvas.off('selection:updated', handleObjectSelected);
        };
    }, [canvas]);


    // Save to history when objects are modified
    useEffect(() => {
        if (!canvas) {return;}

        const handleObjectModified = () => {
            saveToHistory();
        };

        canvas.on('object:modified', handleObjectModified);

        return () => {
            canvas.off('object:modified', handleObjectModified);
        };
    }, [canvas, history, historyIndex]);

    // Get all objects from canvas
    const getObjects = (): FabricObjectWithId[] => {
        if (!canvas) {return [];}
        return canvas.getObjects() as FabricObjectWithId[];
    };

    // Add a new object to the canvas
    const addObject = (type: ObjectType, options: any = {}) => {
        if (!canvas) {return;}

        // Generate a unique ID for the new object
        const newId = objectCount + 1;
        setObjectCount(newId);

        let object: FabricObjectWithId | null = null;

        // Create the object based on type
        switch (type) {
            case 'text':
                object = new fabric.Textbox(options.text || 'New Text', {
                    left: options.left || Math.random() * (width - 200) + 100,
                    top: options.top || Math.random() * (height - 200) + 100,
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
                    left: options.left || Math.random() * (width - 200) + 100,
                    top: options.top || Math.random() * (height - 200) + 100,
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
                    left: options.left || Math.random() * (width - 200) + 100,
                    top: options.top || Math.random() * (height - 200) + 100,
                    radius: options.radius || 50,
                    fill: options.fill || '#10b981'
                });
                break;

            case 'triangle':
                object = new fabric.Triangle({
                    left: options.left || Math.random() * (width - 200) + 100,
                    top: options.top || Math.random() * (height - 200) + 100,
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
                        name: options.name || `Image ${newId}`,
                        layoutGroup: options.layoutGroup || undefined
                    });

                    canvas.add(img);
                    canvas.setActiveObject(img);
                    canvas.requestRenderAll();
                    setSelectedObject(img);
                    saveToHistory();
                });
                return;

            case 'video':
                // Videos require additional implementation - placeholder for now
                object = new fabric.Rect({
                    left: options.left || Math.random() * (width - 200) + 100,
                    top: options.top || Math.random() * (height - 200) + 100,
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
                name: options.name || `${type.charAt(0).toUpperCase() + type.slice(1)} ${newId}`
            });

            // If no specific layout group provided, try to add to active group
            if (!options.layoutGroup) {
                const activeGroupId = getActiveLayoutGroupId();
                if (activeGroupId) {
                    object.set({
                        'layoutGroup': activeGroupId
                    });
                }
            } else {
                object.set({
                    'layoutGroup': options.layoutGroup
                });
            }

            // Add to canvas, select it, and save to history
            canvas.add(object);
            canvas.setActiveObject(object);
            canvas.requestRenderAll();
            setSelectedObject(object);
            saveToHistory();
        }
    };

    // Update the selected object
    const updateObject = (options: Partial<FabricObjectWithId>) => {
        if (!canvas || !selectedObject) {return;}

        selectedObject.set(options);
        selectedObject.setCoords(); // 객체 좌표 업데이트
        canvas.requestRenderAll(); // renderAll 대신 requestRenderAll 사용
        saveToHistory();
    };

    // Delete the selected object
    const deleteObject = () => {
        if (!canvas || !selectedObject) {return;}

        canvas.remove(selectedObject);
        setSelectedObject(null);
        canvas.requestRenderAll();
        saveToHistory();
    };

    // Clone the selected object
    const cloneObject = () => {
        if (!canvas || !selectedObject) {return;}

        selectedObject.clone((cloned: FabricObjectWithId) => {
            // Generate a new ID for the cloned object
            const newId = objectCount + 1;
            setObjectCount(newId);

            // Offset the cloned object
            cloned.set({
                left: (selectedObject.left || 0) + 20,
                top: (selectedObject.top || 0) + 20,
                id: newId,
                name: `${selectedObject.name || 'Object'} (Copy)`
            });

            canvas.add(cloned);
            canvas.setActiveObject(cloned);
            canvas.requestRenderAll();
            setSelectedObject(cloned);
            saveToHistory();
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
    };

    // Move object down one level
    const moveObjectDown = (object?: FabricObjectWithId) => {
        if (!canvas) {return;}
        const objectToMove = object || selectedObject;
        if (!objectToMove) {return;}

        canvas.sendBackwards(objectToMove);
        canvas.requestRenderAll();
        saveToHistory();
    };

    // Move object to the top
    const moveObjectToTop = (object?: FabricObjectWithId) => {
        if (!canvas) {return;}
        const objectToMove = object || selectedObject;
        if (!objectToMove) {return;}

        canvas.bringToFront(objectToMove);
        canvas.requestRenderAll();
        saveToHistory();
    };

    // Move object to the bottom
    const moveObjectToBottom = (object?: FabricObjectWithId) => {
        if (!canvas) {return;}
        const objectToMove = object || selectedObject;
        if (!objectToMove) {return;}

        canvas.sendToBack(objectToMove);
        canvas.requestRenderAll();
        saveToHistory();
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
        objects.splice(newIndex, 0, object);
        canvas.insertAt(object, newIndex);

        canvas.requestRenderAll();
        saveToHistory();
    };

    // Select an object
    const selectObject = (object: FabricObjectWithId | null) => {
        if (!canvas) {return;}

        if (object) {
            // 객체 선택 전에 활성 객체를 초기화
            canvas.discardActiveObject();
            canvas.setActiveObject(object);
            // 선택 후 객체를 화면에 렌더링하기 위해 renderAll 대신 requestRenderAll 사용
            canvas.requestRenderAll();
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

        // 객체 좌표 업데이트 (특히 크기나 위치 변경시 중요)
        selectedObject.setCoords();
        canvas.requestRenderAll(); // 화면 갱신 요청
        saveToHistory();
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
        });
    };

    // createLayoutGroup: 새로운 레이아웃 그룹 생성
    const createLayoutGroup = (name: string, options: any = {}) => {
        if (!canvas) return '';

        // 타임스탬프 기반 고유 ID 생성
        const timestamp = Date.now();
        const groupId = `layout_${timestamp}`;

        const width = options.width || canvas.getWidth();
        const height = options.height || canvas.getHeight();

        // 레이아웃 부모 객체 생성 (배경 사각형)
        const layoutObject = new fabric.Rect({
            left: options.left || 0,
            top: options.top || 0,
            width: width,
            height: height,
            fill: options.fill || '#f0f0f0',
            opacity: options.opacity || 0.5,
            rx: options.rx || 0,
            ry: options.ry || 0,
            selectable: true,
            hasControls: true,
            hasBorders: true
        });

        // 커스텀 속성 추가
        layoutObject.set({
            id: objectCount + 1,
            objectType: 'rectangle',
            name: name || `레이어 ${objectCount + 1}`,
            isLayoutParent: true,
            layoutGroup: groupId
        });

        // 객체 움직임 이벤트 핸들러 설정
        layoutObject.on('moving', (e) => {
            const movedObj = e.target as FabricObjectWithId;

            // 현재 위치
            const currentLeft = movedObj.left || 0;
            const currentTop = movedObj.top || 0;

            // 이전 위치가 없는 경우 초기화
            if (movedObj.__oldLeft === undefined) {
                movedObj.__oldLeft = currentLeft;
            }
            if (movedObj.__oldTop === undefined) {
                movedObj.__oldTop = currentTop;
            }

            // 이동 거리 계산
            const deltaX = currentLeft - movedObj.__oldLeft;
            const deltaY = currentTop - movedObj.__oldTop;

            // 이동량이 있는 경우에만 자식 객체 이동
            if (deltaX !== 0 || deltaY !== 0) {
                // 자식 객체들 이동
                const childObjects = canvas.getObjects().filter(obj => {
                    const childObj = obj as FabricObjectWithId;
                    return childObj.layoutGroup === groupId && !childObj.isLayoutParent;
                }) as FabricObjectWithId[];

                childObjects.forEach(child => {
                    child.set({
                        left: (child.left || 0) + deltaX,
                        top: (child.top || 0) + deltaY
                    });
                    child.setCoords();
                });

                // 이전 위치 업데이트
                movedObj.__oldLeft = currentLeft;
                movedObj.__oldTop = currentTop;
            }
        });

        // ID 카운터 업데이트
        setObjectCount(objectCount + 1);

        // 캔버스에 추가
        canvas.add(layoutObject);

        // 활성 객체로 설정 (선택)
        canvas.setActiveObject(layoutObject);
        canvas.requestRenderAll();

        // 선택된 객체 상태 업데이트
        setSelectedObject(layoutObject as FabricObjectWithId);

        // 캔버스 상태 저장
        saveToHistory();

        return groupId;
    };

    // addObjectToGroup: 그룹에 객체 추가
    const addObjectToGroup = (groupId: string, type: ObjectType, options: any = {}) => {
        if (!canvas) {return;}

        // 그룹의 레이아웃 부모 객체 찾기
        const groupObjects = getObjectsByGroup(groupId);
        const parentObject = groupObjects.find(obj => obj.isLayoutParent);

        if (!parentObject) {return;}

        // 부모 객체 내부에 위치시키기 위한 좌표 계산
        const parentLeft = parentObject.left || 0;
        const parentTop = parentObject.top || 0;
        const parentWidth = parentObject.width || 0;
        const parentHeight = parentObject.height || 0;

        // 기본 좌표 설정 (부모 객체 중앙)
        const objLeft = options.left || (parentLeft + parentWidth / 2);
        const objTop = options.top || (parentTop + parentHeight / 2);

        // 그룹에 속한 같은 타입 객체 수 계산
        const sameTypeCount = groupObjects.filter(obj =>
            obj.objectType === type ||
            (obj.type === 'textbox' && type === 'text') ||
            (obj.type === 'rect' && type === 'rectangle')
        ).length;

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

        // 객체 추가 시 그룹 정보 포함
        addObject(type, {
            ...options,
            left: objLeft,
            top: objTop,
            name: options.name || `${objName} ${sameTypeCount + 1}`,
            layoutGroup: groupId,
            isLayoutParent: false
        });
    };

    // getObjectsByGroup: 그룹에 속한 객체 가져오기
    const getObjectsByGroup = (groupId: string): FabricObjectWithId[] => {
        if (!canvas) {return [];}

        return canvas.getObjects()
            .filter(obj => (obj as FabricObjectWithId).layoutGroup === groupId) as FabricObjectWithId[];
    };

// deleteLayoutGroup: 레이아웃 그룹 삭제
    const deleteLayoutGroup = (groupId: string) => {
        if (!canvas) {return;}

        // 모든 레이아웃 그룹 찾기
        const allGroups: {id: string, parentObj: FabricObjectWithId}[] = [];

        canvas.getObjects().forEach((obj: FabricObjectWithId) => {
            if (obj.isLayoutParent && obj.layoutGroup) {
                allGroups.push({
                    id: obj.layoutGroup,
                    parentObj: obj
                });
            }
        });

        // 그룹에 속한 모든 객체 찾기
        const groupObjects = getObjectsByGroup(groupId);

        // 모든 객체 캔버스에서 제거
        groupObjects.forEach(obj => {
            canvas.remove(obj);
        });

        canvas.requestRenderAll();

        // 삭제 후 레이아웃 그룹이 하나도 남지 않았다면 자동으로 새 레이아웃 생성
        if (allGroups.length <= 1) {
            // 약간의 지연 후 실행하여 이벤트 루프가 삭제 작업을 완료하도록 함
            setTimeout(() => {
                createLayoutGroup("레이어 1");
            }, 100);
        }

        // 캔버스 상태 저장
        saveToHistory();
    };

// moveObjectToGroup: 객체를 다른 그룹으로 이동
    const moveObjectToGroup = (objectId: number | string, groupId: string | null) => {
        if (!canvas) {return;}

        // 이동할 객체 찾기
        const object = canvas.getObjects().find(
            obj => (obj as FabricObjectWithId).id === objectId
        ) as FabricObjectWithId;

        if (!object) {return;}

        // 레이아웃 부모는 그룹 변경 불가
        if (object.isLayoutParent) {return;}

        // 그룹 속성 업데이트
        object.set({
            'layoutGroup': groupId || undefined
        });

        canvas.requestRenderAll();
        saveToHistory();
    };

    const moveGroupTogether = (groupId: string, deltaX: number, deltaY: number) => {
        if (!canvas) return;

        const groupObjects = canvas.getObjects().filter(obj => {
            const fabricObj = obj as FabricObjectWithId;
            return fabricObj.layoutGroup === groupId;
        }) as FabricObjectWithId[];

        // 모든 그룹 객체 이동
        groupObjects.forEach(obj => {
            obj.set({
                left: (obj.left || 0) + deltaX,
                top: (obj.top || 0) + deltaY
            });
            obj.setCoords();
        });

        canvas.requestRenderAll();
    };

    const getActiveLayoutGroupId = (): string | null => {
        if (!canvas) return null;

        // If a selected object is part of a layout group, use that group
        if (selectedObject && selectedObject.layoutGroup) {
            return selectedObject.layoutGroup as string;
        }

        // Otherwise, find the first layout group
        const objects = canvas.getObjects() as FabricObjectWithId[];
        const layoutParents = objects.filter(obj => obj.isLayoutParent && obj.layoutGroup);

        if (layoutParents.length > 0) {
            return layoutParents[0].layoutGroup as string;
        }

        return null;
    };

    // Move object to active layout group (if exists)
    const moveToActiveLayoutGroup = (object: FabricObjectWithId): void => {
        if (!canvas || object.isLayoutParent) return;

        const activeGroupId = getActiveLayoutGroupId();
        if (activeGroupId) {
            object.set({
                'layoutGroup': activeGroupId
            });
        }
    };


    // Update canUndo and canRedo when history changes
    useEffect(() => {
        setCanUndo(historyIndex > 0);
        setCanRedo(historyIndex < history.length - 1);
    }, [historyIndex, history]);

    // 캔버스에 초기 상태를 저장
    useEffect(() => {
        if (canvas && history.length === 0) {
            saveToHistory();
        }
    }, [canvas]);

    // Context value
    const contextValue: DesignEditorContextType = {
        canvas,
        setCanvas,
        canvasWidth: width,
        canvasHeight: height,
        selectedObject,
        getObjects,
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
        moveToActiveLayoutGroup,
        showGrid,
        toggleGrid,
        zoomLevel,
        setZoomLevel,
        undo,
        redo,
        canUndo,
        canRedo
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

export default DesignEditorContext;