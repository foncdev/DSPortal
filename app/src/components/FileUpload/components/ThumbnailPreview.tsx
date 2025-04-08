import React, { useState } from 'react';
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

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVideoLoad = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    setDuration(video.duration);
    // Set to middle of video initially
    const middleTime = video.duration / 2;
    setCurrentTime(middleTime);
    video.currentTime = middleTime;
  };

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
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [videoUrl] = useState(URL.createObjectURL(fileInfo.file));
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [currentThumbnail, setCurrentThumbnail] = useState<string>(fileInfo.preview || '');

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
        setCurrentThumbnail(thumbnailUrl);
      } catch (err) {
        console.error('썸네일 생성 오류:', err);
      }
    };

    const handleSliderChangeWithThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
      const video = document.getElementById('preview-video') as HTMLVideoElement;
      if (video) {
        const newTime = parseFloat(e.target.value);
        setCurrentTime(newTime);
        video.currentTime = newTime;

        const onCanPlay = () => {
          generateThumbnailFromCurrentTime();
          video.removeEventListener('canplay', onCanPlay);
        };

        video.addEventListener('canplay', onCanPlay);
      }
    };

    const handleVideoSeeked = () => {
      generateThumbnailFromCurrentTime();
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
                preload="auto"
            />
            {currentThumbnail && (
                <img
                    src={currentThumbnail}
                    alt={fileInfo.name}
                    className={styles.thumbnailImage}
                />
            )}
          </div>

          <div className={styles.videoControls}>
            <div className={styles.sliderContainer}>
              <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSliderChangeWithThumbnail}
                  className={styles.slider}
              />
            </div>
            <div className={styles.timeDisplay}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            {fileInfo.metadata && (
                <div className={styles.videoMetadata}>
                  {fileInfo.metadata.width && fileInfo.metadata.height && (
                      <div>
                        해상도: {fileInfo.metadata.width} x {fileInfo.metadata.height}px
                      </div>
                  )}
                  {fileInfo.metadata.duration && (
                      <div>재생 시간: {formatTime(fileInfo.metadata.duration)}</div>
                  )}
                  {fileInfo.metadata.codec && <div>코덱: {fileInfo.metadata.codec}</div>}
                </div>
            )}
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