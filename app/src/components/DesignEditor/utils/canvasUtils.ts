// src/components/DesignEditor/utils/canvasUtils.ts

import { fabric } from 'fabric';
import { FabricObjectWithId } from '../context/DesignEditorContext';
import GuidelinesHandler from './GuideLines';

/**
 * Safely resize the canvas while preserving objects and selection
 * @param canvas The fabric canvas instance
 * @param width New canvas width
 * @param height New canvas height
 * @param guidelinesHandler Optional guidelines handler to update
 * @returns Promise that resolves when resizing is complete
 */
export const resizeCanvas = (
    canvas: fabric.Canvas,
    width: number,
    height: number,
    guidelinesHandler?: GuidelinesHandler | null
): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!canvas) {
            reject(new Error('Canvas not initialized'));
            return;
        }

        try {
            // Check if canvas element is valid
            const canvasElement = canvas.getElement();
            if (!canvasElement) {
                reject(new Error('Canvas element is not available'));
                return;
            }

            // Store canvas state
            const currentZoom = canvas.getZoom();
            const viewportTransform = canvas.viewportTransform ? [...canvas.viewportTransform] : null;

            // Save JSON data with custom properties
            const jsonData = canvas.toJSON([
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
            ]);

            // Store active object(s) for restoring selection later
            const activeObjectIds: (string | number)[] = [];
            const activeObjects = canvas.getActiveObjects() as FabricObjectWithId[];

            activeObjects.forEach(obj => {
                if (obj.id) {
                    activeObjectIds.push(obj.id);
                }
            });

            // Temporarily clear any active selection
            canvas.discardActiveObject();

            // Set new dimensions (wrap in try/catch to handle potential errors)
            try {
                canvas.setWidth(width);
                canvas.setHeight(height);
            } catch (dimensionError) {
                reject(new Error(`Failed to set canvas dimensions: ${dimensionError}`));
                return;
            }

            // Clear existing objects
            canvas.clear();

            // Load the saved state back into the canvas
            canvas.loadFromJSON(jsonData, () => {
                try {
                    // Restore zoom level
                    if (currentZoom !== 1) {
                        canvas.setZoom(currentZoom);
                    }

                    // Restore viewport transform if needed (for panning position)
                    if (viewportTransform) {
                        // Adjust the transform for new dimensions
                        viewportTransform[4] = (width * (1 - currentZoom)) / 2;
                        viewportTransform[5] = (height * (1 - currentZoom)) / 2;
                        canvas.setViewportTransform(viewportTransform);
                    }

                    // Restore selection if there were selected objects
                    if (activeObjectIds.length > 0) {
                        const objectsToSelect: fabric.Object[] = [];

                        activeObjectIds.forEach(id => {
                            const obj = canvas.getObjects().find(
                                (o) => (o as FabricObjectWithId).id === id
                            );

                            if (obj) {
                                objectsToSelect.push(obj);
                            }
                        });

                        if (objectsToSelect.length === 1) {
                            canvas.setActiveObject(objectsToSelect[0]);
                        } else if (objectsToSelect.length > 1) {
                            const selection = new fabric.ActiveSelection(objectsToSelect, {
                                canvas: canvas
                            });
                            canvas.setActiveObject(selection);
                        }
                    }

                    // Update guidelines handler if provided
                    if (guidelinesHandler) {
                        guidelinesHandler.updateCanvasDimensions(width, height);
                    }

                    // Render canvas
                    canvas.requestRenderAll();

                    // Resolve promise
                    resolve();
                } catch (restoreError) {
                    reject(new Error(`Failed to restore canvas state: ${restoreError}`));
                }
            });
        } catch (error) {
            console.error('Error resizing canvas:', error);
            reject(error);
        }
    });
};

/**
 * Apply sizing from a preset to the canvas with the specified orientation
 * @param canvas The fabric canvas instance
 * @param preset Canvas preset with width and height
 * @param orientation Current orientation
 * @param guidelinesHandler Optional guidelines handler to update
 * @returns Promise that resolves when resizing is complete with the applied dimensions
 */
export const applyCanvasPreset = (
    canvas: fabric.Canvas,
    preset: { width: number; height: number },
    orientation: 'landscape' | 'portrait',
    guidelinesHandler?: GuidelinesHandler | null
): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        if (!canvas) {
            reject(new Error('Canvas not initialized'));
            return;
        }

        // Calculate dimensions based on orientation
        let width, height;

        if (orientation === 'portrait' && preset.width > preset.height) {
            // Switch dimensions for portrait mode if preset is landscape
            width = preset.height;
            height = preset.width;
        } else if (orientation === 'landscape' && preset.width < preset.height) {
            // Switch dimensions for landscape mode if preset is portrait
            width = preset.height;
            height = preset.width;
        } else {
            // Use preset dimensions as is
            width = preset.width;
            height = preset.height;
        }

        // Resize the canvas
        resizeCanvas(canvas, width, height, guidelinesHandler)
            .then(() => {
                resolve({ width, height });
            })
            .catch(error => {
                console.error('Error applying canvas preset:', error);
                reject(error);
            });
    });
};

/**
 * Create a grid on the canvas
 * @param canvas The fabric canvas instance
 * @param gridSize The size of the grid cells
 * @param showGrid Whether to show the grid
 * @returns The created grid group or null if grid is disabled
 */
export const createCanvasGrid = (
    canvas: fabric.Canvas,
    gridSize: number = 20,
    showGrid: boolean = false
): fabric.Group | null => {
    if (!canvas || !showGrid) {
        // Remove existing grid if any but grid should be hidden
        const existingGrid = (canvas as any)?._gridGroup;
        if (existingGrid && canvas) {
            canvas.remove(existingGrid);
            (canvas as any)._gridGroup = null;
        }
        return null;
    }

    try {
        // Remove existing grid if any
        const existingGrid = (canvas as any)._gridGroup;
        if (existingGrid) {
            canvas.remove(existingGrid);
            (canvas as any)._gridGroup = null;
        }

        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();
        const gridLines: fabric.Line[] = [];

        // Create vertical lines
        for (let i = 0; i <= canvasWidth; i += gridSize) {
            const isMajor = i % (gridSize * 5) === 0;
            gridLines.push(new fabric.Line([i, 0, i, canvasHeight], {
                stroke: isMajor ? '#aaa' : '#ddd',
                strokeWidth: isMajor ? 0.7 : 0.5,
                selectable: false,
                evented: false,
                excludeFromExport: true
            }));
        }

        // Create horizontal lines
        for (let i = 0; i <= canvasHeight; i += gridSize) {
            const isMajor = i % (gridSize * 5) === 0;
            gridLines.push(new fabric.Line([0, i, canvasWidth, i], {
                stroke: isMajor ? '#aaa' : '#ddd',
                strokeWidth: isMajor ? 0.7 : 0.5,
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
        canvas.requestRenderAll();

        // Store grid reference
        (canvas as any)._gridGroup = gridGroup;

        return gridGroup;
    } catch (error) {
        console.error('Error creating grid:', error);
        return null;
    }
};