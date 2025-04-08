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
import styles from './FileItem.module.scss';

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
          className={styles.tooltip}
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
            className={`${styles.listItem} ${styles.item} ${isSelected ? styles.selected : ''}`}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
        >
          {/* Checkbox */}
          <div className={styles.checkbox} onClick={handleCheckboxClick}>
            <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {}} // React needs an onChange handler, but we handle clicks in the div's onClick
                className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>

          {/* Icon or Thumbnail & Name */}
          <div className={styles.fileInfo}>
            {/* Icon or Thumbnail */}
            <div className={styles.icon}>
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

            <div className={styles.nameContainer}>
              <div
                  ref={nameRef}
                  className={styles.fileName}
                  onMouseEnter={() => {
                    updateNameTooltipPosition();
                    setShowNameTooltip(true);
                  }}
                  onMouseLeave={() => setShowNameTooltip(false)}
              >
                <span className={styles.nameText}>{item.name}</span>
                <button
                    className={styles.copyButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(item.name, 'name');
                    }}
                    title="Copy name to clipboard"
                >
                  {nameCopied ? (
                      <Check size={14} className={styles.copySuccess} />
                  ) : (
                      <Copy size={14} />
                  )}
                </button>
                {showNameTooltip && <Tooltip content={item.name} />}
              </div>
              {!isFolder && (
                  <div className={styles.fileSize}>
                    {formatFileSize(item.size)}
                  </div>
              )}
            </div>
          </div>

          {/* File Size */}
          <div className={styles.fileMetaInfo}>
            {!isFolder ? formatFileSize(item.size) : '—'}
          </div>

          {/* Modified Date */}
          <div className={styles.fileMetaInfo}>
            {getModificationDate()
                ? formatDate(getModificationDate())
                : getCreationDate()
                    ? formatDate(getCreationDate())
                    : '—'}
          </div>

          {/* File MD5 */}
          <div
              ref={md5Ref}
              className={styles.fileMd5}
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
                  <span>{item.md5.substring(0, 8)}</span>
                  <button
                      className={styles.copyButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(item.md5!, 'md5');
                      }}
                      title="Copy MD5 to clipboard"
                  >
                    {md5Copied ? (
                        <Check size={14} className={styles.copySuccess} />
                    ) : (
                        <Copy size={14} />
                    )}
                  </button>
                  {showMd5Tooltip && <Tooltip content={item.md5} />}
                </>
            ) : (
                '—'
            )}
          </div>

          {/* Actions */}
          <div className={styles.actionsContainer} ref={actionsRef}>
            <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActions(!showActions);
                }}
                className={styles.actionButton}
            >
              <MoreVertical size={16} />
            </button>

            {showActions && (
                <div className={styles.actionsMenu}>
                  {!isFolder && item.url && (
                      <button
                          onClick={handleDownload}
                          className={styles.menuItem}
                      >
                        <Download size={16} />
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
                          className={styles.menuItem}
                      >
                        <ExternalLink size={16} />
                        Open in New Tab
                      </button>
                  )}
                  <button
                      onClick={handleRename}
                      className={styles.menuItem}
                  >
                    <Pencil size={16} />
                    Rename
                  </button>
                  <button
                      onClick={handleDelete}
                      className={`${styles.menuItem} ${styles.menuItemDanger}`}
                  >
                    <Trash size={16} />
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
          className={`${styles.gridItem} ${styles.item} ${isSelected ? styles.selected : ''}`}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
      >
        {/* Checkbox (top-left) */}
        <div className={styles.gridCheckbox} onClick={handleCheckboxClick}>
          <input
              type="checkbox"
              checked={isSelected}
              onChange={() => {}} // React needs an onChange handler, but we handle clicks in the div's onClick
              className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>

        {/* Thumbnail or Icon */}
        <div className={styles.gridThumbnail}>
          {item.thumbnail && !isFolder ? (
              <img
                  src={item.thumbnail}
                  alt={item.name}
                  onError={(e) => {
                    // Fallback to icon if thumbnail fails to load
                    e.currentTarget.style.display = 'none';
                    (e.currentTarget.nextSibling as HTMLElement).style.display = 'flex';
                  }}
              />
          ) : (
              <div className={styles.iconLarge}>{getFileIcon()}</div>
          )}
          {/* Hidden icon for thumbnail fallback */}
          {item.thumbnail && !isFolder && <div className="hidden">{getFileIcon()}</div>}
        </div>

        <div className={styles.gridInfo}>
          <div
              ref={nameRef}
              className={styles.gridFileName}
              onMouseEnter={() => {
                updateNameTooltipPosition();
                setShowNameTooltip(true);
              }}
              onMouseLeave={() => setShowNameTooltip(false)}
          >
            <span className={styles.nameText}>{item.name}</span>
            <button
                className={styles.copyButton}
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(item.name, 'name');
                }}
                title="Copy name to clipboard"
            >
              {nameCopied ? (
                  <Check size={14} className={styles.copySuccess} />
              ) : (
                  <Copy size={14} />
              )}
            </button>
            {showNameTooltip && <Tooltip content={item.name} />}
          </div>

          <div className={styles.gridFileSize}>
            {isFolder ? 'Folder' : formatFileSize(item.size)}
          </div>

          {/* MD5 in grid view */}
          {item.md5 && (
              <div
                  ref={md5Ref}
                  className={styles.gridMd5}
                  onMouseEnter={() => {
                    updateMd5TooltipPosition();
                    setShowMd5Tooltip(true);
                  }}
                  onMouseLeave={() => setShowMd5Tooltip(false)}
              >
                <span>MD5: {item.md5.substring(0, 8)}</span>
                <button
                    className={styles.copyButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(item.md5!, 'md5');
                    }}
                    title="Copy MD5 to clipboard"
                >
                  {md5Copied ? (
                      <Check size={14} className={styles.copySuccess} />
                  ) : (
                      <Copy size={14} />
                  )}
                </button>
                {showMd5Tooltip && <Tooltip content={item.md5} />}
              </div>
          )}
        </div>

        <div
            className={styles.gridActions}
            ref={actionsRef}
        >
          <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className={styles.gridActionButton}
          >
            <MoreVertical size={16} />
          </button>

          {showActions && (
              <div className={styles.actionsMenu}>
                {!isFolder && item.url && (
                    <button
                        onClick={handleDownload}
                        className={styles.menuItem}
                    >
                      <Download size={16} />
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
                        className={styles.menuItem}
                    >
                      <ExternalLink size={16} />
                      Open in New Tab
                    </button>
                )}
                <button
                    onClick={handleRename}
                    className={styles.menuItem}
                >
                  <Pencil size={16} />
                  Rename
                </button>
                <button
                    onClick={handleDelete}
                    className={`${styles.menuItem} ${styles.menuItemDanger}`}
                >
                  <Trash size={16} />
                  Delete
                </button>
              </div>
          )}
        </div>
      </div>
  );
};

export default FileItem;