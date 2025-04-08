// src/components/FileManager/components/FileContextMenu.tsx
import React, { useEffect, useRef } from 'react';
import {
  FolderPlus,
  Copy,
  Scissors,
  Clipboard,
  Download,
  Pencil,
  Trash,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { FileItem } from '../types';
import { useFileManager } from '../hooks/useFileManager';
import { useFileOperations } from '../hooks/useFileOperations';
import { useFolderOperations } from '../hooks/useFolderOperations';
import { useClipboard } from '../hooks/useClipboard';
import { isViewableFile } from '../utils/fileTypeUtils';

interface FileContextMenuProps {
  x: number;
  y: number;
  item?: FileItem; // Optional, if context menu is triggered on an item
  onClose: () => void;
}

const FileContextMenu: React.FC<FileContextMenuProps> = ({ x, y, item, onClose }) => {
  const {
    reloadFiles,
    state: { currentFolderId, selectedItems },
  } = useFileManager();

  const { renameFile, deleteFiles, downloadFile } = useFileOperations();
  const { createFolder, renameFolder } = useFolderOperations();
  const { copy, cut, paste, hasClipboardItems } = useClipboard();

  const ref = useRef<HTMLDivElement>(null);

  // Adjust position if the menu is too close to the edge of the screen
  const adjustedX = x + 240 > window.innerWidth ? window.innerWidth - 240 : x;
  const adjustedY = y + 300 > window.innerHeight ? window.innerHeight - 300 : y;

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Create a new folder
  const handleCreateFolder = () => {
    const folderName = prompt('Enter folder name:');
    if (folderName && folderName.trim() !== '') {
      createFolder(folderName.trim());
    }
    onClose();
  };

  // Rename item
  const handleRename = () => {
    if (!item) return;

    const newName = prompt('Enter new name:', item.name);
    if (newName && newName.trim() !== '' && newName !== item.name) {
      if (item.isFolder) {
        renameFolder(item.id, newName.trim());
      } else {
        renameFile(item.id, newName.trim());
      }
    }
    onClose();
  };

  // Delete items
  const handleDelete = () => {
    if (selectedItems.length > 0) {
      const confirmMessage = `Are you sure you want to delete ${selectedItems.length} item(s)?`;
      if (window.confirm(confirmMessage)) {
        deleteFiles(selectedItems);
      }
    }
    onClose();
  };

  // Download item
  const handleDownload = () => {
    if (item && !item.isFolder) {
      downloadFile(item.id);
    } else if (selectedItems.length === 1) {
      downloadFile(selectedItems[0]);
    }
    onClose();
  };

  // View item
  const handleView = () => {
    if (!item) return;

    console.log('Preview file:', item.name);
    onClose();
  };

  // Copy items
  const handleCopy = () => {
    copy();
    onClose();
  };

  // Cut items
  const handleCut = () => {
    cut();
    onClose();
  };

  // Paste items
  const handlePaste = async () => {
    await paste();
    onClose();
  };

  // Refresh files
  const handleRefresh = () => {
    reloadFiles();
    onClose();
  };

  const hasSelectedItems = selectedItems.length > 0;
  const hasViewableItem = item && !item.isFolder && isViewableFile(item.type);
  const hasSingleNonFolderSelected = selectedItems.length === 1 && item && !item.isFolder;

  return (
    <div
      ref={ref}
      className="absolute z-50 w-60 rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
      style={{ top: adjustedY, left: adjustedX }}
    >
      {/* Always visible options */}
      <button
        onClick={handleCreateFolder}
        className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        <FolderPlus size={16} className="mr-2" />
        New Folder
      </button>

      {/* Option when item is selected */}
      {hasSelectedItems && (
        <>
          <button
            onClick={handleCopy}
            className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Copy size={16} className="mr-2" />
            Copy
          </button>
          <button
            onClick={handleCut}
            className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Scissors size={16} className="mr-2" />
            Cut
          </button>
        </>
      )}

      {/* Paste option when clipboard has items */}
      {hasClipboardItems && (
        <button
          onClick={handlePaste}
          className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <Clipboard size={16} className="mr-2" />
          Paste
        </button>
      )}

      {/* Options when a single item is right-clicked */}
      {item && (
        <>
          <hr className="my-1 border-gray-200 dark:border-gray-700" />
          <button
            onClick={handleRename}
            className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Pencil size={16} className="mr-2" />
            Rename
          </button>
          <button
            onClick={handleDelete}
            className="flex w-full items-center px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
          >
            <Trash size={16} className="mr-2" />
            Delete
          </button>

          {hasSingleNonFolderSelected && (
            <button
              onClick={handleDownload}
              className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Download size={16} className="mr-2" />
              Download
            </button>
          )}

          {hasViewableItem && (
            <button
              onClick={handleView}
              className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Eye size={16} className="mr-2" />
              View
            </button>
          )}
        </>
      )}

      <hr className="my-1 border-gray-200 dark:border-gray-700" />
      <button
        onClick={handleRefresh}
        className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        <RefreshCw size={16} className="mr-2" />
        Refresh
      </button>
    </div>
  );
};

export default FileContextMenu;
