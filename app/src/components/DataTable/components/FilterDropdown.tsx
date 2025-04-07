import { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import styles from '../DataTable.module.scss';
import { TableColumn } from '../types';

interface FilterDropdownProps {
    isOpen: boolean;
    columns: TableColumn<any>[];
    filters: Record<string, string>;
    onFilterChange: (key: string, value: string) => void;
    themeClass: string;
}

const FilterDropdown = forwardRef<HTMLDivElement, FilterDropdownProps>(
    ({ isOpen, columns, filters, onFilterChange, themeClass }, ref) => {
        const { t } = useTranslation();
        const [searchTerm, setSearchTerm] = useState('');

        // 필터링 가능한 컬럼 필터링
        const filterableColumns = columns.filter(col => col.filterable);

        // 검색어로 컬럼 필터링
        const filteredColumns = searchTerm.trim() === ''
            ? filterableColumns
            : filterableColumns.filter(col =>
                col.header.toLowerCase().includes(searchTerm.toLowerCase())
            );

        // 여기서 null을 반환하는 대신 CSS로 표시/숨김을 제어합니다

        return (
            <div
                ref={ref}
                className={`${styles.dropdown} ${styles[themeClass]} ${isOpen ? '' : styles.hidden}`}
                style={{ maxHeight: '400px', overflow: 'auto' }}
                role="menu"
                aria-labelledby="filter-toggle-btn"
            >
                <h4 className={`${styles.dropdownTitle} ${styles[themeClass]}`}>
                    {t('dataTable.filterOptions')}
                </h4>

                {/* 컬럼 검색 입력 필드 */}
                <div className={`${styles.searchContainer} ${styles[themeClass]}`}>
                    <div className={styles.searchIconWrapper}>
                        <Search size={14} className={styles.searchIcon} />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`${styles.searchInput} ${styles[themeClass]}`}
                        placeholder={t('dataTable.searchColumns')}
                        aria-label={t('dataTable.searchColumns')}
                    />
                </div>

                {filteredColumns.length > 0 ? (
                    filteredColumns.map(col => (
                        <div key={`filter-${col.key}`} className={styles.dropdownItem}>
                            <label
                                htmlFor={`filter-${col.key}`}
                                className={`${styles.itemLabel} ${styles[themeClass]}`}
                            >
                                {col.header}
                            </label>
                            <input
                                id={`filter-${col.key}`}
                                type="text"
                                value={filters[col.key] || ''}
                                onChange={(e) => onFilterChange(col.key, e.target.value)}
                                className={`${styles.filterInput} ${styles[themeClass]}`}
                                placeholder={`${t('dataTable.searchBy')} ${col.header}...`}
                            />
                        </div>
                    ))
                ) : (
                    <div className={styles.dropdownItem}>
                        <p className={`${styles.noResults} ${styles[themeClass]}`}>
                            {filterableColumns.length === 0
                                ? t('dataTable.noFilterableColumns')
                                : t('dataTable.noMatchingColumns')}
                        </p>
                    </div>
                )}
            </div>
        );
    }
);

FilterDropdown.displayName = 'FilterDropdown';

export default FilterDropdown;