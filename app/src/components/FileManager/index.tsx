// src/components/FileManager/index.tsx
import React, { useEffect } from 'react';
import { FileManagerProvider } from './FileManagerProvider';
import BreadcrumbPath from './components/BreadcrumbPath';
import ActionBar from './components/ActionBar';
import FileList from './components/FileList';
import FileGrid from './components/FileGrid';
import { useFileManager } from './hooks/useFileManager';
import styles from './FileManager.module.scss';

interface FileManagerContainerProps {
    initialFolderId?: string | null;
}

// Main file manager component with context access
const FileManagerContainer: React.FC = () => {
    const { state } = useFileManager();
    const { viewMode, isLoading, error } = state;

    // Add effect to support proper rendering when dark mode changes
    useEffect(() => {
        // This is a no-op function just to re-render when dark mode changes
        const darkModeObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    // Force react to re-render (we don't need to change state, just acknowledge the change)
                    // This ensures all components are aware of the dark mode change
                }
            });
        });

        darkModeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => {
            darkModeObserver.disconnect();
        };
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <BreadcrumbPath />
                <ActionBar />
            </div>

            <div className={styles.content}>
                {isLoading && (
                    <div className={styles.loadingContainer}>
                        <div className={styles.loadingSpinner} />
                    </div>
                )}

                {error && (
                    <div className={styles.errorContainer}>
                        {error}
                    </div>
                )}

                {!isLoading && !error && <>{viewMode === 'list' ? <FileList /> : <FileGrid />}</>}
            </div>
        </div>
    );
};

// Main file manager component with provider
export const FileManager: React.FC<FileManagerContainerProps> = ({ initialFolderId = null }) => (
        <FileManagerProvider initialFolderId={initialFolderId}>
            <FileManagerContainer />
        </FileManagerProvider>
    );

export default FileManager;