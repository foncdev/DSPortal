import React, { useState, useEffect } from 'react';
import { FileInfo } from '../types';
import { formatFileSize } from '../utils';
import styles from '../FileUpload.module.scss';

interface ThumbnailPreviewProps {
  fileInfo: FileInfo;
  className?: string;
}

export const ThumbnailPreview: React.FC<ThumbnailPreviewProps> = ({ fileInfo, className = '' }) => {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isSliderActive, setIsSliderActive] = useState<boolean>(false);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVideoLoad = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    setDuration(video.duration);
    // Set to first frame initially
    setCurrentTime(0);
    video.currentTime = 0;

    // 비디오 로드 후 썸네일 생성 확인
    setTimeout(() => {
      generateThumbnailFromCurrentTime();
    }, 100);
  };

  // 컴포넌트 마운트 시 비디오 리소스 해제 처리
  useEffect(() => {
    let videoUrl: string | null = null;

    if (fileInfo.file.type.startsWith('video/')) {
      videoUrl = URL.createObjectURL(fileInfo.file);
    }

    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [fileInfo.file]);

  if (!fileInfo.preview) {
    return (
        <div className={`${styles.thumbnailContainer} ${styles.noPreview} ${className}`}>
          <p className={styles.noPreviewText}>미리보기를 생성할 수 없습니다.</p>
        </div>
    );
  }

  if (fileInfo.file.type.startsWith('image/')) {
    return (
        <div className={`${styles.thumbnailContainer} ${className}`}>
          <img
              src={fileInfo.preview}
              alt={fileInfo.name}
              className={styles.thumbnailImage}
          />
          {fileInfo.metadata?.width && fileInfo.metadata?.height && (
              <div className={styles.imageMetaOverlay}>
            <span>
              {fileInfo.metadata.width} x {fileInfo.metadata.height}px
            </span>
              </div>
          )}
        </div>
    );
  }

  if (fileInfo.file.type.startsWith('video/')) {
    // 비디오 URL은 필요할 때만 생성
    const videoUrl = URL.createObjectURL(fileInfo.file);

    // 썸네일 생성 함수
    const generateThumbnailFromCurrentTime = () => {
      const video = document.getElementById('preview-video') as HTMLVideoElement;
      if (!video) return;

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);
        return thumbnailUrl;
      } catch (err) {
        console.error('썸네일 생성 오류:', err);
        return fileInfo.preview;
      }
    };

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const video = document.getElementById('preview-video') as HTMLVideoElement;
      if (video) {
        const newTime = parseFloat(e.target.value);
        setCurrentTime(newTime);
        video.currentTime = newTime;
      }
    };

    const handleSliderMouseDown = () => {
      setIsSliderActive(true);
    };

    const handleSliderMouseUp = () => {
      const video = document.getElementById('preview-video') as HTMLVideoElement;
      if (video) {
        // 슬라이더 조작 완료 후 해당 프레임의 썸네일 생성
        generateThumbnailFromCurrentTime();
      }
      setIsSliderActive(false);
    };

    const handleVideoSeeked = () => {
      // 비디오가 seek 완료된 경우에만 썸네일 생성
      if (!isSliderActive) {
        generateThumbnailFromCurrentTime();
      }
    };

    // 비디오 메타데이터 정보 가져오기
    const getVideoMetadataDisplay = () => {
      const metadata = [];

      if (fileInfo.metadata?.width && fileInfo.metadata?.height) {
        metadata.push(`${fileInfo.metadata.width}×${fileInfo.metadata.height}`);
      }

      if (fileInfo.metadata?.duration) {
        metadata.push(formatTime(fileInfo.metadata.duration));
      }

      return metadata.join(' • ');
    };

    return (
        <div className={`${styles.thumbnailContainer} ${className}`}>
          <div className="relative">
            <video
                id="preview-video"
                src={videoUrl}
                className="hidden"
                controls={false}
                onLoadedMetadata={handleVideoLoad}
                onSeeked={handleVideoSeeked}
                preload="metadata"
            />
            <img
                src={fileInfo.preview}
                alt={fileInfo.name}
                className={styles.thumbnailImage}
            />
          </div>

          <div className={styles.videoControls}>
            <div className={styles.sliderContainer}>
              <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSliderChange}
                  onMouseDown={handleSliderMouseDown}
                  onMouseUp={handleSliderMouseUp}
                  onTouchStart={handleSliderMouseDown}
                  onTouchEnd={handleSliderMouseUp}
                  className={styles.slider}
              />
            </div>
            <div className={styles.timeDisplay}>
              <span>{formatTime(currentTime)}</span>
              <span>{getVideoMetadataDisplay()}</span>
            </div>
          </div>
        </div>
    );
  }

  // Fallback for other file types
  return (
      <div className={`${styles.thumbnailContainer} ${styles.noPreview} ${className}`}>
        <div className="text-center">
          <p className="font-medium">{fileInfo.name}</p>
          <p className="text-sm">{formatFileSize(fileInfo.size)}</p>
        </div>
      </div>
  );
};