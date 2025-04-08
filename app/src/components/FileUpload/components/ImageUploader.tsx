/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { FileUploader } from './FileUploader';
import { UploadConfig, FileInfo } from '../types';

interface ImageUploaderProps {
  className?: string;
  uploadConfig?: Partial<UploadConfig>;
  onUploadComplete?: (fileInfo: FileInfo) => void;
  onUploadProgress?: (progress: number, fileInfo: FileInfo) => void;
  onUploadError?: (error: Error, fileInfo: FileInfo) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  className,
  uploadConfig,
  onUploadComplete,
  onUploadProgress,
  onUploadError,
}) => {
  return (
    <div className={className}>
      <h2 className="text-xl font-semibold mb-4">이미지 업로드</h2>
      <p className="text-gray-600 mb-4">
        .png, .jpg, .jpeg, .gif 형식의 이미지 파일을 업로드할 수 있습니다.
      </p>

      <FileUploader
        acceptedTypes={['image']}
        uploadConfig={uploadConfig}
        onUploadComplete={onUploadComplete}
        onUploadProgress={onUploadProgress}
        onUploadError={onUploadError}
      />
    </div>
  );
};
