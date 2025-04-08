import React, { useState, useRef } from 'react';
import {
  VideoUploader,
  ImageUploader,
  DocumentUploader,
  ApplicationUploader,
  ArchiveUploader,
} from '../components/FileUpload';
import { FileInfo } from '../components/FileUpload/types';
import {
  Image as ImageIcon,
  Video as VideoIcon,
  FileText as DocumentIcon,
  Archive as ArchiveIcon,
  Smartphone as AppIcon,
} from 'lucide-react';

import styles from './FileUploadDemo.module.scss';


type UploaderType = 'image' | 'video' | 'document' | 'archive' | 'application';

interface UploaderState {
  type: UploaderType;
  fileInfo: FileInfo | null;
  uploading: boolean;
}

const FileUploadDemo: React.FC = () => {
  const [activeUploader, setActiveUploader] = useState<UploaderType>('image');
  const [uploadedFiles, setUploadedFiles] = useState<FileInfo[]>([]);

  const [uploaderStates, setUploaderStates] = useState<Record<UploaderType, UploaderState>>({
    image: { type: 'image', fileInfo: null, uploading: false },
    video: { type: 'video', fileInfo: null, uploading: false },
    document: { type: 'document', fileInfo: null, uploading: false },
    archive: { type: 'archive', fileInfo: null, uploading: false },
    application: { type: 'application', fileInfo: null, uploading: false },
  });

  const uploaderRefs = useRef<Record<string, HTMLDivElement | null>>({
    image: null,
    video: null,
    document: null,
    archive: null,
    application: null,
  });

  const handleUploadProgress = (type: UploaderType) => (progress: number, fileInfo: FileInfo) => {
    setUploaderStates((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        fileInfo,
        uploading: fileInfo.status === 'uploading',
      },
    }));
  };

  const handleUploadComplete = (type: UploaderType) => (fileInfo: FileInfo) => {
    setUploadedFiles((prev) => [...prev, fileInfo]);
    setUploaderStates((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        fileInfo,
        uploading: false,
      },
    }));
  };

  const handleUploadError = (type: UploaderType) => (error: Error, fileInfo: FileInfo) => {
    console.error(`[${type}] 업로드 오류:`, error);
    setUploaderStates((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        fileInfo,
        uploading: false,
      },
    }));
  };

  const iconComponents = {
    image: <ImageIcon size={36} />,
    video: <VideoIcon size={36} />,
    document: <DocumentIcon size={36} />,
    archive: <ArchiveIcon size={36} />,
    application: <AppIcon size={36} />,
  };

  const typeLabels = {
    image: '이미지',
    video: '동영상',
    document: '문서',
    archive: '압축 파일',
    application: '애플리케이션',
  };

  const handleUploaderChange = (type: UploaderType) => {
    setActiveUploader(type);
    if (uploaderRefs.current[type]) {
      uploaderRefs.current[type]?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
      <div className={styles['file-upload-demo']}>
        <div className={styles.title}>파일 업로드 데모</div>
        <p className={styles.description}>
          다양한 유형의 파일을 업로드하고 진행 상황을 실시간으로 확인할 수 있습니다.
        </p>

        <div className={styles['type-selector']}>
          {Object.keys(typeLabels).map((type) => {
            const current = uploaderStates[type as UploaderType];
            const isActive = activeUploader === type;
            return (
                <button
                    key={type}
                    className={
                        `${styles['type-button']} ` +
                        `${isActive ? styles.active : ''} ` +
                        `${current.uploading ? styles.uploading : ''}`
                    }
                    onClick={() => handleUploaderChange(type as UploaderType)}
                >
                  <div className={`${styles.icon} ${isActive ? styles['icon-active'] : ''}`}>
                    {iconComponents[type as UploaderType]}
                  </div>
                  <span className={styles.label}>{typeLabels[type as UploaderType]}</span>
                  {current.uploading && <div className={`${styles['status-dot']} ${styles.uploading}`} />}
                  {!current.uploading && current.fileInfo?.status === 'completed' && (
                      <div className={`${styles['status-dot']} ${styles.completed}`} />
                  )}
                  {!current.uploading && current.fileInfo?.status === 'error' && (
                      <div className={`${styles['status-dot']} ${styles.error}`} />
                  )}
                </button>
            );
          })}
        </div>

        <div className={styles['upload-section']}>
          {(['image', 'video', 'document', 'archive', 'application'] as UploaderType[]).map((type) => (
              <div
                  key={type}
                  ref={(el) => (uploaderRefs.current[type] = el)}
                  className={
                      `${styles['uploader-container']} ` +
                      `${activeUploader === type ? styles.active : styles.inactive}`
                  }
              >
                {type === 'image' && (
                    <ImageUploader
                        onUploadComplete={handleUploadComplete('image')}
                        onUploadProgress={handleUploadProgress('image')}
                        onUploadError={handleUploadError('image')}
                    />
                )}
                {type === 'video' && (
                    <VideoUploader
                        onUploadComplete={handleUploadComplete('video')}
                        onUploadProgress={handleUploadProgress('video')}
                        onUploadError={handleUploadError('video')}
                    />
                )}
                {type === 'document' && (
                    <DocumentUploader
                        onUploadComplete={handleUploadComplete('document')}
                        onUploadProgress={handleUploadProgress('document')}
                        onUploadError={handleUploadError('document')}
                    />
                )}
                {type === 'archive' && (
                    <ArchiveUploader
                        onUploadComplete={handleUploadComplete('archive')}
                        onUploadProgress={handleUploadProgress('archive')}
                        onUploadError={handleUploadError('archive')}
                    />
                )}
                {type === 'application' && (
                    <ApplicationUploader
                        onUploadComplete={handleUploadComplete('application')}
                        onUploadProgress={handleUploadProgress('application')}
                        onUploadError={handleUploadError('application')}
                    />
                )}
              </div>
          ))}
        </div>

        {uploadedFiles.length > 0 && (
            <div className={styles['uploaded-files']}>
              <h2 className={styles.header}>업로드된 파일</h2>
              <div className={styles['file-list']}>
                {uploadedFiles.map((file, index) => (
                    <div key={index} className={styles['file-item']}>
                      {file.preview ? (
                          <div className={styles.preview}>
                            <img src={file.preview} alt={file.name} />
                          </div>
                      ) : (
                          <div className={`${styles.preview} ${styles['icon-preview']}`}>
                            {file.type.startsWith('image/') && <ImageIcon size={24} />}
                            {file.type.startsWith('video/') && <VideoIcon size={24} />}
                            {file.type.startsWith('application/pdf') && <DocumentIcon size={24} />}
                            {file.type.startsWith('application/zip') && <ArchiveIcon size={24} />}
                            {file.type.startsWith('application/vnd.android') && <AppIcon size={24} />}
                          </div>
                      )}
                      <div className={styles.info}>
                        <p className={styles.name} title={file.name}>{file.name}</p>
                        <p className={styles.status}>
                          <span className={styles.dot} /> 업로드 완료
                        </p>
                      </div>
                    </div>
                ))}
              </div>
            </div>
        )}
      </div>
  );
};

export default FileUploadDemo;
