// src/components/FileManager/components/FileGrid.tsx
import React from 'react';
import { useFileManager } from '../hooks/useFileManager';
import FileItem from './FileItem';
import { getSortedAndFilteredFiles } from '../utils/sortUtils';

const FileGrid: React.FC = () => {
  const { state, toggleSelectAll } = useFileManager();
  const { files, sortOption, filterOption, selectedItems } = state;

  const sortedAndFilteredFiles = getSortedAndFilteredFiles(files, sortOption, filterOption);

  return (
    <div>
      {/* Select all checkbox */}
      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          checked={
            selectedItems.length === sortedAndFilteredFiles.length &&
            sortedAndFilteredFiles.length > 0
          }
          onChange={toggleSelectAll}
          className="mr-2 size-4 rounded border-gray-300 text-blue-500 dark:border-gray-700"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {selectedItems.length > 0
            ? `Selected ${selectedItems.length} of ${sortedAndFilteredFiles.length} items`
            : 'Select all'}
        </span>
      </div>

      {sortedAndFilteredFiles.length === 0 ? (
        <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">No items found</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {sortedAndFilteredFiles.map((item) => (
            <FileItem key={item.id.toString()} item={item} viewMode="grid" />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileGrid;
