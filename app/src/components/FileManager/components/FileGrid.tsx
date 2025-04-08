// src/components/FileManager/components/FileGrid.tsx
import React from 'react';
import { useFileManager } from '../hooks/useFileManager';
import FileItem from './FileItem';
import { getSortedAndFilteredFiles } from '../utils/sortUtils';
import styles from './FileGrid.module.scss';

const FileGrid: React.FC = () => {
  const { state, toggleSelectAll } = useFileManager();
  const { files, sortOption, filterOption, selectedItems } = state;

  const sortedAndFilteredFiles = getSortedAndFilteredFiles(files, sortOption, filterOption);

  return (
      <div className={styles.container}>
        {/* Select all checkbox */}
        <div className={styles.selectAllContainer}>
          <input
              type="checkbox"
              checked={
                  selectedItems.length === sortedAndFilteredFiles.length &&
                  sortedAndFilteredFiles.length > 0
              }
              onChange={toggleSelectAll}
              className={styles.checkbox}
          />
          <span className={styles.selectionText}>
          {selectedItems.length > 0
              ? `Selected ${selectedItems.length} of ${sortedAndFilteredFiles.length} items`
              : 'Select all'}
        </span>
        </div>

        {sortedAndFilteredFiles.length === 0 ? (
            <div className={styles.emptyState}>No items found</div>
        ) : (
            <div className={styles.gridContainer}>
              {sortedAndFilteredFiles.map((item) => (
                  <FileItem key={item.id.toString()} item={item} viewMode="grid" />
              ))}
            </div>
        )}
      </div>
  );
};

export default FileGrid;