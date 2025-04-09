// src/components/DesignEditor/DesignEditorContext.tsx
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { fabric } from 'fabric';

// Define object types
export type ObjectType = 'text' | 'image' | 'video' | 'rectangle' | 'circle' | 'triangle';

// Define fabric object with custom properties
export interface FabricObjectWithId extends fabric.Object {
    id?: number;
    objectType?: ObjectType;
    name?: string;
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

    // Actions
    addObject: (type: ObjectType, options?: any) => void;
    updateObject: (options: Partial<FabricObjectWithId>) => void;
    deleteObject: () => void;
    cloneObject: () => void;

    // Selection
    selectObject: (object: FabricObjectWithId | null) => void;

    // Property updates
    updateObjectProperty: <T>(property: string, value: T) => void;

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
        if (!canvas) return;

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
        if (!canvas) return;

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
        if (!canvas) return;

        const handleSelectionCreated = (e: fabric.IEvent) => {
            const selection = e.selected?.[0] as FabricObjectWithId;
            setSelectedObject(selection || null);
        };

        const handleSelectionCleared = () => {
            setSelectedObject(null);
        };

        canvas.on('selection:created', handleSelectionCreated);
        canvas.on('selection:updated', handleSelectionCreated);
        canvas.on('selection:cleared', handleSelectionCleared);

        return () => {
            canvas.off('selection:created', handleSelectionCreated);
            canvas.off('selection:updated', handleSelectionCreated);
            canvas.off('selection:cleared', handleSelectionCleared);
        };
    }, [canvas]);


    // Save to history when objects are modified
    useEffect(() => {
        if (!canvas) return;

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
        if (!canvas) return [];
        return canvas.getObjects() as FabricObjectWithId[];
    };

    // Add a new object to the canvas
    const addObject = (type: ObjectType, options: any = {}) => {
        if (!canvas) return;

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
                    editable: true
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
                    ry: options.ry || 0
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
                        name: options.name || `Image ${newId}`
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

            // Add to canvas, select it, and save to history
            canvas.add(object);
            canvas.setActiveObject(object);
            console.log("Object added:", object);
            canvas.requestRenderAll(); // renderAll 대신 requestRenderAll 사용
            setSelectedObject(object); // 선택된 객체 상태 업데이트
            saveToHistory();
        }
    };

    // Update the selected object
    const updateObject = (options: Partial<FabricObjectWithId>) => {
        if (!canvas || !selectedObject) return;

        selectedObject.set(options);
        selectedObject.setCoords(); // 객체 좌표 업데이트
        canvas.requestRenderAll(); // renderAll 대신 requestRenderAll 사용
        saveToHistory();
    };

    // Delete the selected object
    const deleteObject = () => {
        if (!canvas || !selectedObject) return;

        canvas.remove(selectedObject);
        setSelectedObject(null);
        canvas.requestRenderAll();
        saveToHistory();
    };

    // Clone the selected object
    const cloneObject = () => {
        if (!canvas || !selectedObject) return;

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

    // Select an object
    const selectObject = (object: FabricObjectWithId | null) => {
        if (!canvas) return;

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
        if (!canvas || !selectedObject) return;

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
        if (!canvas || !canUndo) return;

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
        if (!canvas || !canRedo || historyIndex >= history.length - 1) return;

        const newIndex = historyIndex + 1;
        const state = history[newIndex];

        canvas.loadFromJSON(state, () => {
            setHistoryIndex(newIndex);
            setCanUndo(true);
            setCanRedo(newIndex < history.length - 1);
            canvas.requestRenderAll();
        });
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
        selectObject,
        updateObjectProperty,
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