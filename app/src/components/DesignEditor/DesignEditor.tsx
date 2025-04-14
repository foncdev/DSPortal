// src/components/DesignEditor/DesignEditor.tsx
import React, { useState, useRef } from 'react';import {
    Maximize, Minimize, ZoomIn, ZoomOut, Ruler, MousePointer,
    RotateCcw, Smartphone, Monitor, Square, Instagram
} from 'lucide-react';
import { DesignEditorProvider } from './context/DesignEditorContext';
import DesignEditorLayout from './layout/DesignEditorLayout';
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
 * Enhanced DesignEditor component with additional features:
 * - Canvas size presets and orientation control
 * - Device frames
 * - Rulers with different unit options
 * - Mouse coordinate tracking
 * - Fullscreen mode
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
    const getInitialPreset = (): CanvasPreset => CANVAS_PRESETS[initialPreset] || CANVAS_PRESETS.ANDROID_FHD;
    const getInitialFrame = (): DeviceFrame => DEVICE_FRAMES[initialDeviceFrame] || DEVICE_FRAMES.NONE;
    const getInitialUnit = (): RulerUnit => RULER_UNITS[initialRulerUnit] || RULER_UNITS.PX;

    // State variables for design editor settings
    const [activePreset, setActivePreset] = useState<CanvasPreset>(getInitialPreset());
    const [orientation, setOrientation] = useState<'landscape' | 'portrait'>(initialOrientation);
    const [deviceFrame, setDeviceFrame] = useState<DeviceFrame>(getInitialFrame());
    const [showRulers, setShowRulers] = useState<boolean>(initialShowRulers);
    const [rulerUnit, setRulerUnit] = useState<RulerUnit>(getInitialUnit());
    const [showCoordinates, setShowCoordinates] = useState<boolean>(initialShowCoordinates);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [showPresetSelector, setShowPresetSelector] = useState(false);

    // Refs
    const editorContainerRef = useRef<HTMLDivElement>(null);

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

    // Handle mouse position update
    const updateMousePosition = (x: number, y: number) => {
        if (showCoordinates) {
            setMousePosition({ x, y });
        }
    };

    // Handle canvas preset selection
    const handlePresetChange = (presetKey: keyof typeof CANVAS_PRESETS) => {
        setActivePreset(CANVAS_PRESETS[presetKey]);
        setShowPresetSelector(false);
    };

    // Handle device frame change
    const handleDeviceFrameChange = (frameKey: keyof typeof DEVICE_FRAMES) => {
        setDeviceFrame(DEVICE_FRAMES[frameKey]);
    };

    // Handle ruler unit change
    const handleRulerUnitChange = (unitKey: keyof typeof RULER_UNITS) => {
        setRulerUnit(RULER_UNITS[unitKey]);
    };

    // Handle orientation toggle
    const toggleOrientation = () => {
        setOrientation(orientation === 'landscape' ? 'portrait' : 'landscape');
    };

    // Pass settings to layout component
    return (
        <div
            ref={editorContainerRef}
            className={`${styles.designEditor} ${className}`}
        >
            <DesignEditorProvider width={dimensions.width} height={dimensions.height}>
                <DesignEditorLayout
                    canvasWidth={dimensions.width}
                    canvasHeight={dimensions.height}
                    activePreset={activePreset}
                    orientation={orientation}
                    deviceFrame={deviceFrame}
                    showRulers={showRulers}
                    rulerUnit={rulerUnit}
                    showCoordinates={showCoordinates}
                    mousePosition={mousePosition}
                    showPresetSelector={showPresetSelector}
                    onMousePositionChange={updateMousePosition}
                    onPresetChange={handlePresetChange}
                    onOrientationToggle={toggleOrientation}
                    onDeviceFrameChange={handleDeviceFrameChange}
                    onRulerToggle={() => setShowRulers(!showRulers)}
                    onRulerUnitChange={handleRulerUnitChange}
                    onCoordinatesToggle={() => setShowCoordinates(!showCoordinates)}
                    onPresetSelectorToggle={() => setShowPresetSelector(!showPresetSelector)}
                    containerRef={editorContainerRef}
                />
            </DesignEditorProvider>
        </div>
    );
};

export default DesignEditor;