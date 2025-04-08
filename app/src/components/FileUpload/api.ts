// src/components/FileUpload/api.ts 개선된 버전
import { FileInfo, UploadConfig } from './types';

interface InitiateUploadResponse {
  uploadId: string;
  chunkSize: number; // 서버가 조정할 수 있는 청크 크기
}

interface ChunkUploadResponse {
  chunkIndex: number;
  received: boolean;
  nextExpected?: number;
}

interface FinalizeUploadResponse {
  fileUrl: string;
  fileId: string;
  thumbnailUrl?: string;
}

interface UploadMetadata {
  width?: number;
  height?: number;
  duration?: number;
  codec?: string;
  bitrate?: number;
  frameRate?: number;
  fileType: string;
  extension: string;
  size: number;
  lastModified: number;
  // 기타 필요한 메타데이터
}

// 로컬 테스트용 가상 구현
export const initiateUpload = async (
  fileName: string,
  fileSize: number,
  fileType: string,
  config: UploadConfig,
  thumbnail?: string, // 썸네일 데이터 URL
  metadata?: UploadMetadata, // 파일 메타데이터
): Promise<InitiateUploadResponse> => {
  console.log(`[API] 업로드 초기화: ${fileName} (${fileSize} bytes, ${fileType})`);

  if (thumbnail) {
    console.log(`[API] 썸네일 포함 (데이터 길이: ${thumbnail.length})`);
    // 실제 구현에서는 여기서 썸네일을 서버로 전송
  }

  if (metadata) {
    console.log('[API] 메타데이터 포함:', metadata);
    // 실제 구현에서는 여기서 메타데이터를 서버로 전송
  }

  // 네트워크 지연 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 300));

  // 랜덤 업로드 ID 생성
  const uploadId = Math.random().toString(36).substring(2, 15);

  return {
    uploadId,
    chunkSize: config.chunkSize,
  };
};

export const uploadChunk = async (
  uploadId: string,
  chunkIndex: number,
  chunk: Blob,
  totalChunks: number,
  thumbnail?: string, // 첫 번째 청크(index=0)에만 썸네일 포함
  metadata?: UploadMetadata, // 첫 번째 청크에만 메타데이터 포함
): Promise<ChunkUploadResponse> => {
  console.log(`[API] 청크 업로드 ${chunkIndex + 1}/${totalChunks} (업로드 ID: ${uploadId})`);

  // 첫 번째 청크와 함께 썸네일 및 메타데이터 전송
  if (chunkIndex === 0) {
    if (thumbnail) {
      console.log(`[API] 첫 번째 청크와 함께 썸네일 전송 (데이터 길이: ${thumbnail.length})`);
      // 실제 구현에서는 첫 번째 청크와 함께 썸네일 전송
    }

    if (metadata) {
      console.log('[API] 첫 번째 청크와 함께 메타데이터 전송:', metadata);
      // 실제 구현에서는 첫 번째 청크와 함께 메타데이터 전송
    }
  }

  // 네트워크 지연 및 다양한 업로드 속도 시뮬레이션
  const delay = 500 + Math.random() * 1000;
  await new Promise((resolve) => setTimeout(resolve, delay));

  // 랜덤 오류 시뮬레이션 (10% 확률)
  if (Math.random() < 0.1) {
    throw new Error('청크 업로드 중 네트워크 오류');
  }

  return {
    chunkIndex,
    received: true,
    nextExpected: chunkIndex + 1 < totalChunks ? chunkIndex + 1 : undefined,
  };
};

export const finalizeUpload = async (
  uploadId: string,
  fileName: string,
  totalChunks: number,
  fileInfo?: FileInfo, // 파일 정보 포함 (메타데이터 활용 가능)
): Promise<FinalizeUploadResponse> => {
  console.log(`[API] 업로드 완료: ${uploadId} (총 ${totalChunks} 청크)`);

  if (fileInfo) {
    console.log('[API] 파일 정보 포함:', {
      name: fileInfo.name,
      size: fileInfo.size,
      type: fileInfo.type,
      metadata: fileInfo.metadata,
      extension: fileInfo.extension,
      lastModified: fileInfo.lastModified,
    });

    // 실제 구현에서는 이 정보를 서버에 저장하거나 데이터베이스에 기록할 수 있음
  }

  // 처리 지연 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 썸네일 URL 생성 (실제로는 서버에서 생성된 URL 반환)
  let thumbnailUrl;
  if (fileInfo?.preview) {
    thumbnailUrl = `https://example.com/thumbnails/${encodeURIComponent(fileName)}`;
    console.log(`[API] 썸네일 URL 생성: ${thumbnailUrl}`);
  }

  return {
    fileUrl: `https://example.com/uploads/${encodeURIComponent(fileName)}`,
    fileId: uploadId,
    thumbnailUrl,
  };
};

// 파일 정보에서 API 전송용 메타데이터 추출 유틸리티 함수
export const extractUploadMetadata = (fileInfo: FileInfo): UploadMetadata => {
  return {
    width: fileInfo.metadata?.width,
    height: fileInfo.metadata?.height,
    duration: fileInfo.metadata?.duration,
    codec: fileInfo.metadata?.codec,
    bitrate: fileInfo.metadata?.bitrate,
    frameRate: fileInfo.metadata?.frameRate,
    fileType: fileInfo.type,
    extension: fileInfo.extension,
    size: fileInfo.size,
    lastModified: fileInfo.lastModified,
  };
};
