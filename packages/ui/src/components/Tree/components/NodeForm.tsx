import React, { useState, useEffect, useRef } from 'react';
import { NodeFormProps } from '../types';

/**
 * 노드 생성 또는 편집을 위한 인라인 폼 컴포넌트
 */
const NodeForm: React.FC<NodeFormProps> = ({
                                               initialValue,
                                               placeholder,
                                               autoFocus = true,
                                               onSubmit,
                                               onCancel
                                           }) => {
    const [value, setValue] = useState(initialValue);
    const inputRef = useRef<HTMLInputElement>(null);

    // 포커스 자동 설정
    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
            // 텍스트 전체 선택
            inputRef.current.select();
        }
    }, [autoFocus]);

    // 폼 제출 핸들러
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const trimmedValue = value.trim();
        if (trimmedValue) {
            onSubmit(trimmedValue);
        } else {
            onCancel();
        }
    };

    return (
        <form
            className="edit-form"
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
        >
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                onBlur={() => {
                    const trimmedValue = value.trim();
                    if (trimmedValue) {
                        onSubmit(trimmedValue);
                    } else {
                        onCancel();
                    }
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                        e.preventDefault();
                        e.stopPropagation();
                        onCancel();
                    }
                }}
            />
        </form>
    );
};

export default NodeForm;