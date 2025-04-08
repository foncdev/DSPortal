// src/components/FileManager/FileManagerProvider.tsx
import React, { createContext, useReducer, useCallback, useEffect } from 'react';
import {
  FileManagerState,
  FileManagerContextType,
  SortOption,
  FilterOption,
  FileItem,
} from './types';
import * as fileManagerApi from '@/api/fileManager';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Initial state for the file manager
const initialState: FileManagerState = {
  files: [],
  selectedItems: [],
  currentPath: '/',
  currentFolderId: null,
  sortOption: { field: 'name', direction: 'asc' },
  filterOption: {},
  viewMode: 'list',
  clipboardItems: { items: [], operation: null },
  isLoading: false,
  error: null,
};

// Actions for the reducer
type FileManagerAction =
  | { type: 'SET_FILES'; payload: FileItem[] }
  | { type: 'SET_CURRENT_FOLDER'; payload: { folderId: string | null; path: string } }
  | { type: 'SELECT_ITEM'; payload: { itemId: string; multiSelect: boolean } }
  | { type: 'SELECT_MULTIPLE_ITEMS'; payload: string[] }
  | { type: 'DESELECT_ALL' }
  | { type: 'SET_SORT_OPTION'; payload: SortOption }
  | { type: 'SET_FILTER_OPTION'; payload: FilterOption }
  | { type: 'SET_VIEW_MODE'; payload: 'list' | 'grid' }
  | { type: 'SET_CLIPBOARD_ITEMS'; payload: { items: string[]; operation: 'copy' | 'cut' | null } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Reducer for file manager state
const fileManagerReducer = (
  state: FileManagerState,
  action: FileManagerAction,
): FileManagerState => {
  switch (action.type) {
    case 'SET_FILES':
      return { ...state, files: action.payload };

    case 'SET_CURRENT_FOLDER':
      return {
        ...state,
        currentFolderId: action.payload.folderId,
        currentPath: action.payload.path,
        selectedItems: [], // Clear selection when changing folders
      };

    case 'SELECT_ITEM':
      if (action.payload.multiSelect) {
        // Toggle selection with multi-select
        const isSelected = state.selectedItems.includes(action.payload.itemId);
        if (isSelected) {
          return {
            ...state,
            selectedItems: state.selectedItems.filter((id) => id !== action.payload.itemId),
          };
        } else {
          return {
            ...state,
            selectedItems: [...state.selectedItems, action.payload.itemId],
          };
        }
      } else {
        // Single selection
        return {
          ...state,
          selectedItems: [action.payload.itemId],
        };
      }

    case 'SELECT_MULTIPLE_ITEMS':
      return {
        ...state,
        selectedItems: action.payload,
      };

    case 'DESELECT_ALL':
      return {
        ...state,
        selectedItems: [],
      };

    case 'SET_SORT_OPTION':
      return {
        ...state,
        sortOption: action.payload,
      };

    case 'SET_FILTER_OPTION':
      return {
        ...state,
        filterOption: action.payload,
      };

    case 'SET_VIEW_MODE':
      return {
        ...state,
        viewMode: action.payload,
      };

    case 'SET_CLIPBOARD_ITEMS':
      return {
        ...state,
        clipboardItems: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
};

// Create context
export const FileManagerContext = createContext<FileManagerContextType | undefined>(undefined);

interface FileManagerProviderProps {
  children: React.ReactNode;
  initialFolderId?: string | null;
}

export const FileManagerProvider: React.FC<FileManagerProviderProps> = ({
  children,
  initialFolderId = null,
}) => {
  const [state, dispatch] = useReducer(fileManagerReducer, {
    ...initialState,
    currentFolderId: initialFolderId,
  });

  // Fetch files from current folder
  const fetchFiles = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const files = await fileManagerApi.getFiles(state.currentFolderId);
      dispatch({ type: 'SET_FILES', payload: files });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to fetch files',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.currentFolderId]);

  // Load files on initial mount and when current folder changes
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Get folder path information
  const getFolderPathInfo = useCallback(async (folderId: string | null) => {
    if (!folderId) {
      return '/';
    }

    try {
      const pathItems = await fileManagerApi.getFolderPath(folderId);
      return '/' + pathItems.map((item) => item.name).join('/');
    } catch (error) {
      console.error('Failed to get folder path:', error);
      return '/';
    }
  }, []);

  // Navigate to a folder
  const setCurrentFolder = async (folderId: any | null, path?: string) => {
    const folderPath = path || (await getFolderPathInfo(folderId));

    dispatch({
      type: 'SET_CURRENT_FOLDER',
      payload: {
        folderId,
        path: folderPath,
      },
    });
  };

  // Select a file/folder
  const selectItem = (itemId: any, multiSelect = false) => {
    dispatch({
      type: 'SELECT_ITEM',
      payload: {
        itemId,
        multiSelect,
      },
    });
  };

  // Select multiple files/folders
  const selectMultipleItems = (itemIds: any) => {
    dispatch({ type: 'SELECT_MULTIPLE_ITEMS', payload: itemIds });
  };

  // Deselect all items
  const deselectAll = () => {
    dispatch({ type: 'DESELECT_ALL' });
  };

  // Toggle select all items in current view
  const toggleSelectAll = () => {
    if (state.selectedItems.length === state.files.length) {
      // If all items are selected, deselect all
      deselectAll();
    } else {
      // Otherwise, select all items
      selectMultipleItems(state.files.map((file) => file.id));
    }
  };

  // Set sort option
  const setSortOption = (option: SortOption) => {
    dispatch({ type: 'SET_SORT_OPTION', payload: option });
  };

  // Set filter option
  const setFilterOption = (option: FilterOption) => {
    dispatch({ type: 'SET_FILTER_OPTION', payload: option });
  };

  // Set view mode
  const setViewMode = (mode: 'list' | 'grid') => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  };

  // Copy items to clipboard
  const copyItems = (itemIds: any) => {
    dispatch({
      type: 'SET_CLIPBOARD_ITEMS',
      payload: {
        items: itemIds,
        operation: 'copy',
      },
    });
  };

  // Cut items to clipboard
  const cutItems = (itemIds: any) => {
    dispatch({
      type: 'SET_CLIPBOARD_ITEMS',
      payload: {
        items: itemIds,
        operation: 'cut',
      },
    });
  };

  // Paste items from clipboard
  const pasteItems = async () => {
    const { items, operation } = state.clipboardItems;

    if (!items.length || !operation) {
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      if (operation === 'copy') {
        await fileManagerApi.copyFiles(items, state.currentFolderId);
      } else {
        await fileManagerApi.moveFiles(items, state.currentFolderId);
      }

      // Clear clipboard after cut operation
      if (operation === 'cut') {
        dispatch({
          type: 'SET_CLIPBOARD_ITEMS',
          payload: {
            items: [],
            operation: null,
          },
        });
      }

      // Reload files
      await fetchFiles();
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to paste items',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Reload files
  const reloadFiles = async () => {
    await fetchFiles();
  };

  const contextValue: FileManagerContextType = {
    state,
    setCurrentFolder,
    selectItem,
    selectMultipleItems,
    deselectAll,
    toggleSelectAll,
    setSortOption,
    setFilterOption,
    setViewMode,
    copyItems,
    cutItems,
    pasteItems,
    reloadFiles,
  };

  return <FileManagerContext.Provider value={contextValue}>{children}</FileManagerContext.Provider>;
};
