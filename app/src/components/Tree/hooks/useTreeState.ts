// app/src/components/Tree/hooks/useTreeState.ts
import { useState, useRef, useCallback, useEffect } from 'react';
import { TreeNode, NodeType, TreeProps, TreeState } from '../types';
import {
    updateNodeExpanded,
    updateNodeName,
    deleteNode,
    createNewNode
} from '../utils/treeOperations';
import { findNodeById } from '../utils/treeNodeFinder';

/**
 * Tree state management hook with improved checkbox handling
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

    // Tree data state
    const [treeData, setTreeData] = useState<TreeNode[]>([]);

    // Node editing/creating state
    const [editingNode, setEditingNode] = useState<{ id: string; name: string } | null>(null);
    const [creatingNode, setCreatingNode] = useState<{ parentId: string | null; type: NodeType } | null>(null);

    // Confirmation dialog state
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

    // Track expanded node IDs (persist between renders)
    const expandedNodesRef = useRef<Set<string>>(new Set(expandedIds));
    const processedDataRef = useRef<boolean>(false);

    // Update internal state when data changes
    useEffect(() => {
        // Prevent infinite loops by checking if we've already processed this data
        if (processedDataRef.current) {
            return;
        }

        // Process function to set expanded and selected state
        const processNodes = (nodes: TreeNode[]): TreeNode[] =>
            nodes.map(node => {
                // Track expanded nodes
                if (node.isExpanded) {
                    expandedNodesRef.current.add(node.id);
                }

                return {
                    ...node,
                    isExpanded: expandedNodesRef.current.has(node.id),
                    isSelected: selectedIds.includes(node.id),
                    // Add highlighted state separately from checkbox selection
                    isHighlighted: selectedIds.includes(node.id),
                    children: node.children ? processNodes(node.children) : undefined
                };
            });

        const processedData = processNodes(data);
        setTreeData(processedData);
        processedDataRef.current = true;
    }, [data, selectedIds]);

    // Update the reference when expandedIds prop changes
    useEffect(() => {
        expandedNodesRef.current = new Set(expandedIds);
    }, [expandedIds]);

    // Toggle node expansion
    const toggleNode = useCallback((id: string) => {
        // Use reference to track expansion state
        const isExpanded = !expandedNodesRef.current.has(id);

        if (isExpanded) {
            expandedNodesRef.current.add(id);
        } else {
            expandedNodesRef.current.delete(id);
        }

        // Update tree with new expansion state
        const newTreeData = treeData.map(rootNode => updateNodeExpansion(rootNode, id, isExpanded));

        setTreeData(newTreeData);
        onChange?.(newTreeData);
    }, [treeData, onChange]);

    // Helper function to update node expansion state
    const updateNodeExpansion = (node: TreeNode, nodeId: string, isExpanded: boolean): TreeNode => {
        if (node.id === nodeId) {
            return { ...node, isExpanded };
        }

        if (node.children) {
            return {
                ...node,
                children: node.children.map(child => updateNodeExpansion(child, nodeId, isExpanded))
            };
        }

        return node;
    };

    // Select node (highlighting) - separate from checkbox toggling
    const selectNode = useCallback((id: string, multiSelection = false) => {
        // Process tree to update highlighting
        const newTreeData = treeData.map(rootNode => updateNodeHighlightState(rootNode, id, multiSelection && props.multiSelect));

        setTreeData(newTreeData);
        onChange?.(newTreeData);

        // Callback
        const selectedNode = findNodeById(id, newTreeData);
        if (selectedNode) {
            onNodeSelect?.(selectedNode);
        }
    }, [treeData, onChange, onNodeSelect, props.multiSelect]);

    // Helper function to update node highlighting state
    const updateNodeHighlightState = (
        node: TreeNode,
        targetId: string,
        keepOtherSelections: boolean
    ): TreeNode => {
        const isTarget = node.id === targetId;
        const wasHighlighted = node.isHighlighted;

        let newIsHighlighted = false;

        if (isTarget) {
            // Target node is always highlighted
            newIsHighlighted = true;
        } else if (keepOtherSelections && wasHighlighted) {
            // In multi-selection mode, maintain previously highlighted nodes
            newIsHighlighted = true;
        }

        // Process children recursively
        const newChildren = node.children
            ? node.children.map(child => updateNodeHighlightState(child, targetId, keepOtherSelections))
            : undefined;

        return {
            ...node,
            isHighlighted: newIsHighlighted,
            children: newChildren
        };
    };

    // Toggle checkbox (separate from node highlighting)
    const toggleNodeCheckbox = useCallback((id: string) => {
        // Process tree to update checkbox selection
        const newTreeData = treeData.map(rootNode => updateNodeCheckboxState(rootNode, id));

        setTreeData(newTreeData);
        onChange?.(newTreeData);

        // Callback
        const updatedNode = findNodeById(id, newTreeData);
        if (updatedNode) {
            onNodeSelect?.(updatedNode);
        }
    }, [treeData, onChange, onNodeSelect]);

    // Helper function to update checkbox state
    const updateNodeCheckboxState = (node: TreeNode, targetId: string): TreeNode => {
        if (node.id === targetId) {
            // Toggle isSelected for the target node only
            return {
                ...node,
                isSelected: !node.isSelected,
                children: node.children
                    ? node.children.map(child => updateNodeCheckboxState(child, targetId))
                    : undefined
            };
        } else if (node.children) {
            // Process children recursively
            return {
                ...node,
                children: node.children.map(child => updateNodeCheckboxState(child, targetId))
            };
        }

        // Keep other nodes unchanged
        return node;
    };

    // Create node
    const handleCreateNode = useCallback(async (parentId: string | null, type: NodeType) => {
        const parentNode = parentId ? findNodeById(parentId, treeData) : null;

        // Check if creation is allowed
        if (onBeforeCreate) {
            const canCreate = await onBeforeCreate(parentNode, type);
            if (!canCreate) {return;}
        }

        // Set creating state
        setCreatingNode({ parentId, type });
    }, [treeData, onBeforeCreate]);

    // Submit node creation form
    const handleCreateNodeSubmit = useCallback((name: string) => {
        if (!creatingNode || !name.trim()) {
            setCreatingNode(null);
            return;
        }

        // Create new node and update tree
        const { node: newNode, updatedTree } = createNewNode(
            treeData,
            creatingNode.parentId,
            name.trim(),
            creatingNode.type
        );

        setTreeData(updatedTree);
        onChange?.(updatedTree);
        setCreatingNode(null);

        // Callback
        const parentNode = creatingNode.parentId
            ? findNodeById(creatingNode.parentId, treeData)
            : null;

        onNodeCreate?.(newNode, parentNode);
    }, [creatingNode, treeData, onChange, onNodeCreate]);

    // Edit node
    const handleEditNode = useCallback(async (id: string) => {
        const node = findNodeById(id, treeData);
        if (!node) {return;}

        // Check if edit is allowed
        if (onBeforeEdit) {
            const canEdit = await onBeforeEdit(node);
            if (!canEdit) {return;}
        }

        // Set editing state
        setEditingNode({ id, name: node.name });
    }, [treeData, onBeforeEdit]);

    // Submit node edit form
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

        // Callback
        const updatedNode = findNodeById(id, newTreeData);
        if (updatedNode) {
            onNodeEdit?.(updatedNode, previousName);
        }
    }, [treeData, onChange, onNodeEdit]);

    // Delete node
    const handleDeleteNode = useCallback(async (id: string) => {
        const node = findNodeById(id, treeData);
        if (!node) {return;}

        // Check if delete is allowed
        if (onBeforeDelete) {
            const canDelete = await onBeforeDelete(node);
            if (!canDelete) {return;}
        }

        // Show confirmation dialog
        setConfirmDialog({
            isOpen: true,
            title: 'tree.deleteConfirmTitle',
            message: 'tree.deleteConfirmMessage',
            onConfirm: () => {
                // Delete node and update tree
                const newTreeData = deleteNode(treeData, id);
                setTreeData(newTreeData);
                onChange?.(newTreeData);

                // Callback
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
        toggleNodeCheckbox,
        createNode: handleCreateNode,
        handleCreateNodeSubmit,
        editNode: handleEditNode,
        handleEditNodeSubmit,
        deleteNode: handleDeleteNode
    };
};