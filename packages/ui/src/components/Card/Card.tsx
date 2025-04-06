import { forwardRef } from 'react';

import { CardProps } from '../../types';
import { cn, getSizeClass } from '../../utils';
import './Card.scss';

export const Card = forwardRef<HTMLDivElement, CardProps>(
    (
        {
            children,
            className,
            title,
            subtitle,
            image,
            footer,
            bordered = true,
            hoverable = false,
            size = 'md',
            ...props
        },
        ref
    ) => (
        <div
            ref={ref}
            className={cn(
                'ds-card',
                getSizeClass(size, 'ds-card'),
                bordered && 'ds-card-bordered',
                hoverable && 'ds-card-hoverable',
                className
            )}
            {...props}
        >
            {image && (
                <div className="ds-card-image-wrapper">
                    <img src={image} alt={typeof title === 'string' ? title : 'Card image'} className="ds-card-image" />
                </div>
            )}

            {(title || subtitle) && (
                <div className="ds-card-header">
                    {title && (
                        <div className="ds-card-title">
                            {title}
                        </div>
                    )}
                    {subtitle && (
                        <div className="ds-card-subtitle">
                            {subtitle}
                        </div>
                    )}
                </div>
            )}

            <div className="ds-card-body">
                {children}
            </div>

            {footer && (
                <div className="ds-card-footer">
                    {footer}
                </div>
            )}
        </div>
    )
);

Card.displayName = 'Card';