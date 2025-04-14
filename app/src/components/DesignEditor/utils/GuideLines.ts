// src/components/DesignEditor/utils/GuideLines.ts
import { fabric } from 'fabric';
import { FabricObjectWithId } from '../context/DesignEditorContext';

// Guide line types
export enum GuideLineType {
    HORIZONTAL = 'horizontal',
    VERTICAL = 'vertical',
}

// Snapping configuration
interface SnapConfig {
    enabled: boolean;
    threshold: number;  // Distance in pixels to activate snapping
    showGuides: boolean;
    snapToGrid: boolean;
    gridSize: number;
    snapToObjects: boolean;
    snapToCenter: boolean;
    snapToEdges: boolean;
}

// Default configuration
const defaultSnapConfig: SnapConfig = {
    enabled: true,
    threshold: 10,
    showGuides: true,
    snapToGrid: true,
    gridSize: 20,
    snapToObjects: true,
    snapToCenter: true,
    snapToEdges: true,
};

// Guideline storage
interface GuideLines {
    horizontal: number[];
    vertical: number[];
    drawn: fabric.Line[];
}

/**
 * GuidelinesHandler manages the creation, display, and behavior of guidelines
 * and snapping functionality in the design editor.
 */
export class GuidelinesHandler {
    private canvas: fabric.Canvas;
    private config: SnapConfig;
    private guideLines: GuideLines = {
        horizontal: [],
        vertical: [],
        drawn: [],
    };
    private canvasWidth: number;
    private canvasHeight: number;
    private isDragging: boolean = false;
    private draggedObject: FabricObjectWithId | null = null;

    constructor(canvas: fabric.Canvas, canvasWidth: number, canvasHeight: number, config?: Partial<SnapConfig>) {
        this.canvas = canvas;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.config = { ...defaultSnapConfig, ...config };
        this.initialize();
    }

    /**
     * Initialize the guidelines handler
     */
    private initialize(): void {
        // Initialize canvas event handlers
        this.initializeEventHandlers();

        // Calculate initial guidelines for canvas
        this.calculateCanvasGuidelines();
    }

