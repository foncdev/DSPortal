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

    // Update DOM directly when checked prop changes
    useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.checked = checked;
        }
    }, [checked]);

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
            className="tree-checkbox-wrapper"
            onClick={handleClick}
            // Capture all mouse events to prevent them from bubbling up
            onMouseDown={(e) => e.stopPropagation()}
        >
            <input
                ref={checkboxRef}
                type="checkbox"
                id={`tree-checkbox-${id}`}
                className="tree-checkbox"
                checked={checked}
                disabled={disabled}
                // Important: We're handling the change via the wrapper div's click
                // This prevents double toggling
                onChange={(e) => e.stopPropagation()}
                // Prevent default checkbox behavior - we'll handle it ourselves
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
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