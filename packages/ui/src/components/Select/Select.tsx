import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

import { InputBaseProps } from '../../types';
import { cn, generateId } from '../../utils';
import './Select.scss';

export interface SelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
}

export interface SelectProps extends Omit<InputBaseProps, 'value' | 'defaultValue' | 'onChange'> {
    options: SelectOption[];
    value?: string | number;
    defaultValue?: string | number;
    onChange?: (value: string | number) => void;
    label?: string;
    placeholder?: string;
    error?: string;
    helperText?: string;
    success?: boolean;
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(
    (
        {
            className,
            options,
            value,
            defaultValue,
            onChange,
            label,
            placeholder = 'Select an option',
            size = 'md',
            disabled = false,
            required = false,
            fullWidth = false,
            error,
            helperText,
            success,
            id: providedId,
            ...props
        },
        ref
    ) => {
        const [isOpen, setIsOpen] = useState(false);
        const [selectedValue, setSelectedValue] = useState<string | number | undefined>(value || defaultValue);
        const [isFocused, setIsFocused] = useState(false);

        const selectRef = useRef<HTMLDivElement>(null);
        const uniqueId = useRef(providedId || generateId('select'));

        // Close dropdown when clicking outside
        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, []);

        // Update internal state when value prop changes
        useEffect(() => {
            if (value !== undefined) {
                setSelectedValue(value);
            }
        }, [value]);

        const toggleDropdown = () => {
            if (!disabled) {
                setIsOpen(!isOpen);
            }
        };

        const handleOptionSelect = (option: SelectOption) => {
            if (option.disabled) {return;}

            setSelectedValue(option.value);
            setIsOpen(false);
            onChange?.(option.value);
        };

        const getSelectedLabel = () => {
            const selectedOption = options.find(option => option.value === selectedValue);
            return selectedOption ? selectedOption.label : placeholder;
        };

        const handleKeyDown = (e: React.KeyboardEvent) => {
            switch (e.key) {
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    toggleDropdown();
                    break;
                case 'Escape':
                    setIsOpen(false);
                    break;
                case 'Tab':
                    setIsOpen(false);
                    break;
                // Add arrow key navigation later
            }
        };

        const handleFocus = () => {
            setIsFocused(true);
        };

        const handleBlur = () => {
            setIsFocused(false);
        };

        return (
            <div
                className={cn(
                    'ds-select-container',
                    fullWidth && 'ds-select-full',
                    className
                )}
            >
                {label && (
                    <label
                        htmlFor={uniqueId.current}
                        className="ds-select-label"
                    >
                        {label}
                        {required && <span className="ds-select-required">*</span>}
                    </label>
                )}

                <div
                    ref={selectRef}
                    className={cn(
                        'ds-select-wrapper',
                        `ds-select-${size}`,
                        isOpen && 'ds-select-open',
                        isFocused && 'ds-select-focused',
                        disabled && 'ds-select-disabled',
                        error && 'ds-select-error',
                        success && 'ds-select-success'
                    )}
                >
                    <div
                        ref={ref}
                        className="ds-select-trigger"
                        onClick={toggleDropdown}
                        onKeyDown={handleKeyDown}
                        tabIndex={disabled ? -1 : 0}
                        role="combobox"
                        aria-expanded={isOpen}
                        aria-haspopup="listbox"
                        aria-controls={`${uniqueId.current}-options`}
                        id={uniqueId.current}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        {...props}
                    >
            <span className={cn(
                'ds-select-value',
                !selectedValue && 'ds-select-placeholder'
            )}>
              {getSelectedLabel()}
            </span>
                        <ChevronDown
                            size={16}
                            className={cn(
                                'ds-select-icon',
                                isOpen && 'ds-select-icon-open'
                            )}
                        />
                    </div>

                    {isOpen && (
                        <div
                            className="ds-select-dropdown"
                            role="listbox"
                            id={`${uniqueId.current}-options`}
                            aria-labelledby={uniqueId.current}
                        >
                            {options.map((option) => (
                                <div
                                    key={option.value}
                                    role="option"
                                    aria-selected={selectedValue === option.value}
                                    className={cn(
                                        'ds-select-option',
                                        selectedValue === option.value && 'ds-select-option-selected',
                                        option.disabled && 'ds-select-option-disabled'
                                    )}
                                    onClick={() => handleOptionSelect(option)}
                                >
                                    <span className="ds-select-option-label">{option.label}</span>
                                    {selectedValue === option.value && (
                                        <Check size={16} className="ds-select-option-check" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {(helperText || error) && (
                    <div className={cn(
                        'ds-select-helper',
                        error && 'ds-select-helper-error'
                    )}>
                        {error || helperText}
                    </div>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';