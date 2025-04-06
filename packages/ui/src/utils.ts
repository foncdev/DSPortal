import { Size, Variant } from './types';

/**
 * Get CSS class based on component size
 */
export function getSizeClass(size: Size, component: string): string {
    switch (size) {
        case 'sm':
            return `${component}-sm`;
        case 'lg':
            return `${component}-lg`;
        case 'md':
        default:
            return `${component}-md`;
    }
}

/**
 * Get CSS class based on component variant
 */
export function getVariantClass(variant: Variant, component: string): string {
    switch (variant) {
        case 'secondary':
            return `${component}-secondary`;
        case 'outline':
            return `${component}-outline`;
        case 'ghost':
            return `${component}-ghost`;
        case 'link':
            return `${component}-link`;
        case 'danger':
            return `${component}-danger`;
        case 'warning':
            return `${component}-warning`;
        case 'success':
            return `${component}-success`;
        case 'primary':
        default:
            return `${component}-primary`;
    }
}

/**
 * Combine multiple class names and filter out falsy values
 */
export function cn(...classes: (string | undefined | null | boolean)[]): string {
    return classes.filter(Boolean).join(' ');
}

/**
 * Generate a unique ID
 */
export function generateId(prefix: string = 'ds'): string {
    return `${prefix}-${Math.random().toString(36).substring(2, 10)}`;
}