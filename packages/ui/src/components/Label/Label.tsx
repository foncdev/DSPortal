import { forwardRef } from 'react';

import { BaseProps } from '../../types';
import { cn } from '../../utils';
import './Label.scss';

export interface LabelProps extends BaseProps {
    htmlFor?: string;
    required?: boolean;
    disabled?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
    ({ children, className, htmlFor, required = false, disabled = false, ...props }, ref) => (
            <label
                ref={ref}
                htmlFor={htmlFor}
                className={cn(
                    'ds-label',
                    required && 'ds-label-required',
                    disabled && 'ds-label-disabled',
                    className
                )}
                {...props}
            >
                {children}
                {required && <span className="ds-label-required-indicator">*</span>}
            </label>
        )
);

Label.displayName = 'Label';