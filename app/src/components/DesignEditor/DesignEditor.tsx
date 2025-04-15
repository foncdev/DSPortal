import React, { useState, useRef, useEffect } from 'react';
import {
    Square,
    Smartphone,
    Monitor,
    Instagram
} from 'lucide-react';
import { DesignEditorProvider } from './context/DesignEditorContext';
import LeftPanel from './components/panels/LeftPanel';
import RightPanel from './components/panels/RightPanel';
import EditorToolbar from './components/toolbar/EditorToolbar';
import CanvasContainer from './components/Canvas/CanvasContainer';
import CanvasControls from './components/Canvas/CanvasControls';
import { useResizablePanel } from './hooks/useResizablePanel';
import styles from './styles/DesignEditor.module.scss';

// Define canvas presets
export const CANVAS_PRESETS = {
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
export const DEVICE_FRAMES = {
    NONE: { id: 'none', name: 'No Frame', icon: <Square size={14} /> },
    SMARTPHONE: { id: 'smartphone', name: 'Smartphone', icon: <Smartphone size={14} /> },
    MONITOR: { id: 'monitor', name: 'Monitor', icon: <Monitor size={14} /> },
};

// Define ruler units
export const RULER_UNITS = {
    PX: { id: 'px', name: 'Pixels (px)' },
    CM: { id: 'cm', name: 'Centimeters (cm)' },
    MM: { id: 'mm', name: 'Millimeters (mm)' },
};

interface DesignEditorProps {
    initialPreset?: keyof typeof CANVAS_PRESETS;
    initialOrientation?: 'landscape' | 'portrait';
    initialDeviceFrame?: keyof typeof DEVICE_FRAMES;
    initialShowRulers?: boolean;
    initialRulerUnit?: keyof typeof RULER_UNITS;
    initialShowCoordinates?: boolean;
    className?: string;
}

/**
 * Improved DesignEditor component that maintains a fixed canvas size
 * and scales based on available space
 */
const DesignEditor: React.FC<DesignEditorProps> = ({
                                                       initialPreset = 'ANDROID_FHD',
                                                       initialOrientation = 'landscape',
                                                       initialDeviceFrame = 'NONE',
                                                       initialShowRulers = true,
                                                       initialRulerUnit = 'PX',
                                                       initialShowCoordinates = true,
                                                       className = '',
                                                   }) => {
    // Get preset objects from initial values
    const getInitialPreset = (): any => CANVAS_PRESETS[initialPreset] || CANVAS_PRESETS.ANDROID_FHD;
    const getInitialFrame = (): any => DEVICE_FRAMES[initialDeviceFrame] || DEVICE_FRAMES.NONE;
    const getInitialUnit = (): any => RULER_UNITS[initialRulerUnit] || RULER_UNITS.PX;

    // State variables for design editor settings
    const [activePreset, setActivePreset] = useState<any>(getInitialPreset());
    const [orientation, setOrientation] = useState<'landscape' | 'portrait'>(initialOrientation);
    const [deviceFrame, setDeviceFrame] = useState<any>(getInitialFrame());
    const [showRulers, setShowRulers] = useState<boolean>(initialShowRulers);
    const [rulerUnit, setRulerUnit] = useState<any>(getInitialUnit());
    const [showCoordinates, setShowCoordinates] = useState<boolean>(initialShowCoordinates);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [showPresetSelector, setShowPresetSelector] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Panel states
    const [leftPanelOpen, setLeftPanelOpen] = useState(true);
    const [rightPanelOpen, setRightPanelOpen] = useState(true);
    const [toolbarOpen, setToolbarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('objects'); // 'objects', 'library', 'filemanager'

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

    // Refs
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const contentAreaRef = useRef<HTMLDivElement>(null);

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

    // Handle fullscreen toggle
    const toggleFullscreen = () => {
        if (!document.fullscreenElement && editorContainerRef.current) {
            editorContainerRef.current.requestFullscreen().catch(err => {
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

    // Toggle panels
    const toggleLeftPanel = () => setLeftPanelOpen(!leftPanelOpen);
    const toggleRightPanel = () => setRightPanelOpen(!rightPanelOpen);
    const toggleToolbar = () => setToolbarOpen(!toolbarOpen);

    // Handle mouse position update
    const updateMousePosition = (x: number, y: number) => {
        if (showCoordinates) {
            setMousePosition({ x, y });
        }
    };

    // Handle canvas preset change
    const handlePresetChange = (preset: any) => {
        setActivePreset(preset);
    };

    // Handle device frame change
    const handleDeviceFrameChange = (frame: any) => {
        setDeviceFrame(frame);
    };

    // Handle ruler unit change
    const handleRulerUnitChange = (unit: any) => {
        setRulerUnit(unit);
    };

    // Handle orientation toggle
    const toggleOrientation = () => {
        setOrientation(orientation === 'landscape' ? 'portrait' : 'landscape');
    };

    // Render toolbar toggle button
    const renderToolbarToggleButton = () => (
        <button
            className={styles.toolbarToggleButton}
            onClick={toggleToolbar}
            title={toolbarOpen ? "Hide Toolbar" : "Show Toolbar"}
        >
            {/* Icon can be Minimize/Maximize based on state */}
            {toolbarOpen ? "▲" : "▼"}
        </button>
    );

    return (
        <div
            ref={editorContainerRef}
            className={`${styles.editorContainer} ${className}`}
        >
            <DesignEditorProvider width={dimensions.width} height={dimensions.height}>
                {/* Toolbar toggle button - only visible when toolbar is hidden */}
                {!toolbarOpen && (
                    <div className={styles.toolbarToggleContainer}>
                        {renderToolbarToggleButton()}
                    </div>
                )}

                {/* Main toolbar */}
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

                    {/* Canvas content area */}
                    <div ref={contentAreaRef} className={styles.contentArea}>
                        <CanvasContainer
                            onMouseMove={updateMousePosition}
                            showDeviceFrame={deviceFrame.id !== 'none'}
                            deviceFrameType={deviceFrame.id}
                            showRulers={showRulers}
                            rulerUnit={rulerUnit.id}
                        />

                        {/* Canvas controls */}
                        <CanvasControls
                            containerRef={contentAreaRef}
                            onPresetChange={handlePresetChange}
                            onOrientationToggle={toggleOrientation}
                            onDeviceFrameChange={handleDeviceFrameChange}
                            onRulerToggle={() => setShowRulers(!showRulers)}
                            onRulerUnitChange={handleRulerUnitChange}
                            onCoordinatesToggle={() => setShowCoordinates(!showCoordinates)}
                            onFullscreenToggle={toggleFullscreen}
                            showPresetSelector={showPresetSelector}
                            onTogglePresetSelector={() => setShowPresetSelector(!showPresetSelector)}
                        />
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
            </DesignEditorProvider>
        </div>
    );
};

export default DesignEditor;