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
import styles from './FileContextMenu.module.scss';

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
    if (!item) {return;}

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
    if (!item) {return;}

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
          className={styles.contextMenu}
          style={{ top: adjustedY, left: adjustedX }}
      >
        {/* Always visible options */}
        <button
            onClick={handleCreateFolder}
            className={styles.menuItem}
        >
          <FolderPlus size={16} />
          New Folder
        </button>

        {/* Option when item is selected */}
        {hasSelectedItems && (
            <>
              <button
                  onClick={handleCopy}
                  className={styles.menuItem}
              >
                <Copy size={16} />
                Copy
              </button>
              <button
                  onClick={handleCut}
                  className={styles.menuItem}
              >
                <Scissors size={16} />
                Cut
              </button>
            </>
        )}

        {/* Paste option when clipboard has items */}
        {hasClipboardItems && (
            <button
                onClick={handlePaste}
                className={styles.menuItem}
            >
              <Clipboard size={16} />
              Paste
            </button>
        )}

        {/* Options when a single item is right-clicked */}
        {item && (
            <>
              <hr className={styles.divider} />
              <button
                  onClick={handleRename}
                  className={styles.menuItem}
              >
                <Pencil size={16} />
                Rename
              </button>
              <button
                  onClick={handleDelete}
                  className={`${styles.menuItem} ${styles.dangerItem}`}
              >
                <Trash size={16} />
                Delete
              </button>

              {hasSingleNonFolderSelected && (
                  <button
                      onClick={handleDownload}
                      className={styles.menuItem}
                  >
                    <Download size={16} />
                    Download
                  </button>
              )}

              {hasViewableItem && (
                  <button
                      onClick={handleView}
                      className={styles.menuItem}
                  >
                    <Eye size={16} />
                    View
                  </button>
              )}
            </>
        )}

        <hr className={styles.divider} />
        <button
            onClick={handleRefresh}
            className={styles.menuItem}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>
  );
};

export default FileContextMenu;