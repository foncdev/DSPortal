// src/components/DesignEditor/hooks/useClickOutside.ts
import { useEffect, RefObject } from 'react';

/**
 * Hook to detect clicks outside of a specified element
 * @param ref - Reference to the element to detect clicks outside of
 * @param callback - Function to call when a click outside is detected
 */
export const useClickOutside = (
    ref: RefObject<HTMLElement>,
    callback: () => void
) => {
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback();
            }
        };

        // Add event listener
        document.addEventListener('mousedown', handleClickOutside);

        // Clean up
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [ref, callback]);
};