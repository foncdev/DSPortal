// src/components/FileUpload/components/FileUploader.tsx
import React, { useState, useCallback } from 'react';
import { useFileUpload } from '../hooks/useFileUpload';
import { Dropzone } from './Dropzone';
import { ProgressBar } from './ProgressBar';
import { ThumbnailPreview } from './ThumbnailPreview';
import { FileInfo, FileType, UploadConfig } from '../types';
import { formatFileSize } from '../utils';
import { Play, Pause, Check, X, Upload, RefreshCw, Trash } from 'lucide-react';

interface FileUploaderProps {
  acceptedTypes: FileType[];
  multiple?: boolean;
  className?: string;
  uploadConfig?: Partial<UploadConfig>;
  onUploadComplete?: (fileInfo: FileInfo) => void;
  onUploadError?: (error: Error, fileInfo: FileInfo) => void;
  onUploadProgress?: (progress: number, fileInfo: FileInfo) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  acceptedTypes,
  className = '',
  uploadConfig,
  onUploadComplete,
  onUploadError,
  onUploadProgress,
}) => {
  const [uploadMode, setUploadMode] = useState<'chunked' | 'single'>('single');

  const {
    fileInfo,
    isUploading,
    uploadProgress,
    error,
    handleFileSelect,
    uploadFile,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    resetUpload,
  } = useFileUpload({
    acceptedTypes,
    uploadConfig,
    onUploadComplete,
    onUploadError,
    onUploadProgress,
  });

  const handleUpload = useCallback(() => {
    // 오류 상태에서 다시 시도할 때 정리 작업
    if (fileInfo?.status === 'error') {
      // 파일 정보는 유지하지만 상태를 초기화
      cancelUpload();
      // 약간의 지연 후 업로드 시작
      setTimeout(() => {
        uploadFile(uploadMode === 'chunked');
      }, 100);
      return;
    }

    uploadFile(uploadMode === 'chunked');
  }, [fileInfo, uploadFile, uploadMode, cancelUpload]);

  const handleNewFile = useCallback(() => {
    resetUpload();
  }, [resetUpload]);

  const renderUploadControls = () => {
    if (!fileInfo) return null;

    switch (fileInfo.status) {
      case 'pending':
        return (
          <>
            <button
              type="button"
              onClick={handleUpload}
              className="flex items-center gap-1 rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Upload size={16} /> 업로드
            </button>

            <div className="ml-4 flex items-center">
              <span className="mr-2 text-sm text-gray-600">업로드 방식:</span>
              <select
                className="rounded border p-1 text-sm"
                value={uploadMode}
                onChange={(e) => setUploadMode(e.target.value as 'chunked' | 'single')}
              >
                <option value="single">한 번에 업로드</option>
                <option value="chunked">청크 업로드</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleNewFile}
              className="ml-auto flex items-center gap-1 rounded bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300"
            >
              <Trash size={16} /> 취소
            </button>
          </>
        );

      case 'uploading':
        return (
          <>
            <button
              type="button"
              onClick={pauseUpload}
              className="flex items-center gap-1 rounded bg-yellow-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-yellow-700"
            >
              <Pause size={16} /> 일시 정지
            </button>

            <button
              type="button"
              onClick={cancelUpload}
              className="ml-2 flex items-center gap-1 rounded bg-gray-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-600"
            >
              <X size={16} /> 취소
            </button>
          </>
        );

      case 'paused':
        return (
          <>
            <button
              type="button"
              onClick={resumeUpload}
              className="flex items-center gap-1 rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
            >
              <Play size={16} /> 계속하기
            </button>

            <button
              type="button"
              onClick={cancelUpload}
              className="ml-2 flex items-center gap-1 rounded bg-gray-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-600"
            >
              <X size={16} /> 취소
            </button>
          </>
        );

      case 'completed':
        return (
          <>
            <div className="flex items-center gap-1 rounded bg-green-100 px-3 py-1.5 text-sm font-medium text-green-800">
              <Check size={16} /> 업로드 완료
            </div>

            <button
              type="button"
              onClick={handleNewFile}
              className="ml-2 flex items-center gap-1 rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              <RefreshCw size={16} /> 새 파일 업로드
            </button>
          </>
        );

      case 'error':
        return (
          <>
            <button
              type="button"
              onClick={handleUpload}
              className="flex items-center gap-1 rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              <RefreshCw size={16} /> 다시 시도
            </button>

            <button
              type="button"
              onClick={handleNewFile}
              className="ml-2 flex items-center gap-1 rounded bg-gray-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-600"
            >
              <X size={16} /> 취소
            </button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {!fileInfo ? (
        <Dropzone
          onFileDrop={handleFileSelect}
          acceptedTypes={acceptedTypes}
          disabled={isUploading}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            {/* 파일 미리보기 */}
            <div className="w-1/3">
              <ThumbnailPreview fileInfo={fileInfo} className="w-full" />
            </div>

            {/* 파일 정보 및 컨트롤 */}
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="truncate text-lg font-medium text-gray-700" title={fileInfo.name}>
                  {fileInfo.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {formatFileSize(fileInfo.size)} · {fileInfo.type}
                </p>
              </div>

              {/* 업로드 진행 상태 */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {!fileInfo.status || fileInfo.status === 'pending'
                      ? '대기 중'
                      : fileInfo.status === 'uploading'
                        ? '업로드 중...'
                        : fileInfo.status === 'paused'
                          ? '일시 정지됨'
                          : fileInfo.status === 'completed'
                            ? '업로드 완료'
                            : fileInfo.status === 'error'
                              ? '오류 발생'
                              : ''}
                  </span>
                  {fileInfo.chunks && (
                    <span className="text-gray-500">
                      {fileInfo.chunks.uploaded}/{fileInfo.chunks.total} 청크
                    </span>
                  )}
                </div>
                {/* 항상 진행 표시줄 렌더링, 상태에 따라 다른 스타일 적용 */}
                <ProgressBar
                  progress={fileInfo.status === 'pending' ? 0 : uploadProgress}
                  color={
                    fileInfo.status === 'completed'
                      ? 'bg-green-500'
                      : fileInfo.status === 'error'
                        ? 'bg-red-500'
                        : fileInfo.status === 'paused'
                          ? 'bg-yellow-500'
                          : 'bg-blue-500'
                  }
                />
              </div>

              {/* 오류 메시지 */}
              {error && (
                <div className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* 컨트롤 버튼 */}
              <div className="flex items-center gap-2">{renderUploadControls()}</div>

              {/* 파일 메타데이터 표시 (선택 사항) */}
              {fileInfo.metadata && Object.keys(fileInfo.metadata).length > 0 && (
                <div className="mt-4 border-t pt-2">
                  <h4 className="mb-1 text-sm font-medium text-gray-600">파일 정보</h4>
                  <div className="grid grid-cols-2 gap-1 text-xs text-gray-500">
                    {fileInfo.metadata.width && fileInfo.metadata.height && (
                      <div>
                        해상도: {fileInfo.metadata.width} x {fileInfo.metadata.height}px
                      </div>
                    )}
                    {fileInfo.metadata.duration && (
                      <div>재생 시간: {Math.round(fileInfo.metadata.duration)}초</div>
                    )}
                    {fileInfo.metadata.codec && <div>코덱: {fileInfo.metadata.codec}</div>}
                    {fileInfo.metadata.bitrate && (
                      <div>비트레이트: {Math.round(fileInfo.metadata.bitrate / 1000)} kbps</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
