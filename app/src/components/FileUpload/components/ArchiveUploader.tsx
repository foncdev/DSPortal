/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { FileUploader } from './FileUploader';
import { UploadConfig, FileInfo } from '../types';

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
}) => {
  return (
    <div className={className}>
      <h2 className="text-xl font-semibold mb-4">압축 파일 업로드</h2>
      <p className="text-gray-600 mb-4">.zip 형식의 압축 파일을 업로드할 수 있습니다.</p>

      <FileUploader
        acceptedTypes={['archive']}
        uploadConfig={uploadConfig}
        onUploadComplete={onUploadComplete}
        onUploadProgress={onUploadProgress}
        onUploadError={onUploadError}
      />
    </div>
  );
};
