// src/components/DesignEditor/layout/DesignEditorLayout.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Maximize, Minimize, ZoomIn, ZoomOut, Ruler, MousePointer,
    RotateCcw, ChevronDown, Square, Smartphone, Monitor
} from 'lucide-react';
import { useDesignEditor } from '../context/DesignEditorContext';
import styles from '../styles/DesignEditor.module.scss';
import EditorToolbar from '../components/toolbar/EditorToolbar';
import LeftPanel from '../components/panels/LeftPanel';
import RightPanel from '../components/panels/RightPanel';
import Canvas from '../components/Canvas/Canvas';
import { useResizablePanel } from '../hooks/useResizablePanel';
import { CANVAS_PRESETS, DEVICE_FRAMES, RULER_UNITS } from '../DesignEditor';

interface CanvasPreset {
    width: number;
    height: number;
    name: string;
    icon: JSX.Element;
}

interface DeviceFrame {
    id: string;
    name: string;
    icon: JSX.Element;
}

interface RulerUnit {
    id: string;
    name: string;
}

interface DesignEditorLayoutProps {
    canvasWidth: number;
    canvasHeight: number;
    activePreset: CanvasPreset;
    orientation: 'landscape' | 'portrait';
    deviceFrame: DeviceFrame;
    showRulers: boolean;
    rulerUnit: RulerUnit;
    showCoordinates: boolean;
    mousePosition: { x: number; y: number };
    showPresetSelector: boolean;
    onMousePositionChange: (x: number, y: number) => void;
    onPresetChange: (presetKey: keyof typeof CANVAS_PRESETS) => void;
    onOrientationToggle: () => void;
    onDeviceFrameChange: (frameKey: keyof typeof DEVICE_FRAMES) => void;
    onRulerToggle: () => void;
    onRulerUnitChange: (unitKey: keyof typeof RULER_UNITS) => void;
    onCoordinatesToggle: () => void;
    onPresetSelectorToggle: () => void;
    containerRef: React.RefObject<HTMLDivElement>;
}

/**
 * Layout component for the DesignEditor
 * Handles the arrangement of panels, canvas, and toolbar
 */
