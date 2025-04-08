// src/components/FileManager/components/BreadcrumbPath.tsx
import React, { useMemo } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useFileManager } from '../hooks/useFileManager';
import styles from './BreadcrumbPath.module.scss';

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
    console.log('Navigate to path:', path);
  };

  return (
      <div className={styles.container}>
        <div className={styles.path}>
          <button
              onClick={goToRoot}
              className={styles.breadcrumbItem}
          >
            <Home size={16} className={styles.homeIcon} />
            <span>Home</span>
          </button>

          {pathSegments.map((segment, index) => (
              <React.Fragment key={index}>
                <ChevronRight size={14} className={styles.divider} />
                <button
                    onClick={() => goToPath(segment.path)}
                    className={styles.breadcrumbItem}
                >
                  {segment.name}
                </button>
              </React.Fragment>
          ))}
        </div>
      </div>
  );
};

export default BreadcrumbPath;