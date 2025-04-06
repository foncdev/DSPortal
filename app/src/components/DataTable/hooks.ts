import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TableColumn, TableState } from './types';

/**
 * 테이블 기본 로직을 처리하는 커스텀 훅
 */
export function useTable<T>({
  data,
  initialColumns,
  uniqueKey,
  itemsPerPage,
  expandableRows = false,
  initialHorizontalScroll = true,
  initialVerticalScroll = true,
  mobileBreakpoint = 768, // 기본 모바일 중단점
  onSelectionChange,
}: {
  data: T[];
  initialColumns: TableColumn<T>[];
  uniqueKey: keyof T;
  itemsPerPage: number;
  expandableRows?: boolean;
  initialHorizontalScroll?: boolean;
  initialVerticalScroll?: boolean;
  mobileBreakpoint?: number;
  onSelectionChange?: (selectedItems: T[]) => void;
}) {
  // 모바일 환경 여부 확인
  const [isMobile, setIsMobile] = useState(false);

  // 화면 크기 변화 감지하여 모바일 여부 설정
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };

    // 초기 확인
    checkIfMobile();

    // 리사이즈 이벤트 리스너 등록
    window.addEventListener('resize', checkIfMobile);

    // 컴포넌트 언마운트 시 리스너 제거
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, [mobileBreakpoint]);
  // 상태 관리
  const [columns, setColumns] = useState<TableColumn<T>[]>(
    initialColumns.map((col) => ({ ...col, visible: col.visible ?? true })),
  );
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedItems, setSelectedItems] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPageState, setItemsPerPageState] = useState(itemsPerPage);
  const [resizingColumnKey, setResizingColumnKey] = useState<string | null>(null);
  const [initialX, setInitialX] = useState(0);
  const [columnWidths, setColumnWidths] = useState<Record<string, number | string>>({});
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [horizontalScroll, setHorizontalScroll] = useState(initialHorizontalScroll);
  const [verticalScroll, setVerticalScroll] = useState(initialVerticalScroll);

  // 컬럼 초기 너비 설정
  useEffect(() => {
    const initialWidths: Record<string, number | string> = {};
    columns.forEach((col) => {
      if (col.width) {
        initialWidths[col.key] = col.width;
      }
    });
    setColumnWidths(initialWidths);
  }, []);

  // 페이지당 항목 수 변경 적용
  useEffect(() => {
    setItemsPerPageState(itemsPerPage);
  }, [itemsPerPage]);

  // 필터 적용
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value.trim()) return true;

        const itemValue = String(item[key as keyof T] || '').toLowerCase();
        return itemValue.includes(value.toLowerCase());
      });
    });
  }, [data, filters]);

  // 정렬 적용
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortKey as keyof T];
      const bValue = b[sortKey as keyof T];

      // 데이터 유형에 따른 처리
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // 문자열 변환 및 비교
      const aString = String(aValue || '').toLowerCase();
      const bString = String(bValue || '').toLowerCase();

      if (sortOrder === 'asc') {
        return aString.localeCompare(bString);
      } else {
        return bString.localeCompare(aString);
      }
    });
  }, [filteredData, sortKey, sortOrder]);

  // 페이지네이션 적용
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPageState;
    return sortedData.slice(startIndex, startIndex + itemsPerPageState);
  }, [sortedData, currentPage, itemsPerPageState]);

  // 총 페이지 수 계산
  const totalPages = useMemo(() => {
    return Math.ceil(sortedData.length / itemsPerPageState);
  }, [sortedData, itemsPerPageState]);

  // 행 선택 여부 확인
  const isSelected = useCallback(
    (item: T) => {
      const keyProp = uniqueKey as string;
      return selectedItems.some(
        (selected) => String(selected[keyProp as keyof T]) === String(item[keyProp as keyof T]),
      );
    },
    [selectedItems, uniqueKey],
  );

  // 행 확장 상태 토글
  const toggleRowExpansion = useCallback(
    (item: T) => {
      const key = String(item[uniqueKey as keyof T]);
      setExpandedRows((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    },
    [uniqueKey],
  );

  // 행 확장 상태 확인
  const isRowExpanded = useCallback(
    (item: T) => {
      const key = String(item[uniqueKey as keyof T]);
      return expandedRows[key] || false;
    },
    [expandedRows, uniqueKey],
  );

  // 컬럼 표시 여부 토글
  const toggleColumnVisibility = useCallback((columnKey: string) => {
    setColumns((prevColumns) =>
      prevColumns.map((col) => (col.key === columnKey ? { ...col, visible: !col.visible } : col)),
    );
  }, []);

  // 정렬 처리
  const handleSort = useCallback(
    (key: string) => {
      if (sortKey === key) {
        setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortKey(key);
        setSortOrder('asc');
      }
    },
    [sortKey],
  );

  // 필터 변경 처리
  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
    setCurrentPage(1); // 필터링 시 첫 페이지로 이동
  }, []);

  // 행 선택 처리
  const handleRowSelect = useCallback(
    (item: T, checked: boolean) => {
      setSelectedItems((prevSelected) => {
        const keyProp = uniqueKey as string;
        const newSelected = checked
          ? [...prevSelected, item]
          : prevSelected.filter(
              (selected) =>
                String(selected[keyProp as keyof T]) !== String(item[keyProp as keyof T]),
            );

        if (onSelectionChange) {
          onSelectionChange(newSelected);
        }

        return newSelected;
      });
    },
    [uniqueKey, onSelectionChange],
  );

  // 전체 선택 처리
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      const newSelectedItems = checked ? filteredData : [];
      setSelectedItems(newSelectedItems);

      if (onSelectionChange) {
        onSelectionChange(newSelectedItems);
      }
    },
    [filteredData, onSelectionChange],
  );

  // 페이지 변경 처리
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // 컬럼 리사이징 처리 (마우스 다운)
  const handleMouseDown = useCallback((e: React.MouseEvent, columnKey: string) => {
    e.preventDefault();
    setResizingColumnKey(columnKey);
    setInitialX(e.clientX);
  }, []);

  // 컬럼 리사이징 처리 (마우스 이동/업)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingColumnKey) {
        const deltaX = e.clientX - initialX;
        setColumnWidths((prev) => {
          const currentWidth = prev[resizingColumnKey];
          const newWidth =
            typeof currentWidth === 'number'
              ? Math.max(80, currentWidth + deltaX)
              : Math.max(80, parseInt(String(currentWidth || 100)) + deltaX);
          return { ...prev, [resizingColumnKey]: newWidth };
        });
        setInitialX(e.clientX);
      }
    };

    const handleMouseUp = () => {
      setResizingColumnKey(null);
    };

    if (resizingColumnKey) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingColumnKey, initialX]);

  // 보이는 컬럼만 필터링 (모바일 환경에서는 hideOnMobile 속성도 고려)
  const visibleColumns = useMemo(() => {
    return columns.filter((col) => {
      if (!col.visible) return false;
      if (isMobile && col.hideOnMobile) return false;
      return true;
    });
  }, [columns, isMobile]);

  // 스크롤 토글 핸들러
  const toggleHorizontalScroll = useCallback(() => {
    setHorizontalScroll((prev) => !prev);
  }, []);

  const toggleVerticalScroll = useCallback(() => {
    setVerticalScroll((prev) => !prev);
  }, []);

  return {
    state: {
      columns,
      sortKey,
      sortOrder,
      filters,
      selectedItems,
      currentPage,
      itemsPerPageState,
      resizingColumnKey,
      initialX,
      columnWidths,
      expandedRows,
      horizontalScroll,
      verticalScroll,
      isMobile,
    },
    handlers: {
      setItemsPerPageState,
      toggleColumnVisibility,
      handleSort,
      handleFilterChange,
      handleRowSelect,
      handleSelectAll,
      handlePageChange,
      handleMouseDown,
      toggleRowExpansion,
      toggleHorizontalScroll,
      toggleVerticalScroll,
    },
    data: {
      filteredData,
      sortedData,
      paginatedData,
      visibleColumns,
      totalPages,
    },
    utils: {
      isSelected,
      isRowExpanded,
    },
  };
}
