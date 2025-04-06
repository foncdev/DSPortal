import React, {useEffect, useRef, useState} from 'react';
import { useTable } from './hooks';
import { TableProps } from './types';
import styles from './DataTable.module.scss';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, Columns, Filter } from 'lucide-react';

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
                                 customStyles = {},
                             }: TableProps<T>) {
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
        setIsFilterDropdownOpen(!isFilterDropdownOpen);
        // 다른 드롭다운 닫기
        if (isColumnDropdownOpen) {
            setIsColumnDropdownOpen(false);
        }
    };

    // 컬럼 설정 드롭다운 토글
    const toggleColumnDropdown = () => {
        setIsColumnDropdownOpen(!isColumnDropdownOpen);
        // 다른 드롭다운 닫기
        if (isFilterDropdownOpen) {
            setIsFilterDropdownOpen(false);
        }
    };

    // 스크롤 컨테이너 스타일 설정
    const scrollContainerStyle = {
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

    return (
        <div className="relative">
            <div className={styles.tableToolbar}>
                <div className={styles.toolbarActions}>
                    {/* 필터 버튼 */}
                    <div className="relative">
                        <button
                            ref={filterButtonRef}
                            className={`${styles.actionButton} ${styles[themeClass]}`}
                            onClick={toggleFilterDropdown}
                            title="필터 설정"
                            aria-haspopup="true"
                            aria-expanded={isFilterDropdownOpen ? "true" : "false"}
                        >
                            <Filter size={18} className={styles.buttonIcon} />
                            <span className={styles.buttonText}>필터</span>
                        </button>

                        {/* 필터 드롭다운 */}
                        <div
                            ref={filterDropdownRef}
                            className={`${styles.dropdown} ${styles[themeClass]} ${isFilterDropdownOpen ? '' : 'hidden'}`}
                            style={{ maxHeight: '400px', overflow: 'auto' }}
                            role="menu"
                            aria-labelledby="filter-toggle-btn"
                        >
                            <h4 className={`${styles.dropdownTitle} ${styles[themeClass]}`}>필터 옵션</h4>
                            {state.columns
                                .filter(col => col.filterable)
                                .map(col => (
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
                                            value={state.filters[col.key] || ''}
                                            onChange={(e) => handlers.handleFilterChange(col.key, e.target.value)}
                                            className={`${styles.filterInput} ${styles[themeClass]}`}
                                            placeholder={`${col.header} 검색...`}
                                        />
                                    </div>
                                ))}
                            {state.columns.filter(col => col.filterable).length === 0 && (
                                <div className={styles.dropdownItem}>
                                    <p className={`${styles.itemLabel} ${styles[themeClass]}`}>필터링 가능한 컬럼이 없습니다.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 컬럼 설정 버튼 */}
                    <div className="relative">
                        <button
                            ref={columnButtonRef}
                            className={`${styles.actionButton} ${styles[themeClass]}`}
                            onClick={toggleColumnDropdown}
                            title="컬럼 설정"
                            aria-haspopup="true"
                            aria-expanded={isColumnDropdownOpen ? "true" : "false"}
                        >
                            <Columns size={18} className={styles.buttonIcon} />
                            <span className={styles.buttonText}>컬럼 설정</span>
                        </button>

                        {/* 컬럼 설정 드롭다운 */}
                        <div
                            ref={columnDropdownRef}
                            className={`${styles.dropdown} ${styles[themeClass]} ${isColumnDropdownOpen ? '' : 'hidden'}`}
                            style={{ maxHeight: '400px', overflow: 'auto' }}
                            role="menu"
                            aria-labelledby="column-toggle-btn"
                        >
                            <h4 className={`${styles.dropdownTitle} ${styles[themeClass]}`}>표시할 컬럼</h4>
                            <div className="max-h-60 overflow-y-auto">
                                {state.columns.map(col => (
                                    <div key={`visibility-${col.key}`} className={styles.columnToggle}>
                                        <input
                                            type="checkbox"
                                            id={`visibility-${col.key}`}
                                            checked={col.visible}
                                            onChange={() => handlers.toggleColumnVisibility(col.key)}
                                            className={`${styles.toggleCheckbox} ${styles[themeClass]}`}
                                        />
                                        <label
                                            htmlFor={`visibility-${col.key}`}
                                            className={`${styles.toggleLabel} ${styles[themeClass]}`}
                                        >
                                            {col.header}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 가로 스크롤 토글 버튼 */}
                    <button
                        className={`${styles.actionButton} ${styles[themeClass]}`}
                        onClick={handlers.toggleHorizontalScroll}
                        title={state.horizontalScroll ? '가로 스크롤 비활성화' : '가로 스크롤 활성화'}
                        aria-pressed={state.horizontalScroll ? "true" : "false"}
                    >
                        <ArrowUpDown size={18} className={styles.buttonIcon} style={{ transform: 'rotate(90deg)' }} />
                        <span className={styles.buttonText}>
              {state.horizontalScroll ? '가로 스크롤 ON' : '가로 스크롤 OFF'}
            </span>
                    </button>

                    {/* 세로 스크롤 토글 버튼 */}
                    <button
                        className={`${styles.actionButton} ${styles[themeClass]}`}
                        onClick={handlers.toggleVerticalScroll}
                        title={state.verticalScroll ? '세로 스크롤 비활성화' : '세로 스크롤 활성화'}
                        aria-pressed={state.verticalScroll ? "true" : "false"}
                    >
                        <ArrowUpDown size={18} className={styles.buttonIcon} />
                        <span className={styles.buttonText}>
              {state.verticalScroll ? '세로 스크롤 ON' : '세로 스크롤 OFF'}
            </span>
                    </button>
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
                                aria-label="선택"
                            >
                                <input
                                    type="checkbox"
                                    className={`${styles.checkbox} ${styles[themeClass]}`}
                                    checked={
                                        state.selectedItems.length === tableData.filteredData.length &&
                                        tableData.filteredData.length > 0
                                    }
                                    onChange={(e) => handlers.handleSelectAll(e.target.checked)}
                                    aria-label="모두 선택"
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
                                        aria-label={col.sortable ? `${col.header} 정렬` : undefined}
                                    >
                                        <span className={styles.headerTitle}>{col.header}</span>
                                        {col.sortable && (
                                            <span className={styles.sortIcon} aria-hidden="true">
                          {state.sortKey === col.key ? (
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
                                        )}
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
                                                placeholder="필터..."
                                                aria-label={`${col.header} 필터`}
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
                                        role="separator"
                                        aria-orientation="vertical"
                                        aria-label="컬럼 크기 조절"
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
                                                aria-label={`행 ${rowIndex + 1} 선택`}
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
                                                        <p>확장 뷰 렌더러가 제공되지 않았습니다.</p>
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
                                데이터가 없습니다
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* 페이지네이션 */}
            {pagination && tableData.totalPages > 0 && (
                <div
                    className={`${styles.pagination} ${styles[themeClass]}`}
                    role="navigation"
                    aria-label="페이지네이션"
                >
                    <div className={styles.paginationInfo}>
                        <div className={`${styles.infoText} ${styles[themeClass]}`}>
              <span className={`${styles.infoHighlight} ${styles[themeClass]}`}>
                {Math.min((state.currentPage - 1) * state.itemsPerPageState + 1, tableData.sortedData.length)}
              </span>
                            -
                            <span className={`${styles.infoHighlight} ${styles[themeClass]}`}>
                {Math.min(state.currentPage * state.itemsPerPageState, tableData.sortedData.length)}
              </span>{' '}
                            of{' '}
                            <span className={`${styles.infoHighlight} ${styles[themeClass]}`}>
                {tableData.sortedData.length}
              </span>{' '}
                            항목
                        </div>

                        <div className={styles.itemsPerPageSelect}>
                            <label
                                htmlFor="table-items-per-page"
                                className={`${styles.selectLabel} ${styles[themeClass]}`}
                            >
                                페이지당 행:
                            </label>
                            <select
                                id="table-items-per-page"
                                value={state.itemsPerPageState}
                                onChange={(e) => {
                                    handlers.setItemsPerPageState(Number(e.target.value));
                                }}
                                className={`${styles.select} ${styles[themeClass]}`}
                                aria-label="페이지당 항목 수"
                            >
                                {itemsPerPageOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={styles.paginationButtons}>
                        <button
                            onClick={() => handlers.handlePageChange(1)}
                            disabled={state.currentPage === 1}
                            className={`${styles.pageButton} ${styles[themeClass]} ${state.currentPage === 1 ? styles.disabled : ''}`}
                            aria-label="첫 페이지"
                            aria-disabled={state.currentPage === 1}
                        >
                            <ChevronsLeft size={16} />
                        </button>

                        <button
                            onClick={() => handlers.handlePageChange(state.currentPage - 1)}
                            disabled={state.currentPage === 1}
                            className={`${styles.pageButton} ${styles[themeClass]} ${state.currentPage === 1 ? styles.disabled : ''}`}
                            aria-label="이전 페이지"
                            aria-disabled={state.currentPage === 1}
                        >
                            <ChevronLeft size={16} />
                        </button>

                        {Array.from({ length: Math.min(5, tableData.totalPages) }, (_, i) => {
                            let pageNum;
                            if (tableData.totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (state.currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (state.currentPage >= tableData.totalPages - 2) {
                                pageNum = tableData.totalPages - 4 + i;
                            } else {
                                pageNum = state.currentPage - 2 + i;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => handlers.handlePageChange(pageNum)}
                                    className={`${styles.pageButton} ${styles[themeClass]} ${state.currentPage === pageNum ? styles.active : ''}`}
                                    aria-label={`${pageNum} 페이지`}
                                    aria-current={state.currentPage === pageNum ? "page" : undefined}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => handlers.handlePageChange(state.currentPage + 1)}
                            disabled={state.currentPage === tableData.totalPages}
                            className={`${styles.pageButton} ${styles[themeClass]} ${state.currentPage === tableData.totalPages ? styles.disabled : ''}`}
                            aria-label="다음 페이지"
                            aria-disabled={state.currentPage === tableData.totalPages}
                        >
                            <ChevronRight size={16} />
                        </button>

                        <button
                            onClick={() => handlers.handlePageChange(tableData.totalPages)}
                            disabled={state.currentPage === tableData.totalPages}
                            className={`${styles.pageButton} ${styles[themeClass]} ${state.currentPage === tableData.totalPages ? styles.disabled : ''}`}
                            aria-label="마지막 페이지"
                            aria-disabled={state.currentPage === tableData.totalPages}
                        >
                            <ChevronsRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}