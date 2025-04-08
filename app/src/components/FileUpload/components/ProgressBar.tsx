import React from 'react';

interface ProgressBarProps {
  progress: number;
  className?: string;
  height?: number;
  color?: string;
  backgroundColor?: string;
  withLabel?: boolean;
  labelPosition?: 'inside' | 'outside';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className = '',
  height = 8,
  color = 'bg-blue-500',
  backgroundColor = 'bg-gray-200',
  withLabel = true,
  labelPosition = 'outside',
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="relative">
        <div
          className={`w-full overflow-hidden rounded-full ${backgroundColor}`}
          style={{ height: `${height}px` }}
        >
          <div
            className={`transition-width h-full rounded-full duration-300 ease-in-out ${color}`}
            style={{ width: `${progress}%` }}
          >
            {withLabel && labelPosition === 'inside' && progress > 15 && (
              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                {Math.round(progress)}%
              </span>
            )}
          </div>
        </div>

        {withLabel && labelPosition === 'outside' && (
          <div className="mt-1 text-right text-xs font-medium text-gray-700">
            {Math.round(progress)}%
          </div>
        )}
      </div>
    </div>
  );
};
