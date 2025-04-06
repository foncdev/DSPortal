import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { InputBaseProps } from '../../types';
import { cn } from '../../utils';
import './TextField.scss';

export interface TextFieldProps extends InputBaseProps {
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
    label?: string;
    icon?: React.ReactNode;
    helperText?: string;
    success?: boolean;
    error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
    (
        {
            className,
            type = 'text',
            size = 'md',
            label,
            icon,
            fullWidth = false,
            disabled = false,
            readOnly = false,
            error,
            success,
            helperText,
            onFocus,
            onBlur,
            ...props
        },
        ref
    ) => {
        const [focused, setFocused] = useState(false);
        const [passwordVisible, setPasswordVisible] = useState(false);

        const isPassword = type === 'password';
        const effectiveType = isPassword && passwordVisible ? 'text' : type;

        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
            setFocused(true);
            onFocus?.(e);
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            setFocused(false);
            onBlur?.(e);
        };

        const togglePasswordVisibility = () => {
            setPasswordVisible(!passwordVisible);
        };

        return (
            <div
                className={cn(
                    'ds-textfield-container',
                    fullWidth && 'ds-textfield-full',
                    className
                )}
            >
                {label && (
                    <label className="ds-textfield-label">
                        {label}
                    </label>
                )}

                <div
                    className={cn(
                        'ds-textfield-wrapper',
                        `ds-textfield-${size}`,
                        focused && 'ds-textfield-focused',
                        disabled && 'ds-textfield-disabled',
                        readOnly && 'ds-textfield-readonly',
                        error && 'ds-textfield-error',
                        success && 'ds-textfield-success'
                    )}
                >
                    {icon && <div className="ds-textfield-icon">{icon}</div>}

                    <input
                        ref={ref}
                        type={effectiveType}
                        className={cn(
                            'ds-textfield',
                            icon && 'ds-textfield-with-icon',
                            isPassword && 'ds-textfield-with-action'
                        )}
                        disabled={disabled}
                        readOnly={readOnly}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        {...props}
                    />

                    {isPassword && (
                        <button
                            type="button"
                            className="ds-textfield-password-toggle"
                            onClick={togglePasswordVisibility}
                            aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                            tabIndex={-1}
                        >
                            {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    )}
                </div>

                {(helperText || error) && (
                    <div className={cn(
                        'ds-textfield-helper',
                        error && 'ds-textfield-helper-error'
                    )}>
                        {error || helperText}
                    </div>
                )}
            </div>
        );
    }
);

TextField.displayName = 'TextField';