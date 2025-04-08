// src/components/FileUpload/config.ts
import { FileTypeConfig, ThumbnailConfig, UploadConfig } from './types';

export const FILE_TYPE_CONFIGS: Record<string, FileTypeConfig> = {
  image: {
    accept: '.png,.jpg,.jpeg,.gif',
    maxSize: 30 * 1024 * 1024, // 30MB
    mimeTypes: ['image/png', 'image/jpeg', 'image/gif'],
  },
  video: {
    accept: '.mp4,.avi,.mov,.mp3',
    maxSize: 1024 * 1024 * 1024, // 1GB
    mimeTypes: ['video/mp4', 'video/avi', 'video/quicktime', 'audio/mpeg'],
  },
  document: {
    accept: '.pdf',
    maxSize: 100 * 1024 * 1024, // 100MB
    mimeTypes: ['application/pdf'],
  },
  archive: {
    accept: '.zip',
    maxSize: 500 * 1024 * 1024, // 500MB
    mimeTypes: ['application/zip'],
  },
  application: {
    accept: '.apk',
    maxSize: 500 * 1024 * 1024, // 500MB
    mimeTypes: ['application/vnd.android.package-archive'],
  },
};

export const DEFAULT_THUMBNAIL_CONFIG: ThumbnailConfig = {
  dimensions: [
    { width: 480, height: 360 }, // 4:3
    { width: 640, height: 360 }, // 16:9
  ],
  quality: 0.7,
};

export const DEFAULT_UPLOAD_CONFIG: UploadConfig = {
  chunkSize: 2 * 1024 * 1024, // 2MB chunks
  retryCount: 3,
  retryDelay: 1000,
  concurrentUploads: 1, // Only upload one file at a time
};
