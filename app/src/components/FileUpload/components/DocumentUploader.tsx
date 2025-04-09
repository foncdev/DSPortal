import React from 'react';
import { FileUploader } from './FileUploader';
import { UploadConfig, FileInfo } from '../types';
import styles from '../FileUpload.module.scss';

interface DocumentUploaderProps {
    className?: string;
    uploadConfig?: Partial<UploadConfig>;
    onUploadComplete?: (fileInfo: FileInfo) => void;
    onUploadProgress?: (progress: number, fileInfo: FileInfo) => void;
    onUploadError?: (error: Error, fileInfo: FileInfo) => void;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
                                                                      className,
                                                                      uploadConfig,
                                                                      onUploadComplete,
                                                                      onUploadProgress,
                                                                      onUploadError,
                                                                  }) => (
        <div className={className}>
            <h2 className={styles.uploaderTitle}>문서 업로드</h2>
            <p className={styles.uploaderDescription}>
                .pdf 형식의 문서 파일을 업로드할 수 있습니다.
            </p>

            <FileUploader
                acceptedTypes={['document']}
                uploadConfig={uploadConfig}
                onUploadComplete={onUploadComplete}
                onUploadProgress={onUploadProgress}
                onUploadError={onUploadError}
            />
        </div>
    );