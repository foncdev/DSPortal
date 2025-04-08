// src/components/FileManager/components/BreadcrumbPath.tsx
import React, { useMemo } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useFileManager } from '../hooks/useFileManager';

const BreadcrumbPath: React.FC = () => {
  const { state, setCurrentFolder } = useFileManager();
  const { currentPath } = state;

  // Parse the current path into segments
  const pathSegments = useMemo(() => {
    // Remove leading and trailing slashes and split by /
    const cleanPath = currentPath.replace(/^\/|\/$/g, '');
    if (!cleanPath) {
      return [];
    }

    const segments = cleanPath.split('/');

    // Build cumulative paths
    return segments.map((segment, index) => {
      const path = '/' + segments.slice(0, index + 1).join('/');
      return { name: segment, path };
    });
  }, [currentPath]);

  // Go to root folder
  const goToRoot = () => {
    setCurrentFolder(null, '/');
  };

  // Go to specific path
  const goToPath = (path: string) => {
    // We'd need to get the folder ID from the path in a real application
    // This is simplified for demonstration
    // In a real app, you might have a service that resolves paths to folder IDs
    console.log('Navigate to path:', path);
  };

  return (
    <div className="mb-4 flex flex-wrap items-center">
      <button
        onClick={goToRoot}
        className="flex items-center text-gray-700 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400"
      >
        <Home size={16} className="mr-1" />
        <span>Home</span>
      </button>

      {pathSegments.map((segment, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={16} className="mx-2 text-gray-400" />
          <button
            onClick={() => goToPath(segment.path)}
            className="text-gray-700 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400"
          >
            {segment.name}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

export default BreadcrumbPath;
