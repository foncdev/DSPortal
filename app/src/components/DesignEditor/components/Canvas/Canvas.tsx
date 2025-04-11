// src/components/DesignEditor/components/Canvas/Canvas.tsx
import React, { useRef, useEffect, useState } from 'react';
import { fabric } from 'fabric';
import { useTranslation } from 'react-i18next';
import { ZoomIn, ZoomOut, Maximize, Minimize } from 'lucide-react';
import { useDesignEditor } from '../../context/DesignEditorContext';
import { useCanvasEvents } from '../../hooks/useCanvasEvents';
import styles from './Canvas.module.scss';

const Canvas: React.FC = () => {
    const { t } = useTranslation();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Access the design editor context
    const {
        setCanvas,
        canvas,
        canvasWidth,
        canvasHeight,
        zoomLevel,
        setZoomLevel,
        showGrid
    } = useDesignEditor();

    // Track panning state
    const [isPanning, setIsPanning] = useState(false);
    const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

    // Initialize canvas when component mounts
    useEffect(() => {
        if (!canvasRef.current || canvas) {return;}

        // Create a new fabric canvas
        const fabricCanvas = new fabric.Canvas(canvasRef.current, {
            width: canvasWidth,
            height: canvasHeight,
            backgroundColor: '#ffffff',
            preserveObjectStacking: true,
            selection: true,
            stopContextMenu: true,
            renderOnAddRemove: true // 객체 추가/제거 시 자동 렌더링
        });

        // Set the canvas in the context
        setCanvas(fabricCanvas);

        // Cleanup on unmount
        return () => {
            fabricCanvas.dispose();
        };
    }, [canvasRef, setCanvas, canvasWidth, canvasHeight]);

    // Apply zoom level changes
    useEffect(() => {
        if (!canvas) {return;}

        canvas.setZoom(zoomLevel);
        // Center the canvas
        const vpt = canvas.viewportTransform;
        if (vpt) {
            vpt[4] = (canvasWidth * (1 - zoomLevel)) / 2;
            vpt[5] = (canvasHeight * (1 - zoomLevel)) / 2;
        }
        canvas.requestRenderAll();
    }, [canvas, zoomLevel, canvasWidth, canvasHeight]);

    const { handleKeyDown } = useCanvasEvents();

    // Handle mouse wheel for zooming
    useEffect(() => {
        if (!canvas || !containerRef.current) {return;}

        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey) {
                e.preventDefault();
                e.stopPropagation();

                const delta = e.deltaY;
                const zoom = canvas.getZoom();
                const newZoom = delta > 0 ? Math.max(zoom - 0.05, 0.1) : Math.min(zoom + 0.05, 3);

                // Get cursor position relative to canvas
                const container = containerRef.current;
                if (!container) {return;}

                const rect = container.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                // Zoom to point
                zoomToPoint(newZoom, { x: mouseX, y: mouseY });
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
        }

        return () => {
            if (container) {
                container.removeEventListener('wheel', handleWheel);
            }
        };
    }, [canvas, containerRef]);

    // Handle keyboard shortcuts
    useEffect(() => {
        if (!canvas) {return;}

        const handleKeyDown = (e: KeyboardEvent) => {
            // Handle keyboard shortcuts
            if (e.ctrlKey) {
                switch (e.key) {
                    case 'z':
                        if (!e.shiftKey) {
                            // Ctrl+Z (Undo)
                            e.preventDefault();
                            useDesignEditor().undo();
                        } else {
                            // Ctrl+Shift+Z (Redo)
                            e.preventDefault();
                            useDesignEditor().redo();
                        }
                        break;

                    case 'y':
                        // Ctrl+Y (Redo)
                        e.preventDefault();
                        useDesignEditor().redo();
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
                const activeObject = canvas.getActiveObject();
                if (activeObject && !activeObject.excludeFromExport) {
                    useDesignEditor().deleteObject();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [canvas, zoomLevel, handleKeyDown]);

    // Handle mouse wheel for zooming
    useEffect(() => {
        if (!canvas || !containerRef.current) {return;}

        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey) {
                e.preventDefault();
                e.stopPropagation();

                const delta = e.deltaY;
                const zoom = canvas.getZoom();
                const newZoom = delta > 0 ? Math.max(zoom - 0.05, 0.1) : Math.min(zoom + 0.05, 3);

                // Get cursor position relative to canvas
                const container = containerRef.current;
                if (!container) {return;}

                const rect = container.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                // Zoom to point
                zoomToPoint(newZoom, { x: mouseX, y: mouseY });
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
        }

        return () => {
            if (container) {
                container.removeEventListener('wheel', handleWheel);
            }
        };
    }, [canvas, containerRef]);

    // Handle panning with middle mouse or space+drag
    useEffect(() => {
        if (!canvas || !containerRef.current) {return;}

        let isSpacePressed = false;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                isSpacePressed = true;
                document.body.style.cursor = 'grab';
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                isSpacePressed = false;
                document.body.style.cursor = 'default';
            }
        };

        const handleMouseDown = (e: MouseEvent) => {
            if (e.button === 1 || (e.button === 0 && isSpacePressed)) {
                setIsPanning(true);
                setLastPanPoint({ x: e.clientX, y: e.clientY });
                document.body.style.cursor = 'grabbing';
                e.preventDefault();
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (isPanning && canvas) {
                e.preventDefault();
                const vpt = canvas.viewportTransform;
                if (!vpt) {return;}

                vpt[4] += e.clientX - lastPanPoint.x;
                vpt[5] += e.clientY - lastPanPoint.y;

                canvas.requestRenderAll();
                setLastPanPoint({ x: e.clientX, y: e.clientY });
            }
        };

        const handleMouseUp = () => {
            if (isPanning) {
                setIsPanning(false);
                document.body.style.cursor = isSpacePressed ? 'grab' : 'default';
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('mousedown', handleMouseDown);
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('keyup', handleKeyUp);
        }

        return () => {
            if (container) {
                container.removeEventListener('mousedown', handleMouseDown);
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
                window.removeEventListener('keydown', handleKeyDown);
                window.removeEventListener('keyup', handleKeyUp);
            }
        };
    }, [canvas, isPanning, lastPanPoint]);

    // Zoom to a specific point on the canvas
    const zoomToPoint = (zoom: number, point: { x: number, y: number }) => {
        if (!canvas) {return;}

        const vpt = canvas.viewportTransform;
        if (!vpt) {return;}

        // Set zoom
        canvas.zoomToPoint({ x: point.x, y: point.y }, zoom);

        // Update the context zoomLevel
        setZoomLevel(zoom);
    };

    // Zoom controls
    const zoomIn = () => {
        setZoomLevel(Math.min(zoomLevel + 0.1, 3));
    };

    const zoomOut = () => {
        setZoomLevel(Math.max(zoomLevel - 0.1, 0.1));
    };

    const zoomToFit = () => {
        if (!canvas || !containerRef.current) {return;}

        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        // Calculate the zoom level to fit the canvas in the container
        const scaleX = containerWidth / canvasWidth;
        const scaleY = containerHeight / canvasHeight;
        const scale = Math.min(scaleX, scaleY) * 0.9; // 90% to add some padding

        setZoomLevel(scale);
    };

    const resetZoom = () => {
        setZoomLevel(1);
    };

    return (
        <div
            ref={containerRef}
            className={`${styles.canvasContainer} ${isPanning ? styles.panning : ''}`}
        >
            <div
                className={styles.canvasWrapper}
                style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: 'center center'
                }}
            >
                <canvas ref={canvasRef} />
            </div>

            {/* Placeholder message when empty */}
            {canvas && canvas.getObjects().length === 0 && (
                <div className={styles.placeholder}>
                    {t('editor.canvasPlaceholder')}
                </div>
            )}

            {/* Zoom controls */}
            <div className={styles.zoomControls}>
                <button
                    onClick={zoomOut}
                    title={t('editor.zoomOut')}
                    className={zoomLevel <= 0.1 ? styles.disabled : ''}
                    disabled={zoomLevel <= 0.1}
                >
                    <ZoomOut size={16} />
                </button>

                <span className={styles.zoomLevel}>{Math.round(zoomLevel * 100)}%</span>

                <button
                    onClick={zoomIn}
                    title={t('editor.zoomIn')}
                    className={zoomLevel >= 3 ? styles.disabled : ''}
                    disabled={zoomLevel >= 3}
                >
                    <ZoomIn size={16} />
                </button>

                <button
                    onClick={zoomToFit}
                    title={t('editor.zoomToFit')}
                >
                    <Minimize size={16} />
                </button>

                <button
                    onClick={resetZoom}
                    title={t('editor.resetZoom')}
                    className={zoomLevel === 1 ? styles.active : ''}
                >
                    <Maximize size={16} />
                </button>
            </div>
        </div>
    );
};

export default Canvas;