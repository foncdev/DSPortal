// src/components/DesignEditor/hooks/useCanvasEvents.ts
import { useCallback } from 'react';
import { FabricObjectWithId, useDesignEditor } from '../context/DesignEditorContext';

/**
 * Custom hook to manage canvas event handlers
 * Handles keyboard shortcuts and other canvas events
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
        deleteObject
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
            }
        }

        // Delete key to delete selected objects
        if (e.key === 'Delete' || e.key === 'Backspace') {
            const activeObject = canvas.getActiveObject() as FabricObjectWithId;
            if (activeObject && !activeObject.excludeFromExport) {
                deleteObject();
            }
        }
    }, [canvas, canUndo, canRedo, undo, redo, zoomLevel, setZoomLevel, deleteObject]);

    return {
        handleKeyDown
    };
};