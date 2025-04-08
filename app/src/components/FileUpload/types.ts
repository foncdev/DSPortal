// src/components/FileUpload/types.ts
export type FileType = 'image' | 'video' | 'document' | 'archive' | 'application';

export interface FileTypeConfig {
  accept: string;
  maxSize: number; // in bytes
  mimeTypes: string[];
}

export interface UploadConfig {
  chunkSize: number; // in bytes
  retryCount: number;
  retryDelay: number; // in ms
  concurrentUploads: number;
}

export interface ThumbnailConfig {
  dimensions: {
    width: number;
    height: number;
  }[];
  quality: number;
}

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  extension: string;
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'paused' | 'completed' | 'error';
  error?: string;
  uploadId?: string;
  chunks?: {
    total: number;
    uploaded: number;
    current: number;
  };
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    codec?: string;
    bitrate?: number;
    frameRate?: number;
  };
}
