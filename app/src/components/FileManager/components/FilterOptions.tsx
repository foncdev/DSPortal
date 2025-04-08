// src/components/FileManager/components/FilterOptions.tsx
import React, { useState, useEffect, useRef } from 'react';
import { X, Search } from 'lucide-react';
import { FileType } from '../types';
import { useFileManager } from '../hooks/useFileManager';
import styles from './FilterOptions.module.scss';

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
          className={styles.dropdownMenu}
      >
        <div className={styles.container}>
          <div className={styles.header}>
            <h3 className={styles.title}>Filter</h3>
            <button
                onClick={onClose}
                className={styles.closeButton}
            >
              <X size={16} />
            </button>
          </div>

          {/* Search filter */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Search
            </label>
            <div className={styles.searchInputContainer}>
              <div className={styles.searchIcon}>
                <Search size={16} />
              </div>
              <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                  placeholder="Search files..."
              />
            </div>
          </div>

          {/* File type filter */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              File Type
            </label>
            <div className={styles.checkboxGroup}>
              <div className={styles.checkboxItem}>
                <input
                    type="checkbox"
                    id="type-folder"
                    checked={fileTypes.includes('folder')}
                    onChange={() => handleTypeChange('folder')}
                    className={styles.checkbox}
                />
                <label
                    htmlFor="type-folder"
                    className={styles.checkboxLabel}
                >
                  Folders
                </label>
              </div>
              <div className={styles.checkboxItem}>
                <input
                    type="checkbox"
                    id="type-image"
                    checked={fileTypes.includes('image')}
                    onChange={() => handleTypeChange('image')}
                    className={styles.checkbox}
                />
                <label htmlFor="type-image" className={styles.checkboxLabel}>
                  Images
                </label>
              </div>
              <div className={styles.checkboxItem}>
                <input
                    type="checkbox"
                    id="type-video"
                    checked={fileTypes.includes('video')}
                    onChange={() => handleTypeChange('video')}
                    className={styles.checkbox}
                />
                <label htmlFor="type-video" className={styles.checkboxLabel}>
                  Videos
                </label>
              </div>
              <div className={styles.checkboxItem}>
                <input
                    type="checkbox"
                    id="type-pdf"
                    checked={fileTypes.includes('pdf')}
                    onChange={() => handleTypeChange('pdf')}
                    className={styles.checkbox}
                />
                <label htmlFor="type-pdf" className={styles.checkboxLabel}>
                  PDFs
                </label>
              </div>
              <div className={styles.checkboxItem}>
                <input
                    type="checkbox"
                    id="type-zip"
                    checked={fileTypes.includes('zip')}
                    onChange={() => handleTypeChange('zip')}
                    className={styles.checkbox}
                />
                <label htmlFor="type-zip" className={styles.checkboxLabel}>
                  Archives
                </label>
              </div>
              <div className={styles.checkboxItem}>
                <input
                    type="checkbox"
                    id="type-other"
                    checked={fileTypes.includes('other')}
                    onChange={() => handleTypeChange('other')}
                    className={styles.checkbox}
                />
                <label htmlFor="type-other" className={styles.checkboxLabel}>
                  Other
                </label>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className={styles.buttonContainer}>
            <button
                onClick={clearFilters}
                className={styles.clearButton}
            >
              Clear All
            </button>
            <button
                onClick={applyFilters}
                className={styles.applyButton}
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>
  );
};

export default FilterOptions;