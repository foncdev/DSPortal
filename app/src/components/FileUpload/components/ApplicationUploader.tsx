import React from 'react';
import { FileUploader } from './FileUploader';
import { UploadConfig, FileInfo } from '../types';
import styles from '../FileUpload.module.scss';

interface ApplicationUploaderProps {
    className?: string;
    uploadConfig?: Partial<UploadConfig>;
    onUploadComplete?: (fileInfo: FileInfo) => void;
    onUploadProgress?: (progress: number, fileInfo: FileInfo) => void;
    onUploadError?: (error: Error, fileInfo: FileInfo) => void;
}

export const ApplicationUploader: React.FC<ApplicationUploaderProps> = ({
                                                                            className,
                                                                            uploadConfig,
                                                                            onUploadComplete,
                                                                            onUploadProgress,
                                                                            onUploadError,
                                                                        }) => {
    return (
        <div className={className}>
            <h2 className={styles.uploaderTitle}>애플리케이션 업로드</h2>
            <p className={styles.uploaderDescription}>
                .apk 형식의 애플리케이션 파일을 업로드할 수 있습니다.
            </p>

            <FileUploader
                acceptedTypes={['application']}
                uploadConfig={uploadConfig}
                onUploadComplete={onUploadComplete}
                onUploadProgress={onUploadProgress}
                onUploadError={onUploadError}
            />
        </div>
    );
};