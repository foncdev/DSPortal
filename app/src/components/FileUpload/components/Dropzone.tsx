import React, { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import { FILE_TYPE_CONFIGS, formatFileSize } from '@/components/FileUpload';

interface DropzoneProps {
  onFileDrop: (file: File) => void;
  acceptedTypes: string[];
  maxSize?: number;
  disabled?: boolean;
  className?: string;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFileDrop,
  acceptedTypes,
  maxSize,
  disabled = false,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const getAcceptString = (): string => {
    return acceptedTypes.map((type) => FILE_TYPE_CONFIGS[type].accept).join(',');
  };

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled) return;

      setIsDragging(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      setIsDragging(false);

      if (disabled) return;

      if (e.dataTransfer.files?.length) {
        const file = e.dataTransfer.files[0]; // We only accept one file at a time
        onFileDrop(file);
      }
    },
    [disabled, onFileDrop],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;

      const files = e.target.files;
      if (files?.length) {
        onFileDrop(files[0]); // We only accept one file at a time
      }

      // Reset the input value so the same file can be uploaded again if needed
      e.target.value = '';
    },
    [disabled, onFileDrop],
  );

  return (
    <div
      className={`relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        ${disabled ? 'cursor-not-allowed opacity-50' : ''}
        ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="absolute inset-0 size-full cursor-pointer opacity-0"
        onChange={handleChange}
        accept={getAcceptString()}
        disabled={disabled}
      />

      <div className="flex flex-col items-center justify-center gap-2">
        <Upload className="size-10 text-gray-400" />
        <p className="text-lg font-medium text-gray-700">
          파일을 여기에 드래그하거나 클릭하여 업로드
        </p>
        <p className="text-sm text-gray-500">
          {acceptedTypes.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')} 파일만
          허용됩니다.
          {maxSize && ` (최대 ${formatFileSize(maxSize)})`}
        </p>
      </div>
    </div>
  );
};
