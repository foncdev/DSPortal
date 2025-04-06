import React from 'react';

import { BaseProps } from '../../types';
import { cn } from '../../utils';
import './Spinner.scss';

export interface SpinnerProps extends BaseProps {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'light';
    thickness?: 'thin' | 'regular' | 'thick';
    label?: string;
    showLabel?: boolean;
    centered?: boolean;
}

export const Spinner: React.FC<SpinnerProps> = ({
                                                    className,
                                                    size = 'md',
                                                    variant = 'primary',
                                                    thickness = 'regular',
                                                    label = 'Loading...',
                                                    showLabel = false,
                                                    centered = false,
                                                    ...props
                                                }) => (
    <div
        className={cn(
            'ds-spinner-container',
            centered && 'ds-spinner-centered',
            className
        )}
        role="status"
        aria-live="polite"
        {...props}
    >
        <div
            className={cn(
                'ds-spinner',
                `ds-spinner-${size}`,
                `ds-spinner-${variant}`,
                `ds-spinner-${thickness}`
            )}
        >
            <svg viewBox="0 0 50 50" className="ds-spinner-svg">
                <circle
                    className="ds-spinner-track"
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    strokeWidth="5"
                />
                <circle
                    className="ds-spinner-progress"
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    strokeWidth="5"
                />
            </svg>
        </div>
        {showLabel && <span className="ds-spinner-label">{label}</span>}
        <span className="ds-spinner-sr-only">{label}</span>
    </div>
);

export interface SpinnerOverlayProps extends SpinnerProps {
    visible: boolean;
    blur?: boolean;
    fixed?: boolean;
}

export const SpinnerOverlay: React.FC<SpinnerOverlayProps> = ({
                                                                  visible,
                                                                  blur = true,
                                                                  fixed = false,
                                                                  ...props
                                                              }) => {
    if (!visible) {return null;}

    return (
        <div
            className={cn(
                'ds-spinner-overlay',
                blur && 'ds-spinner-overlay-blur',
                fixed && 'ds-spinner-overlay-fixed'
            )}
        >
            <Spinner centered showLabel {...props} />
        </div>
    );
};

Spinner.displayName = 'Spinner';
SpinnerOverlay.displayName = 'SpinnerOverlay';