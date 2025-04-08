// src/components/FileManager/components/SortOptions.tsx
import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import { SortOption } from '../types';
import { useFileManager } from '../hooks/useFileManager';
import styles from './SortOptions.module.scss';

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
          className={styles.dropdownMenu}
      >
        <div className={styles.container}>
          <div className={styles.header}>
            <h3 className={styles.title}>Sort By</h3>
            <button
                onClick={onClose}
                className={styles.closeButton}
            >
              <X size={16} />
            </button>
          </div>

          {/* Sort options */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Field
            </label>
            <div className={styles.radioGroup}>
              <div className={styles.radioItem}>
                <input
                    type="radio"
                    id="sort-name"
                    name="sort-field"
                    checked={sortField === 'name'}
                    onChange={() => setSortField('name')}
                    className={styles.radio}
                />
                <label htmlFor="sort-name" className={styles.radioLabel}>
                  Name
                </label>
              </div>
              <div className={styles.radioItem}>
                <input
                    type="radio"
                    id="sort-size"
                    name="sort-field"
                    checked={sortField === 'size'}
                    onChange={() => setSortField('size')}
                    className={styles.radio}
                />
                <label htmlFor="sort-size" className={styles.radioLabel}>
                  Size
                </label>
              </div>
              <div className={styles.radioItem}>
                <input
                    type="radio"
                    id="sort-type"
                    name="sort-field"
                    checked={sortField === 'type'}
                    onChange={() => setSortField('type')}
                    className={styles.radio}
                />
                <label htmlFor="sort-type" className={styles.radioLabel}>
                  Type
                </label>
              </div>
              <div className={styles.radioItem}>
                <input
                    type="radio"
                    id="sort-created"
                    name="sort-field"
                    checked={sortField === 'createdAt'}
                    onChange={() => setSortField('createdAt')}
                    className={styles.radio}
                />
                <label
                    htmlFor="sort-created"
                    className={styles.radioLabel}
                >
                  Date Created
                </label>
              </div>
              <div className={styles.radioItem}>
                <input
                    type="radio"
                    id="sort-modified"
                    name="sort-field"
                    checked={sortField === 'modifiedAt'}
                    onChange={() => setSortField('modifiedAt')}
                    className={styles.radio}
                />
                <label
                    htmlFor="sort-modified"
                    className={styles.radioLabel}
                >
                  Date Modified
                </label>
              </div>
            </div>
          </div>

          {/* Sort direction */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Direction
            </label>
            <div className={styles.radioGroup}>
              <div className={styles.radioItem}>
                <input
                    type="radio"
                    id="sort-asc"
                    name="sort-direction"
                    checked={sortDirection === 'asc'}
                    onChange={() => setSortDirection('asc')}
                    className={styles.radio}
                />
                <label
                    htmlFor="sort-asc"
                    className={styles.radioLabel}
                >
                  <ChevronUp size={14} className={styles.directionIcon} />
                  Ascending
                </label>
              </div>
              <div className={styles.radioItem}>
                <input
                    type="radio"
                    id="sort-desc"
                    name="sort-direction"
                    checked={sortDirection === 'desc'}
                    onChange={() => setSortDirection('desc')}
                    className={styles.radio}
                />
                <label
                    htmlFor="sort-desc"
                    className={styles.radioLabel}
                >
                  <ChevronDown size={14} className={styles.directionIcon} />
                  Descending
                </label>
              </div>
            </div>
          </div>

          {/* Apply button */}
          <div className={styles.buttonContainer}>
            <button
                onClick={applySortOptions}
                className={styles.applyButton}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
  );
};

export default SortOptions;