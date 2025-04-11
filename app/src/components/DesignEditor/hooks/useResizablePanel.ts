// src/components/DesignEditor/hooks/useResizablePanel.ts
import { useState, useRef, useEffect } from 'react';

/**
 * Hook for managing a resizable panel
 * @param initialWidth - The initial width of the panel
 * @param minWidth - The minimum width of the panel
 * @param maxWidth - The maximum width of the panel
 * @returns Panel state and refs
 */
export const useResizablePanel = (
    initialWidth: number = 280,
    minWidth: number = 200,
    maxWidth: number = 400
) => {
    const [width, setWidth] = useState(initialWidth);
    const [isResizing, setIsResizing] = useState(false);

    const ref = useRef<HTMLDivElement>(null);
    const resizeHandleRef = useRef<HTMLDivElement>(null);

    // Start resizing the panel
    const startResizing = () => setIsResizing(true);

    // Handle panel resize
    useEffect(() => {
        // Handle mouse movement when resizing
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;

            // Left panel vs right panel logic would differ based on which side
            // For simplicity, assuming left panel resizing here
            const newWidth = e.clientX;
            setWidth(Math.max(minWidth, Math.min(newWidth, maxWidth)));
        };

        // Stop resizing on mouse up
        const handleMouseUp = () => {
            setIsResizing(false);
        };

        // Add event listeners when resizing
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        // Clean up event listeners
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, minWidth, maxWidth]);

    return {
        width,
        setWidth,
        isResizing,
        startResizing,
        ref,
        resizeHandleRef
    };
};