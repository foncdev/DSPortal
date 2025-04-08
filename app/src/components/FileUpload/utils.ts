import { FileInfo, FileType } from './types';
import { FILE_TYPE_CONFIGS } from './config';

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

export const getFileType = (file: File): FileType | null => {
  const extension = getFileExtension(file.name);
  const mimeType = file.type;

  if (FILE_TYPE_CONFIGS.image.mimeTypes.includes(mimeType)) {
    return 'image';
  } else if (FILE_TYPE_CONFIGS.video.mimeTypes.includes(mimeType)) {
    return 'video';
  } else if (FILE_TYPE_CONFIGS.document.mimeTypes.includes(mimeType)) {
    return 'document';
  } else if (FILE_TYPE_CONFIGS.archive.mimeTypes.includes(mimeType)) {
    return 'archive';
  } else if (FILE_TYPE_CONFIGS.application.mimeTypes.includes(mimeType)) {
    return 'application';
  }

  // Fallback to extension-based detection
  if (['png', 'jpg', 'jpeg', 'gif'].includes(extension)) {
    return 'image';
  } else if (['mp4', 'avi', 'mov', 'mp3'].includes(extension)) {
    return 'video';
  } else if (['pdf'].includes(extension)) {
    return 'document';
  } else if (['zip'].includes(extension)) {
    return 'archive';
  } else if (['apk'].includes(extension)) {
    return 'application';
  }

  return null;
};

export const validateFile = (
  file: File,
  acceptedTypes: string[],
): { valid: boolean; error?: string } => {
  const fileType = getFileType(file);

  if (!fileType) {
    return { valid: false, error: '지원되지 않는 파일 형식입니다.' };
  }

  if (!acceptedTypes.includes(fileType)) {
    return { valid: false, error: '허용되지 않는 파일 형식입니다.' };
  }

  const config = FILE_TYPE_CONFIGS[fileType];
  if (file.size > config.maxSize) {
    return {
      valid: false,
      error: `파일 크기가 너무 큽니다. 최대 ${Math.floor(
        config.maxSize / (1024 * 1024),
      )}MB까지 가능합니다.`,
    };
  }

  return { valid: true };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const generateThumbnail = async (
  file: File,
  maxWidth: number,
  maxHeight: number,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.type.startsWith('image/')) {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate scaled dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * (maxHeight / height));
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context creation failed'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };

      img.onerror = () => {
        reject(new Error('Image loading failed'));
      };

      img.src = URL.createObjectURL(file);
    } else if (file.type.startsWith('video/')) {
      const video = document.createElement('video');

      // 메타데이터 및 첫 번째 프레임 로드
      video.preload = 'metadata';
      video.muted = true; // 필요함 (일부 브라우저에서 자동 재생 정책)
      video.playsInline = true;

      video.onloadedmetadata = () => {
        // 2초 지점이나 동영상 중간 지점 중 더 작은 값으로 설정
        const seekTime = Math.min(2, video.duration / 2);
        video.currentTime = seekTime;
      };

      video.onseeked = async () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context creation failed'));
            return;
          }

          // 비디오 비율 유지하면서 크기 조정
          let width = video.videoWidth;
          let height = video.videoHeight;

          const aspectRatio = width / height;

          if (aspectRatio > maxWidth / maxHeight) {
            // 비디오가 더 넓은 경우
            width = maxWidth;
            height = width / aspectRatio;
          } else {
            // 비디오가 더 높은 경우
            height = maxHeight;
            width = height * aspectRatio;
          }

          canvas.width = width;
          canvas.height = height;

          // 배경을 검은색으로 설정
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, width, height);

          // 비디오 프레임 그리기
          ctx.drawImage(video, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));

          // 리소스 정리
          URL.revokeObjectURL(video.src);
        } catch (error) {
          reject(error);
          URL.revokeObjectURL(video.src);
        }
      };

      video.onerror = () => {
        reject(new Error('Video loading failed'));
        URL.revokeObjectURL(video.src);
      };

      const videoUrl = URL.createObjectURL(file);
      video.src = videoUrl;

      // 일부 브라우저에서는 play()를 호출해야 seeked 이벤트가 발생
      video.load();

      // 1초 타임아웃 - 비디오가 로드되지 않을 경우를 대비
      setTimeout(() => {
        if (!video.videoWidth) {
          reject(new Error('Video loading timed out'));
          URL.revokeObjectURL(video.src);
        }
      }, 5000);
    } else {
      reject(new Error('Unsupported file type for thumbnail generation'));
    }
  });
};

export const extractVideoMetadata = (file: File): Promise<FileInfo['metadata']> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration,
        // Note: we can't get codec info in browser without more complex APIs
      });
      URL.revokeObjectURL(video.src);
    };

    video.onerror = () => {
      resolve({});
      URL.revokeObjectURL(video.src);
    };

    video.src = URL.createObjectURL(file);
  });
};

export const extractImageMetadata = (file: File): Promise<FileInfo['metadata']> => {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      });
      URL.revokeObjectURL(img.src);
    };

    img.onerror = () => {
      resolve({});
      URL.revokeObjectURL(img.src);
    };

    img.src = URL.createObjectURL(file);
  });
};

export const generateVideoThumbnail = (
  video: HTMLVideoElement,
  width: number,
  height: number,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // 비디오 크기를 가져옴
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      if (!videoWidth || !videoHeight) {
        reject(new Error('비디오 치수를 가져올 수 없습니다.'));
        return;
      }

      // 비디오 비율 유지하면서 조정할 치수 계산
      let targetWidth = width;
      let targetHeight = height;

      const aspectRatio = videoWidth / videoHeight;

      if (aspectRatio > width / height) {
        // 비디오가 더 넓은 경우
        targetHeight = width / aspectRatio;
      } else {
        // 비디오가 더 높은 경우
        targetWidth = height * aspectRatio;
      }

      // 캔버스에 현재 비디오 프레임 그리기
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('캔버스 컨텍스트를 생성할 수 없습니다.'));
        return;
      }

      // 배경을 검은색으로 설정
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // 비디오 프레임 그리기
      ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

      // 썸네일 생성
      const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);
      resolve(thumbnailUrl);
    } catch (err) {
      console.error('썸네일 생성 중 오류:', err);
      reject(err);
    }
  });
};
