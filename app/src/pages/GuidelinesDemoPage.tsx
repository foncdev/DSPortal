import React, { useState, useEffect, useRef } from 'react';
import {
    Grid,
    Magnet,
    BoxSelect,
    ArrowUp,
    ArrowDown,
    Square,
    Circle,
    Triangle,
    Type,
    Info,
    Keyboard
} from 'lucide-react';

// Interactive demo of guidelines and snapping functionality
const GuidelinesDemoPage = () => {
    // Demo states
    const [showGrid, setShowGrid] = useState(true);
    const [snapToGuides, setSnapToGuides] = useState(true);
    const [snapToGrid, setSnapToGrid] = useState(false);
    const [selectedShape, setSelectedShape] = useState('rect');
    const [showKeyboardTips, setShowKeyboardTips] = useState(false);

    // Canvas ref for drawing
    const canvasRef = useRef(null);

    // Track mouse position
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // Track dragging state
    const [isDragging, setIsDragging] = useState(false);
    const [dragTarget, setDragTarget] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    // Shapes for the demo
    const [shapes, setShapes] = useState([
        { id: 1, type: 'rect', x: 50, y: 50, width: 100, height: 100, color: '#3b82f6' },
        { id: 2, type: 'circle', x: 250, y: 100, radius: 50, color: '#10b981' },
        { id: 3, type: 'rect', x: 400, y: 200, width: 150, height: 80, color: '#f59e0b' }
    ]);

    // Guidelines state
    const [activeGuides, setActiveGuides] = useState({
        horizontal: [],
        vertical: []
    });

    // Initialize drawing
    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw grid if enabled
        if (showGrid) {
            drawGrid(ctx, canvas.width, canvas.height);
        }

        // Draw guidelines
        drawGuideLines(ctx, canvas.width, canvas.height);

        // Draw shapes
        shapes.forEach(shape => {
            drawShape(ctx, shape);
        });

    }, [shapes, showGrid, activeGuides]);

    // Draw grid
    const drawGrid = (ctx, width, height) => {
        ctx.save();
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;

        // Grid size
        const gridSize = 20;

        // Draw vertical lines
        for (let x = 0; x <= width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Draw horizontal lines
        for (let y = 0; y <= height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        ctx.restore();
    };

    // Draw guidelines
    const drawGuideLines = (ctx, width, height) => {
        if (!snapToGuides) return;

        ctx.save();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);

        // Draw horizontal guidelines
        activeGuides.horizontal.forEach(y => {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        });

        // Draw vertical guidelines
        activeGuides.vertical.forEach(x => {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        });

        ctx.restore();
    };

    // Draw shape
    const drawShape = (ctx, shape) => {
        ctx.save();
        ctx.fillStyle = shape.color;

        switch (shape.type) {
            case 'rect':
                ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
                break;
            case 'circle':
                ctx.beginPath();
                ctx.arc(shape.x + shape.radius, shape.y + shape.radius, shape.radius, 0, Math.PI * 2);
                ctx.fill();
                break;
            case 'triangle':
                const h = shape.height;
                const w = shape.width;
                ctx.beginPath();
                ctx.moveTo(shape.x + w/2, shape.y);
                ctx.lineTo(shape.x, shape.y + h);
                ctx.lineTo(shape.x + w, shape.y + h);
                ctx.closePath();
                ctx.fill();
                break;
            default:
                break;
        }

        ctx.restore();
    };

    // Handle mouse down
    const handleMouseDown = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if mouse is over a shape
        let targetShape = null;

        for (let i = shapes.length - 1; i >= 0; i--) {
            const shape = shapes[i];

            let isOver = false;

            if (shape.type === 'rect') {
                isOver = x >= shape.x && x <= shape.x + shape.width &&
                    y >= shape.y && y <= shape.y + shape.height;
            } else if (shape.type === 'circle') {
                const dx = x - (shape.x + shape.radius);
                const dy = y - (shape.y + shape.radius);
                isOver = dx * dx + dy * dy <= shape.radius * shape.radius;
            } else if (shape.type === 'triangle') {
                // Simplified triangle hit test
                const px = x - shape.x;
                const py = y - shape.y;

                isOver = px >= 0 && px <= shape.width &&
                    py >= 0 && py <= shape.height &&
                    py >= shape.height - (shape.height * px / shape.width);
            }

            if (isOver) {
                targetShape = shape;
                break;
            }
        }

        if (targetShape) {
            setIsDragging(true);
            setDragTarget(targetShape);

            // Calculate offset
            setDragOffset({
                x: x - targetShape.x,
                y: y - targetShape.y
            });
        }
    };

    // Handle mouse move
    const handleMouseMove = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setMousePos({ x, y });

        if (isDragging && dragTarget) {
            // Calculate new position
            let newX = x - dragOffset.x;
            let newY = y - dragOffset.y;

            // Get shape bounds
            let width, height;

            if (dragTarget.type === 'rect' || dragTarget.type === 'triangle') {
                width = dragTarget.width;
                height = dragTarget.height;
            } else if (dragTarget.type === 'circle') {
                width = height = dragTarget.radius * 2;
            }

            // Calculate shape center
            const centerX = newX + width / 2;
            const centerY = newY + height / 2;

            // Create guides array
            const guides = {
                horizontal: [],
                vertical: []
            };

            // Check for snapping if enabled
            if (snapToGuides) {
                // Add canvas center guidelines
                guides.horizontal.push(canvas.height / 2);
                guides.vertical.push(canvas.width / 2);

                // Add guidelines for other shapes
                shapes.forEach(shape => {
                    if (shape.id === dragTarget.id) return;

                    let shapeWidth, shapeHeight, shapeCenterX, shapeCenterY;

                    if (shape.type === 'rect' || shape.type === 'triangle') {
                        shapeWidth = shape.width;
                        shapeHeight = shape.height;
                        shapeCenterX = shape.x + shapeWidth / 2;
                        shapeCenterY = shape.y + shapeHeight / 2;

                        // Add edge guidelines
                        guides.horizontal.push(shape.y); // Top
                        guides.horizontal.push(shape.y + shapeHeight); // Bottom
                        guides.vertical.push(shape.x); // Left
                        guides.vertical.push(shape.x + shapeWidth); // Right

                    } else if (shape.type === 'circle') {
                        shapeWidth = shapeHeight = shape.radius * 2;
                        shapeCenterX = shape.x + shape.radius;
                        shapeCenterY = shape.y + shape.radius;

                        // Add edge guidelines
                        guides.horizontal.push(shape.y); // Top
                        guides.horizontal.push(shape.y + shapeHeight); // Bottom
                        guides.vertical.push(shape.x); // Left
                        guides.vertical.push(shape.x + shapeWidth); // Right
                    }

                    // Add center alignment guidelines
                    guides.horizontal.push(shapeCenterY);
                    guides.vertical.push(shapeCenterX);
                });
            }

            // Apply snapping
            const snapThreshold = 10;
            const activeGuides = {
                horizontal: [],
                vertical: []
            };

            if (snapToGuides) {
                // Check horizontal guides
                guides.horizontal.forEach(guideY => {
                    // Snap center
                    if (Math.abs(centerY - guideY) < snapThreshold) {
                        newY = guideY - height / 2;
                        activeGuides.horizontal.push(guideY);
                    }

                    // Snap top edge
                    if (Math.abs(newY - guideY) < snapThreshold) {
                        newY = guideY;
                        activeGuides.horizontal.push(guideY);
                    }

                    // Snap bottom edge
                    if (Math.abs(newY + height - guideY) < snapThreshold) {
                        newY = guideY - height;
                        activeGuides.horizontal.push(guideY);
                    }
                });

                // Check vertical guides
                guides.vertical.forEach(guideX => {
                    // Snap center
                    if (Math.abs(centerX - guideX) < snapThreshold) {
                        newX = guideX - width / 2;
                        activeGuides.vertical.push(guideX);
                    }

                    // Snap left edge
                    if (Math.abs(newX - guideX) < snapThreshold) {
                        newX = guideX;
                        activeGuides.vertical.push(guideX);
                    }

                    // Snap right edge
                    if (Math.abs(newX + width - guideX) < snapThreshold) {
                        newX = guideX - width;
                        activeGuides.vertical.push(guideX);
                    }
                });
            }

            // Apply grid snapping if enabled
            if (snapToGrid) {
                const gridSize = 20;
                newX = Math.round(newX / gridSize) * gridSize;
                newY = Math.round(newY / gridSize) * gridSize;
            }

            // Update shape position
            setShapes(shapes.map(shape =>
                shape.id === dragTarget.id
                    ? { ...shape, x: newX, y: newY }
                    : shape
            ));

            // Update active guidelines
            setActiveGuides(activeGuides);
        }
    };

    // Handle mouse up
    const handleMouseUp = () => {
        setIsDragging(false);
        setDragTarget(null);
        setActiveGuides({ horizontal: [], vertical: [] });
    };

    // Add a new shape
    const addShape = () => {
        const shape = {
            id: Date.now(),
            type: selectedShape,
            x: 100 + Math.random() * 300,
            y: 100 + Math.random() * 200,
            width: 80 + Math.random() * 40,
            height: 80 + Math.random() * 40,
            radius: 40 + Math.random() * 20,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`
        };

        setShapes([...shapes, shape]);
    };

    return (
        <div className="flex flex-col w-full max-w-4xl mx-auto bg-white rounded-lg shadow p-4 gap-4">
            <div className="text-center mb-2">
                <h2 className="text-xl font-bold">Guidelines & Snapping Demo</h2>
                <p className="text-sm text-gray-600">Drag shapes to see snapping in action</p>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap justify-center gap-2 mb-2">
                <button
                    className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm 
            ${showGrid ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
                    onClick={() => setShowGrid(!showGrid)}
                >
                    <Grid size={16} />
                    <span>Show Grid</span>
                </button>

                <button
                    className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm 
            ${snapToGuides ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
                    onClick={() => setSnapToGuides(!snapToGuides)}
                >
                    <Magnet size={16} />
                    <span>Snap to Guides</span>
                </button>

                <button
                    className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm 
            ${snapToGrid ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
                    onClick={() => setSnapToGrid(!snapToGrid)}
                >
                    <BoxSelect size={16} />
                    <span>Snap to Grid</span>
                </button>

                <button
                    className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm ml-2
            ${showKeyboardTips ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
                    onClick={() => setShowKeyboardTips(!showKeyboardTips)}
                >
                    <Keyboard size={16} />
                    <span>Keyboard Tips</span>
                </button>
            </div>

            {/* Shape selection */}
            <div className="flex justify-center gap-2 mb-2">
                <button
                    className={`w-10 h-10 flex items-center justify-center rounded 
            ${selectedShape === 'rect' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                    onClick={() => setSelectedShape('rect')}
                    title="Rectangle"
                >
                    <Square size={18} />
                </button>

                <button
                    className={`w-10 h-10 flex items-center justify-center rounded 
            ${selectedShape === 'circle' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                    onClick={() => setSelectedShape('circle')}
                    title="Circle"
                >
                    <Circle size={18} />
                </button>

                <button
                    className={`w-10 h-10 flex items-center justify-center rounded 
            ${selectedShape === 'triangle' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
                    onClick={() => setSelectedShape('triangle')}
                    title="Triangle"
                >
                    <Triangle size={18} />
                </button>

                <button
                    className="ml-2 px-3 py-1 bg-blue-500 text-white rounded flex items-center gap-1"
                    onClick={addShape}
                >
                    <span>Add Shape</span>
                    <ArrowDown size={16} />
                </button>
            </div>

            {/* Canvas */}
            <div className="relative border border-gray-300 rounded">
                <canvas
                    ref={canvasRef}
                    width={600}
                    height={400}
                    className="w-full h-96 bg-white"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                />

                {/* Position indicator */}
                <div className="absolute bottom-2 right-2 text-xs bg-white bg-opacity-80 px-2 py-1 rounded-sm shadow-sm">
                    x: {Math.round(mousePos.x)}, y: {Math.round(mousePos.y)}
                </div>
            </div>

            {/* Keyboard shortcuts tip */}
            {showKeyboardTips && (
                <div className="bg-blue-50 rounded p-3 text-sm border border-blue-200">
                    <div className="flex items-start mb-2">
                        <Info size={18} className="text-blue-500 mr-2 mt-0.5" />
                        <div>
                            <h3 className="font-semibold">Keyboard Shortcuts</h3>
                            <p className="text-gray-600 text-xs">In the full implementation, these shortcuts help with snapping</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 text-xs font-semibold bg-white border border-gray-300 rounded shadow-sm">Shift</kbd>
                            <span className="text-xs">Hold to temporarily disable snapping</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 text-xs font-semibold bg-white border border-gray-300 rounded shadow-sm">Alt</kbd>
                            <span className="text-xs">Hold to snap only to grid</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 text-xs font-semibold bg-white border border-gray-300 rounded shadow-sm">G</kbd>
                            <span className="text-xs">Toggle grid visibility</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 text-xs font-semibold bg-white border border-gray-300 rounded shadow-sm">Ctrl</kbd>
                            <span className="text-xs">+</span>
                            <kbd className="px-2 py-1 text-xs font-semibold bg-white border border-gray-300 rounded shadow-sm">;</kbd>
                            <span className="text-xs">Toggle guidelines</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                    <h3 className="font-semibold mb-1">What's happening?</h3>
                    <ul className="list-disc pl-5 text-gray-600">
                        <li>The shapes snap to each other's edges and centers</li>
                        <li>Guidelines appear when objects align</li>
                        <li>Grid snapping aligns objects to the grid lines</li>
                        <li>Try toggling the different snapping options</li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-semibold mb-1">Implementation Details</h3>
                    <ul className="list-disc pl-5 text-gray-600">
                        <li>This demo uses canvas for simplicity</li>
                        <li>The real implementation uses Fabric.js</li>
                        <li>Objects snap to canvas edges, centers, and other objects</li>
                        <li>The snapping threshold is customizable</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default GuidelinesDemoPage;