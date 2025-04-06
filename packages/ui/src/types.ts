import { ReactNode } from 'react';

// Common size types
export type Size = 'sm' | 'md' | 'lg';

// Common variant types
export type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger' | 'warning' | 'success';

// Common props shared across components
export interface BaseProps {
    className?: string;
    children?: ReactNode;
    id?: string;
    'data-testid'?: string;
}

// Common props for interactive elements
export interface InteractiveProps extends BaseProps {
    disabled?: boolean;
    onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

// Base button props
export interface ButtonBaseProps extends InteractiveProps {
    type?: 'button' | 'submit' | 'reset';
    size?: Size;
    variant?: Variant;
    fullWidth?: boolean;
    loading?: boolean;
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
}

// Base input props
export interface InputBaseProps extends InteractiveProps {
    name?: string;
    value?: string | number;
    defaultValue?: string | number;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
    onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
    placeholder?: string;
    required?: boolean;
    readOnly?: boolean;
    autoFocus?: boolean;
    autoComplete?: string;
    error?: string;
    success?: boolean;
    size?: Size;
    fullWidth?: boolean;
}

// Toast/notification props
export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastProps extends BaseProps {
    type?: ToastType;
    title?: string;
    message: string;
    duration?: number; // milliseconds
    onClose?: () => void;
    autoClose?: boolean;
}

// Tab props
export interface TabItemProps extends BaseProps {
    value: string;
    label: string | ReactNode;
    disabled?: boolean;
    icon?: ReactNode;
}

export interface TabsProps extends BaseProps {
    value: string;
    onChange: (value: string) => void;
    children: ReactNode;
    variant?: 'default' | 'bordered' | 'pills';
    size?: Size;
    fullWidth?: boolean;
}

// Card props
export interface CardProps extends BaseProps {
    title?: string | ReactNode;
    subtitle?: string | ReactNode;
    image?: string;
    footer?: ReactNode;
    bordered?: boolean;
    hoverable?: boolean;
    size?: Size;
}