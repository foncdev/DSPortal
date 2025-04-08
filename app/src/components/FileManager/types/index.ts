// src/components/FileManager/types/index.ts

export type FileType = 'image' | 'video' | 'zip' | 'pdf' | 'folder' | 'other';

export interface FileItem {
  id: string | number;
  name: string;
  type: FileType;
  path?: string;
  size: number;
  createdAt?: string;
  createAt?: string; // API uses createAt
  modifiedAt?: string;
  modifiedDate?: string; // API uses modifiedDate
  md5?: string;
  isFolder?: boolean;
  parentId?: string | number | null;
  thumbnail?: string | null;
  url?: string | null;
  expirationAt?: string | null;
}

export interface SortOption {
  field: 'name' | 'size' | 'type' | 'createdAt' | 'modifiedAt';
  direction: 'asc' | 'desc';
}

export interface FilterOption {
  type?: FileType[];
  search?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
}

export interface ApiResponse {
  success: boolean;
  code: number;
  status: string;
  msg: string;
  errors: string[];
  data: FileItem[];
}

export interface FileManagerState {
  files: FileItem[];
  selectedItems: (string | number)[];
  currentPath: string;
  currentFolderId: string | number | null;
  sortOption: SortOption;
  filterOption: FilterOption;
  viewMode: 'list' | 'grid';
  clipboardItems: {
    items: (string | number)[];
    operation: 'copy' | 'cut' | null;
  };
  isLoading: boolean;
  error: string | null;
}

export interface FileManagerContextType {
  state: FileManagerState;
  setCurrentFolder: (folderId: string | number | null, path: string) => void;
  selectItem: (itemId: string | number, multiSelect?: boolean) => void;
  selectMultipleItems: (itemIds: (string | number)[]) => void;
  deselectAll: () => void;
  toggleSelectAll: () => void;
  setSortOption: (option: SortOption) => void;
  setFilterOption: (option: FilterOption) => void;
  setViewMode: (mode: 'list' | 'grid') => void;
  copyItems: (itemIds: (string | number)[]) => void;
  cutItems: (itemIds: (string | number)[]) => void;
  pasteItems: () => Promise<void>;
  reloadFiles: () => Promise<void>;
}
