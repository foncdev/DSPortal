import React from 'react';
import { useTranslation } from 'react-i18next';
import './Dialog.scss';
import { DialogProps, ConfirmDialogProps } from './types';

/**
 * 기본 다이얼로그 컴포넌트
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
                    <button className="dialog-close" onClick={onClose} aria-label="Close">
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
 * 확인 다이얼로그 컴포넌트
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
                                                                title,
                                                                message,
                                                                isOpen,
                                                                onConfirm,
                                                                onCancel,
                                                                confirmText,
                                                                cancelText
                                                            }) => {
    const { t } = useTranslation();

    if (!isOpen) {return null;}

    // 다국어 처리
    const translatedTitle = t(title);
    const translatedMessage = t(message, { name: message.includes('{{name}}') ? '' : '' });
    const translatedConfirmText = confirmText ? t(confirmText) : t('tree.confirmButton');
    const translatedCancelText = cancelText ? t(cancelText) : t('tree.cancelButton');

    return (
        <Dialog title={translatedTitle} isOpen={isOpen} onClose={onCancel}>
            <div className="confirm-dialog">
                <p className="confirm-message">{translatedMessage}</p>
                <div className="confirm-actions">
                    <button className="cancel-button" onClick={onCancel}>
                        {translatedCancelText}
                    </button>
                    <button className="confirm-button" onClick={onConfirm}>
                        {translatedConfirmText}
                    </button>
                </div>
            </div>
        </Dialog>
    );
};

export default { Dialog, ConfirmDialog };