// src/components/DesignEditor/components/Canvas/Canvas.tsx
import React, { useRef, useEffect } from 'react';
import { fabric } from 'fabric';
import { useDesignEditor } from '../../context/DesignEditorContext';
import { useCanvasEvents } from '../../hooks/useCanvasEvents';
import styles from './Canvas.module.scss';

interface CanvasProps {
    onCanvasReady?: () => void;
}

/**
 * Modified Canvas component that focuses only on the fabric.js canvas
 * without additional controls that were moved to layout
 */
const Canvas: React.FC<CanvasProps> = ({ onCanvasReady }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gridGroupRef = useRef<fabric.Group | null>(null);

    // Design Editor context
    const {
        setCanvas,
        canvas,
        canvasWidth,
        canvasHeight,
        showGrid,
        snapToGuides,
        snapToGrid
    } = useDesignEditor();

    // Initialize canvas
    useEffect(() => {
        if (!canvasRef.current || canvas) return;

        // Create fabric.js canvas
        const fabricCanvas = new fabric.Canvas(canvasRef.current, {
            width: canvasWidth,
            height: canvasHeight,
            backgroundColor: '#ffffff',
            preserveObjectStacking: true,
            selection: true,
            stopContextMenu: true,
            renderOnAddRemove: true
        });

        // Set canvas in context
        setCanvas(fabricCanvas);

        // Notify parent when canvas is ready
        if (onCanvasReady) {
            onCanvasReady();
        }

        // Clean up on unmount
        return () => {
            fabricCanvas.dispose();
        };
    }, [canvasRef, setCanvas, canvasWidth, canvasHeight, onCanvasReady]);

    // Update canvas dimensions when they change
    useEffect(() => {
        if (!canvas) return;

        if (canvas.getWidth() !== canvasWidth || canvas.getHeight() !== canvasHeight) {
            canvas.setWidth(canvasWidth);
            canvas.setHeight(canvasHeight);
            canvas.requestRenderAll();
        }
    }, [canvas, canvasWidth, canvasHeight]);

    // Create or update grid when showGrid changes
    useEffect(() => {
        if (!canvas) return;

        // Remove existing grid if any
        if (gridGroupRef.current) {
            canvas.remove(gridGroupRef.current);
            gridGroupRef.current = null;
        }

        if (showGrid) {
            // Create grid
            const gridSize = 20;
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

            // Add grid to canvas and store reference
            canvas.add(gridGroup);
            gridGroup.sendToBack();
            gridGroupRef.current = gridGroup;
        }

        canvas.requestRenderAll();
    }, [canvas, showGrid, canvasWidth, canvasHeight]);

    // Set up canvas events
    const { handleKeyDown, setupObjectMovingEvents } = useCanvasEvents();

    // Set up keyboard shortcuts
    useEffect(() => {
        if (!canvas) return;

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [canvas, handleKeyDown]);

    // Set up object moving events for snap-to-grid and guidelines
    useEffect(() => {
        if (!canvas) return;

        const cleanup = setupObjectMovingEvents();
        return cleanup;
    }, [canvas, setupObjectMovingEvents, snapToGrid, snapToGuides]);

    // Render initial canvas
    return <canvas ref={canvasRef} className={styles.canvas} />;
};

export default Canvas;