import React from 'react';

/**
 * 데이터 테이블 스타일 유틸리티
 * - Tailwind CSS 클래스를 조건부로 생성하여 반환
 */

/**
 * 컨테이너 스타일 생성
 */
export const createContainerStyles = (
  darkMode: boolean,
  className: string,
  customTableStyle?: string,
) => {
  return `relative rounded-lg border ${
    darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200'
  } ${customTableStyle || className}`;
};

/**
 * 스크롤 스타일 생성
 */
export const createScrollStyles = (
  horizontalScroll: boolean,
  verticalScroll: boolean,
  maxHeight?: string,
): React.CSSProperties => {
  return {
    maxHeight: verticalScroll ? maxHeight || 'auto' : 'none',
    overflowX: horizontalScroll ? ('auto' as const) : ('hidden' as const),
    overflowY: verticalScroll ? ('auto' as const) : ('hidden' as const),
  };
};

/**
 * 테이블 스타일 생성
 */
export const createTableStyles = (fixed: boolean) => {
  return `w-full text-left text-sm ${fixed ? 'table-fixed' : 'table-auto'}`;
};

/**
 * 테이블 헤더 스타일 생성
 */
export const createHeaderStyles = (darkMode: boolean, customHeaderStyle?: string) => {
  return `sticky top-0 z-10 shadow-sm ${
    darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-700'
  } ${customHeaderStyle || ''}`;
};

/**
 * 헤더 셀 스타일 생성
 */
export const createHeaderCellStyles = (darkMode: boolean, customHeaderCellStyle?: string) => {
  return `relative px-4 py-3 ${darkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-gray-50'} ${
    customHeaderCellStyle || ''
  }`;
};

/**
 * 선택 체크박스 스타일 생성
 */
export const createCheckboxStyles = (darkMode: boolean) => {
  return `h-4 w-4 rounded border ${
    darkMode
      ? 'border-gray-600 bg-gray-700 text-indigo-400 focus:ring-indigo-400 focus:ring-offset-gray-800'
      : 'border-gray-300 text-indigo-600 focus:ring-indigo-500'
  }`;
};

/**
 * 테이블 본문 스타일 생성
 */
export const createBodyStyles = (darkMode: boolean) => {
  return darkMode ? 'text-gray-100' : 'text-gray-700';
};

/**
 * 행 스타일 생성
 */
export const createRowStyles = (
  darkMode: boolean,
  isSelected: boolean,
  rowClassName: string,
  customRowStyle?: string,
) => {
  return `border-b ${
    darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'
  } ${isSelected ? (darkMode ? 'bg-indigo-900/30' : 'bg-indigo-50') : ''} ${rowClassName} ${
    customRowStyle || ''
  }`;
};

/**
 * 확장 행 스타일 생성
 */
export const createExpandedRowStyles = (darkMode: boolean) => {
  return darkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-gray-50';
};

/**
 * 확장 컨텐츠 스타일 생성
 */
export const createExpandedContentStyles = (darkMode: boolean) => {
  return `p-3 rounded ${darkMode ? 'bg-gray-700 text-gray-100' : 'bg-white'} shadow-inner`;
};

/**
 * 데이터 없음 메시지 스타일 생성
 */
export const createNoDataStyles = (darkMode: boolean) => {
  return `px-4 py-8 text-center ${
    darkMode ? 'text-gray-300 border-b border-gray-700' : 'text-gray-500'
  }`;
};

/**
 * 페이지네이션 컨테이너 스타일 생성
 */
export const createPaginationContainerStyles = (darkMode: boolean, customFooterStyle?: string) => {
  return `mt-4 flex flex-wrap items-center justify-between gap-4 ${
    darkMode ? 'text-gray-100 bg-gray-800 p-3 rounded-lg border border-gray-700' : 'text-gray-700'
  } ${customFooterStyle || ''}`;
};

/**
 * 버튼 스타일 생성
 */
export const createButtonStyles = (darkMode: boolean) => {
  return `flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium shadow-sm transition ${
    darkMode
      ? 'bg-gray-700 text-gray-100 hover:bg-gray-600 border border-gray-600'
      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
  }`;
};

/**
 * 페이지네이션 버튼 스타일 생성
 */
export const createPageButtonStyles = (
  darkMode: boolean,
  isActive: boolean,
  disabled: boolean = false,
  customPaginationStyle?: string,
) => {
  let baseStyle =
    'inline-flex items-center rounded-md border px-2 py-1 text-sm font-medium shadow-sm transition';

  if (isActive) {
    baseStyle += darkMode
      ? ' border-indigo-600 bg-indigo-800 text-indigo-200'
      : ' border-indigo-500 bg-indigo-50 text-indigo-600';
  } else {
    baseStyle += darkMode
      ? ' border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600'
      : ' border-gray-300 bg-white text-gray-700 hover:bg-gray-50';
  }

  if (disabled) {
    baseStyle += darkMode
      ? ' opacity-50 cursor-not-allowed hover:bg-gray-700'
      : ' opacity-50 cursor-not-allowed hover:bg-white';
  }

  return `${baseStyle} ${customPaginationStyle || ''}`;
};

/**
 * 드롭다운 스타일 생성
 */
export const createDropdownStyles = (darkMode: boolean) => {
  return `absolute left-0 top-full z-50 mt-1 hidden w-56 rounded-md border p-3 shadow-lg ${
    darkMode
      ? 'border-gray-600 bg-gray-800 text-gray-100'
      : 'border-gray-200 bg-white text-gray-800'
  }`;
};

/**
 * 입력 필드 스타일 생성
 */
export const createInputStyles = (darkMode: boolean) => {
  return `w-full rounded border px-2 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 ${
    darkMode
      ? 'border-gray-600 bg-gray-700 text-gray-100 focus:border-indigo-400 focus:ring-indigo-400'
      : 'border-gray-200 bg-white text-gray-800 focus:border-indigo-300 focus:ring-indigo-300'
  }`;
};
