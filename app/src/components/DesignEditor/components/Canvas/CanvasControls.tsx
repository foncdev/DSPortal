import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ZoomIn,
    ZoomOut,
    Maximize,
    Minimize,
    Ruler,
    MousePointer,
    RotateCcw,
    ChevronDown,
    Square,
    Smartphone,
    Monitor,
    Instagram
} from 'lucide-react';
import { useDesignEditor } from '../../context/DesignEditorContext';
import styles from './CanvasControls.module.scss';

// Canvas presets reference (imported from constants)
const CANVAS_PRESETS = {
    DEFAULT: { width: 800, height: 600, name: 'Default', icon: <Square size={14} /> },
    FACEBOOK: { width: 1200, height: 628, name: 'Facebook', icon: <Square size={14} /> },
    WIDESCREEN: { width: 1024, height: 576, name: '16:9 Ratio', icon: <Square size={14} /> },
    INSTA_SQUARE: { width: 1080, height: 1080, name: 'Instagram Square', icon: <Instagram size={14} /> },
    INSTA_PORTRAIT: { width: 1080, height: 1350, name: 'Instagram Portrait', icon: <Instagram size={14} /> },
    INSTA_LANDSCAPE: { width: 1080, height: 566, name: 'Instagram Landscape', icon: <Instagram size={14} /> },
    ANDROID_HD: { width: 1280, height: 720, name: 'Android HD', icon: <Smartphone size={14} /> },
    ANDROID_FHD: { width: 1920, height: 1080, name: 'Android FHD', icon: <Smartphone size={14} /> },
    ANDROID_QHD: { width: 2560, height: 1440, name: 'Android QHD', icon: <Smartphone size={14} /> },
};

// Device frames reference
const DEVICE_FRAMES = {
    NONE: { id: 'none', name: 'No Frame', icon: <Square size={14} /> },
    SMARTPHONE: { id: 'smartphone', name: 'Smartphone', icon: <Smartphone size={14} /> },
    MONITOR: { id: 'monitor', name: 'Monitor', icon: <Monitor size={14} /> },
};

// Ruler units reference
const RULER_UNITS = {
    PX: { id: 'px', name: 'Pixels (px)' },
    CM: { id: 'cm', name: 'Centimeters (cm)' },
    MM: { id: 'mm', name: 'Millimeters (mm)' },
};

interface CanvasControlsProps {
    containerRef: React.RefObject<HTMLDivElement>;
    onPresetChange: (preset: any) => void;
    onOrientationToggle: () => void;
    onDeviceFrameChange: (frame: any) => void;
    onRulerToggle: () => void;
    onRulerUnitChange: (unit: any) => void;
    onCoordinatesToggle: () => void;
    onFullscreenToggle: () => void;
    showPresetSelector: boolean;
    onTogglePresetSelector: () => void;
}

