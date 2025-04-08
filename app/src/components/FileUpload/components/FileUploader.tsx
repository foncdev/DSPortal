import React, { useState, useCallback } from 'react';
import { useFileUpload } from '../hooks/useFileUpload';
import { Dropzone } from './Dropzone';
import { ProgressBar } from './ProgressBar';
import { ThumbnailPreview } from './ThumbnailPreview';
import { FileInfo, FileType, UploadConfig } from '../types';
import { formatFileSize } from '../utils';
import { Play, Pause, Check, X, Upload, RefreshCw, Trash } from 'lucide-react';
import styles from '../FileUpload.module.scss';

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
                            className={`${styles.btn} ${styles.btnPrimary}`}
                        >
                            <Upload size={16} /> 업로드
                        </button>

                        <div className={styles.uploadModeSelector}>
                            <span className={styles.uploadModeLabel}>업로드 방식:</span>
                            <select
                                className={styles.uploadModeSelect}
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
                            className={`${styles.btn} ${styles.btnGray}`}
                            style={{ marginLeft: 'auto' }}
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
                            className={`${styles.btn} ${styles.btnWarning}`}
                        >
                            <Pause size={16} /> 일시 정지
                        </button>

                        <button
                            type="button"
                            onClick={cancelUpload}
                            className={`${styles.btn} ${styles.btnGray}`}
                            style={{ marginLeft: '0.5rem' }}
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
                            className={`${styles.btn} ${styles.btnSuccess}`}
                        >
                            <Play size={16} /> 계속하기
                        </button>

                        <button
                            type="button"
                            onClick={cancelUpload}
                            className={`${styles.btn} ${styles.btnGray}`}
                            style={{ marginLeft: '0.5rem' }}
                        >
                            <X size={16} /> 취소
                        </button>
                    </>
                );

            case 'completed':
                return (
                    <>
                        <div className={`${styles.statusIndicator} ${styles.statusSuccess}`}>
                            <Check size={16} /> 업로드 완료
                        </div>

                        <button
                            type="button"
                            onClick={handleNewFile}
                            className={`${styles.btn} ${styles.btnPrimary}`}
                            style={{ marginLeft: '0.5rem' }}
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
                            className={`${styles.btn} ${styles.btnPrimary}`}
                        >
                            <RefreshCw size={16} /> 다시 시도
                        </button>

                        <button
                            type="button"
                            onClick={handleNewFile}
                            className={`${styles.btn} ${styles.btnGray}`}
                            style={{ marginLeft: '0.5rem' }}
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
        <div className={`${styles.uploaderContainer} ${className}`}>
            {!fileInfo ? (
                <Dropzone
                    onFileDrop={handleFileSelect}
                    acceptedTypes={acceptedTypes}
                    disabled={isUploading}
                />
            ) : (
                <div className={styles.fileInfoContainer}>
                    {/* 파일 미리보기 */}
                    <div className={styles.previewSection}>
                        <ThumbnailPreview fileInfo={fileInfo} />
                    </div>

                    {/* 파일 정보 및 컨트롤 */}
                    <div className={styles.infoSection}>
                        <div className={styles.fileInfoHeader}>
                            <h3 className={styles.fileName} title={fileInfo.name}>
                                {fileInfo.name}
                            </h3>
                            <p className={styles.fileDetails}>
                                {formatFileSize(fileInfo.size)} · {fileInfo.type}
                            </p>
                        </div>

                        {/* 업로드 진행 상태 */}
                        <div className={styles.progressSection}>
                            <div className={styles.progressHeader}>
                <span className={styles.statusText}>
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
                                    <span className={styles.chunkInfo}>
                    {fileInfo.chunks.uploaded}/{fileInfo.chunks.total} 청크
                  </span>
                                )}
                            </div>

                            <ProgressBar
                                progress={fileInfo.status === 'pending' ? 0 : uploadProgress}
                                status={fileInfo.status === 'completed'
                                    ? 'completed'
                                    : fileInfo.status === 'error'
                                        ? 'error'
                                        : fileInfo.status === 'paused'
                                            ? 'paused'
                                            : 'uploading'}
                            />
                        </div>

                        {/* 오류 메시지 */}
                        {error && (
                            <div className={styles.errorMessage}>
                                {error}
                            </div>
                        )}

                        {/* 컨트롤 버튼 */}
                        <div className={styles.controls}>{renderUploadControls()}</div>

                        {/* 파일 메타데이터 표시 */}
                        {fileInfo.metadata && Object.keys(fileInfo.metadata).length > 0 && (
                            <div className={styles.metadataSection}>
                                <h4 className={styles.metadataTitle}>파일 정보</h4>
                                <div className={styles.metadataGrid}>
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
            )}
        </div>
    );
};