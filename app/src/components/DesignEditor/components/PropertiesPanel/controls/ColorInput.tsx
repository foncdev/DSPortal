import React, { useState, useRef, useEffect } from 'react';
import styles from './ColorInput.module.scss';

interface ColorInputProps {
    value: string;
    onChange: (value: string) => void;
}

/**
 * Enhanced color input control with text input for hex values
 */
const ColorInput: React.FC<ColorInputProps> = ({ value, onChange }) => {
    const [hexValue, setHexValue] = useState(value || '#000000');
    const [showInput, setShowInput] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Update internal state when value changes externally
    useEffect(() => {
        if (value) {
            setHexValue(value);
        }
    }, [value]);

    // Focus input when opened
    useEffect(() => {
        if (showInput && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [showInput]);

    // Handle direct color picker change
    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newColor = e.target.value;
        setHexValue(newColor);
        onChange(newColor);
    };

    // Handle manual hex input
    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newHex = e.target.value;
        setHexValue(newHex);
    };

    // Apply hex input when enter is pressed or input is blurred
    const applyHexValue = () => {
        // Validate hex value
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

        // Normalize input (add # if missing)
        let normalizedHex = hexValue;
        if (!normalizedHex.startsWith('#')) {
            normalizedHex = `#${normalizedHex}`;
        }

        // Only apply if it's a valid hex color
        if (hexRegex.test(normalizedHex)) {
            onChange(normalizedHex);
        } else {
            // Reset to the current value if invalid
            setHexValue(value);
        }

        setShowInput(false);
    };

    // Handle key press in hex input
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            applyHexValue();
        } else if (e.key === 'Escape') {
            setHexValue(value);
            setShowInput(false);
        }
    };

    return (
        <div className={styles.colorInputContainer}>
            <div className={styles.colorSquare}>
                <input
                    type="color"
                    value={hexValue}
                    onChange={handleColorChange}
                    className={styles.colorPicker}
                />
            </div>

            {showInput ? (
                <input
                    ref={inputRef}
                    type="text"
                    value={hexValue}
                    onChange={handleHexChange}
                    onBlur={applyHexValue}
                    onKeyDown={handleKeyPress}
                    className={styles.hexInput}
                    placeholder="#RRGGBB"
                />
            ) : (
                <button
                    className={styles.hexValue}
                    onClick={() => setShowInput(true)}
                    title="Click to edit hex value"
                >
                    {hexValue.toUpperCase()}
                </button>
            )}
        </div>
    );
};

export default ColorInput;