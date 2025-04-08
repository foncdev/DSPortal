// src/components/FileManager/hooks/useFileManager.tsx
import { useContext } from 'react';
import { FileManagerContext } from '../FileManagerProvider';

/**
 * Hook to access the file manager context
 */
export const useFileManager = () => {
  const context = useContext(FileManagerContext);

  if (!context) {
    throw new Error('useFileManager must be used within a FileManagerProvider');
  }

  return context;
};
