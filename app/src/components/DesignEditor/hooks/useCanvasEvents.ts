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

                case 's':
                case 'S':
                    // S key to toggle snap to grid
                    if (e.shiftKey) {
                        toggleSnapToGrid();
                    } else {
                        toggleSnapToGuides();
                    }
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

    // Handle objects moved to apply grid snapping
    const handleObjectModified = useCallback((e: fabric.IEvent) => {
        if (!canvas || !snapToGrid) return;

        const target = e.target as FabricObjectWithId;
        if (!target) return;

        // Apply grid snapping on modification completion if needed
        const gridSize = 20; // Match the grid size from Canvas.tsx

        // Only snap if not locked
        if (!target.lockMovementX && !target.lockMovementY) {
            // Snap position to grid
            const left = Math.round(target.left! / gridSize) * gridSize;
            const top = Math.round(target.top! / gridSize) * gridSize;

            // Only update if position changed
            if (left !== target.left || top !== target.top) {
                target.set({
                    left: left,
                    top: top
                });

                target.setCoords();
                canvas.requestRenderAll();
            }
        }
    }, [canvas, snapToGrid]);

    // Set up object moving event handlers
    const setupObjectMovingEvents = useCallback(() => {
        if (!canvas) return () => {};

        canvas.on('object:moving', handleObjectMoving);
        canvas.on('object:modified', handleObjectModified);

        return () => {
            canvas.off('object:moving', handleObjectMoving);
            canvas.off('object:modified', handleObjectModified);
        };
    }, [canvas, handleObjectMoving, handleObjectModified]);

    return {
        handleKeyDown,
        setupObjectMovingEvents
    };
};

export default useCanvasEvents;