import React, { useEffect, useRef } from 'react';

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
    // 체크박스 DOM 요소 참조
    const checkboxRef = useRef<HTMLInputElement>(null);

    // checked 속성 변경 시 즉시 DOM에 반영하도록 함
    useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.checked = checked;
        }
    }, [checked]);

    // 클릭 이벤트가 상위 노드로 전파되지 않도록 처리
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (!disabled) {
            // 직접 상태를 변경하여 시각적 피드백을 즉시 제공
            if (checkboxRef.current) {
                checkboxRef.current.checked = !checked;
            }
            // 부모 컴포넌트에 변경 알림
            onChange();
        }
    };

    return (
        <div
            className="tree-checkbox-wrapper"
            onClick={handleClick}
            // 추가: 체크박스 영역이 클릭된 것을 명확히 시각적으로 표시
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
        >
            <input
                ref={checkboxRef}
                type="checkbox"
                id={`tree-checkbox-${id}`}
                className="tree-checkbox"
                checked={checked}
                onChange={(e) => {
                    e.stopPropagation();
                    // onChange가 호출되어 상태가 업데이트되므로 여기서는 이벤트 전파만 막음
                }}
                onClick={(e) => {
                    // 브라우저의 기본 체크박스 토글을 방지
                    e.stopPropagation();
                    e.preventDefault();
                }}
                disabled={disabled}
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