// src/components/FileUpload/components/ThumbnailPreview.tsx
import React, { useState } from 'react';
import { FileInfo } from '../types';
import { formatFileSize } from '../utils';

interface ThumbnailPreviewProps {
  fileInfo: FileInfo;
  className?: string;
}

export const ThumbnailPreview: React.FC<ThumbnailPreviewProps> = ({ fileInfo, className = '' }) => {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  // 기본 슬라이더 변경 핸들러 (비디오가 아닌 경우 사용)
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (fileInfo.file.type.startsWith('video/')) {
      const video = document.getElementById('preview-video') as HTMLVideoElement;
      if (video) {
        const newTime = parseFloat(e.target.value);
        setCurrentTime(newTime);
        video.currentTime = newTime;
      }
    }
  };

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
      <div
        className={`flex items-center justify-center rounded-lg border bg-gray-50 p-4 ${className}`}
      >
        <p className="text-gray-500">미리보기를 생성할 수 없습니다.</p>
      </div>
    );
  }

  if (fileInfo.file.type.startsWith('image/')) {
    return (
      <div className={`relative overflow-hidden rounded-lg border ${className}`}>
        <img src={fileInfo.preview} alt={fileInfo.name} className="h-auto w-full object-contain" />
        <div className="absolute inset-x-0 bottom-0 bg-black bg-opacity-50 p-2 text-sm text-white">
          {fileInfo.metadata?.width && fileInfo.metadata?.height && (
            <span>
              {fileInfo.metadata.width} x {fileInfo.metadata.height}px
            </span>
          )}
        </div>
      </div>
    );
  }

  if (fileInfo.file.type.startsWith('video/')) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [videoUrl] = useState(URL.createObjectURL(fileInfo.file));
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [currentThumbnail, setCurrentThumbnail] = useState<string>(fileInfo.preview || '');

    // 슬라이더 이동 시 썸네일 생성 함수
    const generateThumbnailFromCurrentTime = () => {
      const video = document.getElementById('preview-video') as HTMLVideoElement;
      if (!video) return;

      // canvas를 이용하여 현재 비디오 프레임을 캡처
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 비디오 현재 프레임을 캔버스에 그림
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 썸네일 생성
      try {
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);
        setCurrentThumbnail(thumbnailUrl);
      } catch (err) {
        console.error('썸네일 생성 오류:', err);
      }
    };

    // 슬라이더 변경 핸들러 업데이트
    const handleSliderChangeWithThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
      const video = document.getElementById('preview-video') as HTMLVideoElement;
      if (video) {
        const newTime = parseFloat(e.target.value);
        setCurrentTime(newTime);
        video.currentTime = newTime;

        // canplay 이벤트로 변경 - 프레임이 준비되면 썸네일 생성
        const onCanPlay = () => {
          generateThumbnailFromCurrentTime();
          video.removeEventListener('canplay', onCanPlay);
        };

        video.addEventListener('canplay', onCanPlay);
      }
    };

    // seeked 이벤트를 통해 비디오가 특정 위치로 이동했을 때 썸네일 생성
    const handleVideoSeeked = () => {
      generateThumbnailFromCurrentTime();
    };

    return (
      <div className={`overflow-hidden rounded-lg border ${className}`}>
        <div className="relative">
          {/* 비디오 요소는 보이지 않게 하고 썸네일 이미지만 표시 */}
          <video
            id="preview-video"
            src={videoUrl}
            className="hidden" // 비디오 숨김 처리
            controls={false}
            onLoadedMetadata={handleVideoLoad}
            onSeeked={handleVideoSeeked}
            preload="auto"
          />
          {currentThumbnail && (
            <img src={currentThumbnail} alt={fileInfo.name} className="h-auto w-full" />
          )}
        </div>

        <div className="border-t bg-gray-50 p-3">
          <div className="mb-2 flex items-center">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSliderChangeWithThumbnail}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          {fileInfo.metadata && (
            <div className="mt-2 text-xs text-gray-600">
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
    <div className={`flex items-center justify-center rounded-lg border p-4 ${className}`}>
      <div className="text-center">
        <p className="font-medium text-gray-700">{fileInfo.name}</p>
        <p className="text-sm text-gray-500">{formatFileSize(fileInfo.size)}</p>
      </div>
    </div>
  );
};
