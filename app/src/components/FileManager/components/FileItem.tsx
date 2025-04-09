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

  // 아이템이 폴더인지 판별
  const isFolder = item.type === 'folder' || item.isFolder === true;
  // 선택된 아이템인지 확인
  const isSelected = selectedItems.includes(item.id);

  // 액션 메뉴 외부 클릭 시 닫기
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

  // 복사 상태 초기화 타이머
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

  // 툴팁 위치 업데이트 - 파일명
  const updateNameTooltipPosition = (event: React.MouseEvent) => {
    // 마우스 위치를 기반으로 툴팁 위치 계산
    setTooltipPosition({
      x: event.clientX,
      y: event.clientY - 30
    });
  };

  // 툴팁 위치 업데이트 - MD5
  const updateMd5TooltipPosition = (event: React.MouseEvent) => {
    // 마우스 위치를 기반으로 툴팁 위치 계산
    setTooltipPosition({
      x: event.clientX,
      y: event.clientY - 30
    });
  };

  // 아이템 클릭 (선택)
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectItem(item.id, e.ctrlKey || e.metaKey || e.shiftKey);
  };

  // 아이템 더블 클릭 (폴더 열기/파일 실행)
  const handleDoubleClick = () => {
    if (isFolder) {
      setCurrentFolder(item.id, item.path || `/${item.name}`);
    } else if (item.url) {
      window.open(item.url, '_blank');
    }
  };

  // 체크박스 클릭
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectItem(item.id, true);
  };

  // 이름 변경
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

  // 삭제
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActions(false);

    const confirmMessage = `Are you sure you want to delete "${item.name}"?`;
    if (window.confirm(confirmMessage)) {
      deleteFiles([item.id.toString()]);
    }
  };

  // 다운로드
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActions(false);

    if (!isFolder && item.url) {
      window.open(item.url, '_blank');
    } else if (!isFolder) {
      downloadFile(item.id.toString());
    }
  };

  // 클립보드에 복사
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

  // 생성 및 수정 날짜 가져오기
  const getCreationDate = () => item.createdAt || item.createAt || '';

  const getModificationDate = () => item.modifiedAt || item.modifiedDate || '';

  // 파일 타입에 따른 아이콘 가져오기
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

  // 리스트 뷰의 아이콘/썸네일 렌더링
  const renderListViewIcon = () => {
    if (item.thumbnail && !isFolder) {
      return (
          <div className={styles.icon}>
            <img
                src={item.thumbnail}
                alt={item.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallbackIcon = document.createElement('div');
                  fallbackIcon.className = 'flex items-center justify-center';
                  fallbackIcon.appendChild(getFileIcon().props.children);
                  e.currentTarget.parentElement?.appendChild(fallbackIcon);
                }}
            />
          </div>
      );
    }

    return (
        <div className={styles.icon}>
          {getFileIcon()}
        </div>
    );
  };

  // 그리드 뷰의 아이콘/썸네일 렌더링
  const renderGridViewThumbnail = () => {
    if (item.thumbnail && !isFolder) {
      return (
          <div className={styles.gridThumbnail}>
            <img
                src={item.thumbnail}
                alt={item.name}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const iconWrapper = document.createElement('div');
                  iconWrapper.className = styles.iconLarge;
                  iconWrapper.appendChild(getFileIcon().props.children);
                  e.currentTarget.parentElement?.appendChild(iconWrapper);
                }}
            />
          </div>
      );
    }

    return (
        <div className={styles.gridThumbnail}>
          <div className={styles.iconLarge}>{getFileIcon()}</div>
        </div>
    );
  };

  // 툴팁 컴포넌트
  const Tooltip = ({ content }: { content: string }) => (
      <div
          className={styles.tooltip}
          style={{
            top: `${tooltipPosition.y}px`,
            left: `${tooltipPosition.x}px`,
            transform: 'translateX(-50%)' // 마우스 위치 중앙에 놓이도록 조정
          }}
      >
        {content}
      </div>
  );

  // 리스트 뷰 렌더링
  if (viewMode === 'list') {
    return (
        <div
            className={`${styles.listItem} ${styles.item} ${isSelected ? styles.selected : ''}`}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
        >
          {/* 체크박스 */}
          <div className={styles.checkbox} onClick={handleCheckboxClick}>
            <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {}}
                className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>

          {/* 아이콘/썸네일 & 이름 */}
          <div className={styles.fileInfo}>
            {/* 아이콘 또는 썸네일 */}
            {renderListViewIcon()}

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

          {/* 파일 크기 */}
          <div className={styles.fileMetaInfo}>
            {!isFolder ? formatFileSize(item.size) : '—'}
          </div>

          {/* 수정 날짜 */}
          <div className={styles.fileMetaInfo}>
            {getModificationDate()
                ? formatDate(getModificationDate())
                : getCreationDate()
                    ? formatDate(getCreationDate())
                    : '—'}
          </div>

          {/* 파일 MD5 */}
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

          {/* 액션 버튼 */}
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

  // 그리드 뷰 렌더링
  return (
      <div
          className={`${styles.gridItem} ${styles.item} ${isSelected ? styles.selected : ''}`}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
      >
        {/* 체크박스 (좌상단) */}
        <div className={styles.gridCheckbox} onClick={handleCheckboxClick}>
          <input
              type="checkbox"
              checked={isSelected}
              onChange={() => {}} // React needs an onChange handler, but we handle clicks in the div's onClick
              aria-label={`Select ${item.name}`}
          />
        </div>

        {/* 썸네일 또는 아이콘 */}
        {renderGridViewThumbnail()}

        <div className={styles.gridInfo}>
          <div
              ref={nameRef}
              className={styles.gridFileName}
              onMouseEnter={(e) => {
                updateNameTooltipPosition(e);
                setShowNameTooltip(true);
              }}
              onMouseMove={(e) => updateNameTooltipPosition(e)}
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

          {/* 그리드 뷰에서 MD5 표시 */}
          {item.md5 && (
              <div
                  ref={md5Ref}
                  className={styles.fileMd5}
                  onMouseEnter={(e) => {
                    if (item.md5) {
                      updateMd5TooltipPosition(e);
                      setShowMd5Tooltip(true);
                    }
                  }}
                  onMouseMove={(e) => item.md5 && updateMd5TooltipPosition(e)}
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