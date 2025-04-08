import React, { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import { FILE_TYPE_CONFIGS } from '../config';
import { formatFileSize } from '../utils';
import styles from '../FileUpload.module.scss';

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

    const getAcceptedFileTypes = (): string => {
        return acceptedTypes
            .map((type) => {
                switch(type) {
                    case 'image': return '이미지';
                    case 'video': return '비디오';
                    case 'document': return '문서';
                    case 'archive': return '압축 파일';
                    case 'application': return '앱 파일';
                    default: return type;
                }
            })
            .join(', ');
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
            className={`${styles.dropzone} ${isDragging ? styles.dragging : ''} ${
                disabled ? styles.disabled : ''
            } ${className}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input
                type="file"
                className={styles.dropzoneInput}
                onChange={handleChange}
                accept={getAcceptString()}
                disabled={disabled}
            />

            <div className={styles.dropzoneContent}>
                <Upload className={styles.dropzoneIcon} />
                <p className={styles.dropzoneTitle}>
                    파일을 드래그하거나 클릭하여 업로드
                </p>
                <p className={styles.dropzoneText}>
                    {getAcceptedFileTypes()} 파일만 가능
                    {maxSize && ` (최대 ${formatFileSize(maxSize)})`}
                </p>
            </div>
        </div>
    );
};