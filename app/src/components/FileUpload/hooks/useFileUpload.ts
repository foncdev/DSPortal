/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useRef } from 'react';
import { FileInfo, UploadConfig } from '../types';
import {
  getFileExtension,
  getFileType,
  validateFile,
  generateThumbnail,
  extractVideoMetadata,
  extractImageMetadata,
} from '../utils';
import { DEFAULT_UPLOAD_CONFIG } from '../config';
import { initiateUpload, uploadChunk, finalizeUpload, extractUploadMetadata } from '../api';

interface UseFileUploadOptions {
  acceptedTypes: string[];
  uploadConfig?: Partial<UploadConfig>;
  onUploadComplete?: (fileInfo: FileInfo) => void;
  onUploadError?: (error: Error, fileInfo: FileInfo) => void;
  onUploadProgress?: (progress: number, fileInfo: FileInfo) => void;
}

export const useFileUpload = ({
  acceptedTypes,
  uploadConfig = {},
  onUploadComplete,
  onUploadError,
  onUploadProgress,
}: UseFileUploadOptions) => {
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // 업로드 작업을 추적하기 위한 ref
  const uploadControllerRef = useRef<AbortController | null>(null);

  const config: UploadConfig = { ...DEFAULT_UPLOAD_CONFIG, ...uploadConfig };

  // 업로드 상태 완전 초기화
  const resetUpload = useCallback(() => {
    // 진행 중인 업로드가 있다면 중단
    if (uploadControllerRef.current) {
      uploadControllerRef.current.abort();
      uploadControllerRef.current = null;
    }

    setFileInfo(null);
    setIsUploading(false);
    setUploadProgress(0);
    setError(null);
  }, []);

  // 파일 처리 함수
  const processFile = useCallback(async (file: File): Promise<FileInfo> => {
    const extension = getFileExtension(file.name);
    const fileType = getFileType(file);

    if (!fileType) {
      throw new Error('지원되지 않는 파일 형식입니다.');
    }

    let preview: string | undefined;
    let metadata: any = {};

    try {
      if (fileType === 'image') {
        preview = await generateThumbnail(file, 480, 360);
        metadata = await extractImageMetadata(file);
      } else if (fileType === 'video') {
        preview = await generateThumbnail(file, 640, 360);
        metadata = await extractVideoMetadata(file);
      }
    } catch (err) {
      console.error('미리보기 생성 오류:', err);
    }

    const newFileInfo: FileInfo = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      extension,
      file,
      preview,
      progress: 0,
      status: 'pending',
      metadata,
    };

    return newFileInfo;
  }, []);

  // 파일 선택 핸들러
  const handleFileSelect = useCallback(
    async (file: File) => {
      // 기존 업로드 초기화
      if (uploadControllerRef.current) {
        uploadControllerRef.current.abort();
        uploadControllerRef.current = null;
      }

      setError(null);
      setUploadProgress(0);
      setIsUploading(false);

      const validation = validateFile(file, acceptedTypes);
      if (!validation.valid) {
        setError(validation.error || '파일 유효성 검사 실패');
        return;
      }

      try {
        const newFileInfo = await processFile(file);
        setFileInfo(newFileInfo);
      } catch (err) {
        const error = err instanceof Error ? err.message : '파일 처리 중 오류가 발생했습니다.';
        setError(error);
      }
    },
    [acceptedTypes, processFile],
  );

  // 파일 업로드 함수
  const uploadFile = useCallback(
    async (forceChunked = false) => {
      if (!fileInfo) {
        setError('업로드할 파일이 없습니다.');
        return;
      }

      // 이전 업로드가 진행 중이면 중단
      if (uploadControllerRef.current) {
        uploadControllerRef.current.abort();
      }

      // 새 업로드 컨트롤러 생성
      uploadControllerRef.current = new AbortController();

      setIsUploading(true);
      setError(null);

      // 프로그레스 바 초기화
      setUploadProgress(0);

      // 파일 상태 업데이트 (이전 상태 초기화)
      setFileInfo((prev) =>
        prev
          ? {
              ...prev,
              progress: 0,
              status: 'uploading',
              error: undefined,
            }
          : null,
      );

      try {
        // 청크 업로드 사용 여부 결정
        const useChunkedUpload = forceChunked || fileInfo.size > config.chunkSize;

        if (useChunkedUpload) {
          await uploadFileInChunks(fileInfo);
        } else {
          await uploadFileAtOnce(fileInfo);
        }
      } catch (err) {
        // AbortError는 사용자가 의도적으로 취소한 경우이므로 에러로 처리하지 않음
        if (err instanceof Error && (err.name === 'AbortError' || err.message === 'AbortError')) {
          console.log('[Upload] 사용자에 의해 업로드가 취소되었습니다.');
          return;
        }

        const errorMessage =
          err instanceof Error ? err.message : '파일 업로드 중 오류가 발생했습니다.';
        setError(errorMessage);
        setFileInfo((prev) => (prev ? { ...prev, status: 'error', error: errorMessage } : null));

        if (onUploadError && fileInfo) {
          onUploadError(err instanceof Error ? err : new Error(errorMessage), fileInfo);
        }
      } finally {
        setIsUploading(false);
      }
    },
    [fileInfo, config, onUploadError],
  );

  // 한 번에 파일 업로드
  const uploadFileAtOnce = async (fileInfo: FileInfo) => {
    console.log(`[Upload] 파일 업로드: ${fileInfo.name} (${fileInfo.size} bytes) 한 번에 업로드`);

    // eslint-disable-next-line no-useless-catch
    try {
      // 메타데이터 추출
      const metadata = extractUploadMetadata(fileInfo);

      // 업로드 초기화 (썸네일 및 메타데이터 함께 전송)
      const response = await initiateUpload(
        fileInfo.name,
        fileInfo.size,
        fileInfo.type,
        config,
        fileInfo.preview, // 썸네일 데이터 URL 전달
        metadata, // 메타데이터 전달
      );

      setFileInfo((prev) =>
        prev ? { ...prev, uploadId: response.uploadId, status: 'uploading' } : null,
      );

      // 업로드 중단 감지를 위한 signal 객체
      const signal = uploadControllerRef.current?.signal;

      // 업로드가 중단되었는지 주기적으로 확인
      const checkAbort = () => {
        if (signal?.aborted) {
          throw new Error('AbortError');
        }
      };

      // 진행 상태 업데이트 시뮬레이션
      const totalUpdates = 10;
      for (let i = 1; i <= totalUpdates; i++) {
        await new Promise((resolve) => setTimeout(resolve, 300));

        // 중단 확인
        checkAbort();

        const progress = Math.floor((i / totalUpdates) * 100);

        setUploadProgress(progress);
        setFileInfo((prev) => (prev ? { ...prev, progress } : null));

        if (onUploadProgress && fileInfo) {
          onUploadProgress(progress, fileInfo);
        }
      }

      // 중단 확인
      checkAbort();

      // 업로드 완료 처리 (파일 정보 함께 전달)
      const finalizeResponse = await finalizeUpload(response.uploadId, fileInfo.name, 1, fileInfo);

      setFileInfo((prev: any) => {
        if (!prev) {return null;}
        const updated: any = {
          ...prev,
          status: 'completed',
          progress: 100,
          uploadId: finalizeResponse.fileId,
        };

        if (onUploadComplete) {
          onUploadComplete(updated);
        }

        return updated;
      });

      setUploadProgress(100);
    } catch (err) {
      throw err;
    }
  };

  // 청크별 파일 업로드
  const uploadFileInChunks = async (fileInfo: FileInfo) => {
    console.log(
      `[Upload] 파일 업로드: ${fileInfo.name} (${fileInfo.size} bytes) 청크 단위로 업로드`,
    );

    // eslint-disable-next-line no-useless-catch
    try {
      // 업로드 초기화 (청크 업로드에서는 첫 번째 청크에 메타데이터와 썸네일을 포함할 것이므로 여기서는 전달하지 않음)
      const initResponse = await initiateUpload(
        fileInfo.name,
        fileInfo.size,
        fileInfo.type,
        config,
      );
      const chunkSize = initResponse.chunkSize;

      // 청크 수 계산
      const totalChunks = Math.ceil(fileInfo.size / chunkSize);

      // 메타데이터 추출
      const metadata = extractUploadMetadata(fileInfo);

      setFileInfo((prev) => {
        if (!prev) {return null;}

        return {
          ...prev,
          uploadId: initResponse.uploadId,
          status: 'uploading',
          chunks: {
            total: totalChunks,
            uploaded: 0,
            current: 0,
          },
        };
      });

      // 업로드 중단 감지를 위한 signal 객체
      const signal = uploadControllerRef.current?.signal;

      // 업로드가 중단되었는지 확인하는 함수
      const checkAbort = () => {
        if (signal?.aborted) {
          throw new Error('AbortError');
        }
      };

      // 청크 업로드
      let chunkIndex = 0;
      let retries = 0;

      while (chunkIndex < totalChunks) {
        try {
          // 중단 확인
          checkAbort();

          const start = chunkIndex * chunkSize;
          const end = Math.min(start + chunkSize, fileInfo.size);
          const chunk = fileInfo.file.slice(start, end);

          // 청크 업로드 (첫 번째 청크에만 썸네일과 메타데이터 포함)
          const response = await uploadChunk(
            initResponse.uploadId,
            chunkIndex,
            chunk,
            totalChunks,
            chunkIndex === 0 ? fileInfo.preview : undefined, // 첫 번째 청크에만 썸네일 포함
            chunkIndex === 0 ? metadata : undefined, // 첫 번째 청크에만 메타데이터 포함
          );

          // 진행 상태 업데이트
          const uploaded = chunkIndex + 1;
          const progress = Math.floor((uploaded / totalChunks) * 100);

          setUploadProgress(progress);
          setFileInfo((prev) => {
            if (!prev) {return null;}

            const updated = {
              ...prev,
              progress,
              chunks: {
                total: totalChunks,
                uploaded,
                current: response.nextExpected || chunkIndex + 1,
              },
            };

            if (onUploadProgress) {
              onUploadProgress(progress, updated);
            }

            return updated;
          });

          // 다음 청크로 이동
          chunkIndex = response.nextExpected || chunkIndex + 1;
          retries = 0;
        } catch (err) {
          // 중단 확인
          checkAbort();

          retries++;

          if (retries > config.retryCount) {
            throw new Error(`청크 업로드 실패: ${config.retryCount}회 재시도 후 실패`);
          }

          console.log(`[Upload] 청크 ${chunkIndex} 재시도 중 (${retries}/${config.retryCount})`);
          await new Promise((resolve) => setTimeout(resolve, config.retryDelay));
        }
      }

      // 중단 확인
      checkAbort();

      // 업로드 완료 처리 (파일 정보 포함)
      const finalizeResponse = await finalizeUpload(
        initResponse.uploadId,
        fileInfo.name,
        totalChunks,
        fileInfo,
      );

      setFileInfo((prev: any) => {
        if (!prev) {return null;}

        const updated: any = {
          ...prev,
          status: 'completed',
          progress: 100,
          uploadId: finalizeResponse.fileId,
        };

        if (onUploadComplete) {
          onUploadComplete(updated);
        }

        return updated;
      });

      setUploadProgress(100);
    } catch (err) {
      throw err;
    }
  };

  // 업로드 일시 정지
  const pauseUpload = useCallback(() => {
    console.log('[Upload] 업로드 일시 정지');
    setFileInfo((prev) => (prev ? { ...prev, status: 'paused' } : null));
  }, []);

  // 업로드 재개
  const resumeUpload = useCallback(() => {
    if (!fileInfo || fileInfo.status !== 'paused') {
      return;
    }

    console.log('[Upload] 업로드 재개');
    setFileInfo((prev) => (prev ? { ...prev, status: 'uploading' } : null));

    // 실제 구현에서는 이전에 업로드된 청크 정보를 활용하여 이어서 업로드해야 함
    // 이 예제에서는 간단히 처리하기 위해 처음부터 다시 시작
    uploadFile(true);
  }, [fileInfo, uploadFile]);

  // 업로드 취소
  const cancelUpload = useCallback(() => {
    console.log('[Upload] 업로드 취소');

    // 업로드를 중단하고 상태 초기화
    if (uploadControllerRef.current) {
      uploadControllerRef.current.abort();
      uploadControllerRef.current = null;
    }

    // 파일 정보는 유지하고 상태만 초기화
    setIsUploading(false);
    setUploadProgress(0);
    setError(null);
    setFileInfo((prev) =>
      prev
        ? {
            ...prev,
            status: 'pending',
            progress: 0,
            error: undefined,
          }
        : null,
    );
  }, []);

  return {
    fileInfo,
    isUploading,
    uploadProgress,
    error,
    handleFileSelect,
    uploadFile,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    resetUpload,
  };
};
