import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { BaseProps } from '../../types';
import { cn } from '../../utils';
import './Tooltip.scss';

export type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';

export interface TooltipProps extends BaseProps {
    content: React.ReactNode;
    position?: TooltipPosition;
    delay?: number;
    disabled?: boolean;
    maxWidth?: number;
    arrow?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
                                                    children,
                                                    content,
                                                    className,
                                                    position = 'top',
                                                    delay = 300,
                                                    disabled = false,
                                                    maxWidth = 200,
                                                    arrow = true,
                                                    ...props
                                                }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<number | null>(null);

    const calculatePosition = () => {
        if (!triggerRef.current || !tooltipRef.current) {return;}

        const triggerRect = triggerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const scrollX = window.scrollX || document.documentElement.scrollLeft;

        let top = 0;
        let left = 0;

        switch (position) {
            case 'top':
                top = triggerRect.top + scrollY - tooltipRect.height - 8;
                left = triggerRect.left + scrollX + triggerRect.width / 2 - tooltipRect.width / 2;
                break;
            case 'right':
                top = triggerRect.top + scrollY + triggerRect.height / 2 - tooltipRect.height / 2;
                left = triggerRect.right + scrollX + 8;
                break;
            case 'bottom':
                top = triggerRect.bottom + scrollY + 8;
                left = triggerRect.left + scrollX + triggerRect.width / 2 - tooltipRect.width / 2;
                break;
            case 'left':
                top = triggerRect.top + scrollY + triggerRect.height / 2 - tooltipRect.height / 2;
                left = triggerRect.left + scrollX - tooltipRect.width - 8;
                break;
        }

        // Ensure tooltip stays within viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Adjust horizontal position if needed
        if (left < 10) {
            left = 10;
        } else if (left + tooltipRect.width > viewportWidth - 10) {
            left = viewportWidth - tooltipRect.width - 10;
        }

        // Adjust vertical position if needed
        if (top < 10) {
            top = 10;
        } else if (top + tooltipRect.height > viewportHeight + scrollY - 10) {
            top = viewportHeight + scrollY - tooltipRect.height - 10;
        }

        setTooltipPosition({ top, left });
    };

    const handleMouseEnter = () => {
        if (disabled) {return;}

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = window.setTimeout(() => {
            setIsVisible(true);
            // We need a small delay to let the tooltip render before calculating position
            setTimeout(calculatePosition, 0);
        }, delay);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setIsVisible(false);
    };

    // Handle scroll and resize
    useEffect(() => {
        if (isVisible) {
            const handlePositionUpdate = () => {
                calculatePosition();
            };

            window.addEventListener('scroll', handlePositionUpdate);
            window.addEventListener('resize', handlePositionUpdate);

            return () => {
                window.removeEventListener('scroll', handlePositionUpdate);
                window.removeEventListener('resize', handlePositionUpdate);
            };
        }

        return undefined; // Fixed: explicit return
    }, [isVisible]);

    // Clean up timeout on unmount
    useEffect(() => () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        }, []);

    return (
        <>
            <div
                ref={triggerRef}
                className="ds-tooltip-trigger"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onFocus={handleMouseEnter}
                onBlur={handleMouseLeave}
            >
                {children}
            </div>

            {isVisible &&
                createPortal(
                    <div
                        ref={tooltipRef}
                        className={cn(
                            'ds-tooltip',
                            `ds-tooltip-${position}`,
                            arrow && 'ds-tooltip-arrow',
                            className
                        )}
                        style={{
                            ...tooltipPosition,
                            maxWidth: `${maxWidth}px`,
                        }}
                        role="tooltip"
                        {...props}
                    >
                        {content}
                    </div>,
                    document.body
                )}
        </>
    );
};

Tooltip.displayName = 'Tooltip';