const DesignEditorLayout: React.FC<DesignEditorLayoutProps> = ({
                                                                   canvasWidth,
                                                                   canvasHeight,
                                                                   activePreset,
                                                                   orientation,
                                                                   deviceFrame,
                                                                   showRulers,
                                                                   rulerUnit,
                                                                   showCoordinates,
                                                                   mousePosition,
                                                                   showPresetSelector,
                                                                   onMousePositionChange,
                                                                   onPresetChange,
                                                                   onOrientationToggle,
                                                                   onDeviceFrameChange,
                                                                   onRulerToggle,
                                                                   onRulerUnitChange,
                                                                   onCoordinatesToggle,
                                                                   onPresetSelectorToggle,
                                                                   containerRef
                                                               }) => {
    const { t } = useTranslation();
    const { canvas, zoomLevel, setZoomLevel } = useDesignEditor();

    // Panel states
    const [leftPanelOpen, setLeftPanelOpen] = useState(true);
    const [rightPanelOpen, setRightPanelOpen] = useState(true);
    const [toolbarOpen, setToolbarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('objects'); // 'objects', 'library', 'filemanager'
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Refs
    const canvasContainerRef = useRef<HTMLDivElement>(null);

    // Panel resizing hooks
    const {
        width: leftWidth,
        panelRef: leftPanelRef,
        resizeHandleRef: leftResizeRef,
        startResizing: startLeftResizing
    } = useResizablePanel(280, 200, 400, 'left');

    const {
        width: rightWidth,
        panelRef: rightPanelRef,
        resizeHandleRef: rightResizeRef,
        startResizing: startRightResizing
    } = useResizablePanel(280, 200, 400, 'right');

    // Toggle fullscreen mode
    const toggleFullscreen = () => {
        if (!document.fullscreenElement && containerRef.current) {
            containerRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    };

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Handle mouse move to track coordinates
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!canvasContainerRef.current || !showCoordinates) return;

        const rect = canvasContainerRef.current.getBoundingClientRect();
        const x = Math.round((e.clientX - rect.left) / zoomLevel);
        const y = Math.round((e.clientY - rect.top) / zoomLevel);

        onMousePositionChange(x, y);
    };

    // Canvas size should be updated when dimensions change
    useEffect(() => {
        if (canvas && typeof canvas === 'object') {
            try {
                // Check if canvas has the expected methods
                if (typeof canvas.setWidth === 'function' &&
                    typeof canvas.setHeight === 'function' &&
                    typeof canvas.requestRenderAll === 'function') {

                    canvas.setWidth(canvasWidth);
                    canvas.setHeight(canvasHeight);
                    canvas.requestRenderAll();
                } else {
                    console.warn('Canvas is missing expected methods');
                }
            } catch (error) {
                console.error('Error updating canvas dimensions:', error);
            }
        }
    }, [canvas, canvasWidth, canvasHeight]);

    // Update zoom with panel states
    useEffect(() => {
        if (canvas) {
            // Force canvas rendering refresh to fix any display issues
            setTimeout(() => {
                canvas.requestRenderAll();
            }, 100);
        }
    }, [canvas, leftPanelOpen, rightPanelOpen, leftWidth, rightWidth, zoomLevel]);

    // Toggle panels
    const toggleLeftPanel = () => setLeftPanelOpen(!leftPanelOpen);
    const toggleRightPanel = () => setRightPanelOpen(!rightPanelOpen);
    const toggleToolbar = () => setToolbarOpen(!toolbarOpen);

    // Render device frame
    const renderDeviceFrame = () => {
        if (deviceFrame.id === 'none') return null;

        const frameStyles: React.CSSProperties = {
            position: 'absolute',
            pointerEvents: 'none',
            border: deviceFrame.id === 'monitor' ? '16px solid #333' : '24px solid #333',
            borderRadius: deviceFrame.id === 'smartphone' ? '24px' : '8px',
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)',
            top: '-30px',
            left: '-30px',
            right: '-30px',
            bottom: '-30px',
            zIndex: 10
        };

        // Add smartphone notch if needed
        const notchStyles: React.CSSProperties = deviceFrame.id === 'smartphone' ? {
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
                {deviceFrame.id === 'smartphone' && <div className={styles.deviceNotch} style={notchStyles}></div>}
            </>
        );
    };

    // Render rulers with selected unit
    const renderRulers = () => {
        if (!showRulers) return null;

        // Calculate ruler calibration based on unit
        const pxPerUnit = rulerUnit.id === 'px' ? 1 :
            rulerUnit.id === 'cm' ? 37.8 : 3.78; // Approximate pixels per cm/mm

        const rulerMarks = [];

        // Generate horizontal ruler marks
        for (let i = 0; i <= canvasWidth; i += pxPerUnit) {
            const isMajor = i % (pxPerUnit * 5) === 0;
            rulerMarks.push(
                <div key={`h-${i}`} className={`${styles.rulerMark} ${styles.horizontal} ${isMajor ? styles.major : ''}`}
                     style={{ left: `${i}px` }}>
                    {isMajor && <span className={styles.rulerLabel}>{Math.round(i / pxPerUnit)}</span>}
                </div>
            );
        }

        // Generate vertical ruler marks
        for (let i = 0; i <= canvasHeight; i += pxPerUnit) {
            const isMajor = i % (pxPerUnit * 5) === 0;
            rulerMarks.push(
                <div key={`v-${i}`} className={`${styles.rulerMark} ${styles.vertical} ${isMajor ? styles.major : ''}`}
                     style={{ top: `${i}px` }}>
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

    // Zoom controls
    const zoomIn = () => {
        setZoomLevel(Math.min(zoomLevel + 0.1, 3));
    };

    const zoomOut = () => {
        setZoomLevel(Math.max(zoomLevel - 0.1, 0.1));
    };

    const resetZoom = () => {
        setZoomLevel(1);
    };

    // Zoom to fit
    const zoomToFit = () => {
        if (!canvas || !canvasContainerRef.current) return;

        const container = canvasContainerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        // Calculate zoom level to fit canvas in container (with padding)
        const scaleX = (containerWidth - 40) / canvasWidth;
        const scaleY = (containerHeight - 40) / canvasHeight;
        const scale = Math.min(scaleX, scaleY);

        setZoomLevel(Math.min(scale, 1)); // Limit max zoom to 100%
    };

    // Render canvas preset selector
    const renderPresetSelector = () => {
        if (!showPresetSelector) return null;

        const presetCategories = [
            {
                name: 'Basic',
                presets: [
                    { key: 'DEFAULT', preset: CANVAS_PRESETS.DEFAULT },
                    { key: 'FACEBOOK', preset: CANVAS_PRESETS.FACEBOOK },
                    { key: 'WIDESCREEN', preset: CANVAS_PRESETS.WIDESCREEN }
                ]
            },
            {
                name: 'Instagram',
                presets: [
                    { key: 'INSTA_SQUARE', preset: CANVAS_PRESETS.INSTA_SQUARE },
                    { key: 'INSTA_PORTRAIT', preset: CANVAS_PRESETS.INSTA_PORTRAIT },
                    { key: 'INSTA_LANDSCAPE', preset: CANVAS_PRESETS.INSTA_LANDSCAPE }
                ]
            },
            {
                name: 'Android',
                presets: [
                    { key: 'ANDROID_HD', preset: CANVAS_PRESETS.ANDROID_HD },
                    { key: 'ANDROID_FHD', preset: CANVAS_PRESETS.ANDROID_FHD },
                    { key: 'ANDROID_QHD', preset: CANVAS_PRESETS.ANDROID_QHD }
                ]
            }
        ];

        return (
            <div className={styles.presetSelector}>
                <div className={styles.presetSelectorHeader}>
                    <h3>{t('editor.canvasSize')}</h3>
                </div>

                {presetCategories.map(category => (
                    <div key={category.name} className={styles.presetCategory}>
                        <div className={styles.presetCategoryTitle}>{category.name}</div>

                        {category.presets.map(({ key, preset }) => (
                            <div
                                key={key}
                                className={`${styles.presetItem} ${preset === activePreset ? styles.active : ''}`}
                                onClick={() => onPresetChange(key as keyof typeof CANVAS_PRESETS)}
                            >
                                <span className={styles.presetIcon}>{preset.icon}</span>
                                <span className={styles.presetName}>{preset.name}</span>
                                <span className={styles.presetDimensions}>
                  {preset.width} × {preset.height}
                </span>
                            </div>
                        ))}
                    </div>
                ))}

                <div className={styles.orientationSelector}>
                    <h3>{t('editor.orientation')}</h3>
                    <div className={styles.orientationButtons}>
                        <button
                            className={`${styles.orientationButton} ${orientation === 'landscape' ? styles.active : ''}`}
                            onClick={onOrientationToggle}
                        >
                            {t('editor.landscape')}
                        </button>
                        <button
                            className={`${styles.orientationButton} ${orientation === 'portrait' ? styles.active : ''}`}
                            onClick={onOrientationToggle}
                        >
                            {t('editor.portrait')}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Render toolbar toggle button
    const renderToolbarToggleButton = () => (
        <button
            className={styles.toolbarToggleButton}
            onClick={toggleToolbar}
            title={toolbarOpen ? t('editor.hideToolbar') : t('editor.showToolbar')}
        >
            {toolbarOpen ? <Minimize size={16} /> : <Maximize size={16} />}
        </button>
    );

    return (
        <div className={styles.editorContainer}>
            {/* Toolbar toggle button - only visible when toolbar is hidden */}
            {!toolbarOpen && (
                <div className={styles.toolbarToggleContainer}>
                    {renderToolbarToggleButton()}
                </div>
            )}

            {/* Custom toolbar */}
            {toolbarOpen && (
                <div className={styles.toolbar}>
                    <EditorToolbar toggleToolbarButton={renderToolbarToggleButton()} />
                </div>
            )}

            <div className={styles.editorMain}>
                {/* Left panel */}
                <LeftPanel
                    isOpen={leftPanelOpen}
                    width={leftWidth}
                    panelRef={leftPanelRef}
                    resizeHandleRef={leftResizeRef}
                    onToggle={toggleLeftPanel}
                    onStartResize={startLeftResizing}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                {/* Canvas container */}
                <div
                    ref={canvasContainerRef}
                    className={styles.contentArea}
                    onMouseMove={handleMouseMove}
                >
                    {/* Canvas controls - 캔버스 위에 있는 툴바 확장 패널 */}
                    <div className={styles.canvasControls}>
                        {/* Canvas preset button */}
                        <button
                            onClick={onPresetSelectorToggle}
                            className={styles.canvasControlButton}
                            title={t('editor.canvasSize')}
                        >
                            <Square size={16} />
                            <span className={styles.buttonLabel}>{canvasWidth} × {canvasHeight}</span>
                            <ChevronDown size={12} />
                        </button>

                        {/* Orientation toggle */}
                        <button
                            onClick={onOrientationToggle}
                            className={styles.canvasControlButton}
                            title={t(orientation === 'landscape' ? 'editor.switchToPortrait' : 'editor.switchToLandscape')}
                        >
                            <RotateCcw size={16} />
                        </button>

                        {/* Device frame selector */}
                        <select
                            className={styles.canvasControlSelect}
                            value={deviceFrame.id}
                            onChange={(e) => {
                                const selected = Object.entries(DEVICE_FRAMES).find(
                                    ([key, frame]) => frame.id === e.target.value
                                );
                                if (selected) {
                                    onDeviceFrameChange(selected[0] as keyof typeof DEVICE_FRAMES);
                                }
                            }}
                        >
                            {Object.entries(DEVICE_FRAMES).map(([key, frame]) => (
                                <option key={key} value={frame.id}>{frame.name}</option>
                            ))}
                        </select>

                        {/* Ruler toggle */}
                        <button
                            onClick={onRulerToggle}
                            className={`${styles.canvasControlButton} ${showRulers ? styles.active : ''}`}
                            title={t(showRulers ? 'editor.hideRulers' : 'editor.showRulers')}
                        >
                            <Ruler size={16} />
                        </button>

                        {/* Ruler unit selector (only visible when rulers are shown) */}
                        {showRulers && (
                            <select
                                className={styles.canvasControlSelect}
                                value={rulerUnit.id}
                                onChange={(e) => {
                                    const selected = Object.entries(RULER_UNITS).find(
                                        ([key, unit]) => unit.id === e.target.value
                                    );
                                    if (selected) {
                                        onRulerUnitChange(selected[0] as keyof typeof RULER_UNITS);
                                    }
                                }}
                            >
                                {Object.entries(RULER_UNITS).map(([key, unit]) => (
                                    <option key={key} value={unit.id}>{unit.name}</option>
                                ))}
                            </select>
                        )}

                        {/* Coordinates toggle */}
                        <button
                            onClick={onCoordinatesToggle}
                            className={`${styles.canvasControlButton} ${showCoordinates ? styles.active : ''}`}
                            title={t(showCoordinates ? 'editor.hideCoordinates' : 'editor.showCoordinates')}
                        >
                            <MousePointer size={16} />
                        </button>
                    </div>

                    {/* Zoom controls - 캔버스 오른쪽 하단에 배치 */}
                    <div className={styles.zoomControlsContainer}>
                        <div className={styles.zoomControls}>
                            <button
                                onClick={zoomOut}
                                disabled={zoomLevel <= 0.1}
                                className={`${styles.zoomButton} ${zoomLevel <= 0.1 ? styles.disabled : ''}`}
                            >
                                <ZoomOut size={16} />
                            </button>

                            <span className={styles.zoomLevel}>
                {Math.round(zoomLevel * 100)}%
              </span>

                            <button
                                onClick={zoomIn}
                                disabled={zoomLevel >= 3}
                                className={`${styles.zoomButton} ${zoomLevel >= 3 ? styles.disabled : ''}`}
                            >
                                <ZoomIn size={16} />
                            </button>

                            <button
                                onClick={zoomToFit}
                                className={styles.zoomButton}
                                title={t('editor.zoomToFit')}
                            >
                                <Minimize size={16} />
                            </button>

                            <button
                                onClick={resetZoom}
                                className={`${styles.zoomButton} ${zoomLevel === 1 ? styles.active : ''}`}
                                title={t('editor.resetZoom')}
                            >
                                <Square size={16} />
                            </button>

                            <button
                                onClick={toggleFullscreen}
                                className={styles.zoomButton}
                                title={t(isFullscreen ? 'editor.exitFullscreen' : 'editor.enterFullscreen')}
                            >
                                {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className={styles.canvasWrapper} style={{
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: 'center center'
                    }}>
                        <Canvas />
                        {renderDeviceFrame()}
                        {renderRulers()}
                    </div>
                    {renderCoordinates()}
                </div>

                {/* Right panel */}
                <RightPanel
                    isOpen={rightPanelOpen}
                    width={rightWidth}
                    panelRef={rightPanelRef}
                    resizeHandleRef={rightResizeRef}
                    onToggle={toggleRightPanel}
                    onStartResize={startRightResizing}
                />
            </div>

            {/* Preset selector dropdown */}
            {renderPresetSelector()}
        </div>
    );
};

export default DesignEditorLayout;