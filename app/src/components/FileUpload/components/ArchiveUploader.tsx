import React from 'react';
import { FileUploader } from './FileUploader';
import { UploadConfig, FileInfo } from '../types';
import styles from '../FileUpload.module.scss';

interface ArchiveUploaderProps {
    className?: string;
    uploadConfig?: Partial<UploadConfig>;
    onUploadComplete?: (fileInfo: FileInfo) => void;
    onUploadProgress?: (progress: number, fileInfo: FileInfo) => void;
    onUploadError?: (error: Error, fileInfo: FileInfo) => void;
}

export const ArchiveUploader: React.FC<ArchiveUploaderProps> = ({
                                                                    className,
                                                                    uploadConfig,
                                                                    onUploadComplete,
                                                                    onUploadProgress,
                                                                    onUploadError,
                                                                }) => (
        <div className={className}>
            <h2 className={styles.uploaderTitle}>압축 파일 업로드</h2>
            <p className={styles.uploaderDescription}>
                .zip 형식의 압축 파일을 업로드할 수 있습니다.
            </p>

            <FileUploader
                acceptedTypes={['archive']}
                uploadConfig={uploadConfig}
                onUploadComplete={onUploadComplete}
                onUploadProgress={onUploadProgress}
                onUploadError={onUploadError}
            />
        </div>
    );