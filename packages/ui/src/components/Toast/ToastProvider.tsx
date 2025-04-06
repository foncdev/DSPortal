import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { ToastProps } from '../../types';
import { Toast } from './Toast';

interface ToastContextType {
    toast: (props: ToastProps) => string;
    success: (message: string, options?: Partial<Omit<ToastProps, 'message' | 'type'>>) => string;
    error: (message: string, options?: Partial<Omit<ToastProps, 'message' | 'type'>>) => string;
    warning: (message: string, options?: Partial<Omit<ToastProps, 'message' | 'type'>>) => string;
    info: (message: string, options?: Partial<Omit<ToastProps, 'message' | 'type'>>) => string;
    remove: (id: string) => void;
    removeAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export interface ToastProviderProps {
    children: React.ReactNode;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
    maxToasts?: number;
}

interface ToastItem extends ToastProps {
    id: string;
    visible: boolean;
}

// Updated ToastContainer to accept children
export interface ExtendedToastContainerProps {
    className?: string;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
    children?: React.ReactNode;
}

const ToastPortalContainer: React.FC<ExtendedToastContainerProps> = ({
                                                                         className,
                                                                         position = 'top-right',
                                                                         children
                                                                     }) => (
    <div className={`ds-toast-container ds-toast-container-${position} ${className || ''}`}>
        {children}
    </div>
);

export const ToastProvider: React.FC<ToastProviderProps> = ({
                                                                children,
                                                                position = 'top-right',
                                                                maxToasts = 5,
                                                            }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const idCounter = useRef(0);

    console.log('toast containerRef => ', containerRef)

    const createToast = useCallback(
        (props: ToastProps): string => {
            const id = `toast-${++idCounter.current}`;

            setToasts((currentToasts) => {
                // If we're at max capacity, remove the oldest toast
                let newToasts = [...currentToasts];
                if (newToasts.length >= maxToasts) {
                    newToasts = newToasts.slice(1);
                }

                return [...newToasts, { id, visible: true, ...props }];
            });

            return id;
        },
        [maxToasts]
    );

    const removeToast = useCallback((id: string) => {
        setToasts((currentToasts) =>
            currentToasts.filter((toast) => toast.id !== id)
        );
    }, []);

    const removeAllToasts = useCallback(() => {
        setToasts([]);
    }, []);

    // Convenience methods for different toast types
    const successToast = useCallback(
        (message: string, options?: Partial<Omit<ToastProps, 'message' | 'type'>>) =>
            createToast({ message, type: 'success', ...options }),
        [createToast]
    );

    const errorToast = useCallback(
        (message: string, options?: Partial<Omit<ToastProps, 'message' | 'type'>>) =>
            createToast({ message, type: 'error', ...options }),
        [createToast]
    );

    const warningToast = useCallback(
        (message: string, options?: Partial<Omit<ToastProps, 'message' | 'type'>>) =>
            createToast({ message, type: 'warning', ...options }),
        [createToast]
    );

    const infoToast = useCallback(
        (message: string, options?: Partial<Omit<ToastProps, 'message' | 'type'>>) =>
            createToast({ message, type: 'info', ...options }),
        [createToast]
    );

    const contextValue = {
        toast: createToast,
        success: successToast,
        error: errorToast,
        warning: warningToast,
        info: infoToast,
        remove: removeToast,
        removeAll: removeAllToasts,
    };

    // Create a portal for the toasts
    const toastPortal = typeof document !== 'undefined' ? createPortal(
        <ToastPortalContainer position={position}>
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    visible={toast.visible}
                    onRemove={() => removeToast(toast.id)}
                    {...toast}
                />
            ))}
        </ToastPortalContainer>,
        document.body
    ) : null;

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            {toastPortal}
        </ToastContext.Provider>
    );
};

// Hook to use the toast context
export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};