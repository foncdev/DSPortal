import React from 'react';

import { BaseProps, Size, Variant } from '../../types';
import { cn } from '../../utils';
import './Badge.scss';

export interface BadgeProps extends BaseProps {
    variant?: Variant;
    size?: Size;
    rounded?: boolean;
    outline?: boolean;
    dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
                                                children,
                                                className,
                                                variant = 'primary',
                                                size = 'md',
                                                rounded = false,
                                                outline = false,
                                                dot = false,
                                                ...props
                                            }) => (
        <span
            className={cn(
                'ds-badge',
                `ds-badge-${variant}`,
                `ds-badge-${size}`,
                rounded && 'ds-badge-rounded',
                outline && 'ds-badge-outline',
                dot && 'ds-badge-dot',
                className
            )}
            {...props}
        >
      {dot && <span className="ds-badge-dot-indicator" />}
            {children}
    </span>
    );

Badge.displayName = 'Badge';