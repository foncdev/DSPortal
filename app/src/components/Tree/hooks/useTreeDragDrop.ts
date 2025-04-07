import { useState, useCallback, useRef } from 'react';
import { TreeNode, DropPosition, TreeDragDropState, TreeProps } from '../types';
import { DROP_THRESHOLD, DROP_CLASSES } from '../constants';
import { moveNode } from '../utils/treeOperations';
import { isDescendantOf } from '../utils/treeNodeFinder';

/**
 * 트리 드래그 앤 드롭 기능 훅
 */
export const useTreeDragDrop = (
    props: TreeProps,
    treeData: TreeNode[],
    setTreeData: React.Dispatch<React.SetStateAction<TreeNode[]>>
): TreeDragDropState => {
    const { draggable, onChange, onNodeMove } = props;

    // 드래그 앤 드롭 상태
    const [draggedNode, setDraggedNode] = useState<TreeNode | null>(null);
    const [dropTargetId, setDropTargetId] = useState<string | null>(null);
    const [dropPosition, setDropPosition] = useState<DropPosition | null>(null);

    // Prevent excessive state updates
    const lastDropEventRef = useRef<number>(0);

    // 드롭 위치 계산
    const getDropPosition = useCallback((y: number, rect: DOMRect): DropPosition => {
        const relativeY = y - rect.top;
        const height = rect.height;

        if (relativeY < height * DROP_THRESHOLD.ABOVE) return DropPosition.Above;
        if (relativeY > height * DROP_THRESHOLD.BELOW) return DropPosition.Below;
        return DropPosition.Inside;
    }, []);

    // 드롭 타겟 CSS 클래스 계산
    const getDropIndicatorClass = useCallback((nodeId: string, position: DropPosition | null) => {
        if (nodeId !== dropTargetId || !position) return '';

        switch (position) {
            case DropPosition.Above:
                return DROP_CLASSES.ABOVE;
            case DropPosition.Below:
                return DROP_CLASSES.BELOW;
            case DropPosition.Inside:
                return DROP_CLASSES.INSIDE;
            default:
                return '';
        }
    }, [dropTargetId]);

    // 드래그 시작 핸들러
    const handleDragStart = useCallback((e: React.DragEvent, node: TreeNode) => {
        if (!draggable || node.isDisabled) return;

        e.stopPropagation();
        e.dataTransfer.setData('text/plain', node.id);
        e.dataTransfer.effectAllowed = 'move';
        setDraggedNode(node);

        // 드래그 프리뷰 생성
        const dragPreview = document.createElement('div');
        dragPreview.className = 'tree-drag-preview';
        dragPreview.textContent = node.name;
        document.body.appendChild(dragPreview);
        e.dataTransfer.setDragImage(dragPreview, 0, 0);

        // 프리뷰 요소 제거
        setTimeout(() => {
            document.body.removeChild(dragPreview);
        }, 0);
    }, [draggable]);

    // 드래그 오버 핸들러
    const handleDragOver = useCallback((e: React.DragEvent, node: TreeNode) => {
        e.preventDefault();
        e.stopPropagation();

        if (!draggable || !draggedNode || node.isDisabled) return;

        // Throttle drag over updates to prevent excessive state updates
        const now = Date.now();
        if (now - lastDropEventRef.current < 50) { // 50ms throttling
            return;
        }
        lastDropEventRef.current = now;

        // 자기 자신이나 자손에게 드롭 방지
        if (node.id === draggedNode.id || isDescendantOf(node.id, draggedNode.id, treeData)) {
            return;
        }

        // 드롭 효과 설정
        e.dataTransfer.dropEffect = 'move';

        // 드롭 위치 계산
        const rect = e.currentTarget.getBoundingClientRect();
        const position = getDropPosition(e.clientY, rect);

        // 폴더가 아닌 노드는 Inside 드롭 위치 제한
        if (position === DropPosition.Inside &&
            node.type !== 'folder' &&
            node.type !== 'default') {
            return;
        }

        setDropTargetId(node.id);
        setDropPosition(position);
    }, [draggable, draggedNode, treeData, getDropPosition]);

    // 드래그 리브 핸들러
    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDropTargetId(null);
        setDropPosition(null);
    }, []);

    // 드롭 핸들러
    const handleDrop = useCallback((e: React.DragEvent, targetNode: TreeNode) => {
        e.preventDefault();
        e.stopPropagation();

        if (!draggable || !draggedNode || targetNode.isDisabled || !dropPosition) {
            resetDragState();
            return;
        }

        // 자기 자신이나 자손에게 드롭 방지
        if (targetNode.id === draggedNode.id ||
            isDescendantOf(targetNode.id, draggedNode.id, treeData)) {
            resetDragState();
            return;
        }

        // 폴더가 아닌 노드는 Inside 드롭 위치 제한
        if (dropPosition === DropPosition.Inside &&
            targetNode.type !== 'folder' &&
            targetNode.type !== 'default') {
            resetDragState();
            return;
        }

        // 노드 이동 처리
        const { updatedTree, movedNode } = moveNode(
            treeData,
            draggedNode.id,
            targetNode.id,
            dropPosition
        );

        if (movedNode) {
            setTreeData(updatedTree);
            onChange?.(updatedTree);

            // 이동 콜백 호출
            onNodeMove?.(movedNode, targetNode, dropPosition);
        }

        resetDragState();
    }, [draggable, draggedNode, dropPosition, treeData, onChange, onNodeMove]);

    // 드래그 종료 핸들러
    const handleDragEnd = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        resetDragState();
    }, []);

    // 드래그 상태 초기화
    const resetDragState = useCallback(() => {
        setDropTargetId(null);
        setDropPosition(null);
        setDraggedNode(null);
    }, []);

    return {
        draggedNode,
        dropTargetId,
        dropPosition,
        handleDragStart,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        handleDragEnd,
        getDropIndicatorClass
    };
};