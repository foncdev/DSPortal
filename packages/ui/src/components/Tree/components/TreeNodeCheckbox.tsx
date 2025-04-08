import React, { useEffect, useRef } from 'react';

interface TreeNodeCheckboxProps {
    id: string;
    checked: boolean;
    disabled?: boolean;
    onChange: () => void;
}

const TreeNodeCheckbox: React.FC<TreeNodeCheckboxProps> = ({
                                                               id,
                                                               checked,
                                                               disabled = false,
                                                               onChange
                                                           }) => {
    // Reference to the checkbox DOM element
    const checkboxRef = useRef<HTMLInputElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Update DOM directly when checked prop changes
    useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.checked = checked;
        }
    }, [checked]);

    // Expand click area to entire parent element
    useEffect(() => {
        const wrapper = wrapperRef.current;
        const checkbox = checkboxRef.current;

        if (wrapper && checkbox) {
            // Make sure the wrapper fills the entire checkbox area
            wrapper.style.position = 'relative';
            wrapper.style.width = '24px';  // Increased from 16px
            wrapper.style.height = '24px'; // Increased from 16px
            wrapper.style.cursor = disabled ? 'not-allowed' : 'pointer';
        }
    }, [disabled]);

    // Handle click with proper event isolation
    const handleClick = (e: React.MouseEvent) => {
        // This is critical: prevent the event from reaching the parent node
        e.stopPropagation();

        if (!disabled) {
            // Toggle checkbox state via parent component
            onChange();
        }
    };

    return (
        <div
            ref={wrapperRef}
            className="tree-checkbox-wrapper"
            onClick={handleClick}
            // Capture all mouse events to prevent them from bubbling up
            // onMouseDown={(e) => e.stopPropagation()}
        >
            <input
                ref={checkboxRef}
                type="checkbox"
                id={`tree-checkbox-${id}`}
                className="tree-checkbox"
                checked={checked}
                disabled={disabled}
                onChange={(e) => e.stopPropagation()}
                onClick={(e) => {
                    handleClick(e);
                }}
                aria-label={`Select ${id}`}
            />
            <label
                htmlFor={`tree-checkbox-${id}`}
                className="tree-checkbox-label"
                onClick={(e) => {
                    e.stopPropagation();
                }}
            />
        </div>
    );
};

export default TreeNodeCheckbox;