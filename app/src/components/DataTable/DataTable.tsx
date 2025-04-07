import React, { useEffect, useRef, useState } from 'react';
import { useTable } from './hooks';
import { TableProps } from './types';
import styles from './DataTable.module.scss';
import { ChevronUp, ChevronDown, ArrowUpDown, Columns, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import FilterDropdown from './components/FilterDropdown';
import ColumnDropdown from './components/ColumnDropdown';
import Pagination from './components/Pagination';
import { isDevelopment } from '../../utils/environment';

/**
 * DataTable - 기능적이고 유연한 데이터 테이블 컴포넌트
 *
 * 필터링, 정렬, 페이지네이션, 컬럼 숨기기/표시, 컬럼 크기 조절, 행 확장 뷰,
 * 다크 모드 지원 등 다양한 기능을 제공하는 재사용 가능한 테이블 컴포넌트입니다.
 */
export function DataTable<T>({
                                 data,
                                 columns: initialColumns,
                                 uniqueKey,
                                 pagination = true,
                                 itemsPerPage = 10,
                                 itemsPerPageOptions = [5, 10, 25, 50, 100],
                                 maxHeight,
                                 selectable = false,
                                 onSelectionChange,
                                 onRowClick,
                                 onRowDoubleClick,
                                 expandableRows = false,
                                 expandedRowRenderer,
                                 className = '',
                                 rowClassName = '',
                                 fixed = false,
                                 darkMode = false,
                                 initialHorizontalScroll = true,
                                 initialVerticalScroll = true,
                                 hideFilterBarOnMobile = true,
                                 mobileBreakpoint = 768,
                             }: TableProps<T>) {
    const { t } = useTranslation();

    // 테이블 로직 커스텀 훅 사용
    const {
        state,
        handlers,
        data: tableData,
        utils,
    } = useTable<T>({
        data,
        initialColumns,
        uniqueKey,
        itemsPerPage,
        expandableRows,
        initialHorizontalScroll,
        initialVerticalScroll,
        mobileBreakpoint,
        onSelectionChange,
    });

    // 드롭다운 상태 관리
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);

    // 필터 및 컬럼 설정은 항상 표시되도록 수정
    // 드롭다운 참조 생성
    const filterDropdownRef = useRef<HTMLDivElement>(null);
    const columnDropdownRef = useRef<HTMLDivElement>(null);
    const filterButtonRef = useRef<HTMLButtonElement>(null);
    const columnButtonRef = useRef<HTMLButtonElement>(null);

    // 외부 클릭 시 드롭다운 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // 필터 드롭다운 닫기
            if (
                isFilterDropdownOpen &&
                filterDropdownRef.current &&
                !filterDropdownRef.current.contains(event.target as Node) &&
                !filterButtonRef.current?.contains(event.target as Node)
            ) {
                setIsFilterDropdownOpen(false);
            }

            // 컬럼 설정 드롭다운 닫기
            if (
                isColumnDropdownOpen &&
                columnDropdownRef.current &&
                !columnDropdownRef.current.contains(event.target as Node) &&
                !columnButtonRef.current?.contains(event.target as Node)
            ) {
                setIsColumnDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isFilterDropdownOpen, isColumnDropdownOpen]);

    // ESC 키로 드롭다운 닫기
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (isFilterDropdownOpen) {
                    setIsFilterDropdownOpen(false);
                }
                if (isColumnDropdownOpen) {
                    setIsColumnDropdownOpen(false);
                }
            }
        };

        document.addEventListener('keydown', handleEscKey);
        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isFilterDropdownOpen, isColumnDropdownOpen]);

    // 행 클래스명 생성
    const getRowClassName = (item: T) => {
        if (typeof rowClassName === 'function') {
            return rowClassName(item);
        }
        return rowClassName;
    };

    // 필터 드롭다운 토글
    const toggleFilterDropdown = () => {
        console.log('Filter dropdown clicked, current state:', isFilterDropdownOpen);
        setIsFilterDropdownOpen(!isFilterDropdownOpen);

        // 다른 드롭다운 닫기
        if (isColumnDropdownOpen) {
            setIsColumnDropdownOpen(false);
        }
    };

    // 컬럼 설정 드롭다운 토글
    const toggleColumnDropdown = () => {
        console.log('Column dropdown clicked, current state:', isColumnDropdownOpen);
        setIsColumnDropdownOpen(!isColumnDropdownOpen);

        // 다른 드롭다운 닫기
        if (isFilterDropdownOpen) {
            setIsFilterDropdownOpen(false);
        }
    };

    // useEffect를 사용하여 드롭다운 위치 계산
    useEffect(() => {
        // 윈도우 리사이즈 시 드롭다운 위치 업데이트
        const handleResize = () => {
            // 드롭다운이 열려있는 경우에만 업데이트
            if (isFilterDropdownOpen || isColumnDropdownOpen) {
                // 강제로 리렌더링하여 위치 업데이트
                setIsFilterDropdownOpen(isFilterDropdownOpen);
                setIsColumnDropdownOpen(isColumnDropdownOpen);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [isFilterDropdownOpen, isColumnDropdownOpen]);

    // 스크롤 컨테이너 스타일 설정
    const scrollContainerStyle: React.CSSProperties = {
        maxHeight: state.verticalScroll ? maxHeight || 'auto' : 'none',
        overflowX: state.horizontalScroll ? 'auto' : 'hidden',
        overflowY: state.verticalScroll ? 'auto' : 'hidden',
    };

    // 테마 클래스 결합
    const themeClass = darkMode ? 'dark' : 'light';

    // 행 클릭 핸들러
    const handleRowClick = (item: T) => {
        if (onRowClick) {
            onRowClick(item);
        }
    };

    // 행 더블 클릭 핸들러 (확장 기능 포함)
    const handleRowDoubleClick = (item: T) => {
        // 확장 가능한 행인 경우 행 확장 토글
        if (expandableRows) {
            handlers.toggleRowExpansion(item);
        }

        // 더블클릭 이벤트 핸들러가 있으면 호출
        if (onRowDoubleClick) {
            onRowDoubleClick(item);
        }
    };

    // 정렬 아이콘 렌더링
    const renderSortIcon = (colKey: string) => (
            <span className={styles.sortIcon} aria-hidden="true">
        {state.sortKey === colKey ? (
            state.sortOrder === 'asc' ? (
                <ChevronUp size={14} />
            ) : (
                <ChevronDown size={14} />
            )
        ) : (
            <span className={styles.inactive}>
            <ChevronDown size={14} />
          </span>
        )}
      </span>
        );

    return (
        <div className="relative">
            {/* 테이블 툴바 (필터, 컬럼 설정은 항상 표시, 스크롤 토글은 개발 모드에서만) */}
            <div className={styles.tableToolbar}>
                <div className={styles.toolbarActions}>
                    {/* 필터 버튼 */}
                    <div className="relative">
                        <button
                            ref={filterButtonRef}
                            className={`${styles.actionButton} ${styles[themeClass]}`}
                            onClick={toggleFilterDropdown}
                            title={t('dataTable.filterSettings')}
                            aria-haspopup="true"
                            aria-expanded={isFilterDropdownOpen ? "true" : "false"}
                        >
                            <Filter size={18} className={styles.buttonIcon} />
                            <span className={styles.buttonText}>{t('dataTable.filter')}</span>
                        </button>

                        {/* 필터 드롭다운 */}
                        <FilterDropdown
                            ref={filterDropdownRef}
                            isOpen={isFilterDropdownOpen}
                            columns={state.columns}
                            filters={state.filters}
                            onFilterChange={handlers.handleFilterChange}
                            themeClass={themeClass}
                        />
                    </div>

                    {/* 컬럼 설정 버튼 */}
                    <div className="relative">
                        <button
                            ref={columnButtonRef}
                            className={`${styles.actionButton} ${styles[themeClass]}`}
                            onClick={toggleColumnDropdown}
                            title={t('dataTable.columnSettings')}
                            aria-haspopup="true"
                            aria-expanded={isColumnDropdownOpen ? "true" : "false"}
                        >
                            <Columns size={18} className={styles.buttonIcon} />
                            <span className={styles.buttonText}>{t('dataTable.columns')}</span>
                        </button>

                        {/* 컬럼 설정 드롭다운 */}
                        <ColumnDropdown
                            ref={columnDropdownRef}
                            isOpen={isColumnDropdownOpen}
                            columns={state.columns}
                            toggleColumnVisibility={handlers.toggleColumnVisibility}
                            themeClass={themeClass}
                        />
                    </div>

                    {/* 가로/세로 스크롤 토글 버튼 (개발 모드에서만 표시) */}
                    {isDevelopment() && (
                        <>
                            <button
                                className={`${styles.actionButton} ${styles[themeClass]}`}
                                onClick={handlers.toggleHorizontalScroll}
                                title={state.horizontalScroll ? t('dataTable.disableHorizontalScroll') : t('dataTable.enableHorizontalScroll')}
                                aria-pressed={state.horizontalScroll ? "true" : "false"}
                            >
                                <ArrowUpDown size={18} className={styles.buttonIcon} style={{ transform: 'rotate(90deg)' }} />
                                <span className={styles.buttonText}>
                  {state.horizontalScroll ? t('dataTable.horizontalScrollOn') : t('dataTable.horizontalScrollOff')}
                </span>
                            </button>

                            <button
                                className={`${styles.actionButton} ${styles[themeClass]}`}
                                onClick={handlers.toggleVerticalScroll}
                                title={state.verticalScroll ? t('dataTable.disableVerticalScroll') : t('dataTable.enableVerticalScroll')}
                                aria-pressed={state.verticalScroll ? "true" : "false"}
                            >
                                <ArrowUpDown size={18} className={styles.buttonIcon} />
                                <span className={styles.buttonText}>
                  {state.verticalScroll ? t('dataTable.verticalScrollOn') : t('dataTable.verticalScrollOff')}
                </span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* 테이블 컨테이너 */}
            <div
                className={`${styles.container} ${styles[themeClass]} ${className}`}
                style={scrollContainerStyle}
            >
                <table
                    className={`${styles.table} ${fixed ? styles.fixed : styles.auto}`}
                    role="grid"
                    aria-rowcount={tableData.filteredData.length + 1} // +1 for header row
                    aria-colcount={tableData.visibleColumns.length + (selectable ? 1 : 0)}
                >
                    {/* 테이블 헤더 */}
                    <thead className={`${styles.tableHeader} ${styles[themeClass]}`}>
                    <tr role="row">
                        {/* 체크박스 헤더 */}
                        {selectable && (
                            <th
                                className={`${styles.headerCell} ${styles[themeClass]}`}
                                style={{ width: '40px' }}
                                role="columnheader"
                                aria-label={t('dataTable.select')}
                            >
                                <input
                                    type="checkbox"
                                    className={`${styles.checkbox} ${styles[themeClass]}`}
                                    checked={
                                        state.selectedItems.length === tableData.filteredData.length &&
                                        tableData.filteredData.length > 0
                                    }
                                    onChange={(e) => handlers.handleSelectAll(e.target.checked)}
                                    aria-label={t('dataTable.selectAll')}
                                />
                            </th>
                        )}

                        {/* 컬럼 헤더 */}
                        {tableData.visibleColumns.map((col, colIndex) => (
                            <th
                                key={col.key}
                                className={`${styles.headerCell} ${styles[themeClass]} ${col.sortable ? styles.sortable : ''}`}
                                style={{ width: state.columnWidths[col.key] || col.width || 'auto' }}
                                role="columnheader"
                                aria-sort={state.sortKey === col.key ?
                                    (state.sortOrder === 'asc' ? 'ascending' : 'descending') :
                                    'none'}
                                aria-colindex={colIndex + (selectable ? 2 : 1)}
                            >
                                <div className={styles.headerContent}>
                                    {/* 헤더 타이틀과 정렬 아이콘 */}
                                    <div
                                        className={styles.headerTop}
                                        onClick={() => col.sortable && handlers.handleSort(col.key)}
                                        onKeyDown={(e) => {
                                            if (col.sortable && (e.key === 'Enter' || e.key === ' ')) {
                                                e.preventDefault();
                                                handlers.handleSort(col.key);
                                            }
                                        }}
                                        tabIndex={col.sortable ? 0 : -1}
                                        role={col.sortable ? "button" : undefined}
                                        aria-label={col.sortable ? `${t('dataTable.sortBy')} ${col.header}` : undefined}
                                    >
                                        <span className={styles.headerTitle}>{col.header}</span>
                                        {col.sortable && renderSortIcon(col.key)}
                                    </div>

                                    {/* 필터 입력 필드 */}
                                    {col.filterable && !(hideFilterBarOnMobile && state.isMobile) && (
                                        <div>
                                            <input
                                                type="text"
                                                value={state.filters[col.key] || ''}
                                                onChange={(e) => handlers.handleFilterChange(col.key, e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                className={`${styles.filterInput} ${styles[themeClass]}`}
                                                placeholder={t('dataTable.filterDots')}
                                                aria-label={`${t('dataTable.filterBy')} ${col.header}`}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* 컬럼 리사이즈 핸들러 */}
                                {col.resizable && (
                                    <div
                                        className={`${styles.resizeHandle} ${state.resizingColumnKey === col.key ? styles.resizing : ''} ${styles[themeClass]}`}
                                        onMouseDown={(e) => handlers.handleMouseDown(e, col.key)}
                                        onClick={(e) => e.stopPropagation()}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                handlers.handleMouseDown(e as any, col.key);
                                            }
                                        }}
                                        role="separator"
                                        aria-orientation="vertical"
                                        aria-label={t('dataTable.resizeColumn')}
                                    />
                                )}
                            </th>
                        ))}
                    </tr>
                    </thead>

                    {/* 테이블 본문 */}
                    <tbody className={`${styles.tableBody} ${styles[themeClass]}`}>
                    {tableData.paginatedData.length > 0 ? (
                        tableData.paginatedData.map((item, rowIndex) => (
                            <React.Fragment key={String(item[uniqueKey as keyof T])}>
                                {/* 데이터 행 */}
                                <tr
                                    className={`${styles.tableRow} ${styles[themeClass]} ${utils.isSelected(item) ? styles.selected : ''} ${getRowClassName(item)}`}
                                    onClick={() => handleRowClick(item)}
                                    onDoubleClick={() => handleRowDoubleClick(item)}
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleRowClick(item);
                                        } else if (e.key === ' ') {
                                            e.preventDefault();
                                            if (expandableRows) {
                                                handlers.toggleRowExpansion(item);
                                            }
                                        }
                                    }}
                                    role="row"
                                    aria-rowindex={rowIndex + 2} // +2 for header row and 1-based indexing
                                    aria-selected={utils.isSelected(item)}
                                    data-expanded={utils.isRowExpanded(item)}
                                >
                                    {/* 체크박스 셀 */}
                                    {selectable && (
                                        <td
                                            className={styles.tableCell}
                                            role="gridcell"
                                            aria-colindex={1}
                                        >
                                            <input
                                                type="checkbox"
                                                className={`${styles.checkbox} ${styles[themeClass]}`}
                                                checked={utils.isSelected(item)}
                                                onChange={(e) => handlers.handleRowSelect(item, e.target.checked)}
                                                onClick={(e) => e.stopPropagation()}
                                                aria-label={`${t('dataTable.selectRow')} ${rowIndex + 1}`}
                                            />
                                        </td>
                                    )}

                                    {/* 데이터 셀 */}
                                    {tableData.visibleColumns.map((col, colIndex) => (
                                        <td
                                            key={`${String(item[uniqueKey as keyof T])}-${col.key}`}
                                            className={styles.tableCell}
                                            role="gridcell"
                                            aria-colindex={colIndex + (selectable ? 2 : 1)}
                                        >
                                            {col.customRenderer
                                                ? col.customRenderer(item, col.key)
                                                : (item[col.key as keyof T] as React.ReactNode)}
                                        </td>
                                    ))}
                                </tr>

                                {/* 확장 행 */}
                                {expandableRows && utils.isRowExpanded(item) && (
                                    <tr
                                        className={`${styles.expandedRow} ${styles[themeClass]}`}
                                        role="row"
                                        aria-expanded="true"
                                    >
                                        <td
                                            colSpan={tableData.visibleColumns.length + (selectable ? 1 : 0)}
                                            className={styles.tableCell}
                                            role="gridcell"
                                        >
                                            <div className={`${styles.expandedContent} ${styles[themeClass]}`}>
                                                {expandedRowRenderer ? (
                                                    expandedRowRenderer(item)
                                                ) : (
                                                    <div className="text-center">
                                                        <p>{t('dataTable.noExpandedRowRenderer')}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))
                    ) : (
                        <tr role="row">
                            <td
                                colSpan={tableData.visibleColumns.length + (selectable ? 1 : 0)}
                                className={`${styles.noDataMessage} ${styles[themeClass]}`}
                                role="gridcell"
                            >
                                {t('dataTable.noData')}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* 페이지네이션 */}
            {pagination && tableData.totalPages > 0 && (
                <Pagination
                    currentPage={state.currentPage}
                    totalPages={tableData.totalPages}
                    itemsPerPage={state.itemsPerPageState}
                    itemsPerPageOptions={itemsPerPageOptions}
                    totalItems={tableData.sortedData.length}
                    onPageChange={handlers.handlePageChange}
                    onItemsPerPageChange={handlers.setItemsPerPageState}
                    themeClass={themeClass}
                />
            )}
        </div>
    );
}