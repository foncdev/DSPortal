// src/components/DesignEditor/Canvas/Canvas.tsx
import React, { useState, useRef, useEffect } from 'react';
import styles from './Canvas.module.scss';
import CanvasObject from './CanvasObject';
import { useTranslation } from 'react-i18next';

interface CanvasProps {
    objects: any[];
    selectedObjectId: number | null;
    onSelectObject: (objectId: number) => void;
    width?: number;
    height?: number;
}

const Canvas: React.FC<CanvasProps> = ({
                                           objects,
                                           selectedObjectId,
                                           onSelectObject,
                                           width = 800,
                                           height = 600
                                       }) => {
    const { t } = useTranslation();
    const canvasRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [showGrid, setShowGrid] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Handle canvas click (deselect objects)
    const handleCanvasClick = (e: React.MouseEvent) => {
        // If clicked directly on the canvas (not on an object)
        if (e.target === canvasRef.current) {
            onSelectObject(-1); // -1 means no selection
        }
    };

    // Toggle grid
    const toggleGrid = () => {
        setShowGrid(!showGrid);
    };

    // Zoom canvas
    const handleZoom = (factor: number) => {
        setScale(prevScale => {
            const newScale = prevScale * factor;
            return Math.min(Math.max(newScale, 0.1), 3); // Limit scale between 0.1 and 3
        });
    };

    // Pan canvas
    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button === 1 || (e.button === 0 && e.altKey)) { // Middle mouse button or Alt+Left click
            setIsDragging(true);
            setDragStart({ x: e.clientX, y: e.clientY });
            e.preventDefault();
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && canvasRef.current) {
            const dx = e.clientX - dragStart.x;
            const dy = e.clientY - dragStart.y;

            canvasRef.current.scrollLeft -= dx;
            canvasRef.current.scrollTop -= dy;

            setDragStart({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Add keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Zoom in/out with Ctrl + +/- or Ctrl + mouse wheel
            if (e.ctrlKey && (e.key === '+' || e.key === '=')) {
                handleZoom(1.1);
                e.preventDefault();
            } else if (e.ctrlKey && e.key === '-') {
                handleZoom(0.9);
                e.preventDefault();
            }

            // Toggle grid with Ctrl+G
            if (e.ctrlKey && e.key === 'g') {
                toggleGrid();
                e.preventDefault();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Handle mouse wheel for zooming
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey) {
                const factor = e.deltaY < 0 ? 1.1 : 0.9;
                handleZoom(factor);
                e.preventDefault();
            }
        };

        const canvasElement = canvasRef.current;
        if (canvasElement) {
            canvasElement.addEventListener('wheel', handleWheel, { passive: false });
        }

        return () => {
            if (canvasElement) {
                canvasElement.removeEventListener('wheel', handleWheel);
            }
        };
    }, [canvasRef.current]);

    return (
        <div
            className={styles.canvasContainer}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div
                ref={canvasRef}
                className={`${styles.canvas} ${showGrid ? styles.grid : ''}`}
                style={{ width, height, transform: `scale(${scale})` }}
                onClick={handleCanvasClick}
            >
                {/*{objects.length === 0 ? (*/}
                {/*    <div className={styles.placeholder}>*/}
                {/*        {t('editor.canvasPlaceholder')}*/}
                {/*    </div>*/}
                {/*) : (*/}
                {/*    objects.map(object => (*/}
                {/*        <CanvasObject*/}
                {/*            key={object.id}*/}
                {/*            object={object}*/}
                {/*            isSelected={selectedObjectId === object.id}*/}
                {/*            onClick={() => onSelectObject(object.id)}*/}
                {/*        />*/}
                {/*    ))*/}
                {/*)}*/}
            </div>

            <div className={styles.zoomControls}>
                <button onClick={() => handleZoom(1.1)}>+</button>
                <span>{Math.round(scale * 100)}%</span>
                <button onClick={() => handleZoom(0.9)}>-</button>
                <button onClick={toggleGrid} className={showGrid ? styles.active : ''}>
                    Grid
                </button>
            </div>
        </div>
    );
};

export default Canvas;