// src/components/DesignEditor/hooks/useCanvasEvents.ts
import { useCallback } from 'react';
import { FabricObjectWithId, useDesignEditor } from '../context/DesignEditorContext';

/**
 * Custom hook to manage canvas event handlers
 * Enhanced with support for guidelines and snapping controls
 */
export const useCanvasEvents = () => {
    const {
        canvas,
        undo,
        redo,
        canUndo,
        canRedo,
        zoomLevel,
        setZoomLevel,
        deleteObject,
        toggleGrid,
        toggleSnapToGuides,
        toggleSnapToGrid,
        showGrid,
        snapToGuides,
        snapToGrid
    } = useDesignEditor();

    // Handle keyboard shortcuts
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!canvas) {return;}

        // Ctrl key shortcuts
        if (e.ctrlKey) {
            switch (e.key) {
                case 'z':
                    if (!e.shiftKey) {
                        // Ctrl+Z (Undo)
                        if (canUndo) {
                            e.preventDefault();
                            undo();
                        }
                    } else {
                        // Ctrl+Shift+Z (Redo)
                        if (canRedo) {
                            e.preventDefault();
                            redo();
                        }
                    }
                    break;

                case 'y':
                    // Ctrl+Y (Redo)
                    if (canRedo) {
                        e.preventDefault();
                        redo();
                    }
                    break;

                case '=':
                case '+':
                    // Ctrl++ (Zoom In)
                    e.preventDefault();
                    setZoomLevel(Math.min(zoomLevel + 0.1, 3));
                    break;

                case '-':
                    // Ctrl+- (Zoom Out)
                    e.preventDefault();
                    setZoomLevel(Math.max(zoomLevel - 0.1, 0.1));
                    break;

                case '0':
                    // Ctrl+0 (Reset Zoom)
                    e.preventDefault();
                    setZoomLevel(1);
                    break;

                case ';':
                    // Ctrl+; (Toggle Guidelines)
                    if (e.shiftKey) {
                        // Ctrl+Shift+; (Toggle Grid Snapping)
                        e.preventDefault();
                        toggleSnapToGrid();
                    } else {
                        // Ctrl+; (Toggle Guidelines)
                        e.preventDefault();
                        toggleSnapToGuides();
                    }
                    break;
            }
        }

        // Single key shortcuts (without modifiers)
        if (!e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey) {
            switch (e.key) {
                case 'Delete':
                case 'Backspace':
                    // Delete key to delete selected objects
                    const activeObject = canvas.getActiveObject() as FabricObjectWithId;
                    if (activeObject && !activeObject.excludeFromExport) {
                        deleteObject();
                    }
                    break;

                case 'g':
                case 'G':
                    // G key to toggle grid
                    toggleGrid();
                    break;
            }
        }

    }, [canvas, canUndo, canRedo, undo, redo, zoomLevel, setZoomLevel, deleteObject, toggleGrid, toggleSnapToGuides, toggleSnapToGrid]);

    // Handle objects moving with modifier keys
    const handleObjectMoving = useCallback((e: fabric.IEvent) => {
        if (!canvas || !e.e) return;

        const evt = e.e as KeyboardEvent;
        const target = e.target as FabricObjectWithId;

        if (!target) return;

        // Get the object's group handler data (if available)
        const guidelinesHandler = (canvas as any).__guidelinesHandler;

        if (guidelinesHandler) {
            // Shift key temporarily disables all snapping
            if (evt.shiftKey) {
                guidelinesHandler.updateConfig({
                    enabled: false,
                    snapToGrid: false
                });
            }
            // Alt key enables only grid snapping
            else if (evt.altKey) {
                guidelinesHandler.updateConfig({
                    enabled: false,
                    snapToGrid: true
                });
            }
            // Restore default settings when no modifiers
            else {
                guidelinesHandler.updateConfig({
                    enabled: snapToGuides,
                    snapToGrid: snapToGrid
                });
            }
        }
    }, [canvas, snapToGuides, snapToGrid]);

    // Set up object moving event handlers
    const setupObjectMovingEvents = useCallback(() => {
        if (!canvas) return () => {};

        canvas.on('object:moving', handleObjectMoving);

        return () => {
            canvas.off('object:moving', handleObjectMoving);
        };
    }, [canvas, handleObjectMoving]);

    return {
        handleKeyDown,
        setupObjectMovingEvents
    };
};

export default useCanvasEvents;