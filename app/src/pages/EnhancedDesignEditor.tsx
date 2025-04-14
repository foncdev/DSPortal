import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Maximize, Minimize, ZoomIn, ZoomOut, Ruler, MousePointer,
    RotateCcw, Smartphone, Monitor, Square, Instagram
} from 'lucide-react';
import { DesignEditorProvider, Canvas } from '../components/DesignEditor';
import LeftPanel from '../components/DesignEditor/components/panels/LeftPanel';
import RightPanel from '../components/DesignEditor/components/panels/RightPanel';
import EditorToolbar from '../components/DesignEditor/components/toolbar/EditorToolbar';

// Define canvas presets
const CANVAS_PRESETS = {
    // Basic presets
    DEFAULT: { width: 800, height: 600, name: 'Default', icon: <Square size={14} /> },
    FACEBOOK: { width: 1200, height: 628, name: 'Facebook', icon: <Square size={14} /> },
    WIDESCREEN: { width: 1024, height: 576, name: '16:9 Ratio', icon: <Square size={14} /> },

    // Instagram presets
    INSTA_SQUARE: { width: 1080, height: 1080, name: 'Instagram Square', icon: <Instagram size={14} /> },
    INSTA_PORTRAIT: { width: 1080, height: 1350, name: 'Instagram Portrait', icon: <Instagram size={14} /> },
    INSTA_LANDSCAPE: { width: 1080, height: 566, name: 'Instagram Landscape', icon: <Instagram size={14} /> },

    // Android device presets
    ANDROID_HD: { width: 1280, height: 720, name: 'Android HD', icon: <Smartphone size={14} /> },
    ANDROID_FHD: { width: 1920, height: 1080, name: 'Android FHD', icon: <Smartphone size={14} /> },
    ANDROID_QHD: { width: 2560, height: 1440, name: 'Android QHD', icon: <Smartphone size={14} /> },
};

// Define device frames
const DEVICE_FRAMES = {
    NONE: { id: 'none', name: 'No Frame', icon: <Square size={14} /> },
    SMARTPHONE: { id: 'smartphone', name: 'Smartphone', icon: <Smartphone size={14} /> },
    MONITOR: { id: 'monitor', name: 'Monitor', icon: <Monitor size={14} /> },
};

// Define ruler units
const RULER_UNITS = {
    PX: { id: 'px', name: 'Pixels (px)' },
    CM: { id: 'cm', name: 'Centimeters (cm)' },
    MM: { id: 'mm', name: 'Millimeters (mm)' },
};

