import React, { forwardRef, useEffect, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

import { ToastProps } from '../../types';
import { cn } from '../../utils';
import './Toast.scss';

export interface ToastComponentProps extends ToastProps {
    onRemove: () => void;
    visible: boolean;
}

export const Toast = forwardRef<HTMLDivElement, ToastComponentProps>(
    (
        {
            type = 'info',
            title,
            message,
            duration = 5000,
            onClose,
            onRemove,
            autoClose = true,
            visible,
            className,
            ...props
        },
        ref
    ) => {
        const [removing, setRemoving] = useState(false);

        useEffect(() => {
            let timer: number | undefined;

            if (autoClose && duration > 0) {
                timer = window.setTimeout(() => handleClose(), duration);
            }

            return () => {
                if (timer) {
                    clearTimeout(timer);
                }
            };
        }, [autoClose, duration]);

        const handleClose = () => {
            setRemoving(true);
            onClose?.();

            // Wait for exit animation to complete
            setTimeout(() => {
                onRemove();
            }, 300); // Match animation duration
        };

        const iconMap = {
            info: <Info size={18} />,
            success: <CheckCircle size={18} />,
            warning: <AlertTriangle size={18} />,
            error: <AlertCircle size={18} />,
        };

        return (
            <div
                ref={ref}
                className={cn(
                    'ds-toast',
                    `ds-toast-${type}`,
                    removing && 'ds-toast-removing',
                    !visible && 'ds-toast-hidden',
                    className
                )}
                role="alert"
                aria-live="polite"
                {...props}
            >
                <div className="ds-toast-icon">{iconMap[type]}</div>
                <div className="ds-toast-content">
                    {title && <div className="ds-toast-title">{title}</div>}
                    <div className="ds-toast-message">{message}</div>
                </div>
                <button
                    type="button"
                    onClick={handleClose}
                    className="ds-toast-close"
                    aria-label="Close toast"
                >
                    <X size={16} />
                </button>
            </div>
        );
    }
);

Toast.displayName = 'Toast';

// Toast container
export interface ToastContainerProps {
    className?: string;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
    children?: React.ReactNode;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
                                                                  className,
                                                                  position = 'top-right',
                                                                  children,
                                                              }) => (
    <div className={cn('ds-toast-container', `ds-toast-container-${position}`, className)}>
        {children}
    </div>
);

ToastContainer.displayName = 'ToastContainer';