const CanvasControls: React.FC<CanvasControlsProps> = ({
                                                           containerRef,
                                                           onPresetChange,
                                                           onOrientationToggle,
                                                           onDeviceFrameChange,
                                                           onRulerToggle,
                                                           onRulerUnitChange,
                                                           onCoordinatesToggle,
                                                           onFullscreenToggle,
                                                           showPresetSelector,
                                                           onTogglePresetSelector
                                                       }) => {
    const { t } = useTranslation();
    const {
        zoomLevel,
        setZoomLevel,
        canvasWidth,
        canvasHeight,
        deviceFrame,
        showRulers,
        rulerUnit,
        showCoordinates,
        orientation,
        canvas
    } = useDesignEditor();

    const [isFullscreen, setIsFullscreen] = useState(false);

    // Zoom in function
    const zoomIn = () => {
        setZoomLevel(Math.min(zoomLevel + 0.1, 3));
    };

    // Zoom out function
    const zoomOut = () => {
        setZoomLevel(Math.max(zoomLevel - 0.1, 0.1));
    };

    // Reset zoom function
    const resetZoom = () => {
        setZoomLevel(1);
    };

    // Zoom to fit function
    const zoomToFit = () => {
        if (!canvas || !containerRef.current) return;

        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        // Calculate zoom level to fit canvas in container (with padding)
        const scaleX = (containerWidth - 40) / canvasWidth;
        const scaleY = (containerHeight - 40) / canvasHeight;
        const scale = Math.min(scaleX, scaleY);

        setZoomLevel(Math.min(scale, 1)); // Limit max zoom to 100%
    };

    // Toggle fullscreen
    const toggleFullscreen = () => {
        onFullscreenToggle();
        setIsFullscreen(!isFullscreen);
    };

    return (
        <>
            {/* Top controls */}
            <div className={styles.canvasControls}>
                {/* Canvas size selector */}
                <button
                    onClick={onTogglePresetSelector}
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
                    value={deviceFrame?.id || 'none'}
                    onChange={(e) => {
                        const selected = Object.entries(DEVICE_FRAMES).find(
                            ([key, frame]) => frame.id === e.target.value
                        );
                        if (selected) {
                            onDeviceFrameChange(selected[1]);
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
                        value={rulerUnit?.id || 'px'}
                        onChange={(e) => {
                            const selected = Object.entries(RULER_UNITS).find(
                                ([key, unit]) => unit.id === e.target.value
                            );
                            if (selected) {
                                onRulerUnitChange(selected[1]);
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

            {/* Zoom controls (bottom right) */}
            <div className={styles.zoomControlsContainer}>
                <div className={styles.zoomControls}>
                    <button
                        onClick={zoomOut}
                        disabled={zoomLevel <= 0.1}
                        className={`${styles.zoomButton} ${zoomLevel <= 0.1 ? styles.disabled : ''}`}
                        title={t('editor.zoomOut')}
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
                        title={t('editor.zoomIn')}
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

            {/* Canvas preset selector modal */}
            {showPresetSelector && (
                <div className={styles.presetSelector}>
                    <div className={styles.presetSelectorHeader}>
                        <h3>{t('editor.canvasSize')}</h3>
                    </div>

                    <div className={styles.presetCategory}>
                        <div className={styles.presetCategoryTitle}>Basic</div>
                        {['DEFAULT', 'FACEBOOK', 'WIDESCREEN'].map(key => {
                            const preset = CANVAS_PRESETS[key as keyof typeof CANVAS_PRESETS];
                            const isActive = canvasWidth === preset.width && canvasHeight === preset.height;
                            return (
                                <div
                                    key={key}
                                    className={`${styles.presetItem} ${isActive ? styles.active : ''}`}
                                    onClick={() => {
                                        onPresetChange(preset);
                                        onTogglePresetSelector();
                                    }}
                                >
                                    <span className={styles.presetIcon}>{preset.icon}</span>
                                    <span className={styles.presetName}>{preset.name}</span>
                                    <span className={styles.presetDimensions}>
                    {preset.width} × {preset.height}
                  </span>
                                </div>
                            );
                        })}
                    </div>

                    <div className={styles.presetCategory}>
                        <div className={styles.presetCategoryTitle}>Instagram</div>
                        {['INSTA_SQUARE', 'INSTA_PORTRAIT', 'INSTA_LANDSCAPE'].map(key => {
                            const preset = CANVAS_PRESETS[key as keyof typeof CANVAS_PRESETS];
                            const isActive = canvasWidth === preset.width && canvasHeight === preset.height;
                            return (
                                <div
                                    key={key}
                                    className={`${styles.presetItem} ${isActive ? styles.active : ''}`}
                                    onClick={() => {
                                        onPresetChange(preset);
                                        onTogglePresetSelector();
                                    }}
                                >
                                    <span className={styles.presetIcon}>{preset.icon}</span>
                                    <span className={styles.presetName}>{preset.name}</span>
                                    <span className={styles.presetDimensions}>
                    {preset.width} × {preset.height}
                  </span>
                                </div>
                            );
                        })}
                    </div>

                    <div className={styles.presetCategory}>
                        <div className={styles.presetCategoryTitle}>Android</div>
                        {['ANDROID_HD', 'ANDROID_FHD', 'ANDROID_QHD'].map(key => {
                            const preset = CANVAS_PRESETS[key as keyof typeof CANVAS_PRESETS];
                            const isActive = canvasWidth === preset.width && canvasHeight === preset.height;
                            return (
                                <div
                                    key={key}
                                    className={`${styles.presetItem} ${isActive ? styles.active : ''}`}
                                    onClick={() => {
                                        onPresetChange(preset);
                                        onTogglePresetSelector();
                                    }}
                                >
                                    <span className={styles.presetIcon}>{preset.icon}</span>
                                    <span className={styles.presetName}>{preset.name}</span>
                                    <span className={styles.presetDimensions}>
                    {preset.width} × {preset.height}
                  </span>
                                </div>
                            );
                        })}
                    </div>

                    <div className={styles.orientationSelector}>
                        <h3>{t('editor.orientation')}</h3>
                        <div className={styles.orientationButtons}>
                            <button
                                className={`${styles.orientationButton} ${orientation === 'landscape' ? styles.active : ''}`}
                                onClick={() => {
                                    if (orientation !== 'landscape') {
                                        onOrientationToggle();
                                    }
                                }}
                            >
                                {t('editor.landscape')}
                            </button>
                            <button
                                className={`${styles.orientationButton} ${orientation === 'portrait' ? styles.active : ''}`}
                                onClick={() => {
                                    if (orientation !== 'portrait') {
                                        onOrientationToggle();
                                    }
                                }}
                            >
                                {t('editor.portrait')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CanvasControls;