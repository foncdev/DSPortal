import { useState, useRef, useCallback, useEffect } from 'react';
import { TreeNode, NodeType, TreeProps, TreeState } from '../types';
import {
    updateNodeExpanded,
    updateNodeSelected,
    toggleNodeCheckbox,
    createNewNode,
    updateNodeName,
    deleteNode
} from '../utils/treeOperations';
import { findNodeById } from '../utils/treeNodeFinder';

/**
 * 트리 상태 관리 훅
 */
export const useTreeState = (props: TreeProps): TreeState & {
    toggleNode: (id: string) => void;
    selectNode: (id: string, multiSelection?: boolean) => void;
    toggleNodeCheckbox: (id: string) => void;
    createNode: (parentId: string | null, type: NodeType) => Promise<void>;
    handleCreateNodeSubmit: (name: string) => void;
    editNode: (id: string) => Promise<void>;
    handleEditNodeSubmit: (id: string, name: string) => void;
    deleteNode: (id: string) => Promise<void>;
} => {
    const {
        data,
        onChange,
        expandedIds = [],
        selectedIds = [],
        onNodeSelect,
        onBeforeCreate,
        onNodeCreate,
        onBeforeEdit,
        onNodeEdit,
        onBeforeDelete,
        onNodeDelete
    } = props;

    // 트리 데이터 상태
    const [treeData, setTreeData] = useState<TreeNode[]>([]);

    // 노드 편집/생성 상태
    const [editingNode, setEditingNode] = useState<{ id: string; name: string } | null>(null);
    const [creatingNode, setCreatingNode] = useState<{ parentId: string | null; type: NodeType } | null>(null);

    // 확인 다이얼로그 상태
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {}
    });

    // 확장된 노드 ID 추적 (렌더링 사이에 유지)
    const expandedNodesRef = useRef<Set<string>>(new Set(expandedIds));
    const processedDataRef = useRef<boolean>(false);

    // 데이터 변경 시 내부 상태 업데이트
    useEffect(() => {
        // 무한 루프 방지: 이미 처리된 데이터인지 확인
        if (processedDataRef.current) {
            return;
        }

        // 노드 처리 함수 (확장 및 선택 상태 설정)
        const processNodes = (nodes: TreeNode[]): TreeNode[] =>
            nodes.map(node => {
                // 노드가 이미 확장된 상태로 표시되어 있으면, expandedNodesRef에 추가
                if (node.isExpanded) {
                    expandedNodesRef.current.add(node.id);
                }

                return {
                    ...node,
                    isExpanded: expandedNodesRef.current.has(node.id),
                    isSelected: selectedIds.includes(node.id),
                    children: node.children ? processNodes(node.children) : undefined
                };
            });

        const processedData = processNodes(data);
        setTreeData(processedData);
        processedDataRef.current = true;
    }, [data, selectedIds]);

    // expandedIds prop 변경 시 참조 업데이트
    useEffect(() => {
        expandedNodesRef.current = new Set(expandedIds);
    }, [expandedIds]);

    // 노드 확장/축소 토글
    const toggleNode = useCallback((id: string) => {
        // 참조를 사용하여 확장 상태 추적
        if (expandedNodesRef.current.has(id)) {
            expandedNodesRef.current.delete(id);
        } else {
            expandedNodesRef.current.add(id);
        }

        const newTreeData = updateNodeExpanded(
            treeData,
            id,
            expandedNodesRef.current.has(id)
        );

        setTreeData(newTreeData);
        onChange?.(newTreeData);
    }, [treeData, onChange]);

    // 노드 선택 - 체크박스와 구분
    const selectNode = useCallback((id: string, multiSelection = false) => {
        // multiSelect 모드에서도 노드 클릭 시 선택은 단일 선택처럼 동작하고
        // 체크박스 선택은 다중 선택으로 동작하도록 분리

        // 체크박스 상태를 보존하면서 선택 상태 업데이트
        const preserveCheckboxes = props.multiSelect; // 다중 선택 모드에서만 체크박스 상태 보존

        const newTreeData = treeData.map(rootNode => {
            return updateNodeSelectionState(rootNode, id, multiSelection && props.multiSelect, preserveCheckboxes);
        });

        setTreeData(newTreeData);
        onChange?.(newTreeData);

        // 콜백 호출
        const selectedNode = findNodeById(id, newTreeData);
        if (selectedNode) {
            onNodeSelect?.(selectedNode);
        }
    }, [treeData, onChange, onNodeSelect, props.multiSelect]);

    // 노드 선택 상태 업데이트 헬퍼 함수
    const updateNodeSelectionState = (
        node: TreeNode,
        targetId: string,
        keepOtherSelections: boolean,
        preserveCheckboxes: boolean
    ): TreeNode => {
        const isTarget = node.id === targetId;
        const wasSelected = node.isSelected;

        // 체크박스 모드에서는 노드 클릭 시 isSelected를 변경하지 않고
        // 하이라이트만 처리하기 위한 별도의 로직이 필요함
        // 여기서는 기존 코드와 호환성을 위해 isSelected를 계속 사용

        let newIsSelected = false;

        if (isTarget) {
            // 타겟 노드는 항상 선택됨
            newIsSelected = true;
        } else if (keepOtherSelections && wasSelected && preserveCheckboxes) {
            // 다중 선택 모드이고 이미 선택되어 있었다면 유지
            newIsSelected = true;
        }

        // 자식 노드는 재귀적으로 처리
        const newChildren = node.children
            ? node.children.map(child =>
                updateNodeSelectionState(child, targetId, keepOtherSelections, preserveCheckboxes)
            )
            : undefined;

        return { ...node, isSelected: newIsSelected, children: newChildren };
    };

    // 노드 체크박스 토글 (다중 선택) - 개선된 버전
    const handleToggleNodeCheckbox = useCallback((id: string) => {
        // 노드를 찾고 현재 상태를 확인
        const node = findNodeById(id, treeData);
        if (!node) return;

        // 체크박스 토글은 노드의 선택 상태를 직접 변경하되, 다른 노드의 선택 상태는 유지해야 함
        // 즉, multiSelect 모드에서는 단일 노드의 isSelected 상태만 변경
        const newTreeData = treeData.map(rootNode => {
            return updateCheckboxState(rootNode, id);
        });

        setTreeData(newTreeData);
        onChange?.(newTreeData);

        // 콜백 호출 - 상태가 변경된 노드 전달
        const updatedNode = findNodeById(id, newTreeData);
        if (updatedNode) {
            onNodeSelect?.(updatedNode);
        }
    }, [treeData, onChange, onNodeSelect]);

    // 체크박스 상태 업데이트 헬퍼 함수
    const updateCheckboxState = (node: TreeNode, targetId: string): TreeNode => {
        if (node.id === targetId) {
            // 현재 노드가 타겟이면 isSelected 상태를 토글
            return { ...node, isSelected: !node.isSelected,
                children: node.children ? node.children.map(child => updateCheckboxState(child, targetId)) : undefined };
        } else if (node.children) {
            // 자식 노드 재귀 처리
            return { ...node, children: node.children.map(child => updateCheckboxState(child, targetId)) };
        }
        // 다른 노드는 그대로 유지
        return node;
    };

    // 노드 생성
    const handleCreateNode = useCallback(async (parentId: string | null, type: NodeType) => {
        const parentNode = parentId ? findNodeById(parentId, treeData) : null;

        // 생성 가능 여부 확인
        if (onBeforeCreate) {
            const canCreate = await onBeforeCreate(parentNode, type);
            if (!canCreate) return;
        }

        // 생성 상태 설정
        setCreatingNode({ parentId, type });
    }, [treeData, onBeforeCreate]);

    // 노드 생성 폼 제출
    const handleCreateNodeSubmit = useCallback((name: string) => {
        if (!creatingNode || !name.trim()) {
            setCreatingNode(null);
            return;
        }

        // 새 노드 생성 및 트리 업데이트
        const { node: newNode, updatedTree } = createNewNode(
            treeData,
            creatingNode.parentId,
            name.trim(),
            creatingNode.type
        );

        setTreeData(updatedTree);
        onChange?.(updatedTree);
        setCreatingNode(null);

        // 콜백 호출
        const parentNode = creatingNode.parentId
            ? findNodeById(creatingNode.parentId, treeData)
            : null;

        onNodeCreate?.(newNode, parentNode);
    }, [creatingNode, treeData, onChange, onNodeCreate]);

    // 노드 편집
    const handleEditNode = useCallback(async (id: string) => {
        const node = findNodeById(id, treeData);
        if (!node) return;

        // 편집 가능 여부 확인
        if (onBeforeEdit) {
            const canEdit = await onBeforeEdit(node);
            if (!canEdit) return;
        }

        // 편집 상태 설정
        setEditingNode({ id, name: node.name });
    }, [treeData, onBeforeEdit]);

    // 노드 편집 폼 제출
    const handleEditNodeSubmit = useCallback((id: string, name: string) => {
        if (!name.trim()) {
            setEditingNode(null);
            return;
        }

        const node = findNodeById(id, treeData);
        if (!node) {
            setEditingNode(null);
            return;
        }

        const previousName = node.name;
        const newTreeData = updateNodeName(treeData, id, name.trim());

        setTreeData(newTreeData);
        onChange?.(newTreeData);
        setEditingNode(null);

        // 콜백 호출
        const updatedNode = findNodeById(id, newTreeData);
        if (updatedNode) {
            onNodeEdit?.(updatedNode, previousName);
        }
    }, [treeData, onChange, onNodeEdit]);

    // 노드 삭제
    const handleDeleteNode = useCallback(async (id: string) => {
        const node = findNodeById(id, treeData);
        if (!node) return;

        // 삭제 가능 여부 확인
        if (onBeforeDelete) {
            const canDelete = await onBeforeDelete(node);
            if (!canDelete) return;
        }

        // 확인 다이얼로그 표시 (i18n 처리를 위해 useTranslation 사용)
        // 메시지는 실제 렌더링될 때 i18n 대체 파라미터 전달
        setConfirmDialog({
            isOpen: true,
            title: 'tree.deleteConfirmTitle',
            message: 'tree.deleteConfirmMessage', // t 함수에서 {{name}} 파라미터 사용
            onConfirm: () => {
                // 노드 삭제 및 트리 업데이트
                const newTreeData = deleteNode(treeData, id);
                setTreeData(newTreeData);
                onChange?.(newTreeData);

                // 콜백 호출
                onNodeDelete?.(node);
            }
        });
    }, [treeData, onChange, onBeforeDelete, onNodeDelete]);

    return {
        treeData,
        expandedNodesRef,
        editingNode,
        creatingNode,
        confirmDialog,
        setTreeData,
        setEditingNode,
        setCreatingNode,
        setConfirmDialog,
        toggleNode,
        selectNode,
        toggleNodeCheckbox: handleToggleNodeCheckbox, // 다중 선택 체크박스 토글
        createNode: handleCreateNode,
        handleCreateNodeSubmit,
        editNode: handleEditNode,
        handleEditNodeSubmit,
        deleteNode: handleDeleteNode
    };
};