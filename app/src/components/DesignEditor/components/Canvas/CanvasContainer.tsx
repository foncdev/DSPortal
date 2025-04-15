import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDesignEditor } from '../../context/DesignEditorContext';
import Canvas from '../Canvas/Canvas';
import styles from './CanvasContainer.module.scss';

interface CanvasContainerProps {
    onMouseMove?: (x: number, y: number) => void;
    showDeviceFrame?: boolean;
    deviceFrameType?: 'smartphone' | 'monitor' | 'none';
    showRulers?: boolean;
    rulerUnit?: string;
}

/**
 * CanvasContainer manages the display of the canvas with related UI elements
 * like device frames, rulers, and coordinates
 */
const CanvasContainer: React.FC<CanvasContainerProps> = ({
                                                             onMouseMove,
                                                             showDeviceFrame = false,
                                                             deviceFrameType = 'none',
                                                             showRulers = true,
                                                             rulerUnit = 'px'
                                                         }) => {
    const { t } = useTranslation();
    const {
        canvas,
        canvasWidth,
        canvasHeight,
        zoomLevel,
        showCoordinates,
        mousePosition
    } = useDesignEditor();
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [scale, setScale] = useState(1);

    // Calculate container size and scale on mount and when canvas dimensions change
    useEffect(() => {
        if (!containerRef.current) return;

        const calculateScale = () => {
            const container = containerRef.current;
            if (!container) return;

            // Get available space (90% of container)
            const availableWidth = container.clientWidth * 0.9;
            const availableHeight = container.clientHeight * 0.9;

            // Calculate scale to fit canvas in available space
            const scaleX = availableWidth / canvasWidth;
            const scaleY = availableHeight / canvasHeight;
            const newScale = Math.min(scaleX, scaleY);

            setContainerSize({
                width: container.clientWidth,
                height: container.clientHeight
            });
            setScale(newScale);
        };

        // Calculate initially
        calculateScale();

        // Recalculate on resize
        const handleResize = () => {
            calculateScale();
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [canvasWidth, canvasHeight, containerRef]);

    // Handle mouse move to track coordinates
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current || !onMouseMove) return;

        const rect = containerRef.current.getBoundingClientRect();
        const scaleWithZoom = scale * zoomLevel;

        // Calculate mouse position relative to canvas
        const canvasX = Math.round((e.clientX - rect.left - ((containerSize.width - canvasWidth * scale) / 2)) / scaleWithZoom);
        const canvasY = Math.round((e.clientY - rect.top - ((containerSize.height - canvasHeight * scale) / 2)) / scaleWithZoom);

        // Only report positions when mouse is over canvas
        if (canvasX >= 0 && canvasX <= canvasWidth && canvasY >= 0 && canvasY <= canvasHeight) {
            onMouseMove(canvasX, canvasY);
        }
    };

    // Render device frame
    const renderDeviceFrame = () => {
        if (!showDeviceFrame || deviceFrameType === 'none') return null;

        const frameStyles: React.CSSProperties = {
            position: 'absolute',
            pointerEvents: 'none',
            border: deviceFrameType === 'monitor' ? '16px solid #333' : '24px solid #333',
            borderRadius: deviceFrameType === 'smartphone' ? '24px' : '8px',
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)',
            top: '-30px',
            left: '-30px',
            right: '-30px',
            bottom: '-30px',
            zIndex: 10
        };

        // Add smartphone notch if needed
        const notchStyles: React.CSSProperties = deviceFrameType === 'smartphone' ? {
            position: 'absolute',
            width: '100px',
            height: '24px',
            backgroundColor: '#333',
            top: '-24px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderRadius: '0 0 16px 16px',
            zIndex: 11
        } : {};

        return (
            <>
                <div className={styles.deviceFrame} style={frameStyles}></div>
                {deviceFrameType === 'smartphone' && <div className={styles.deviceNotch} style={notchStyles}></div>}
            </>
        );
    };

    // Render rulers with selected unit
    const renderRulers = () => {
        if (!showRulers) return null;

        // Calculate ruler calibration based on unit
        const pxPerUnit = rulerUnit === 'px' ? 1 :
            rulerUnit === 'cm' ? 37.8 : 3.78; // Approximate pixels per cm/mm

        const rulerMarks = [];

        // Generate horizontal ruler marks
        for (let i = 0; i <= canvasWidth; i += pxPerUnit) {
            const isMajor = i % (pxPerUnit * 5) === 0;
            rulerMarks.push(
                <div
                    key={`h-${i}`}
                    className={`${styles.rulerMark} ${styles.horizontal} ${isMajor ? styles.major : ''}`}
                    style={{ left: `${i}px` }}
                >
                    {isMajor && <span className={styles.rulerLabel}>{Math.round(i / pxPerUnit)}</span>}
                </div>
            );
        }

        // Generate vertical ruler marks
        for (let i = 0; i <= canvasHeight; i += pxPerUnit) {
            const isMajor = i % (pxPerUnit * 5) === 0;
            rulerMarks.push(
                <div
                    key={`v-${i}`}
                    className={`${styles.rulerMark} ${styles.vertical} ${isMajor ? styles.major : ''}`}
                    style={{ top: `${i}px` }}
                >
                    {isMajor && <span className={styles.rulerLabel}>{Math.round(i / pxPerUnit)}</span>}
                </div>
            );
        }

        return (
            <div className={styles.canvasRulers}>
                <div className={styles.horizontalRuler}>
                    <div className={styles.rulerMarks}>
                        {rulerMarks.filter(mark => mark.key?.toString().startsWith('h-'))}
                    </div>
                </div>
                <div className={styles.verticalRuler}>
                    <div className={styles.rulerMarks}>
                        {rulerMarks.filter(mark => mark.key?.toString().startsWith('v-'))}
                    </div>
                </div>
                <div className={styles.rulerCorner}></div>
            </div>
        );
    };

    // Render coordinate display
    const renderCoordinates = () => {
        if (!showCoordinates) return null;

        return (
            <div className={styles.coordinatesDisplay}>
                X: {mousePosition.x} Y: {mousePosition.y}
            </div>
        );
    };

    // Apply calculated scale to the canvas wrapper
    const canvasWrapperStyle: React.CSSProperties = {
        transform: `scale(${scale * zoomLevel})`,
        transformOrigin: 'center center',
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -(canvasHeight / 2),
        marginLeft: -(canvasWidth / 2)
    };

    return (
        <div
            ref={containerRef}
            className={styles.canvasContainer}
            onMouseMove={handleMouseMove}
        >
            <div className={styles.canvasWrapper} style={canvasWrapperStyle}>
                <Canvas />
                {renderDeviceFrame()}
                {renderRulers()}
            </div>
            {renderCoordinates()}
        </div>
    );
};

export default CanvasContainer;