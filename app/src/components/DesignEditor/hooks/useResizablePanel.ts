// src/components/DesignEditor/hooks/useResizablePanel.ts
import { useState, useRef, useEffect } from 'react';

/**
 * 패널 리사이징을 위한 훅 개선 버전
 * @param initialWidth - 패널의 초기 너비
 * @param minWidth - 패널의 최소 너비
 * @param maxWidth - 패널의 최대 너비
 * @param position - 패널의 위치 ('left' 또는 'right')
 * @returns 패널 상태와 참조
 */
export const useResizablePanel = (
    initialWidth: number = 280,
    minWidth: number = 200,
    maxWidth: number = 400,
    position: 'left' | 'right' = 'left'
) => {
    const [width, setWidth] = useState(initialWidth);
    const [isResizing, setIsResizing] = useState(false);

    const panelRef = useRef<HTMLDivElement>(null);
    const resizeHandleRef = useRef<HTMLDivElement>(null);
    const startXRef = useRef<number>(0);
    const startWidthRef = useRef<number>(initialWidth);

    // 리사이징 시작
    const startResizing = (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        startXRef.current = e.clientX;
        startWidthRef.current = width;
        setIsResizing(true);

        // 리사이징 중임을 시각적으로 표시
        document.body.style.cursor = 'col-resize';
        if (resizeHandleRef.current) {
            resizeHandleRef.current.classList.add('resizing');
        }
    };

    // 리사이징 중 마우스 이동 처리
    const handleMouseMove = (e: MouseEvent) => {
        if (!isResizing) {return;}

        const delta = e.clientX - startXRef.current;
        let newWidth;

        if (position === 'left') {
            newWidth = startWidthRef.current + delta;
        } else {
            newWidth = startWidthRef.current - delta;
        }

        // 범위 제한
        newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
        setWidth(newWidth);
    };

    // 리사이징 종료
    const stopResizing = () => {
        setIsResizing(false);
        document.body.style.cursor = '';
        if (resizeHandleRef.current) {
            resizeHandleRef.current.classList.remove('resizing');
        }
    };

    // 이벤트 리스너 등록 및 해제
    useEffect(() => {
        const handleMouseUp = () => {
            if (isResizing) {
                stopResizing();
            }
        };

        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    return {
        width,
        setWidth,
        isResizing,
        startResizing,
        stopResizing,
        panelRef,
        resizeHandleRef
    };
};