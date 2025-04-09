// src/components/FileManager/utils/fileTypeUtils.ts
import { FileType } from '../types';

/**
 * Determine file type based on file extension
 * @param filename - Name of the file
 */
export const getFileType = (filename: string): FileType => {
  if (!filename.includes('.')) {
    return 'other';
  }

  const extension = filename.split('.').pop()?.toLowerCase() || '';

  // Image files
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension)) {
    return 'image';
  }

  // Video files
  if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv'].includes(extension)) {
    return 'video';
  }

  // Zip files
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
    return 'zip';
  }

  // PDF files
  if (extension === 'pdf') {
    return 'pdf';
  }

  return 'other';
};

/**
 * Get icon name based on file type
 * @param type - File type
 */
export const getFileIconByType = (type: FileType): string => {
  switch (type) {
    case 'folder':
      return 'folder';
    case 'image':
      return 'image';
    case 'video':
      return 'video';
    case 'zip':
      return 'archive';
    case 'pdf':
      return 'file-text';
    default:
      return 'file';
  }
};

/**
 * Check if a file is viewable (image, pdf, video)
 * @param type - File type
 */
export const isViewableFile = (type: FileType): boolean => ['image', 'pdf', 'video'].includes(type);
