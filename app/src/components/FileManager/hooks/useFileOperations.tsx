// src/components/FileManager/hooks/useFileOperations.tsx
import { useState } from 'react';
import * as fileManagerApi from '../../../api/fileManager';
import { useFileManager } from './useFileManager';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Hook for file operations
 */
export const useFileOperations = () => {
  const { reloadFiles, deselectAll } = useFileManager();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Upload files
   * @param files - Files to upload
   * @param folderId - ID of the folder to upload to
   */
  const uploadFiles = async (files: File[], folderId: string | null) => {
    setIsLoading(true);
    setError(null);

    try {
      await fileManagerApi.uploadFiles(files, folderId);
      await reloadFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload files');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Rename a file
   * @param fileId - ID of the file to rename
   * @param newName - New name for the file
   */
  const renameFile = async (fileId: string | number, newName: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await fileManagerApi.renameFile(fileId, newName);
      await reloadFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename file');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Delete files
   * @param fileIds - IDs of the files to delete
   */
  const deleteFiles = async (fileIds: any) => {
    setIsLoading(true);
    setError(null);

    try {
      await fileManagerApi.deleteFiles(fileIds);
      await reloadFiles();
      deselectAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete files');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Download a file
   * @param fileId - ID of the file to download
   */
  const downloadFile = (fileId: string | number) => {
    try {
      fileManagerApi.downloadFile(fileId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download file');
      throw err;
    }
  };

  return {
    uploadFiles,
    renameFile,
    deleteFiles,
    downloadFile,
    isLoading,
    error,
  };
};
