// src/components/FileManager/components/FileList.tsx
import React from 'react';
import { ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';
import { useFileManager } from '../hooks/useFileManager';
import FileItem from './FileItem';
import { getSortedAndFilteredFiles } from '../utils/sortUtils';

const FileList: React.FC = () => {
  const { state, setSortOption, toggleSelectAll } = useFileManager();
  const { files, sortOption, filterOption, selectedItems } = state;

  const sortedAndFilteredFiles = getSortedAndFilteredFiles(files, sortOption, filterOption);

  // Get sort icon for column
  const getSortIcon = (field: string) => {
    if (sortOption.field !== field) {
      return <ArrowUpDown size={14} className="ml-1 text-gray-400" />;
    }

    return sortOption.direction === 'asc' ? (
      <ChevronUp size={14} className="ml-1" />
    ) : (
      <ChevronDown size={14} className="ml-1" />
    );
  };

  // Handle sort column click
  const handleSortClick = (field: 'name' | 'size' | 'type' | 'createdAt' | 'modifiedAt') => {
    if (sortOption.field === field) {
      setSortOption({
        field,
        direction: sortOption.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      setSortOption({
        field,
        direction: 'asc',
      });
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
      {/* Table header */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-800 dark:bg-gray-900">
        <div className="grid grid-cols-12 items-center gap-2">
          <div className="col-span-1 flex items-center">
            <input
              type="checkbox"
              checked={
                selectedItems.length === sortedAndFilteredFiles.length &&
                sortedAndFilteredFiles.length > 0
              }
              onChange={toggleSelectAll}
              className="size-4 rounded border-gray-300 text-blue-500 dark:border-gray-700"
            />
          </div>

          <div
            className="col-span-5 flex cursor-pointer items-center"
            onClick={() => handleSortClick('name')}
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</span>
            {getSortIcon('name')}
          </div>

          <div
            className="col-span-2 flex cursor-pointer items-center"
            onClick={() => handleSortClick('size')}
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Size</span>
            {getSortIcon('size')}
          </div>

          <div
            className="col-span-2 flex cursor-pointer items-center"
            onClick={() => handleSortClick('modifiedAt')}
          >
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Modified</span>
            {getSortIcon('modifiedAt')}
          </div>

          <div className="col-span-1 flex items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">MD5</span>
          </div>

          <div className="col-span-1" />
        </div>
      </div>

      {/* File list */}
      <div>
        {sortedAndFilteredFiles.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
            No items found
          </div>
        ) : (
          sortedAndFilteredFiles.map((item) => (
            <FileItem key={item.id.toString()} item={item} viewMode="list" />
          ))
        )}
      </div>
    </div>
  );
};

export default FileList;
