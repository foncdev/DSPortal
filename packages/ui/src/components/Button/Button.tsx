import React, { forwardRef } from 'react';
import { Loader } from 'lucide-react';

import { ButtonBaseProps } from '../../types';
import { cn } from '../../utils';
import './Button.scss';

export interface ButtonProps extends ButtonBaseProps {
    href?: string;
}

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
    (
        {
            children,
            className,
            variant = 'primary',
            size = 'md',
            type = 'button',
            disabled = false,
            loading = false,
            fullWidth = false,
            icon,
            iconPosition = 'left',
            onClick,
            href,
            ...props
        },
        ref
    ) => {
        const baseClassName = cn(
            'ds-button',
            `ds-button-${variant}`,
            `ds-button-${size}`,
            fullWidth && 'ds-button-full',
            loading && 'ds-button-loading',
            disabled && 'ds-button-disabled',
            className
        );

        const handleClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
            if (disabled || loading) {
                e.preventDefault();
                return;
            }
            onClick?.(e);
        };

        const renderContent = () => (
            <>
                {loading && (
                    <span className="ds-button-loader">
            <Loader size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} className="ds-button-spinner" />
          </span>
                )}
                {icon && iconPosition === 'left' && !loading && (
                    <span className="ds-button-icon ds-button-icon-left">{icon}</span>
                )}
                {children && <span className="ds-button-text">{children}</span>}
                {icon && iconPosition === 'right' && (
                    <span className="ds-button-icon ds-button-icon-right">{icon}</span>
                )}
            </>
        );

        if (href && !disabled) {
            return (
                <a
                    ref={ref as React.ForwardedRef<HTMLAnchorElement>}
                    href={href}
                    className={baseClassName}
                    onClick={handleClick}
                    {...props}
                >
                    {renderContent()}
                </a>
            );
        }

        return (
            <button
                ref={ref as React.ForwardedRef<HTMLButtonElement>}
                type={type}
                className={baseClassName}
                disabled={disabled || loading}
                onClick={handleClick}
                {...props}
            >
                {renderContent()}
            </button>
        );
    }
);

Button.displayName = 'Button';