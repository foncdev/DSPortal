import React from 'react';
import { useTable } from './hooks';
import * as styles from './styles';
import { TableProps } from './types';
import {
  FilterDropdown,
  ColumnsDropdown,
  HeaderCell,
  NoDataMessage,
  Pagination,
  ActionButton,
  ExpandedRow,
} from './components';

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

  // 행 클래스명 생성
  const getRowClassName = (item: T) => {
    if (typeof rowClassName === 'function') {
      return rowClassName(item);
    }
    return rowClassName;
  };

  // 필터 드롭다운 토글
  const toggleFilterDropdown = () => {
    const dropdown = document.getElementById('filters-dropdown');
    if (dropdown) {
      dropdown.classList.toggle('hidden');
      // 다른 드롭다운 닫기
      const columnsDropdown = document.getElementById('columns-dropdown');
      if (columnsDropdown) columnsDropdown.classList.add('hidden');
    }
  };

  // 컬럼 설정 드롭다운 토글
  const toggleColumnDropdown = () => {
    const dropdown = document.getElementById('columns-dropdown');
    if (dropdown) {
      dropdown.classList.toggle('hidden');
      // 다른 드롭다운 닫기
      const filtersDropdown = document.getElementById('filters-dropdown');
      if (filtersDropdown) filtersDropdown.classList.add('hidden');
    }
  };
  return (
    <div className="relative">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* 필터 버튼 */}
          <div className="relative">
            <ActionButton
              icon={
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                </svg>
              }
              label="필터"
              darkMode={darkMode}
              onClick={toggleFilterDropdown}
            />
            <FilterDropdown
              id="filters-dropdown"
              columns={state.columns}
              filters={state.filters}
              darkMode={darkMode}
              onChange={handlers.handleFilterChange}
            />
          </div>

          {/* 컬럼 설정 버튼 */}
          <div className="relative">
            <ActionButton
              icon={
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 9h18M3 15h18" />
                  <path d="M3 9h18M3 15h18M8 4.5v15M15 4.5v15" />
                </svg>
              }
              label="컬럼 설정"
              darkMode={darkMode}
              onClick={toggleColumnDropdown}
            />
            <ColumnsDropdown
              id="columns-dropdown"
              columns={state.columns}
              darkMode={darkMode}
              onToggle={handlers.toggleColumnVisibility}
            />
          </div>

          {/* 가로 스크롤 토글 버튼 */}
          <ActionButton
            icon={
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M8 12h8M8 12l3-3M8 12l3 3M3 5v14M21 5v14" />
              </svg>
            }
            label={state.horizontalScroll ? '가로 스크롤 ON' : '가로 스크롤 OFF'}
            darkMode={darkMode}
            onClick={handlers.toggleHorizontalScroll}
            title={state.horizontalScroll ? '가로 스크롤 비활성화' : '가로 스크롤 활성화'}
          />

          {/* 세로 스크롤 토글 버튼 */}
          <ActionButton
            icon={
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 8v8M12 8l-3 3M12 8l3 3M5 3h14M5 21h14" />
              </svg>
            }
            label={state.verticalScroll ? '세로 스크롤 ON' : '세로 스크롤 OFF'}
            darkMode={darkMode}
            onClick={handlers.toggleVerticalScroll}
            title={state.verticalScroll ? '세로 스크롤 비활성화' : '세로 스크롤 활성화'}
          />
        </div>
      </div>

      {/* 테이블 컨테이너 */}
      <div
        className={styles.createContainerStyles(darkMode, className, customStyles.table)}
        style={styles.createScrollStyles(state.horizontalScroll, state.verticalScroll, maxHeight)}
      >
        <table className={styles.createTableStyles(fixed)}>
          {/* 테이블 헤더 */}
          <thead className={styles.createHeaderStyles(darkMode, customStyles.header)}>
            <tr>
              {/* 체크박스 헤더 */}
              {selectable && (
                <th className={`w-10 px-4 py-3 ${customStyles.headerCell || ''}`}>
                  <input
                    type="checkbox"
                    className={styles.createCheckboxStyles(darkMode)}
                    checked={
                      state.selectedItems.length === tableData.filteredData.length &&
                      tableData.filteredData.length > 0
                    }
                    onChange={(e) => handlers.handleSelectAll(e.target.checked)}
                  />
                </th>
              )}

              {/* 컬럼 헤더 */}
              {tableData.visibleColumns.map((col) => (
                <HeaderCell
                  key={col.key}
                  column={col}
                  sortKey={state.sortKey}
                  sortOrder={state.sortOrder}
                  darkMode={darkMode}
                  filters={state.filters}
                  customHeaderCellStyle={customStyles.headerCell}
                  columnWidth={state.columnWidths[col.key]}
                  onSort={handlers.handleSort}
                  onFilter={handlers.handleFilterChange}
                  onResizeStart={handlers.handleMouseDown}
                  hideFilterBarOnMobile={hideFilterBarOnMobile && state.isMobile}
                />
              ))}
            </tr>
          </thead>

          {/* 테이블 본문 */}
          <tbody className={styles.createBodyStyles(darkMode)}>
            {tableData.paginatedData.length > 0 ? (
              tableData.paginatedData.map((item) => (
                <React.Fragment key={String(item[uniqueKey as keyof T])}>
                  {/* 데이터 행 */}
                  <tr
                    className={styles.createRowStyles(
                      darkMode,
                      utils.isSelected(item),
                      getRowClassName(item),
                      customStyles.row,
                    )}
                    onClick={() => onRowClick && onRowClick(item)}
                    onDoubleClick={() => {
                      // 확장 가능한 행인 경우 행 확장 토글
                      if (expandableRows) {
                        handlers.toggleRowExpansion(item);
                      }
                      // 더블클릭 이벤트 핸들러가 있으면 호출
                      if (onRowDoubleClick) {
                        onRowDoubleClick(item);
                      }
                    }}
                  >
                    {/* 체크박스 셀 */}
                    {selectable && (
                      <td className={`w-10 px-4 py-3 ${customStyles.cell || ''}`}>
                        <input
                          type="checkbox"
                          className={styles.createCheckboxStyles(darkMode)}
                          checked={utils.isSelected(item)}
                          onChange={(e) => handlers.handleRowSelect(item, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                    )}

                    {/* 데이터 셀 */}
                    {tableData.visibleColumns.map((col) => (
                      <td
                        key={`${String(item[uniqueKey as keyof T])}-${col.key}`}
                        className={`px-4 py-3 ${customStyles.cell || ''}`}
                      >
                        {col.customRenderer
                          ? col.customRenderer(item, col.key)
                          : (item[col.key as keyof T] as React.ReactNode)}
                      </td>
                    ))}
                  </tr>

                  {/* 확장 행 */}
                  {expandableRows && utils.isRowExpanded(item) && (
                    <ExpandedRow
                      item={item}
                      colSpan={tableData.visibleColumns.length + (selectable ? 1 : 0)}
                      darkMode={darkMode}
                      renderer={expandedRowRenderer}
                    />
                  )}
                </React.Fragment>
              ))
            ) : (
              <NoDataMessage
                colSpan={tableData.visibleColumns.length + (selectable ? 1 : 0)}
                darkMode={darkMode}
              />
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
          darkMode={darkMode}
          customStyles={{
            footer: customStyles.footer,
            pagination: customStyles.pagination,
          }}
          onPageChange={handlers.handlePageChange}
          onItemsPerPageChange={handlers.setItemsPerPageState}
        />
      )}
    </div>
  );
}

// 하위 컴포넌트들 내보내기
export * from './types';
