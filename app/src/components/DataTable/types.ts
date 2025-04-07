import { ReactNode } from 'react';

/**
 * 테이블 컬럼 정의를 위한 타입
 */
export interface TableColumn<T> {
  key: string;
  header: string;
  visible?: boolean;
  width?: string | number;
  sortable?: boolean;
  filterable?: boolean;
  customRenderer?: (item: T, key: string) => ReactNode;
  resizable?: boolean;
  hideOnMobile?: boolean; // 모바일에서 컬럼 숨김 여부
}

/**
 * 테이블 속성을 위한 타입
 */
export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  uniqueKey: keyof T;
  pagination?: boolean;
  itemsPerPage?: number;
  itemsPerPageOptions?: number[];
  maxHeight?: string;
  selectable?: boolean;
  onSelectionChange?: (selectedItems: T[]) => void;
  onRowClick?: (item: T) => void;
  onRowDoubleClick?: (item: T) => void;
  expandableRows?: boolean;
  expandedRowRenderer?: (item: T) => ReactNode;
  className?: string;
  rowClassName?: string | ((item: T) => string);
  fixed?: boolean;
  darkMode?: boolean;
  initialHorizontalScroll?: boolean;
  initialVerticalScroll?: boolean;
  hideFilterBarOnMobile?: boolean; // 모바일에서 헤더 필터 숨김 여부
  mobileBreakpoint?: number; // 모바일 중단점 픽셀 (기본값: 768px)
  customStyles?: {
    table?: string;
    header?: string;
    headerCell?: string;
    row?: string;
    cell?: string;
    footer?: string;
    pagination?: string;
  };
}

/**
 * 테이블 상태 관리를 위한 타입
 */
export interface TableState<T> {
  columns: TableColumn<T>[];
  sortKey: string | null;
  sortOrder: 'asc' | 'desc';
  filters: Record<string, string>;
  selectedItems: T[];
  currentPage: number;
  itemsPerPageState: number;
  resizingColumnKey: string | null;
  initialX: number;
  columnWidths: Record<string, number | string>;
  expandedRows: Record<string, boolean>;
  horizontalScroll: boolean;
  verticalScroll: boolean;
  isMobile: boolean;
}

/**
 * 테이블 데이터 상태를 위한 타입
 */
export interface TableData<T> {
  filteredData: T[];
  sortedData: T[];
  paginatedData: T[];
  visibleColumns: TableColumn<T>[];
  totalPages: number;
}

/**
 * 테이블 유틸리티 함수를 위한 타입
 */
export interface TableUtils<T> {
  isSelected: (item: T) => boolean;
  isRowExpanded: (item: T) => boolean;
}

/**
 * 테이블 핸들러 함수를 위한 타입
 */
export interface TableHandlers<T> {
  setItemsPerPageState: (value: number) => void;
  toggleColumnVisibility: (columnKey: string) => void;
  handleSort: (key: string) => void;
  handleFilterChange: (key: string, value: string) => void;
  handleRowSelect: (item: T, checked: boolean) => void;
  handleSelectAll: (checked: boolean) => void;
  handlePageChange: (page: number) => void;
  handleMouseDown: (e: React.MouseEvent, columnKey: string) => void;
  toggleRowExpansion: (item: T) => void;
  toggleHorizontalScroll: () => void;
  toggleVerticalScroll: () => void;
}

/**
 * 테이블 훅 반환 타입
 */
export interface UseTableReturn<T> {
  state: TableState<T>;
  handlers: TableHandlers<T>;
  data: TableData<T>;
  utils: TableUtils<T>;
}