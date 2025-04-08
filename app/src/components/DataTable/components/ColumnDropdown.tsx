import { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Eye, EyeOff } from 'lucide-react';
// @ts-ignore
import styles from '../DataTable.module.scss';
import { TableColumn } from '../types';

interface ColumnDropdownProps {
    isOpen: boolean;
    columns: TableColumn<any>[];
    toggleColumnVisibility: (columnKey: string) => void;
    themeClass: string;
}

const ColumnDropdown = forwardRef<HTMLDivElement, ColumnDropdownProps>(
    ({ isOpen, columns, toggleColumnVisibility, themeClass }, ref) => {
        const { t } = useTranslation();
        const [searchTerm, setSearchTerm] = useState('');

        // 검색어로 컬럼 필터링
        const filteredColumns = searchTerm.trim() === ''
            ? columns
            : columns.filter(col =>
                col.header.toLowerCase().includes(searchTerm.toLowerCase())
            );

        // 여기서 null을 반환하는 대신 CSS로 표시/숨김을 제어합니다

        return (
            <div
                ref={ref}
                className={`${styles.dropdown} ${styles[themeClass]} ${isOpen ? '' : styles.hidden}`}
                style={{ maxHeight: '400px', overflow: 'auto' }}
                role="menu"
                aria-labelledby="column-toggle-btn"
            >
                <h4 className={`${styles.dropdownTitle} ${styles[themeClass]}`}>
                    {t('dataTable.visibleColumns')}
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

                <div className={styles.columnList}>
                    {filteredColumns.length > 0 ? (
                        filteredColumns.map(col => (
                            <div key={`visibility-${col.key}`} className={styles.columnToggle}>
                                <button
                                    onClick={() => toggleColumnVisibility(col.key)}
                                    className={`${styles.toggleButton} ${styles[themeClass]} ${col.visible ? styles.visible : ''}`}
                                    aria-pressed={col.visible}
                                    title={col.visible ? t('dataTable.hideColumn') : t('dataTable.showColumn')}
                                >
                  <span className={styles.toggleIcon}>
                    {col.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </span>
                                    <span className={styles.toggleLabel}>{col.header}</span>
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className={styles.noResults}>
                            <p>{t('dataTable.noMatchingColumns')}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }
);

ColumnDropdown.displayName = 'ColumnDropdown';

export default ColumnDropdown;