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
import styles from './ActionBar.module.scss';

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
      <div className={styles.container}>
        <div className={styles.buttonGroup}>
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
              className={styles.primaryButton}
          >
            <Upload size={16} />
            <span>Upload</span>
          </button>

          {/* Create folder button */}
          <button
              onClick={handleCreateFolder}
              className={styles.secondaryButton}
          >
            <FolderPlus size={16} />
            <span>New Folder</span>
          </button>
        </div>

        <div className={styles.buttonGroup}>
          {/* View toggle buttons */}
          <button
              onClick={() => setViewMode('list')}
              className={`${styles.iconButton} ${viewMode === 'list' ? styles.active : ''}`}
              title="List view"
          >
            <List size={16} />
          </button>
          <button
              onClick={() => setViewMode('grid')}
              className={`${styles.iconButton} ${viewMode === 'grid' ? styles.active : ''}`}
              title="Grid view"
          >
            <Grid size={16} />
          </button>

          {/* Sort button */}
          <div className={styles.optionsContainer}>
            <button
                onClick={toggleSortOptions}
                className={styles.iconButton}
                title="Sort options"
            >
              <SortAsc size={16} />
            </button>
            {showSortOptions && <SortOptions onClose={() => setShowSortOptions(false)} />}
          </div>

          {/* Filter button */}
          <div className={styles.optionsContainer}>
            <button
                onClick={toggleFilterOptions}
                className={styles.iconButton}
                title="Filter options"
            >
              <Filter size={16} />
            </button>
            {showFilterOptions && <FilterOptions onClose={() => setShowFilterOptions(false)} />}
          </div>

          {/* Refresh button */}
          <button
              onClick={() => reloadFiles()}
              className={styles.iconButton}
              title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Item actions (visible when items are selected) */}
        {selectedItems.length > 0 && (
            <div className={styles.actionRow}>
              <button
                  onClick={() => copy()}
                  className={styles.secondaryButton}
              >
                <Copy size={16} />
                <span>Copy</span>
              </button>
              <button
                  onClick={() => cut()}
                  className={styles.secondaryButton}
              >
                <Scissors size={16} />
                <span>Cut</span>
              </button>
              <button
                  onClick={handleDeleteSelected}
                  className={styles.dangerButton}
              >
                <Trash size={16} />
                <span>Delete</span>
              </button>
              {selectedItems.length === 1 && (
                  <button
                      onClick={handleDownloadSelected}
                      className={styles.secondaryButton}
                  >
                    <Download size={16} />
                    <span>Download</span>
                  </button>
              )}
            </div>
        )}

        {/* Paste button (visible when clipboard has items) */}
        {hasClipboardItems && (
            <div className={styles.actionRow}>
              <button
                  onClick={() => paste()}
                  className={styles.successButton}
              >
                <Clipboard size={16} />
                <span>Paste</span>
              </button>
            </div>
        )}
      </div>
  );
};

export default ActionBar;