    /**
     * Update configuration
     */
    public updateConfig(config: Partial<SnapConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Set up event handlers for object movement
     */
    private initializeEventHandlers(): void {
        // Before object movement starts
        this.canvas.on('object:moving', this.handleObjectMoving.bind(this));

        // When object movement starts
        this.canvas.on('mouse:down', this.handleMouseDown.bind(this));

        // When object movement ends
        this.canvas.on('mouse:up', this.handleMouseUp.bind(this));

        // When object is modified
        this.canvas.on('object:modified', this.handleObjectModified.bind(this));
    }

    /**
     * Handle object moving event
     */
    private handleObjectMoving(event: fabric.IEvent<MouseEvent>): void {
        if (!this.config.enabled || !event.target) return;

        const target = event.target as FabricObjectWithId;
        this.draggedObject = target;

        // Clear previous guidelines
        this.clearGuideLines();

        // If snapping is enabled
        if (this.config.enabled) {
            // Generate guidelines for other objects
            if (this.config.snapToObjects) {
                this.calculateObjectGuidelines(target);
            }

            // Generate guidelines for canvas edges and center
            if (this.config.snapToEdges || this.config.snapToCenter) {
                this.calculateCanvasGuidelines();
            }

            // Perform snapping
            this.snapObjectToGuidelines(target);

            // Draw guidelines if enabled
            if (this.config.showGuides) {
                this.drawGuideLines();
            }
        }
    }

    /**
     * Handle mouse down event
     */
    private handleMouseDown(event: fabric.IEvent<MouseEvent>): void {
        const activeObject = this.canvas.getActiveObject();
        if (activeObject) {
            this.isDragging = true;
            this.draggedObject = activeObject as FabricObjectWithId;
        }
    }

    /**
     * Handle mouse up event - end of dragging
     */
    private handleMouseUp(): void {
        if (this.isDragging) {
            this.isDragging = false;
            this.draggedObject = null;
            this.clearGuideLines();
        }
    }

    /**
     * Handle object modified event
     */
    private handleObjectModified(): void {
        this.clearGuideLines();
    }

    /**
     * Calculate guidelines for canvas edges and center
     */
    private calculateCanvasGuidelines(): void {
        const { snapToEdges, snapToCenter } = this.config;

        this.guideLines.horizontal = [];
        this.guideLines.vertical = [];

        if (snapToEdges) {
            // Canvas top and bottom edges
            this.guideLines.horizontal.push(0);
            this.guideLines.horizontal.push(this.canvasHeight);

            // Canvas left and right edges
            this.guideLines.vertical.push(0);
            this.guideLines.vertical.push(this.canvasWidth);
        }

        if (snapToCenter) {
            // Canvas horizontal center
            this.guideLines.horizontal.push(this.canvasHeight / 2);

            // Canvas vertical center
            this.guideLines.vertical.push(this.canvasWidth / 2);
        }
    }

    /**
     * Calculate guidelines based on other objects in the canvas
     */
    private calculateObjectGuidelines(activeObject: FabricObjectWithId): void {
        const allObjects = this.canvas.getObjects() as FabricObjectWithId[];

        // Skip calculating if no other objects exist
        if (allObjects.length <= 1) return;

        // Process each object
        allObjects.forEach((obj) => {
            // Skip the active object itself
            if (obj === activeObject) return;

            // Skip invisible or locked objects
            if (!obj.visible || obj.locked) return;

            // Get object bounds considering transformation
            const objBounds = this.getObjectBounds(obj);

            // Add horizontal guides (top, center, bottom)
            this.guideLines.horizontal.push(objBounds.top);
            this.guideLines.horizontal.push(objBounds.top + objBounds.height / 2);
            this.guideLines.horizontal.push(objBounds.top + objBounds.height);

            // Add vertical guides (left, center, right)
            this.guideLines.vertical.push(objBounds.left);
            this.guideLines.vertical.push(objBounds.left + objBounds.width / 2);
            this.guideLines.vertical.push(objBounds.left + objBounds.width);
        });
    }

    /**
     * Get object bounds considering rotation and scaling
     */
    private getObjectBounds(obj: FabricObjectWithId): { top: number; left: number; width: number; height: number } {
        const boundingBox = obj.getBoundingRect();
        return {
            top: boundingBox.top,
            left: boundingBox.left,
            width: boundingBox.width,
            height: boundingBox.height,
        };
    }

    /**
     * Snap an object to the nearest guidelines
     */
    private snapObjectToGuidelines(object: FabricObjectWithId): void {
        if (!object || !this.config.enabled) return;

        const { threshold } = this.config;
        const objBounds = this.getObjectBounds(object);

        // Calculate object's key points
        const objectPoints = {
            horizontal: [
                objBounds.top, // top edge
                objBounds.top + objBounds.height / 2, // center
                objBounds.top + objBounds.height, // bottom edge
            ],
            vertical: [
                objBounds.left, // left edge
                objBounds.left + objBounds.width / 2, // center
                objBounds.left + objBounds.width, // right edge
            ],
        };

        // Snap horizontally
        let nearestH = null;
        let nearestHDist = threshold;

        objectPoints.horizontal.forEach((point) => {
            this.guideLines.horizontal.forEach((guideline) => {
                const distance = Math.abs(guideline - point);
                if (distance < nearestHDist) {
                    nearestH = { guideline, point };
                    nearestHDist = distance;
                }
            });
        });

        // Snap vertically
        let nearestV = null;
        let nearestVDist = threshold;

        objectPoints.vertical.forEach((point) => {
            this.guideLines.vertical.forEach((guideline) => {
                const distance = Math.abs(guideline - point);
                if (distance < nearestVDist) {
                    nearestV = { guideline, point };
                    nearestVDist = distance;
                }
            });
        });

        // Apply horizontal snapping
        if (nearestH) {
            const deltaY = nearestH.guideline - nearestH.point;
            object.set('top', objBounds.top + deltaY);

            // Add guideline for visualization
            if (this.config.showGuides) {
                this.guideLines.horizontal = [nearestH.guideline];
            }
        }

        // Apply vertical snapping
        if (nearestV) {
            const deltaX = nearestV.guideline - nearestV.point;
            object.set('left', objBounds.left + deltaX);

            // Add guideline for visualization
            if (this.config.showGuides) {
                this.guideLines.vertical = [nearestV.guideline];
            }
        }

        // Apply grid snapping if enabled
        if (this.config.snapToGrid && !nearestH && !nearestV) {
            this.snapToGrid(object);
        }

        // Update object coordinates
        object.setCoords();
    }

    /**
     * Snap object to grid
     */
    private snapToGrid(object: FabricObjectWithId): void {
        if (!this.config.snapToGrid) return;

        const { gridSize } = this.config;
        const objBounds = this.getObjectBounds(object);

        // Snap top-left corner to grid
        const snappedLeft = Math.round(objBounds.left / gridSize) * gridSize;
        const snappedTop = Math.round(objBounds.top / gridSize) * gridSize;

        // Apply snapped position
        object.set({
            left: snappedLeft,
            top: snappedTop,
        });
    }

    /**
     * Draw guidelines on the canvas
     */
    private drawGuideLines(): void {
        // Clear previous guidelines
        this.clearDrawnGuideLines();

        // Set common line properties
        const lineOptions = {
            stroke: '#2196F3', // Material blue color
            strokeWidth: 1,
            strokeDashArray: [5, 5], // Dashed line
            selectable: false,
            evented: false,
            excludeFromExport: true,
        };

        // Draw horizontal guidelines
        this.guideLines.horizontal.forEach((y) => {
            const line = new fabric.Line([0, y, this.canvasWidth, y], {
                ...lineOptions,
                strokeWidth: 1.5, // Make horizontal lines slightly thicker for better visibility
            });
            this.canvas.add(line);
            this.guideLines.drawn.push(line);
        });

        // Draw vertical guidelines
        this.guideLines.vertical.forEach((x) => {
            const line = new fabric.Line([x, 0, x, this.canvasHeight], lineOptions);
            this.canvas.add(line);
            this.guideLines.drawn.push(line);
        });

        // Request canvas rendering
        this.canvas.requestRenderAll();
    }

    /**
     * Clear all drawn guidelines
     */
    private clearDrawnGuideLines(): void {
        // Remove all guideline objects from canvas
        this.guideLines.drawn.forEach((line) => {
            this.canvas.remove(line);
        });

        // Clear the drawn lines array
        this.guideLines.drawn = [];
    }

    /**
     * Clear all guidelines (both data and visual)
     */
    private clearGuideLines(): void {
        this.clearDrawnGuideLines();
        this.guideLines.horizontal = [];
        this.guideLines.vertical = [];
    }

    /**
     * Update canvas dimensions
     */
    public updateCanvasDimensions(width: number, height: number): void {
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.calculateCanvasGuidelines();
    }

    /**
     * Toggle guidelines visibility
     */
    public toggleGuidelines(show: boolean): void {
        this.config.showGuides = show;
        if (!show) {
            this.clearDrawnGuideLines();
        }
    }

    /**
     * Toggle snapping functionality
     */
    public toggleSnapping(enabled: boolean): void {
        this.config.enabled = enabled;
        if (!enabled) {
            this.clearGuideLines();
        }
    }

    /**
     * Toggle grid snapping
     */
    public toggleGridSnapping(enabled: boolean): void {
        this.config.snapToGrid = enabled;
    }

    /**
     * Set grid size
     */
    public setGridSize(size: number): void {
        this.config.gridSize = size;
    }

    /**
     * Cleanup resources when needed
     */
    public destroy(): void {
        // Remove event handlers
        this.canvas.off('object:moving');
        this.canvas.off('mouse:down');
        this.canvas.off('mouse:up');
        this.canvas.off('object:modified');

        // Clear guidelines
        this.clearGuideLines();
    }
}

export default GuidelinesHandler;