// src/components/FileManager/utils/sortUtils.ts
import { FileItem, SortOption } from '../types';
import { getFileType } from './fileTypeUtils';

/**
 * Sort files based on the selected sort option
 * @param files - Array of files to sort
 * @param sortOption - Sort option to apply
 */
export const sortFiles = (files: FileItem[], sortOption: SortOption): FileItem[] => {
  // Create a copy of the array to avoid mutating the original
  const sortedFiles = [...files];

  // Always sort with folders first
  sortedFiles.sort((a, b) => {
    // If one is a folder and the other is not, place the folder first
    const aIsFolder = a.isFolder || a.type === 'folder';
    const bIsFolder = b.isFolder || b.type === 'folder';

    if (aIsFolder && !bIsFolder) {return -1;}
    if (!aIsFolder && bIsFolder) {return 1;}

    // Both are folders or both are files, sort based on the selected option
    const { field, direction } = sortOption;
    const multiplier = direction === 'asc' ? 1 : -1;

    switch (field) {
      case 'name':
        return multiplier * a.name.localeCompare(b.name);

      case 'size':
        return multiplier * (a.size - b.size);

      case 'type':
        if (aIsFolder && bIsFolder) {
          return multiplier * a.name.localeCompare(b.name);
        }
        if (!aIsFolder && !bIsFolder) {
          const aType = a.type || getFileType(a.name);
          const bType = b.type || getFileType(b.name);
          const result = aType.localeCompare(bType);
          return result !== 0 ? multiplier * result : multiplier * a.name.localeCompare(b.name);
        }
        return aIsFolder ? -1 : 1;

      case 'createdAt': {
        const aCreatedAt = a.createdAt || a.createAt || '';
        const bCreatedAt = b.createdAt || b.createAt || '';
        return multiplier * (new Date(aCreatedAt).getTime() - new Date(bCreatedAt).getTime());
      }

      case 'modifiedAt': {
        const aModifiedAt = a.modifiedAt || a.modifiedDate || a.createdAt || a.createAt || '';
        const bModifiedAt = b.modifiedAt || b.modifiedDate || b.createdAt || b.createAt || '';
        return multiplier * (new Date(aModifiedAt).getTime() - new Date(bModifiedAt).getTime());
      }

      default:
        return 0;
    }
  });

  return sortedFiles;
};

/**
 * Get sorted items with applied filters
 * @param files - Array of files
 * @param sortOption - Sort option
 * @param filterOption - Filter option
 */
export const getSortedAndFilteredFiles = (
  files: FileItem[],
  sortOption: SortOption,
  filterOption: { type?: string[]; search?: string },
): FileItem[] => {
  let filteredFiles = [...files];

  // Apply type filter
  if (filterOption.type && filterOption.type.length > 0) {
    filteredFiles = filteredFiles.filter((file) => {
      if (file.isFolder || file.type === 'folder') {
        return filterOption.type?.includes('folder') ?? true;
      }
      const fileType = file.type || getFileType(file.name);
      return filterOption.type?.includes(fileType) ?? true;
    });
  }

  // Apply search filter
  if (filterOption.search && filterOption.search.trim() !== '') {
    const searchTerm = filterOption.search.trim().toLowerCase();
    filteredFiles = filteredFiles.filter((file) => file.name.toLowerCase().includes(searchTerm));
  }

  // Apply sorting
  return sortFiles(filteredFiles, sortOption);
};
