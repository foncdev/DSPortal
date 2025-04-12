// src/components/DesignEditor/context/DesignEditorContext.tsx
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { fabric } from 'fabric';

// Define object types
export type ObjectType = 'text' | 'image' | 'video' | 'rectangle' | 'circle' | 'triangle';

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

    // Layout group functions
    createLayoutGroup: (name: string, options?: any) => string;
    addObjectToGroup: (groupId: string, type: ObjectType, options?: any) => void;
    getObjectsByGroup: (groupId: string) => FabricObjectWithId[];
    deleteLayoutGroup: (groupId: string) => void;
    moveObjectToGroup: (objectId: number | string, groupId: string | null) => void;
    moveGroupTogether: (groupId: string, deltaX: number, deltaY: number) => void;

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

    // Canvas state
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

        // Handle object movement
        const handleObjectMoving = (e: fabric.IEvent) => {
            const movedObject = e.target as FabricObjectWithId;

            // Check if the moving object is a layout parent
            if (movedObject && movedObject.isLayoutParent) {
                // Calculate movement delta
                const oldLeft = movedObject.__oldLeft || 0;
                const oldTop = movedObject.__oldTop || 0;
                const newLeft = movedObject.left || 0;
                const newTop = movedObject.top || 0;

                // Calculate movement delta
                const deltaX = newLeft - oldLeft;
                const deltaY = newTop - oldTop;

                // If no movement, do nothing
                if (deltaX === 0 && deltaY === 0) {return;}

                // Get group ID
                const groupId = movedObject.layoutGroup;
                if (!groupId) {return;}

                // Find all child objects in this group (excluding parent)
                const childObjects = canvas.getObjects().filter(obj => {
                    const fabricObj = obj as FabricObjectWithId;
                    return fabricObj.layoutGroup === groupId && !fabricObj.isLayoutParent;
                }) as FabricObjectWithId[];

                // Move all child objects together
                childObjects.forEach(child => {
                    child.set({
                        left: (child.left || 0) + deltaX,
                        top: (child.top || 0) + deltaY
                    });
                    child.setCoords();
                });

                // Save current position for next movement calculation
                movedObject.__oldLeft = newLeft;
                movedObject.__oldTop = newTop;

                // Render canvas
                canvas.requestRenderAll();
            }
        };

        // Handle object modification completion
        const handleObjectModified = (e: fabric.IEvent) => {
            const modifiedObject = e.target as FabricObjectWithId;

            // Clear old position data when modification is complete
            if (modifiedObject) {
                delete modifiedObject.__oldLeft;
                delete modifiedObject.__oldTop;
            }
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

        // Handle object selected
        const handleObjectSelected = (e: fabric.IEvent) => {
            const selectedObject = e.target as FabricObjectWithId;

            if (selectedObject && selectedObject.isLayoutParent) {
                // Save current position when selected
                selectedObject.__oldLeft = selectedObject.left;
                selectedObject.__oldTop = selectedObject.top;
            }
        };

        // Register event listeners
        canvas.on('object:moving', handleObjectMoving);
        canvas.on('object:modified', handleObjectModified);
        canvas.on('before:selection:cleared', handleBeforeSelectionCleared);
        canvas.on('selection:created', handleObjectSelected);
        canvas.on('selection:updated', handleObjectSelected);

        // Cleanup on unmount
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

        const ensureLayoutGroup = () => {
            const layoutGroups = canvas.getObjects().filter(
                obj => (obj as FabricObjectWithId).isLayoutParent
            );

            // If no layout groups exist, create one automatically
            if (layoutGroups.length === 0) {
                createLayoutGroup(`Layer 1`);
            }
        };

        ensureLayoutGroup();

        const activeGroupId = getActiveLayoutGroupId();
        if (!activeGroupId) {
            console.error('No active layout group available');
            return;
        }

        const newId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const objcnt = objectCount + 1;
        setObjectCount(objcnt);

        const mergedOptions = {
            ...options,
            layoutGroup: activeGroupId,
            left: options.left || Math.random() * (width - 200) + 100,
            top: options.top || Math.random() * (height - 200) + 100,
            id: newId,
            name: options.name || `${type.charAt(0).toUpperCase() + type.slice(1)} ${newId}`
        };

        let object: FabricObjectWithId | null = null;

        // Create the object based on type
        switch (type) {
            case 'text':
                object = new fabric.Textbox(options.text || 'New Text', {
                    ...mergedOptions,
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
                    ...mergedOptions,
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
                    ...mergedOptions,
                    left: options.left || Math.random() * (width - 200) + 100,
                    top: options.top || Math.random() * (height - 200) + 100,
                    radius: options.radius || 50,
                    fill: options.fill || '#10b981'
                });
                break;

            case 'triangle':
                object = new fabric.Triangle({
                    ...mergedOptions,
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
                    ...mergedOptions,
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
        selectedObject.setCoords();
        canvas.requestRenderAll();
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
            // Discard active object before selecting new one
            canvas.discardActiveObject();
            canvas.setActiveObject(object);
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

        // Update object coordinates
        selectedObject.setCoords();
        canvas.requestRenderAll();
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


    // createLayoutGroup: Create a new layout group
    const createLayoutGroup = (name: string, options: any = {}) => {
        if (!canvas) {return '';}

        // Remove any existing layout groups if this is the first group
        const existingGroups = canvas.getObjects().filter(
            obj => (obj as FabricObjectWithId).isLayoutParent
        );

        if (existingGroups.length > 0) {
            existingGroups.forEach(group => canvas.remove(group));
        }

        // Create a unique ID based on timestamp
        const groupId = `layout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const width = options.width || canvas.getWidth();
        const height = options.height || canvas.getHeight();

        // Create layout parent object (background rectangle)
        const layoutObject = new fabric.Rect({
            left: options.left || 0,
            top: options.top || 0,
            width,
            height,
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
            id: objectCount + 1,
            objectType: 'rectangle',
            name: name || `Layer ${objectCount + 1}`,
            isLayoutParent: true,
            layoutGroup: groupId
        });

        // Set up movement event handler
        layoutObject.on('moving', (e) => {
            const movedObj = e.target as FabricObjectWithId;

            // Current position
            const currentLeft = movedObj.left || 0;
            const currentTop = movedObj.top || 0;

            // Initialize old position if not set
            if (movedObj.__oldLeft === undefined) {
                movedObj.__oldLeft = currentLeft;
            }
            if (movedObj.__oldTop === undefined) {
                movedObj.__oldTop = currentTop;
            }

            // Calculate movement delta
            const deltaX = currentLeft - movedObj.__oldLeft;
            const deltaY = currentTop - movedObj.__oldTop;

            // If there's movement, update child objects
            if (deltaX !== 0 || deltaY !== 0) {
                // Find child objects
                const childObjects = canvas.getObjects().filter(obj => {
                    const childObj = obj as FabricObjectWithId;
                    return childObj.layoutGroup === groupId && !childObj.isLayoutParent;
                }) as FabricObjectWithId[];

                // Move child objects
                childObjects.forEach(child => {
                    child.set({
                        left: (child.left || 0) + deltaX,
                        top: (child.top || 0) + deltaY
                    });
                    child.setCoords();
                });

                // Update old position values
                movedObj.__oldLeft = currentLeft;
                movedObj.__oldTop = currentTop;
            }
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

        // Save canvas state
        saveToHistory();

        return groupId;
    };

    // Add object to a group
    const addObjectToGroup = (groupId: string, type: ObjectType, options: any = {}) => {
        if (!canvas) {return;}

        // Find parent layout object
        const groupObjects = getObjectsByGroup(groupId);
        const parentObject = groupObjects.find(obj => obj.isLayoutParent);

        if (!parentObject) {return;}

        // Calculate position within parent object
        const parentLeft = parentObject.left || 0;
        const parentTop = parentObject.top || 0;
        const parentWidth = parentObject.width || 0;
        const parentHeight = parentObject.height || 0;

        // Default position (center of parent)
        const objLeft = options.left || (parentLeft + parentWidth / 2);
        const objTop = options.top || (parentTop + parentHeight / 2);

        // Count objects of same type in group
        const sameTypeCount = groupObjects.filter(obj =>
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

        // Add object to group
        addObject(type, {
            ...options,
            left: objLeft,
            top: objTop,
            name: options.name || `${objName} ${sameTypeCount + 1}`,
            layoutGroup: groupId,
            isLayoutParent: false
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

        // Find all layout groups
        const allGroups: {id: string, parentObj: FabricObjectWithId}[] = [];

        canvas.getObjects().forEach((obj: FabricObjectWithId) => {
            if (obj.isLayoutParent && obj.layoutGroup) {
                allGroups.push({
                    id: obj.layoutGroup,
                    parentObj: obj
                });
            }
        });

        // Find all objects in the group
        const groupObjects = getObjectsByGroup(groupId);

        // Remove all objects from canvas
        groupObjects.forEach(obj => {
            canvas.remove(obj);
        });

        canvas.requestRenderAll();

        // Auto-create new layout group if none remain
        if (allGroups.length <= 1) {
            setTimeout(() => {
                createLayoutGroup("Layer 1");
            }, 100);
        }

        // Save canvas state
        saveToHistory();
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

        // Update group property
        object.set({
            'layoutGroup': groupId || undefined
        });

        canvas.requestRenderAll();
        saveToHistory();
    };

    // Move all objects in a group together
    const moveGroupTogether = (groupId: string, deltaX: number, deltaY: number) => {
        if (!canvas) {return;}

        // Find all objects in the group
        const groupObjects = canvas.getObjects().filter(obj => {
            const fabricObj = obj as FabricObjectWithId;
            return fabricObj.layoutGroup === groupId;
        }) as FabricObjectWithId[];

        // Move all objects
        groupObjects.forEach(obj => {
            obj.set({
                left: (obj.left || 0) + deltaX,
                top: (obj.top || 0) + deltaY
            });
            obj.setCoords();
        });

        canvas.requestRenderAll();
    };

    // Find active layout group ID
    const getActiveLayoutGroupId = (): string | null => {
        if (!canvas) {return null;}

        // If selected object is part of a layout group, use that group
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