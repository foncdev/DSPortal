// packages/ui/src/components/TextField/TextField.tsx
import React, { forwardRef, useState, useCallback, useRef, useEffect } from 'react';
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
            value,
            onChange,
            ...props
        },
        ref
    ) => {
        const [focused, setFocused] = useState(false);
        const [passwordVisible, setPasswordVisible] = useState(false);
        const inputRef = useRef<HTMLInputElement>(null);

        // 외부에서 전달된 ref와 내부 ref 통합
        const handleRef = (instance: HTMLInputElement | null) => {
            // inputRef 설정
            inputRef.current = instance;

            // 외부 ref가 함수인 경우
            if (typeof ref === 'function') {
                ref(instance);
            }
            // 외부 ref가 객체인 경우
            else if (ref) {
                (ref as React.MutableRefObject<HTMLInputElement | null>).current = instance;
            }
        };

        const isPassword = type === 'password';
        const effectiveType = isPassword && passwordVisible ? 'text' : type;

        // 포커스 복원을 위한 마지막 선택 위치 저장
        const lastSelectionRef = useRef<{start: number | null, end: number | null}>({
            start: null,
            end: null
        });

        // 렌더링 후 포커스와 커서 위치 복원
        useEffect(() => {
            if (focused && inputRef.current && lastSelectionRef.current.start !== null) {
                inputRef.current.focus();

                try {
                    // 저장된 커서 위치로 복원
                    inputRef.current.setSelectionRange(
                        lastSelectionRef.current.start!,
                        lastSelectionRef.current.end!
                    );
                } catch (e) {
                    // setSelectionRange는 숫자 입력 등에서 오류가 발생할 수 있음
                    console.error('Could not restore selection:', e);
                }
            }
        }, [focused, value]);

        const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
            setFocused(true);
            onFocus?.(e);
        }, [onFocus]);

        const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
            // 다른 곳으로 포커스가 이동하기 전의 선택 위치 저장
            if (inputRef.current) {
                lastSelectionRef.current = {
                    start: inputRef.current.selectionStart,
                    end: inputRef.current.selectionEnd
                };
            }

            setFocused(false);
            onBlur?.(e);
        }, [onBlur]);

        const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
            // 변경 전 선택 위치 저장
            if (inputRef.current) {
                lastSelectionRef.current = {
                    start: inputRef.current.selectionStart,
                    end: inputRef.current.selectionEnd
                };
            }

            onChange?.(e);
        }, [onChange]);

        const togglePasswordVisibility = useCallback(() => {
            setPasswordVisible(prev => !prev);
        }, []);

        return (
            <div
                className={cn(
                    'ds-textfield-container',
                    fullWidth && 'ds-textfield-full',
                    className
                )}
            >
                {label && (
                    <label className="ds-textfield-label" htmlFor={props.id}>
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
                        ref={handleRef}
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
                        onChange={handleChange}
                        value={value}
                        {...props}
                    />

                    {isPassword && (
                        <button
                            type="button"
                            className="ds-textfield-password-toggle"
                            onClick={togglePasswordVisibility}
                            onMouseDown={(e) => e.preventDefault()} // 포커스 손실 방지
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