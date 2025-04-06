import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

import { BaseProps } from '../../types';
import { cn } from '../../utils';
import './Modal.scss';

export interface ModalProps extends BaseProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    closeOnEsc?: boolean;
    closeOnOverlayClick?: boolean;
    closeButton?: boolean;
    preventScroll?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
                                                isOpen,
                                                onClose,
                                                title,
                                                size = 'md',
                                                closeOnEsc = true,
                                                closeOnOverlayClick = true,
                                                closeButton = true,
                                                preventScroll = true,
                                                children,
                                                className,
                                                ...props
                                            }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<Element | null>(null);

    // Handle escape key press
    useEffect(() => {
        if (!isOpen || !closeOnEsc) {
            return undefined; // Fixed: explicit return value
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, closeOnEsc, onClose]);

    // Handle focus trap and body scroll
    useEffect(() => {
        if (!isOpen) {
            return undefined; // Fixed: explicit return value
        }

        // Save current active element to restore focus later
        previousActiveElement.current = document.activeElement;

        // Focus the modal
        if (modalRef.current) {
            modalRef.current.focus();
        }

        // Prevent body scroll
        if (preventScroll) {
            document.body.style.overflow = 'hidden';
        }

        return () => {
            // Restore focus
            if (previousActiveElement.current && 'focus' in previousActiveElement.current) {
                (previousActiveElement.current as HTMLElement).focus();
            }

            // Restore body scroll
            if (preventScroll) {
                document.body.style.overflow = '';
            }
        };
    }, [isOpen, preventScroll]);

    // Handle overlay click
    const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!closeOnOverlayClick) {
            return;
        }

        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) {
        return null;
    }

    // Create portal
    return createPortal(
        <div
            className="ds-modal-overlay"
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
        >
            <div
                ref={modalRef}
                className={cn(
                    'ds-modal-modal',
                    `ds-modal-${size}`,
                    className
                )}
                tabIndex={-1}
                {...props}
            >
                {(title || closeButton) && (
                    <div className="ds-modal-header">
                        {title && <h2 className="ds-modal-title">{title}</h2>}
                        {closeButton && (
                            <button
                                type="button"
                                className="ds-modal-close"
                                onClick={onClose}
                                aria-label="Close modal"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                )}
                <div className="ds-modal-body">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

// Modal subcomponents
export interface ModalFooterProps extends BaseProps {}

export const ModalFooter: React.FC<ModalFooterProps> = ({ children, className, ...props }) => (
    <div className={cn('ds-modal-footer', className)} {...props}>
        {children}
    </div>
);

Modal.displayName = 'Modal';
ModalFooter.displayName = 'ModalFooter';