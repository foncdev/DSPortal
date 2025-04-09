// src/components/DesignEditor/Canvas/CanvasObject.tsx
import React, { useState, useRef } from 'react';
import styles from './Canvas.module.scss';

interface CanvasObjectProps {
    object: any;
    isSelected: boolean;
    onClick: () => void;
}

const CanvasObject: React.FC<CanvasObjectProps> = ({
                                                       object,
                                                       isSelected,
                                                       onClick
                                                   }) => {
    const [position, setPosition] = useState({ x: object.x || 50, y: object.y || 50 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const objectRef = useRef<HTMLDivElement>(null);

    // Handle mouse events for dragging
    const handleMouseDown = (e: React.MouseEvent) => {
        if (objectRef.current) {
            // Calculate offset from the element's top-left corner
            const rect = objectRef.current.getBoundingClientRect();
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });

            setIsDragging(true);

            // Prevent event from bubbling to parent (canvas)
            e.stopPropagation();

            // Ensure object is selected
            onClick();
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && objectRef.current) {
            const parentRect = objectRef.current.parentElement?.getBoundingClientRect();

            if (parentRect) {
                // Calculate new position relative to parent container
                const newX = e.clientX - parentRect.left - dragOffset.x;
                const newY = e.clientY - parentRect.top - dragOffset.y;

                setPosition({ x: newX, y: newY });
            }
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Add global mouse move and up handlers when dragging
    React.useEffect(() => {
        if (isDragging) {
            const onMouseMove = (e: MouseEvent) => {
                if (objectRef.current) {
                    const parentRect = objectRef.current.parentElement?.getBoundingClientRect();

                    if (parentRect) {
                        const newX = e.clientX - parentRect.left - dragOffset.x;
                        const newY = e.clientY - parentRect.top - dragOffset.y;

                        setPosition({ x: newX, y: newY });
                    }
                }
            };

            const onMouseUp = () => {
                setIsDragging(false);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);

            return () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };
        }
    }, [isDragging, dragOffset]);

    // Render different objects based on type
    const renderObject = () => {
        const { type, properties } = object;

        switch (type) {
            case 'text':
                return (
                    <div
                        className={styles.textObject}
                        style={{
                            fontSize: `${properties.fontSize}px`,
                            color: properties.color
                        }}
                    >
                        {properties.text}
                    </div>
                );

            case 'image':
                return (
                    <img
                        src={properties.src}
                        alt={object.name}
                        className={styles.imageObject}
                        style={{
                            width: `${properties.width}px`,
                            height: `${properties.height}px`
                        }}
                    />
                );

            case 'rectangle':
                return (
                    <div
                        className={styles.rectangleObject}
                        style={{
                            width: `${properties.width}px`,
                            height: `${properties.height}px`,
                            backgroundColor: properties.color,
                            borderRadius: `${properties.radius}px`
                        }}
                    />
                );

            case 'circle':
                return (
                    <div
                        className={styles.circleObject}
                        style={{
                            width: `${properties.radius * 2}px`,
                            height: `${properties.radius * 2}px`,
                            backgroundColor: properties.color,
                            borderRadius: '50%'
                        }}
                    />
                );

            case 'triangle':
                return (
                    <div
                        className={styles.triangleObject}
                        style={{
                            width: 0,
                            height: 0,
                            borderLeft: `${properties.width / 2}px solid transparent`,
                            borderRight: `${properties.width / 2}px solid transparent`,
                            borderBottom: `${properties.height}px solid ${properties.color}`
                        }}
                    />
                );

            default:
                return <div>Unknown object type</div>;
        }
    };

    return (
        <div
            ref={objectRef}
            className={`${styles.canvasObject} ${isSelected ? styles.selected : ''}`}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onClick={onClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            {renderObject()}

            {isSelected && (
                <div className={styles.resizeHandles}>
                    <div className={`${styles.resizeHandle} ${styles.topLeft}`}></div>
                    <div className={`${styles.resizeHandle} ${styles.topRight}`}></div>
                    <div className={`${styles.resizeHandle} ${styles.bottomLeft}`}></div>
                    <div className={`${styles.resizeHandle} ${styles.bottomRight}`}></div>
                </div>
            )}
        </div>
    );
};

export default CanvasObject;