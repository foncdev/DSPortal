// src/components/FileManager/components/SortOptions.tsx
import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import { SortOption } from '../types';
import { useFileManager } from '../hooks/useFileManager';

interface SortOptionsProps {
  onClose: () => void;
}

const SortOptions: React.FC<SortOptionsProps> = ({ onClose }) => {
  const { state, setSortOption } = useFileManager();
  const { sortOption } = state;

  // Initialize with current sort state
  const [sortField, setSortField] = useState<SortOption['field']>(sortOption.field);
  const [sortDirection, setSortDirection] = useState<SortOption['direction']>(sortOption.direction);

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

  // Apply sort options
  const applySortOptions = () => {
    setSortOption({
      field: sortField,
      direction: sortDirection,
    });
    onClose();
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 z-10 mt-2 w-60 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
    >
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Sort By</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X size={16} />
          </button>
        </div>

        {/* Sort options */}
        <div className="mb-4 space-y-2">
          <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
            Field
          </label>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="radio"
                id="sort-name"
                name="sort-field"
                checked={sortField === 'name'}
                onChange={() => setSortField('name')}
                className="size-4 border-gray-300 text-blue-500 dark:border-gray-700"
              />
              <label htmlFor="sort-name" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Name
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="sort-size"
                name="sort-field"
                checked={sortField === 'size'}
                onChange={() => setSortField('size')}
                className="size-4 border-gray-300 text-blue-500 dark:border-gray-700"
              />
              <label htmlFor="sort-size" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Size
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="sort-type"
                name="sort-field"
                checked={sortField === 'type'}
                onChange={() => setSortField('type')}
                className="size-4 border-gray-300 text-blue-500 dark:border-gray-700"
              />
              <label htmlFor="sort-type" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Type
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="sort-created"
                name="sort-field"
                checked={sortField === 'createdAt'}
                onChange={() => setSortField('createdAt')}
                className="size-4 border-gray-300 text-blue-500 dark:border-gray-700"
              />
              <label
                htmlFor="sort-created"
                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
              >
                Date Created
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="sort-modified"
                name="sort-field"
                checked={sortField === 'modifiedAt'}
                onChange={() => setSortField('modifiedAt')}
                className="size-4 border-gray-300 text-blue-500 dark:border-gray-700"
              />
              <label
                htmlFor="sort-modified"
                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
              >
                Date Modified
              </label>
            </div>
          </div>
        </div>

        {/* Sort direction */}
        <div className="mb-4">
          <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
            Direction
          </label>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="radio"
                id="sort-asc"
                name="sort-direction"
                checked={sortDirection === 'asc'}
                onChange={() => setSortDirection('asc')}
                className="size-4 border-gray-300 text-blue-500 dark:border-gray-700"
              />
              <label
                htmlFor="sort-asc"
                className="ml-2 flex items-center text-sm text-gray-700 dark:text-gray-300"
              >
                <ChevronUp size={14} className="mr-1" />
                Ascending
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="sort-desc"
                name="sort-direction"
                checked={sortDirection === 'desc'}
                onChange={() => setSortDirection('desc')}
                className="size-4 border-gray-300 text-blue-500 dark:border-gray-700"
              />
              <label
                htmlFor="sort-desc"
                className="ml-2 flex items-center text-sm text-gray-700 dark:text-gray-300"
              >
                <ChevronDown size={14} className="mr-1" />
                Descending
              </label>
            </div>
          </div>
        </div>

        {/* Apply button */}
        <div className="flex justify-end">
          <button
            onClick={applySortOptions}
            className="rounded-md bg-blue-500 px-3 py-2 text-sm text-white hover:bg-blue-600"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default SortOptions;
