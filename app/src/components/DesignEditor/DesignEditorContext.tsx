// src/components/DesignEditor/DesignEditorContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define object types
export interface DesignObject {
    id: number;
    type: 'text' | 'image' | 'video' | 'rectangle' | 'circle' | 'triangle';
    name: string;
    x?: number;
    y?: number;
    properties: {
        [key: string]: any;
    };
}

// Define context type
interface DesignEditorContextType {
    // Canvas state
    objects: DesignObject[];
    selectedObject: DesignObject | null;
    canvasWidth: number;
    canvasHeight: number;

    // Actions
    addObject: (type: DesignObject['type']) => void;
    updateObject: (id: number, data: Partial<DesignObject>) => void;
    deleteObject: (id: number) => void;
    selectObject: (object: DesignObject | null) => void;
    updateObjectProperty: (id: number, property: string, value: any) => void;
    moveObject: (id: number, x: number, y: number) => void;

    // History handling
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;

    // Canvas settings
    showGrid: boolean;
    toggleGrid: () => void;
    zoomLevel: number;
    setZoomLevel: (level: number) => void;
}

// Create context with default values
const DesignEditorContext = createContext<DesignEditorContextType | undefined>(undefined);

// Provider component
interface DesignEditorProviderProps {
    children: ReactNode;
    initialObjects?: DesignObject[];
    width?: number;
    height?: number;
}

export const DesignEditorProvider: React.FC<DesignEditorProviderProps> = ({
                                                                              children,
                                                                              initialObjects = [],
                                                                              width = 800,
                                                                              height = 600
                                                                          }) => {
    // State management
    const [objects, setObjects] = useState<DesignObject[]>(initialObjects);
    const [selectedObject, setSelectedObject] = useState<DesignObject | null>(null);
    const [history, setHistory] = useState<DesignObject[][]>([initialObjects]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [showGrid, setShowGrid] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);

    // Computed properties
    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;

    // Add a new state to the history stack
    const addToHistory = (newObjects: DesignObject[]) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push([...newObjects]);
        setHistory(newHistory);
        setHistoryIndex(historyIndex + 1);
    };

    // Actions
    const addObject = (type: DesignObject['type']) => {
        const newId = objects.length ? Math.max(...objects.map(o => o.id)) + 1 : 1;

        let newObject: DesignObject = {
            id: newId,
            type,
            name: `${type} ${newId}`,
            x: Math.floor(Math.random() * (width - 100)) + 50,
            y: Math.floor(Math.random() * (height - 100)) + 50,
            properties: {}
        };

        // Set default properties based on type
        switch (type) {
            case 'text':
                newObject.properties = { text: 'New Text', fontSize: 16, color: '#000000' };
                break;
            case 'image':
                newObject.properties = { src: '/api/placeholder/200/200', width: 200, height: 200 };
                break;
            case 'video':
                newObject.properties = { src: '', width: 320, height: 240 };
                break;
            case 'rectangle':
                newObject.properties = { width: 100, height: 100, color: '#e5e7eb', radius: 0 };
                break;
            case 'circle':
                newObject.properties = { radius: 50, color: '#e5e7eb' };
                break;
            case 'triangle':
                newObject.properties = { width: 100, height: 100, color: '#e5e7eb' };
                break;
        }

        const newObjects = [...objects, newObject];
        setObjects(newObjects);
        setSelectedObject(newObject);
        addToHistory(newObjects);
    };

    const updateObject = (id: number, data: Partial<DesignObject>) => {
        const newObjects = objects.map(obj =>
            obj.id === id ? { ...obj, ...data } : obj
        );

        setObjects(newObjects);

        // Update selected object if it was modified
        if (selectedObject && selectedObject.id === id) {
            setSelectedObject({ ...selectedObject, ...data });
        }

        addToHistory(newObjects);
    };

    const deleteObject = (id: number) => {
        const newObjects = objects.filter(obj => obj.id !== id);
        setObjects(newObjects);

        // Deselect if the selected object was deleted
        if (selectedObject && selectedObject.id === id) {
            setSelectedObject(null);
        }

        addToHistory(newObjects);
    };

    const selectObject = (object: DesignObject | null) => {
        setSelectedObject(object);
    };

    const updateObjectProperty = (id: number, property: string, value: any) => {
        const newObjects = objects.map(obj => {
            if (obj.id === id) {
                return {
                    ...obj,
                    properties: {
                        ...obj.properties,
                        [property]: value
                    }
                };
            }
            return obj;
        });

        setObjects(newObjects);

        // Update selected object if its property was modified
        if (selectedObject && selectedObject.id === id) {
            setSelectedObject({
                ...selectedObject,
                properties: {
                    ...selectedObject.properties,
                    [property]: value
                }
            });
        }

        addToHistory(newObjects);
    };

    const moveObject = (id: number, x: number, y: number) => {
        const newObjects = objects.map(obj => {
            if (obj.id === id) {
                return { ...obj, x, y };
            }
            return obj;
        });

        setObjects(newObjects);

        // Update selected object position if it was moved
        if (selectedObject && selectedObject.id === id) {
            setSelectedObject({ ...selectedObject, x, y });
        }

        // We don't add this to history for every move to avoid history pollution
        // Usually, we'd add to history on mouse up instead
    };

    const finalizeMove = () => {
        // Add current state to history after movement is complete
        addToHistory(objects);
    };

    // History navigation
    const undo = () => {
        if (canUndo) {
            const prevIndex = historyIndex - 1;
            const prevState = history[prevIndex];
            setObjects(prevState);
            setHistoryIndex(prevIndex);

            // Update selected object or deselect if it no longer exists
            if (selectedObject) {
                const objectInPrevState = prevState.find(obj => obj.id === selectedObject.id);
                setSelectedObject(objectInPrevState || null);
            }
        }
    };

    const redo = () => {
        if (canRedo) {
            const nextIndex = historyIndex + 1;
            const nextState = history[nextIndex];
            setObjects(nextState);
            setHistoryIndex(nextIndex);

            // Update selected object or deselect if it no longer exists
            if (selectedObject) {
                const objectInNextState = nextState.find(obj => obj.id === selectedObject.id);
                setSelectedObject(objectInNextState || null);
            }
        }
    };

    // Canvas settings
    const toggleGrid = () => {
        setShowGrid(!showGrid);
    };

    const contextValue: DesignEditorContextType = {
        // State
        objects,
        selectedObject,
        canvasWidth: width,
        canvasHeight: height,

        // Actions
        addObject,
        updateObject,
        deleteObject,
        selectObject,
        updateObjectProperty,
        moveObject,

        // History
        undo,
        redo,
        canUndo,
        canRedo,

        // Canvas settings
        showGrid,
        toggleGrid,
        zoomLevel,
        setZoomLevel
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