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

    // 데이터 변경 시 내부 상태 업데이트
    useEffect(() => {
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

        setTreeData(processNodes(data));
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

    // 노드 선택
    const selectNode = useCallback((id: string, multiSelection = false) => {
        // multiSelect가 아닐 때는 다른 노드의 선택 상태 모두 해제
        const newTreeData = updateNodeSelected(treeData, id, multiSelection && props.multiSelect);
        setTreeData(newTreeData);
        onChange?.(newTreeData);

        // 콜백 호출
        const selectedNode = findNodeById(id, treeData);
        if (selectedNode) {
            onNodeSelect?.(selectedNode);
        }
    }, [treeData, onChange, onNodeSelect, props.multiSelect]);

    // 노드 체크박스 토글 (다중 선택)
    const handleToggleNodeCheckbox = useCallback((id: string) => {
        const newTreeData = toggleNodeCheckbox(treeData, id);
        setTreeData(newTreeData);
        onChange?.(newTreeData);

        // 콜백 호출
        const selectedNode = findNodeById(id, treeData);
        if (selectedNode) {
            onNodeSelect?.(selectedNode);
        }
    }, [treeData, onChange, onNodeSelect]);

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
        toggleNodeCheckbox: handleToggleNodeCheckbox,
        createNode: handleCreateNode,
        handleCreateNodeSubmit,
        editNode: handleEditNode,
        handleEditNodeSubmit,
        deleteNode: handleDeleteNode
    };
};