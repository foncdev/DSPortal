import React from 'react';

interface TreeNodeCheckboxProps {
    id: string;
    checked: boolean;
    disabled?: boolean;
    onChange: () => void;
}

/**
 * 트리 노드 체크박스 컴포넌트
 * 독립적인 컴포넌트로 분리하여 체크박스 기능 캡슐화
 */
const TreeNodeCheckbox: React.FC<TreeNodeCheckboxProps> = ({
                                                               id,
                                                               checked,
                                                               disabled = false,
                                                               onChange
                                                           }) => {
    // 클릭 이벤트가 상위 노드로 전파되지 않도록 처리
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!disabled) {
            onChange();
        }
    };

    return (
        <div className="tree-checkbox-wrapper" onClick={handleClick}>
            <input
                type="checkbox"
                id={`tree-checkbox-${id}`}
                className="tree-checkbox"
                checked={checked}
                onChange={() => {}} // 실제 변경은 div 클릭 이벤트에서 처리
                disabled={disabled}
            />
            <label
                htmlFor={`tree-checkbox-${id}`}
                className="tree-checkbox-label"
            />
        </div>
    );
};

export default TreeNodeCheckbox;