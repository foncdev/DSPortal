
// app/src/layouts/context/LayoutContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type SidebarPosition = 'left' | 'right';

interface LayoutContextProps {
    sidebarCollapsed: boolean;
    toggleSidebar: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    sidebarPosition: SidebarPosition;
    setSidebarPosition: (position: SidebarPosition) => void;
    mobileSidebarOpen: boolean;
    setMobileSidebarOpen: (open: boolean) => void;
}

const LayoutContext = createContext<LayoutContextProps | undefined>(undefined);

// Storage keys for persisting preferences
const SIDEBAR_COLLAPSED_KEY = 'ds_sidebar_collapsed';
const SIDEBAR_POSITION_KEY = 'ds_sidebar_position';

interface LayoutProviderProps {
    children: ReactNode;
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
    // Initialize state from localStorage if available
    const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
        const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
        return saved ? JSON.parse(saved) : false;
    });

    const [sidebarPosition, setSidebarPosition] = useState<SidebarPosition>(() => {
        const saved = localStorage.getItem(SIDEBAR_POSITION_KEY);
        return (saved as SidebarPosition) || 'left';
    });

    // Mobile sidebar state (doesn't persist)
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

    // Toggle sidebar expanded/collapsed state
    const toggleSidebar = () => {
        setSidebarCollapsed(prev => !prev);
    };

    // Persist sidebar collapsed state
    useEffect(() => {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, JSON.stringify(sidebarCollapsed));
    }, [sidebarCollapsed]);

    // Persist sidebar position preference
    useEffect(() => {
        localStorage.setItem(SIDEBAR_POSITION_KEY, sidebarPosition);
    }, [sidebarPosition]);

    // Close mobile sidebar when window resizes to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024 && mobileSidebarOpen) {
                setMobileSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [mobileSidebarOpen]);

    return (
        <LayoutContext.Provider
            value={{
                sidebarCollapsed,
                toggleSidebar,
                setSidebarCollapsed,
                sidebarPosition,
                setSidebarPosition,
                mobileSidebarOpen,
                setMobileSidebarOpen
            }}
        >
            {children}
        </LayoutContext.Provider>
    );
};

// Custom hook for using the LayoutContext
export const useLayout = (): LayoutContextProps => {
    const context = useContext(LayoutContext);
    if (context === undefined) {
        throw new Error('useLayout must be used within a LayoutProvider');
    }
    return context;
};