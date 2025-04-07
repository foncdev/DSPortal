import React from 'react';
import './Dialog.scss';

interface DialogProps {
    /** Dialog title */
    title: string;
    /** Dialog content or message */
    children?: React.ReactNode;
    /** Is dialog open */
    isOpen: boolean;
    /** Callback when dialog closes */
    onClose: () => void;
    /** Width of the dialog */
    width?: string;
}

interface ConfirmDialogProps {
    /** Dialog title */
    title: string;
    /** Dialog message */
    message: string;
    /** Is dialog open */
    isOpen: boolean;
    /** Callback when confirmed */
    onConfirm: () => void;
    /** Callback when canceled */
    onCancel: () => void;
    /** Confirm button text */
    confirmText?: string;
    /** Cancel button text */
    cancelText?: string;
}

/**
 * Basic Dialog Component
 */
export const Dialog: React.FC<DialogProps> = ({
                                                  title,
                                                  children,
                                                  isOpen,
                                                  onClose,
                                                  width = '400px'
                                              }) => {
    if (!isOpen) {return null;}

    return (
        <div className="dialog-overlay" onClick={onClose}>
            <div
                className="dialog-container"
                style={{ width }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="dialog-header">
                    <h2 className="dialog-title">{title}</h2>
                    <button className="dialog-close" onClick={onClose}>
                        &times;
                    </button>
                </div>
                <div className="dialog-content">
                    {children}
                </div>
            </div>
        </div>
    );
};

/**
 * Confirmation Dialog Component
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
                                                                title,
                                                                message,
                                                                isOpen,
                                                                onConfirm,
                                                                onCancel,
                                                                confirmText = 'Confirm',
                                                                cancelText = 'Cancel'
                                                            }) => {
    if (!isOpen) {return null;}

    return (
        <Dialog title={title} isOpen={isOpen} onClose={onCancel}>
            <div className="confirm-dialog">
                <p className="confirm-message">{message}</p>
                <div className="confirm-actions">
                    <button className="cancel-button" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button className="confirm-button" onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </Dialog>
    );
};

export default { Dialog, ConfirmDialog };