const EnhancedDesignEditor = () => {
    const { t } = useTranslation();
    const [activePreset, setActivePreset] = useState(CANVAS_PRESETS.ANDROID_FHD);
    const [orientation, setOrientation] = useState('landscape');
    const [deviceFrame, setDeviceFrame] = useState(DEVICE_FRAMES.NONE);
    const [showRulers, setShowRulers] = useState(true);
    const [rulerUnit, setRulerUnit] = useState(RULER_UNITS.PX);
    const [showCoordinates, setShowCoordinates] = useState(true);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Panel states
    const [leftPanelOpen, setLeftPanelOpen] = useState(true);
    const [rightPanelOpen, setRightPanelOpen] = useState(true);
    const [showPresetSelector, setShowPresetSelector] = useState(false);

    const editorContainerRef = useRef(null);
    const canvasContainerRef = useRef(null);

    // Get current canvas dimensions with orientation
    const getCurrentDimensions = () => {
        if (orientation === 'portrait' && activePreset.width > activePreset.height) {
            return { width: activePreset.height, height: activePreset.width };
        } else if (orientation === 'landscape' && activePreset.width < activePreset.height) {
            return { width: activePreset.height, height: activePreset.width };
        }
        return { width: activePreset.width, height: activePreset.height };
    };

    const dimensions = getCurrentDimensions();

    // Handle mouse move to track coordinates
    const handleMouseMove = (e) => {
        if (!canvasContainerRef.current || !showCoordinates) return;

        const rect = canvasContainerRef.current.getBoundingClientRect();
        const x = Math.round((e.clientX - rect.left) / zoomLevel);
        const y = Math.round((e.clientY - rect.top) / zoomLevel);

        setMousePosition({ x, y });
    };

    // Toggle fullscreen mode
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            editorContainerRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
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

    // Render device frame
    const renderDeviceFrame = () => {
        if (deviceFrame.id === 'none') return null;

        const frameStyles = {
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
        const notchStyles = deviceFrame.id === 'smartphone' ? {
            content: '""',
            position: 'absolute',
            width: '100px',
            height: '24px',
            backgroundColor: '#333',
            top: '-24px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderRadius: '0 0 16px 16px'
        } : {};

        return (
            <>
                <div style={frameStyles}></div>
                {deviceFrame.id === 'smartphone' && <div style={notchStyles}></div>}
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
        const horizontalRulerLength = dimensions.width;
        const verticalRulerLength = dimensions.height;

        // Generate horizontal ruler marks
        for (let i = 0; i <= horizontalRulerLength; i += pxPerUnit) {
            const isMajor = i % (pxPerUnit * 5) === 0;
            rulerMarks.push(
                <div key={`h-${i}`} className="ruler-mark horizontal" style={{
                    left: `${i}px`,
                    height: isMajor ? '12px' : '8px',
                    top: 0,
                    width: '1px',
                    position: 'absolute',
                    backgroundColor: isMajor ? '#333' : '#999'
                }}>
                    {isMajor && (
                        <span style={{
                            position: 'absolute',
                            top: '14px',
                            left: '-6px',
                            fontSize: '8px',
                            whiteSpace: 'nowrap'
                        }}>
              {Math.round(i / pxPerUnit)}
            </span>
                    )}
                </div>
            );
        }

        // Generate vertical ruler marks
        for (let i = 0; i <= verticalRulerLength; i += pxPerUnit) {
            const isMajor = i % (pxPerUnit * 5) === 0;
            rulerMarks.push(
                <div key={`v-${i}`} className="ruler-mark vertical" style={{
                    top: `${i}px`,
                    width: isMajor ? '12px' : '8px',
                    left: 0,
                    height: '1px',
                    position: 'absolute',
                    backgroundColor: isMajor ? '#333' : '#999'
                }}>
                    {isMajor && (
                        <span style={{
                            position: 'absolute',
                            left: '14px',
                            top: '-6px',
                            fontSize: '8px',
                            whiteSpace: 'nowrap',
                            transform: 'rotate(90deg)',
                            transformOrigin: 'left top'
                        }}>
              {Math.round(i / pxPerUnit)}
            </span>
                    )}
                </div>
            );
        }

        return (
            <div className="rulers" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
                <div className="horizontal-ruler" style={{
                    position: 'absolute',
                    top: 0,
                    left: '20px',
                    right: 0,
                    height: '20px',
                    backgroundColor: '#f0f0f0',
                    borderBottom: '1px solid #ccc',
                    overflow: 'hidden'
                }}>
                    {rulerMarks.filter(mark => mark.key.startsWith('h-'))}
                </div>
                <div className="vertical-ruler" style={{
                    position: 'absolute',
                    top: '20px',
                    left: 0,
                    bottom: 0,
                    width: '20px',
                    backgroundColor: '#f0f0f0',
                    borderRight: '1px solid #ccc',
                    overflow: 'hidden'
                }}>
                    {rulerMarks.filter(mark => mark.key.startsWith('v-'))}
                </div>
                <div className="ruler-corner" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '20px',
                    height: '20px',
                    backgroundColor: '#f0f0f0',
                    borderRight: '1px solid #ccc',
                    borderBottom: '1px solid #ccc'
                }}></div>
            </div>
        );
    };

    // Render coordinate display
    const renderCoordinates = () => {
        if (!showCoordinates) return null;

        return (
            <div className="coordinates-display" style={{
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                zIndex: 1000
            }}>
                X: {mousePosition.x} Y: {mousePosition.y}
            </div>
        );
    };

    // Render canvas preset selector
    const renderPresetSelector = () => {
        if (!showPresetSelector) return null;

        const presetCategories = [
            {
                name: 'Basic',
                presets: [CANVAS_PRESETS.DEFAULT, CANVAS_PRESETS.FACEBOOK, CANVAS_PRESETS.WIDESCREEN]
            },
            {
                name: 'Instagram',
                presets: [CANVAS_PRESETS.INSTA_SQUARE, CANVAS_PRESETS.INSTA_PORTRAIT, CANVAS_PRESETS.INSTA_LANDSCAPE]
            },
            {
                name: 'Android',
                presets: [CANVAS_PRESETS.ANDROID_HD, CANVAS_PRESETS.ANDROID_FHD, CANVAS_PRESETS.ANDROID_QHD]
            }
        ];

        return (
            <div className="preset-selector" style={{
                position: 'absolute',
                top: '60px',
                right: '20px',
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
                width: '250px'
            }}>
                <div style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    <h3 style={{ margin: 0, fontSize: '14px' }}>{t('Canvas Size')}</h3>
                </div>

                {presetCategories.map(category => (
                    <div key={category.name} style={{ padding: '8px 0' }}>
                        <div style={{ padding: '4px 12px', fontSize: '12px', color: '#666', fontWeight: 'bold' }}>
                            {category.name}
                        </div>
                        {category.presets.map(preset => (
                            <div
                                key={preset.name}
                                onClick={() => {
                                    setActivePreset(preset);
                                    setShowPresetSelector(false);
                                }}
                                style={{
                                    padding: '8px 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    backgroundColor: preset === activePreset ? '#f0f7ff' : 'transparent',
                                    borderLeft: preset === activePreset ? '3px solid #2196F3' : '3px solid transparent'
                                }}
                            >
                                <span style={{ marginRight: '8px' }}>{preset.icon}</span>
                                <span style={{ fontSize: '13px' }}>{preset.name}</span>
                                <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#666' }}>
                  {preset.width} × {preset.height}
                </span>
                            </div>
                        ))}
                    </div>
                ))}

                <div style={{ padding: '12px', borderTop: '1px solid #eee' }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>{t('Orientation')}</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => setOrientation('landscape')}
                            style={{
                                flex: 1,
                                padding: '6px',
                                border: orientation === 'landscape' ? '2px solid #2196F3' : '1px solid #ccc',
                                borderRadius: '4px',
                                background: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            {t('Landscape')}
                        </button>
                        <button
                            onClick={() => setOrientation('portrait')}
                            style={{
                                flex: 1,
                                padding: '6px',
                                border: orientation === 'portrait' ? '2px solid #2196F3' : '1px solid #ccc',
                                borderRadius: '4px',
                                background: 'white',
                                cursor: 'pointer'
                            }}
                        >
                            {t('Portrait')}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Render toolbar additions
    const renderToolbarExtensions = () => {
        return (
            <div className="toolbar-extensions" style={{ display: 'flex', gap: '8px' }}>
                {/* Canvas preset button */}
                <button
                    onClick={() => setShowPresetSelector(!showPresetSelector)}
                    className="toolbar-button"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 10px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        background: 'white',
                        cursor: 'pointer'
                    }}
                >
                    <Square size={16} />
                    <span style={{ fontSize: '13px' }}>{dimensions.width} × {dimensions.height}</span>
                </button>

                {/* Orientation toggle */}
                <button
                    onClick={() => setOrientation(orientation === 'landscape' ? 'portrait' : 'landscape')}
                    className="toolbar-button"
                    title={t(orientation === 'landscape' ? 'Switch to Portrait' : 'Switch to Landscape')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        background: 'white',
                        cursor: 'pointer'
                    }}
                >
                    <RotateCcw size={16} />
                </button>

                {/* Device frame selector */}
                <select
                    value={deviceFrame.id}
                    onChange={(e) => {
                        const selected = Object.values(DEVICE_FRAMES).find(frame => frame.id === e.target.value);
                        setDeviceFrame(selected || DEVICE_FRAMES.NONE);
                    }}
                    style={{
                        padding: '6px 8px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        background: 'white',
                        fontSize: '13px'
                    }}
                >
                    {Object.values(DEVICE_FRAMES).map(frame => (
                        <option key={frame.id} value={frame.id}>{frame.name}</option>
                    ))}
                </select>

                {/* Ruler toggle */}
                <button
                    onClick={() => setShowRulers(!showRulers)}
                    className="toolbar-button"
                    title={t(showRulers ? 'Hide Rulers' : 'Show Rulers')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        background: showRulers ? '#e6f2ff' : 'white',
                        cursor: 'pointer'
                    }}
                >
                    <Ruler size={16} />
                </button>

                {/* Ruler unit selector (only visible when rulers are shown) */}
                {showRulers && (
                    <select
                        value={rulerUnit.id}
                        onChange={(e) => {
                            const selected = Object.values(RULER_UNITS).find(unit => unit.id === e.target.value);
                            setRulerUnit(selected || RULER_UNITS.PX);
                        }}
                        style={{
                            padding: '6px 8px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            background: 'white',
                            fontSize: '13px'
                        }}
                    >
                        {Object.values(RULER_UNITS).map(unit => (
                            <option key={unit.id} value={unit.id}>{unit.name}</option>
                        ))}
                    </select>
                )}

                {/* Coordinates toggle */}
                <button
                    onClick={() => setShowCoordinates(!showCoordinates)}
                    className="toolbar-button"
                    title={t(showCoordinates ? 'Hide Coordinates' : 'Show Coordinates')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        background: showCoordinates ? '#e6f2ff' : 'white',
                        cursor: 'pointer'
                    }}
                >
                    <MousePointer size={16} />
                </button>

                {/* Zoom controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                        onClick={() => setZoomLevel(Math.max(0.1, zoomLevel - 0.1))}
                        disabled={zoomLevel <= 0.1}
                        style={{
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            background: 'white',
                            cursor: zoomLevel <= 0.1 ? 'not-allowed' : 'pointer',
                            opacity: zoomLevel <= 0.1 ? 0.5 : 1
                        }}
                    >
                        <ZoomOut size={16} />
                    </button>

                    <span style={{ fontSize: '12px', width: '40px', textAlign: 'center' }}>
            {Math.round(zoomLevel * 100)}%
          </span>

                    <button
                        onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.1))}
                        disabled={zoomLevel >= 3}
                        style={{
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            background: 'white',
                            cursor: zoomLevel >= 3 ? 'not-allowed' : 'pointer',
                            opacity: zoomLevel >= 3 ? 0.5 : 1
                        }}
                    >
                        <ZoomIn size={16} />
                    </button>
                </div>

                {/* Fullscreen toggle */}
                <button
                    onClick={toggleFullscreen}
                    className="toolbar-button"
                    title={t(isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        background: 'white',
                        cursor: 'pointer'
                    }}
                >
                    {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                </button>
            </div>
        );
    };

    return (
        <div
            ref={editorContainerRef}
            className="enhanced-design-editor"
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                overflow: 'hidden',
                position: 'relative'
            }}
        >
            <DesignEditorProvider width={dimensions.width} height={dimensions.height}>
                {/* Custom toolbar with extensions */}
                <div className="custom-toolbar" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 16px',
                    borderBottom: '1px solid #ddd',
                    backgroundColor: '#f5f5f5'
                }}>
                    <EditorToolbar toggleToolbarButton={null} />
                    {renderToolbarExtensions()}
                </div>

                {/* Main editor area */}
                <div className="editor-main" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    {/* Left panel */}
                    {leftPanelOpen && (
                        <LeftPanel
                            isOpen={true}
                            width={280}
                            panelRef={{ current: null }}
                            resizeHandleRef={{ current: null }}
                            onToggle={() => setLeftPanelOpen(!leftPanelOpen)}
                            onStartResize={() => {}}
                            activeTab="objects"
                            onTabChange={() => {}}
                        />
                    )}

                    {/* Canvas container */}
                    <div
                        ref={canvasContainerRef}
                        className="canvas-container"
                        style={{
                            flex: 1,
                            overflow: 'auto',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px',
                            backgroundColor: '#e5e5e5'
                        }}
                        onMouseMove={handleMouseMove}
                    >
                        <div className="canvas-wrapper" style={{
                            position: 'relative',
                            boxShadow: '0 0 20px rgba(0, 0, 0, 0.15)',
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
                    {rightPanelOpen && (
                        <RightPanel
                            isOpen={true}
                            width={280}
                            panelRef={{ current: null }}
                            resizeHandleRef={{ current: null }}
                            onToggle={() => setRightPanelOpen(!rightPanelOpen)}
                            onStartResize={() => {}}
                        />
                    )}
                </div>

                {/* Preset selector dropdown */}
                {renderPresetSelector()}
            </DesignEditorProvider>
        </div>
    );
};

export default EnhancedDesignEditor;