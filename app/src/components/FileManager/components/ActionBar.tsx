// src/components/FileManager/components/ActionBar.tsx
import React, { useState, useRef } from 'react';
import {
  Upload,
  FolderPlus,
  Grid,
  List,
  Scissors,
  Copy,
  Clipboard,
  Trash,
  Download,
  RefreshCw,
  Filter,
  SortAsc,
} from 'lucide-react';
import { useFileManager } from '../hooks/useFileManager';
import { useFileOperations } from '../hooks/useFileOperations';
import { useFolderOperations } from '../hooks/useFolderOperations';
import { useClipboard } from '../hooks/useClipboard';
import FilterOptions from './FilterOptions';
import SortOptions from './SortOptions';

const ActionBar: React.FC = () => {
  const { state, setViewMode, reloadFiles } = useFileManager();
  const { viewMode, selectedItems, currentFolderId } = state;
  const { uploadFiles, deleteFiles, downloadFile } = useFileOperations();
  const { createFolder } = useFolderOperations();
  const { copy, cut, paste, hasClipboardItems } = useClipboard();

  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      uploadFiles(Array.from(files), '' + currentFolderId);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle create folder
  const handleCreateFolder = () => {
    const folderName = prompt('Enter folder name:');
    if (folderName && folderName.trim() !== '') {
      createFolder(folderName.trim());
    }
  };

  // Handle delete selected items
  const handleDeleteSelected = () => {
    if (selectedItems.length > 0) {
      const confirmMessage = `Are you sure you want to delete ${selectedItems.length} item(s)?`;
      if (window.confirm(confirmMessage)) {
        deleteFiles(selectedItems);
      }
    }
  };

  // Handle download selected item
  const handleDownloadSelected = () => {
    if (selectedItems.length === 1) {
      downloadFile(selectedItems[0]);
    }
  };

  // Toggle filter options
  const toggleFilterOptions = () => {
    setShowFilterOptions(!showFilterOptions);
    if (showFilterOptions) {
      setShowSortOptions(false);
    }
  };

  // Toggle sort options
  const toggleSortOptions = () => {
    setShowSortOptions(!showSortOptions);
    if (showSortOptions) {
      setShowFilterOptions(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center space-x-2">
        {/* Upload button */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          multiple
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center rounded-md bg-blue-500 px-3 py-2 text-white hover:bg-blue-600"
        >
          <Upload size={16} className="mr-2" />
          <span>Upload</span>
        </button>

        {/* Create folder button */}
        <button
          onClick={handleCreateFolder}
          className="flex items-center rounded-md bg-gray-100 px-3 py-2 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <FolderPlus size={16} className="mr-2" />
          <span>New Folder</span>
        </button>
      </div>

      <div className="flex items-center space-x-2">
        {/* View toggle buttons */}
        <button
          onClick={() => setViewMode('list')}
          className={`rounded-md p-2 ${
            viewMode === 'list'
              ? 'bg-gray-200 dark:bg-gray-700'
              : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
          }`}
          title="List view"
        >
          <List size={16} />
        </button>
        <button
          onClick={() => setViewMode('grid')}
          className={`rounded-md p-2 ${
            viewMode === 'grid'
              ? 'bg-gray-200 dark:bg-gray-700'
              : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
          }`}
          title="Grid view"
        >
          <Grid size={16} />
        </button>

        {/* Sort button */}
        <div className="relative">
          <button
            onClick={toggleSortOptions}
            className="rounded-md bg-gray-100 p-2 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
            title="Sort options"
          >
            <SortAsc size={16} />
          </button>
          {showSortOptions && <SortOptions onClose={() => setShowSortOptions(false)} />}
        </div>

        {/* Filter button */}
        <div className="relative">
          <button
            onClick={toggleFilterOptions}
            className="rounded-md bg-gray-100 p-2 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
            title="Filter options"
          >
            <Filter size={16} />
          </button>
          {showFilterOptions && <FilterOptions onClose={() => setShowFilterOptions(false)} />}
        </div>

        {/* Refresh button */}
        <button
          onClick={() => reloadFiles()}
          className="rounded-md bg-gray-100 p-2 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Item actions (visible when items are selected) */}
      {selectedItems.length > 0 && (
        <div className="mt-2 flex w-full items-center space-x-2">
          <button
            onClick={() => copy()}
            className="flex items-center rounded-md bg-gray-100 px-3 py-2 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Copy size={16} className="mr-2" />
            <span>Copy</span>
          </button>
          <button
            onClick={() => cut()}
            className="flex items-center rounded-md bg-gray-100 px-3 py-2 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Scissors size={16} className="mr-2" />
            <span>Cut</span>
          </button>
          <button
            onClick={handleDeleteSelected}
            className="flex items-center rounded-md bg-red-100 px-3 py-2 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
          >
            <Trash size={16} className="mr-2" />
            <span>Delete</span>
          </button>
          {selectedItems.length === 1 && (
            <button
              onClick={handleDownloadSelected}
              className="flex items-center rounded-md bg-gray-100 px-3 py-2 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Download size={16} className="mr-2" />
              <span>Download</span>
            </button>
          )}
        </div>
      )}

      {/* Paste button (visible when clipboard has items) */}
      {hasClipboardItems && (
        <div className="mt-2 flex w-full items-center">
          <button
            onClick={() => paste()}
            className="flex items-center rounded-md bg-green-100 px-3 py-2 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800"
          >
            <Clipboard size={16} className="mr-2" />
            <span>Paste</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ActionBar;
