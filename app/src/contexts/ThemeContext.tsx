import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextProps {
    theme: ThemeMode;
    setTheme: (theme: ThemeMode) => void;
    isDarkMode: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

// Storage key for persisting theme preference
const THEME_PREFERENCE_KEY = 'ds_theme_preference';

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    // Initialize theme from localStorage or default to system
    const [theme, setTheme] = useState<ThemeMode>(() => {
        const savedTheme = localStorage.getItem(THEME_PREFERENCE_KEY) as ThemeMode;
        return savedTheme || 'system';
    });

    // Track if the current effective theme is dark
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

    // Toggle between light and dark
    const toggleTheme = () => {
        setTheme(current => {
            if (current === 'system') {return 'light';}
            return current === 'light' ? 'dark' : 'light';
        });
    };

    // Effect to persist theme preference
    useEffect(() => {
        localStorage.setItem(THEME_PREFERENCE_KEY, theme);
    }, [theme]);

    // Effect to apply theme to document
    useEffect(() => {
        const applyTheme = (dark: boolean) => {
            if (dark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            setIsDarkMode(dark);
        };

        // Handle system theme preference
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

            // Initial check
            applyTheme(mediaQuery.matches);

            // Listen for changes
            const listener = (e: MediaQueryListEvent) => applyTheme(e.matches);
            mediaQuery.addEventListener('change', listener);
            return () => mediaQuery.removeEventListener('change', listener);
        } else {
            // Explicit theme preference
            applyTheme(theme === 'dark');
            return () => {}; // Empty cleanup function
        }
    }, [theme]);

    return (
        <ThemeContext.Provider
            value={{
                theme,
                setTheme,
                isDarkMode,
                toggleTheme
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

// Custom hook for using the ThemeContext
export const useTheme = (): ThemeContextProps => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};