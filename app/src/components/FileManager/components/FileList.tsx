// src/components/FileManager/components/FileList.tsx
import React from 'react';
import { ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';
import { useFileManager } from '../hooks/useFileManager';
import FileItem from './FileItem';
import { getSortedAndFilteredFiles } from '../utils/sortUtils';
import styles from './FileList.module.scss';

const FileList: React.FC = () => {
  const { state, setSortOption, toggleSelectAll } = useFileManager();
  const { files, sortOption, filterOption, selectedItems } = state;

  const sortedAndFilteredFiles = getSortedAndFilteredFiles(files, sortOption, filterOption);

  // Get sort icon for column
  const getSortIcon = (field: string) => {
    if (sortOption.field !== field) {
      return <ArrowUpDown size={14} className={`${styles.sortIcon} ${styles.unsorted}`} />;
    }

    return sortOption.direction === 'asc' ? (
        <ChevronUp size={14} className={styles.sortIcon} />
    ) : (
        <ChevronDown size={14} className={styles.sortIcon} />
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
      <div className={styles.container}>
        {/* Table header */}
        <div className={styles.header}>
          <div className={styles.headerGrid}>
            <div className={styles.headerCheckbox}>
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
                className={`${styles.headerColumn} ${styles.name}`}
                onClick={() => handleSortClick('name')}
            >
              <span className={styles.columnLabel}>Name</span>
              {getSortIcon('name')}
            </div>

            <div
                className={`${styles.headerColumn} ${styles.size}`}
                onClick={() => handleSortClick('size')}
            >
              <span className={styles.columnLabel}>Size</span>
              {getSortIcon('size')}
            </div>

            <div
                className={`${styles.headerColumn} ${styles.modified}`}
                onClick={() => handleSortClick('modifiedAt')}
            >
              <span className={styles.columnLabel}>Modified</span>
              {getSortIcon('modifiedAt')}
            </div>

            <div className={`${styles.headerColumn} ${styles.md5}`}>
              <span className={styles.columnLabel}>MD5</span>
            </div>

            <div className={`${styles.headerColumn} ${styles.actions}`} />
          </div>
        </div>

        {/* File list */}
        <div>
          {sortedAndFilteredFiles.length === 0 ? (
              <div className={styles.emptyState}>
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