// src/components/FileManager/components/FileItem.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Folder,
  FileText,
  Image,
  File,
  Video,
  Archive,
  MoreVertical,
  Download,
  Pencil,
  Trash,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { FileItem as FileItemType } from '../types';
import { useFileManager } from '../hooks/useFileManager';
import { useFileOperations } from '../hooks/useFileOperations';
import { useFolderOperations } from '../hooks/useFolderOperations';
import { formatFileSize, formatDate } from '../utils/formatUtils';
import { getFileType } from '../utils/fileTypeUtils';

/* eslint-disable @typescript-eslint/no-explicit-any */

interface FileItemProps {
  item: FileItemType;
  viewMode: 'list' | 'grid';
}

const FileItem: React.FC<FileItemProps> = ({ item, viewMode }) => {
  const {
    selectItem,
    setCurrentFolder,
    state: { selectedItems },
  } = useFileManager();

  const { deleteFiles, renameFile, downloadFile } = useFileOperations();
  const { renameFolder } = useFolderOperations();

  const [showActions, setShowActions] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  const [showNameTooltip, setShowNameTooltip] = useState(false);
  const [showMd5Tooltip, setShowMd5Tooltip] = useState(false);
  const [nameCopied, setNameCopied] = useState(false);
  const [md5Copied, setMd5Copied] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const nameRef = useRef<HTMLDivElement>(null);
  const md5Ref = useRef<HTMLDivElement>(null);

  // Determine if the item is a folder based on type or isFolder property
  const isFolder = item.type === 'folder' || item.isFolder === true;

  const isSelected = selectedItems.includes(item.id);

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setShowActions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset copy states after timeout
  useEffect(() => {
    if (nameCopied) {
      const timer = setTimeout(() => {
        setNameCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [nameCopied]);

  useEffect(() => {
    if (md5Copied) {
      const timer = setTimeout(() => {
        setMd5Copied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [md5Copied]);

  // Update tooltip position for name
  const updateNameTooltipPosition = () => {
    if (nameRef.current) {
      const rect = nameRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left,
        y: rect.top - 30,
      });
    }
  };

  // Update tooltip position for MD5
  const updateMd5TooltipPosition = () => {
    if (md5Ref.current) {
      const rect = md5Ref.current.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left,
        y: rect.top - 30,
      });
    }
  };

  // Handle item click (select)
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectItem(item.id, e.ctrlKey || e.metaKey || e.shiftKey);
  };

  // Handle item double click (open folder)
  const handleDoubleClick = () => {
    if (isFolder) {
      setCurrentFolder(item.id, item.path || `/${item.name}`);
    } else if (item.url) {
      // Open file in a new tab if URL is available
      window.open(item.url, '_blank');
    }
  };

  // Handle checkbox click
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    // 항상 다중 선택 모드 활성화 (Ctrl 키를 누른 것처럼)
    selectItem(item.id, true);
  };

  // Handle rename item
  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActions(false);

    const newName = prompt('Enter new name:', item.name);
    if (newName && newName.trim() !== '' && newName !== item.name) {
      if (isFolder) {
        renameFolder(item.id.toString(), newName.trim());
      } else {
        renameFile(item.id.toString(), newName.trim());
      }
    }
  };

  // Handle delete item
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActions(false);

    const confirmMessage = `Are you sure you want to delete "${item.name}"?`;
    if (window.confirm(confirmMessage)) {
      deleteFiles([item.id.toString()]);
    }
  };

  // Handle download item
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActions(false);

    if (!isFolder && item.url) {
      window.open(item.url, '_blank');
    } else if (!isFolder) {
      downloadFile(item.id.toString());
    }
  };

  // Handle copy to clipboard
  const copyToClipboard = (text: string, type: 'name' | 'md5') => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        if (type === 'name') {
          setNameCopied(true);
        } else {
          setMd5Copied(true);
        }
      })
      .catch((err) => {
        console.error('Could not copy text: ', err);
      });
  };

  // Get creation and modification dates
  const getCreationDate = () => {
    return item.createdAt || item.createAt || '';
  };

  const getModificationDate = () => {
    return item.modifiedAt || item.modifiedDate || '';
  };

  // Get file icon based on type
  const getFileIcon = () => {
    if (isFolder) {
      return <Folder className="text-yellow-500" />;
    }

    const fileType = item.type || getFileType(item.name);

    switch (fileType) {
      case 'image':
        return <Image className="text-green-500" />;
      case 'video':
        return <Video className="text-purple-500" />;
      case 'pdf':
        return <FileText className="text-red-500" />;
      case 'zip':
        return <Archive className="text-blue-500" />;
      default:
        return <File className="text-gray-500" />;
    }
  };

  // Tooltip component
  const Tooltip = ({ content }: { content: string }) => (
    <div
      className="fixed z-50 min-w-32 max-w-xs whitespace-normal break-words rounded bg-black/90 px-2 py-1 text-xs text-white"
      style={{
        top: `${tooltipPosition.y}px`,
        left: `${tooltipPosition.x}px`,
      }}
    >
      {content}
    </div>
  );

  // Render list view
  if (viewMode === 'list') {
    return (
      <div
        className={`grid cursor-pointer grid-cols-12 items-center gap-2 border-b border-gray-100 px-4 py-2 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800 ${
          isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
        }`}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        {/* Checkbox */}
        <div className="col-span-1 shrink-0" onClick={handleCheckboxClick}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}} // React needs an onChange handler, but we handle clicks in the div's onClick
            className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>

        {/* Icon or Thumbnail & Name */}
        <div className="col-span-5 flex min-w-0 items-center">
          {/* Icon or Thumbnail */}
          <div className="mr-3 flex size-6 shrink-0 items-center justify-center">
            {item.thumbnail ? (
              <img
                src={item.thumbnail}
                alt={item.name}
                className="size-6 rounded object-cover"
                onError={(e: any) => {
                  // Fallback to icon if thumbnail fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling!.style.display = 'block';
                }}
              />
            ) : (
              getFileIcon()
            )}
            {/* Hidden icon for thumbnail fallback */}
            {item.thumbnail && <div className="hidden">{getFileIcon()}</div>}
          </div>

          <div className="group min-w-0 grow">
            <div
              ref={nameRef}
              className="flex items-center truncate text-sm font-medium text-gray-900 dark:text-gray-100"
              onMouseEnter={() => {
                updateNameTooltipPosition();
                setShowNameTooltip(true);
              }}
              onMouseLeave={() => setShowNameTooltip(false)}
            >
              <span className="truncate">{item.name}</span>
              <button
                className="ml-1 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(item.name, 'name');
                }}
                title="Copy name to clipboard"
              >
                {nameCopied ? (
                  <Check size={14} className="text-green-500" />
                ) : (
                  <Copy
                    size={14}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  />
                )}
              </button>
              {showNameTooltip && <Tooltip content={item.name} />}
            </div>
            {!isFolder && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatFileSize(item.size)}
              </div>
            )}
          </div>
        </div>

        {/* File Size */}
        <div className="col-span-2 truncate text-sm text-gray-500 dark:text-gray-400">
          {!isFolder ? formatFileSize(item.size) : '—'}
        </div>

        {/* Modified Date */}
        <div className="col-span-2 truncate text-sm text-gray-500 dark:text-gray-400">
          {getModificationDate()
            ? formatDate(getModificationDate())
            : getCreationDate()
              ? formatDate(getCreationDate())
              : '—'}
        </div>

        {/* File MD5 */}
        <div
          ref={md5Ref}
          className="group relative col-span-1 flex items-center truncate text-sm text-gray-500 dark:text-gray-400"
          onMouseEnter={() => {
            if (item.md5) {
              updateMd5TooltipPosition();
              setShowMd5Tooltip(true);
            }
          }}
          onMouseLeave={() => setShowMd5Tooltip(false)}
        >
          {item.md5 ? (
            <>
              <span className="truncate">{item.md5.substring(0, 8)}</span>
              <button
                className="ml-1 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(item.md5!, 'md5');
                }}
                title="Copy MD5 to clipboard"
              >
                {md5Copied ? (
                  <Check size={14} className="text-green-500" />
                ) : (
                  <Copy
                    size={14}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  />
                )}
              </button>
              {showMd5Tooltip && <Tooltip content={item.md5} />}
            </>
          ) : (
            '—'
          )}
        </div>

        {/* Actions */}
        <div className="col-span-1 flex justify-end" ref={actionsRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            className="rounded-full p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <MoreVertical size={16} />
          </button>

          {showActions && (
            <div className="absolute z-10 mt-6 w-48 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
              {!isFolder && item.url && (
                <button
                  onClick={handleDownload}
                  className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Download size={16} className="mr-2" />
                  Download
                </button>
              )}
              {!isFolder && item.url && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(item.url!, '_blank');
                    setShowActions(false);
                  }}
                  className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <ExternalLink size={16} className="mr-2" />
                  Open in New Tab
                </button>
              )}
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
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render grid view
  return (
    <div
      className={`group relative flex cursor-pointer flex-col items-center rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 ${
        isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Checkbox (top-left) */}
      <div className="absolute left-2 top-2 z-10" onClick={handleCheckboxClick}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => {}} // React needs an onChange handler, but we handle clicks in the div's onClick
          className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </div>

      {/* Thumbnail or Icon */}
      <div className="mb-2 flex size-24 items-center justify-center overflow-hidden">
        {item.thumbnail && !isFolder ? (
          <img
            src={item.thumbnail}
            alt={item.name}
            className="max-h-full max-w-full rounded object-contain"
            onError={(e) => {
              // Fallback to icon if thumbnail fails to load
              e.currentTarget.style.display = 'none';
              (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
            }}
          />
        ) : (
          <div className="text-4xl">{getFileIcon()}</div>
        )}
        {/* Hidden icon for thumbnail fallback */}
        {item.thumbnail && !isFolder && <div className="hidden text-4xl">{getFileIcon()}</div>}
      </div>

      <div className="w-full text-center">
        <div
          ref={nameRef}
          className="group relative inline-flex max-w-full items-center truncate text-sm font-medium text-gray-900 dark:text-gray-100"
          onMouseEnter={() => {
            updateNameTooltipPosition();
            setShowNameTooltip(true);
          }}
          onMouseLeave={() => setShowNameTooltip(false)}
        >
          <span className="truncate">{item.name}</span>
          <button
            className="ml-1 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard(item.name, 'name');
            }}
            title="Copy name to clipboard"
          >
            {nameCopied ? (
              <Check size={14} className="text-green-500" />
            ) : (
              <Copy
                size={14}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              />
            )}
          </button>
          {showNameTooltip && <Tooltip content={item.name} />}
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          {isFolder ? 'Folder' : formatFileSize(item.size)}
        </div>

        {/* MD5 in grid view */}
        {item.md5 && (
          <div
            ref={md5Ref}
            className="group relative inline-flex max-w-full items-center truncate text-xs text-gray-500 dark:text-gray-400"
            onMouseEnter={() => {
              updateMd5TooltipPosition();
              setShowMd5Tooltip(true);
            }}
            onMouseLeave={() => setShowMd5Tooltip(false)}
          >
            <span className="truncate">MD5: {item.md5.substring(0, 8)}</span>
            <button
              className="ml-1 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(item.md5!, 'md5');
              }}
              title="Copy MD5 to clipboard"
            >
              {md5Copied ? (
                <Check size={14} className="text-green-500" />
              ) : (
                <Copy
                  size={14}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                />
              )}
            </button>
            {showMd5Tooltip && <Tooltip content={item.md5} />}
          </div>
        )}
      </div>

      <div
        className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
        ref={actionsRef}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowActions(!showActions);
          }}
          className="rounded-full bg-white p-1 text-gray-500 shadow-sm hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <MoreVertical size={16} />
        </button>

        {showActions && (
          <div className="absolute right-0 z-10 mt-1 w-48 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            {!isFolder && item.url && (
              <button
                onClick={handleDownload}
                className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <Download size={16} className="mr-2" />
                Download
              </button>
            )}
            {!isFolder && item.url && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(item.url!, '_blank');
                  setShowActions(false);
                }}
                className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <ExternalLink size={16} className="mr-2" />
                Open in New Tab
              </button>
            )}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default FileItem;
