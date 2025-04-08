// src/components/FileManager/hooks/useFolderOperations.tsx
import { useState } from 'react';
import { useFileManager } from './useFileManager';

/**
 * Hook for folder operations
 */
export const useFolderOperations = () => {
  const { reloadFiles, deselectAll, state } = useFileManager();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create a new folder
   * @param name - Name of the folder
   */
  const createFolder = async (name: string) => {
    console.log('createFolder');
    // setIsLoading(true);
    // setError(null);
    //
    // try {
    //   await fileManagerApi.createFolder(name, state.currentFolderId);
    //   await reloadFiles();
    // } catch (err) {
    //   setError(err instanceof Error ? err.message : 'Failed to create folder');
    //   throw err;
    // } finally {
    //   setIsLoading(false);
    // }
  };

  /**
   * Rename a folder
   * @param folderId - ID of the folder to rename
   * @param newName - New name for the folder
   */
  const renameFolder = async (folderId: string | number, newName: string) => {
    console.log('renameFolder');
    // setIsLoading(true);
    // setError(null);
    //
    // try {
    //   await fileManagerApi.renameFolder(folderId, newName);
    //   await reloadFiles();
    // } catch (err) {
    //   setError(err instanceof Error ? err.message : 'Failed to rename folder');
    //   throw err;
    // } finally {
    //   setIsLoading(false);
    // }
  };

  /**
   * Delete folders
   * @param folderIds - IDs of the folders to delete
   */
  const deleteFolders = async (folderIds: string[]) => {
    console.log('deleteFolders');
    // setIsLoading(true);
    // setError(null);
    //
    // try {
    //   await fileManagerApi.deleteFolders(folderIds);
    //   await reloadFiles();
    //   deselectAll();
    // } catch (err) {
    //   setError(err instanceof Error ? err.message : 'Failed to delete folders');
    //   throw err;
    // } finally {
    //   setIsLoading(false);
    // }
  };

  return {
    createFolder,
    renameFolder,
    deleteFolders,
    isLoading,
    error,
  };
};
