// app/src/layouts/context/ViewportContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Viewport breakpoints - match with Tailwind's default breakpoints
export const breakpoints = {
    sm: 640,   // Small devices
    md: 768,   // Medium devices
    lg: 1024,  // Large devices
    xl: 1280,  // Extra large devices
    '2xl': 1536 // 2X Extra large devices
};

export type BreakpointKey = keyof typeof breakpoints;

interface ViewportContextProps {
    width: number;
    height: number;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    breakpoint: BreakpointKey | null;
    isBreakpoint: (bp: BreakpointKey) => boolean;
    isMinBreakpoint: (bp: BreakpointKey) => boolean;
    isMaxBreakpoint: (bp: BreakpointKey) => boolean;
}

const ViewportContext = createContext<ViewportContextProps | undefined>(undefined);

// Determine current breakpoint based on window width
const getCurrentBreakpoint = (width: number): BreakpointKey | null => {
    // Sort breakpoints from largest to smallest
    const sortedBreakpoints = Object.entries(breakpoints)
        .sort((a, b) => b[1] - a[1]);

    // Find the first breakpoint that the current width is greater than or equal to
    for (const [key, value] of sortedBreakpoints) {
        if (width >= value) {
            return key as BreakpointKey;
        }
    }

    return null; // Smaller than all defined breakpoints
};

interface ViewportProviderProps {
    children: ReactNode;
}

export const ViewportProvider: React.FC<ViewportProviderProps> = ({ children }) => {
    // Initialize with default dimensions and update on mount
    const [dimensions, setDimensions] = useState({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0
    });

    useEffect(() => {
        // Handle window resize events
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        // Set initial dimensions
        handleResize();

        // Add event listener
        window.addEventListener('resize', handleResize);

        // Clean up event listener
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const { width, height } = dimensions;
    const breakpoint = getCurrentBreakpoint(width);

    // Helper flags for common device categories
    const isMobile = width < breakpoints.md;
    const isTablet = width >= breakpoints.md && width < breakpoints.lg;
    const isDesktop = width >= breakpoints.lg;

    // Helper functions for breakpoint comparisons
    const isBreakpoint = (bp: BreakpointKey): boolean => {
        return breakpoint === bp;
    };

    const isMinBreakpoint = (bp: BreakpointKey): boolean => {
        return width >= breakpoints[bp];
    };

    const isMaxBreakpoint = (bp: BreakpointKey): boolean => {
        return width < breakpoints[bp];
    };

    return (
        <ViewportContext.Provider
            value={{
                width,
                height,
                isMobile,
                isTablet,
                isDesktop,
                breakpoint,
                isBreakpoint,
                isMinBreakpoint,
                isMaxBreakpoint,
            }}
        >
            {children}
        </ViewportContext.Provider>
    );
};

// Custom hook for using the ViewportContext
export const useViewport = (): ViewportContextProps => {
    const context = useContext(ViewportContext);
    if (context === undefined) {
        throw new Error('useViewport must be used within a ViewportProvider');
    }
    return context;
};