import React from 'react';
import styles from '../FileUpload.module.scss';

interface ProgressBarProps {
  progress: number;
  className?: string;
  height?: number;
  status?: 'uploading' | 'completed' | 'error' | 'paused';
  withLabel?: boolean;
  labelPosition?: 'inside' | 'outside';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
                                                          progress,
                                                          className = '',
                                                          height = 6,
                                                          status = 'uploading',
                                                          withLabel = true,
                                                          labelPosition = 'outside',
                                                        }) => {
  const statusClass = `status-${status}`;
  const progressValue = Math.min(Math.max(0, progress), 100); // 0-100 사이로 제한

  return (
      <div className={`${styles.progressContainer} ${className}`}>
        <div className={styles.progressBar}>
          <div
              className={styles.progressTrack}
              style={{ height: `${height}px` }}
          >
            <div
                className={`${styles.progressIndicator} ${styles[statusClass]}`}
                style={{ width: `${progressValue}%` }}
            >
              {withLabel && labelPosition === 'inside' && progressValue > 15 && (
                  <span className={styles.progressLabelInside}>
                {Math.round(progressValue)}%
              </span>
              )}
            </div>
          </div>

          {withLabel && labelPosition === 'outside' && (
              <div className={styles.progressLabelOutside}>
                {Math.round(progressValue)}%
              </div>
          )}
        </div>
      </div>
  );
};