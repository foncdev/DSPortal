import React from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import * as styles from './styles';
import { TableColumn } from './types';

/**
 * 필터 드롭다운 컴포넌트
 */
export const FilterDropdown = <T,>({
  id,
  columns,
  filters,
  darkMode,
  onChange,
}: {
  id: string;
  columns: TableColumn<T>[];
  filters: Record<string, string>;
  darkMode: boolean;
  onChange: (key: string, value: string) => void;
}) => (
  <div
    id={id}
    className={`absolute left-0 top-full z-50 mt-1 hidden w-64 rounded-md border p-3 shadow-lg ${
      darkMode
        ? 'border-gray-600 bg-gray-800 text-gray-100'
        : 'border-gray-200 bg-white text-gray-800'
    }`}
    style={{ maxHeight: '400px', overflow: 'auto' }}
  >
    <h4 className={`mb-2 text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
      필터 옵션
    </h4>
    {columns
      .filter((col) => col.filterable)
      .map((col) => (
        <div key={`filter-${col.key}`} className="mb-2">
          <label
            htmlFor={`filter-${col.key}`}
            className={`mb-1 block text-xs font-medium ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            {col.header}
          </label>
          <input
            id={`filter-${col.key}`}
            type="text"
            value={filters[col.key] || ''}
            onChange={(e) => onChange(col.key, e.target.value)}
            className={`w-full rounded-md border px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-1 ${
              darkMode
                ? 'border-gray-600 bg-gray-700 text-gray-100 focus:border-indigo-500 focus:ring-indigo-500'
                : 'border-gray-300 bg-white text-gray-900 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
            placeholder={`${col.header} 검색...`}
          />
        </div>
      ))}
  </div>
);

/**
 * 컬럼 설정 드롭다운 컴포넌트
 */
export const ColumnsDropdown = <T,>({
  id,
  columns,
  darkMode,
  onToggle,
}: {
  id: string;
  columns: TableColumn<T>[];
  darkMode: boolean;
  onToggle: (columnKey: string) => void;
}) => (
  <div
    id={id}
    className={`absolute left-0 top-full z-50 mt-1 hidden w-56 rounded-md border p-3 shadow-lg ${
      darkMode
        ? 'border-gray-600 bg-gray-800 text-gray-100'
        : 'border-gray-200 bg-white text-gray-800'
    }`}
    style={{ maxHeight: '400px', overflow: 'auto' }}
  >
    <h4 className={`mb-2 text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
      표시할 컬럼
    </h4>
    <div className="max-h-60 overflow-y-auto">
      {columns.map((col) => (
        <div key={`visibility-${col.key}`} className="mb-1 flex items-center gap-2 py-1">
          <input
            type="checkbox"
            id={`visibility-${col.key}`}
            checked={col.visible}
            onChange={() => onToggle(col.key)}
            className={`size-4 rounded border focus:ring-2 ${
              darkMode
                ? 'border-gray-600 bg-gray-700 text-indigo-500 focus:ring-indigo-600'
                : 'border-gray-300 text-indigo-600 focus:ring-indigo-500'
            }`}
          />
          <label
            htmlFor={`visibility-${col.key}`}
            className={`cursor-pointer text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
          >
            {col.header}
          </label>
        </div>
      ))}
    </div>
  </div>
);

/**
 * 헤더 셀 컴포넌트
 */
export const HeaderCell = <T,>({
  column,
  sortKey,
  sortOrder,
  darkMode,
  filters,
  customHeaderCellStyle,
  columnWidth,
  onSort,
  onFilter,
  onResizeStart,
  hideFilterBarOnMobile = false,
}: {
  column: TableColumn<T>;
  sortKey: string | null;
  sortOrder: 'asc' | 'desc';
  darkMode: boolean;
  filters: Record<string, string>;
  customHeaderCellStyle?: string;
  columnWidth: string | number | undefined;
  onSort: (key: string) => void;
  onFilter: (key: string, value: string) => void;
  onResizeStart: (e: React.MouseEvent, key: string) => void;
  hideFilterBarOnMobile?: boolean;
}) => (
  <th
    className={styles.createHeaderCellStyles(darkMode, customHeaderCellStyle)}
    style={{ width: columnWidth || column.width || 'auto' }}
  >
    <div className="flex flex-col gap-2">
      <div
        className="flex cursor-pointer items-center justify-between"
        onClick={() => column.sortable && onSort(column.key)}
      >
        <span className="font-medium">{column.header}</span>
        {column.sortable && (
          <span className="ml-1">
            {sortKey === column.key ? (
              sortOrder === 'asc' ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )
            ) : (
              <span className={darkMode ? 'text-gray-500' : 'text-gray-300'}>
                <ChevronDown size={14} />
              </span>
            )}
          </span>
        )}
      </div>

      {column.filterable && !hideFilterBarOnMobile && (
        <div>
          <input
            type="text"
            value={filters[column.key] || ''}
            onChange={(e) => onFilter(column.key, e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className={styles.createInputStyles(darkMode)}
            placeholder="필터..."
          />
        </div>
      )}
    </div>

    {column.resizable && (
      <div
        className="absolute right-0 top-0 h-full w-2 cursor-col-resize"
        onMouseDown={(e) => onResizeStart(e, column.key)}
      />
    )}
  </th>
);

/**
 * 빈 데이터 메시지 컴포넌트
 */
export const NoDataMessage = ({ colSpan, darkMode }: { colSpan: number; darkMode: boolean }) => (
  <tr>
    <td colSpan={colSpan} className={styles.createNoDataStyles(darkMode)}>
      데이터가 없습니다
    </td>
  </tr>
);

/**
 * 페이지네이션 컴포넌트
 */
export const Pagination = ({
  currentPage,
  totalPages,
  itemsPerPage,
  itemsPerPageOptions,
  totalItems,
  darkMode,
  customStyles,
  onPageChange,
  onItemsPerPageChange,
}: {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  itemsPerPageOptions: number[];
  totalItems: number;
  darkMode: boolean;
  customStyles?: {
    footer?: string;
    pagination?: string;
  };
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: number) => void;
}) => (
  <div className={styles.createPaginationContainerStyles(darkMode, customStyles?.footer)}>
    <div className="flex items-center gap-3">
      <div>
        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
          <span className="font-medium">
            {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}
          </span>
          -<span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span>{' '}
          of <span className="font-medium">{totalItems}</span> 항목
        </span>
      </div>

      <div className="inline-flex items-center">
        <label
          htmlFor="table-items-per-page"
          className={`mr-2 text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}
        >
          페이지당 행:
        </label>
        <select
          id="table-items-per-page"
          value={itemsPerPage}
          onChange={(e) => {
            onItemsPerPageChange(Number(e.target.value));
          }}
          className={`rounded-md border px-2 py-1 text-sm focus:outline-none focus:ring-1 ${
            darkMode
              ? 'border-gray-600 bg-gray-700 text-gray-200 focus:border-indigo-500 focus:ring-indigo-500'
              : 'border-gray-300 bg-white text-gray-900 focus:border-indigo-500 focus:ring-indigo-500'
          } ${customStyles?.pagination || ''}`}
        >
          {itemsPerPageOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>

    <div className="flex space-x-1">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className={styles.createPageButtonStyles(
          darkMode,
          false,
          currentPage === 1,
          customStyles?.pagination,
        )}
        aria-label="First page"
      >
        <ChevronsLeft size={16} />
      </button>

      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={styles.createPageButtonStyles(
          darkMode,
          false,
          currentPage === 1,
          customStyles?.pagination,
        )}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        let pageNum;
        if (totalPages <= 5) {
          pageNum = i + 1;
        } else if (currentPage <= 3) {
          pageNum = i + 1;
        } else if (currentPage >= totalPages - 2) {
          pageNum = totalPages - 4 + i;
        } else {
          pageNum = currentPage - 2 + i;
        }

        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={styles.createPageButtonStyles(
              darkMode,
              currentPage === pageNum,
              false,
              customStyles?.pagination,
            )}
            aria-label={`Page ${pageNum}`}
            aria-current={currentPage === pageNum ? 'page' : undefined}
          >
            {pageNum}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={styles.createPageButtonStyles(
          darkMode,
          false,
          currentPage === totalPages,
          customStyles?.pagination,
        )}
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>

      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className={styles.createPageButtonStyles(
          darkMode,
          false,
          currentPage === totalPages,
          customStyles?.pagination,
        )}
        aria-label="Last page"
      >
        <ChevronsRight size={16} />
      </button>
    </div>
  </div>
);

/**
 * 조작 버튼 컴포넌트
 */
export const ActionButton = ({
  icon,
  label,
  darkMode,
  onClick,
  title,
}: {
  icon: React.ReactNode;
  label: string;
  darkMode: boolean;
  onClick: () => void;
  title?: string;
}) => (
  <button
    className={styles.createButtonStyles(darkMode)}
    type="button"
    onClick={onClick}
    title={title}
  >
    {icon}
    {label}
  </button>
);

/**
 * 확장된 행 컴포넌트
 */
export const ExpandedRow = <T,>({
  item,
  colSpan,
  darkMode,
  renderer,
}: {
  item: T;
  colSpan: number;
  darkMode: boolean;
  renderer?: (item: T) => React.ReactNode;
}) => (
  <tr className={styles.createExpandedRowStyles(darkMode)}>
    <td colSpan={colSpan} className="px-4 py-3">
      <div className={styles.createExpandedContentStyles(darkMode)}>
        {renderer ? (
          renderer(item)
        ) : (
          <div className="text-center">
            <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
              확장 뷰 렌더러가 제공되지 않았습니다.
            </p>
          </div>
        )}
      </div>
    </td>
  </tr>
);
