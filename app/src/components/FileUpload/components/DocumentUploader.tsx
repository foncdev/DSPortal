/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { FileUploader } from './FileUploader';
import { UploadConfig, FileInfo } from '../types';

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
}) => {
  return (
    <div className={className}>
      <h2 className="text-xl font-semibold mb-4">문서 업로드</h2>
      <p className="text-gray-600 mb-4">.pdf 형식의 문서 파일을 업로드할 수 있습니다.</p>

      <FileUploader
        acceptedTypes={['document']}
        uploadConfig={uploadConfig}
        onUploadComplete={onUploadComplete}
        onUploadProgress={onUploadProgress}
        onUploadError={onUploadError}
      />
    </div>
  );
};
