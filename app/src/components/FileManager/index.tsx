// src/components/FileManager/index.tsx
import React from 'react';
import { FileManagerProvider } from './FileManagerProvider';
import BreadcrumbPath from './components/BreadcrumbPath';
import ActionBar from './components/ActionBar';
import FileList from './components/FileList';
import FileGrid from './components/FileGrid';
import { useFileManager } from './hooks/useFileManager';

interface FileManagerContainerProps {
  initialFolderId?: string | null;
}

// Main file manager component with context access
const FileManagerContainer: React.FC = () => {
  const { state } = useFileManager();
  const { viewMode, isLoading, error } = state;

  return (
    <div className="flex h-full flex-col rounded-lg bg-white shadow dark:bg-gray-900">
      <div className="border-b border-gray-200 p-4 dark:border-gray-800">
        <BreadcrumbPath />
        <ActionBar />
      </div>

      <div className="grow overflow-auto p-4">
        {isLoading && (
          <div className="flex h-full items-center justify-center">
            <div className="size-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-100 p-4 text-red-800 dark:bg-red-900 dark:text-red-200">
            {error}
          </div>
        )}

        {!isLoading && !error && <>{viewMode === 'list' ? <FileList /> : <FileGrid />}</>}
      </div>
    </div>
  );
};

// Main file manager component with provider
export const FileManager: React.FC<FileManagerContainerProps> = ({ initialFolderId = null }) => {
  return (
    <FileManagerProvider initialFolderId={initialFolderId}>
      <FileManagerContainer />
    </FileManagerProvider>
  );
};

export default FileManager;
