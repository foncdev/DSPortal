// src/components/FileManager/components/FilterOptions.tsx
import React, { useState, useEffect, useRef } from 'react';
import { X, Search } from 'lucide-react';
import { FileType } from '../types';
import { useFileManager } from '../hooks/useFileManager';

interface FilterOptionsProps {
  onClose: () => void;
}

const FilterOptions: React.FC<FilterOptionsProps> = ({ onClose }) => {
  const { state, setFilterOption } = useFileManager();
  const { filterOption } = state;

  // Initialize with current filter state
  const [fileTypes, setFileTypes] = useState<FileType[]>(filterOption.type || []);
  const [searchTerm, setSearchTerm] = useState<string>(filterOption.search || '');

  const ref = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Handle checkbox change
  const handleTypeChange = (type: FileType) => {
    if (fileTypes.includes(type)) {
      setFileTypes(fileTypes.filter((t) => t !== type));
    } else {
      setFileTypes([...fileTypes, type]);
    }
  };

  // Apply filters
  const applyFilters = () => {
    setFilterOption({
      ...filterOption,
      type: fileTypes.length > 0 ? fileTypes : undefined,
      search: searchTerm.trim() || undefined,
    });
    onClose();
  };

  // Clear all filters
  const clearFilters = () => {
    setFileTypes([]);
    setSearchTerm('');
    setFilterOption({});
    onClose();
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 z-10 mt-2 w-72 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Filter</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search filter */}
        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
            Search
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              placeholder="Search files..."
            />
          </div>
        </div>

        {/* File type filter */}
        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
            File Type
          </label>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="type-folder"
                checked={fileTypes.includes('folder')}
                onChange={() => handleTypeChange('folder')}
                className="size-4 rounded border-gray-300 text-blue-500 dark:border-gray-700"
              />
              <label
                htmlFor="type-folder"
                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
              >
                Folders
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="type-image"
                checked={fileTypes.includes('image')}
                onChange={() => handleTypeChange('image')}
                className="size-4 rounded border-gray-300 text-blue-500 dark:border-gray-700"
              />
              <label htmlFor="type-image" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Images
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="type-video"
                checked={fileTypes.includes('video')}
                onChange={() => handleTypeChange('video')}
                className="size-4 rounded border-gray-300 text-blue-500 dark:border-gray-700"
              />
              <label htmlFor="type-video" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Videos
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="type-pdf"
                checked={fileTypes.includes('pdf')}
                onChange={() => handleTypeChange('pdf')}
                className="size-4 rounded border-gray-300 text-blue-500 dark:border-gray-700"
              />
              <label htmlFor="type-pdf" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                PDFs
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="type-zip"
                checked={fileTypes.includes('zip')}
                onChange={() => handleTypeChange('zip')}
                className="size-4 rounded border-gray-300 text-blue-500 dark:border-gray-700"
              />
              <label htmlFor="type-zip" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Archives
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="type-other"
                checked={fileTypes.includes('other')}
                onChange={() => handleTypeChange('other')}
                className="size-4 rounded border-gray-300 text-blue-500 dark:border-gray-700"
              />
              <label htmlFor="type-other" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Other
              </label>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between">
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
          >
            Clear All
          </button>
          <button
            onClick={applyFilters}
            className="rounded-md bg-blue-500 px-3 py-2 text-sm text-white hover:bg-blue-600"
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterOptions;
