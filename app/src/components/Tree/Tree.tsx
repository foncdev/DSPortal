import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FolderIcon,
    FileIcon,
    LayoutIcon,
    UserIcon,
    ChevronRight,
    ChevronDown,
    Plus,
    Edit,
    Trash,
    Smartphone
} from 'lucide-react';
import { ConfirmDialog } from './Dialog';
import './Tree.scss';

/**
 * Node type enumeration
 */
export enum NodeType {
    Default = 'default',
    Folder = 'folder',
    File = 'file',
    Device = 'device',
    Layout = 'layout',
    Custom = 'custom'
}

/**
 * Drop position type
 */
export enum DropPosition {
    Above = 'above',
    Inside = 'inside',
    Below = 'below'
}

/**
 * Tree node interface
 */
export interface TreeNode {
    id: string;
    name: string;
    type: NodeType;
    children?: TreeNode[];
    parentId?: string;
    data?: Record<string, any>; // Additional node data
    isExpanded?: boolean;
    isSelected?: boolean;
    isDisabled?: boolean;
    customIcon?: React.ReactNode;
}

/**
 * Tree component props
 */
export interface TreeProps {
    /** Tree data structure */
    data: TreeNode[];

    /** Callback for data changes */
    onChange?: (data: TreeNode[]) => void;

    /** Enable drag and drop functionality */
    draggable?: boolean;

    /** Allow multiple selection using checkboxes */
    multiSelect?: boolean;

    /** Allow creation of new nodes */
    allowCreate?: boolean;

    /** Allow editing of nodes */
    allowEdit?: boolean;

    /** Allow deletion of nodes */
    allowDelete?: boolean;

    /** Callback when a node is selected */
    onNodeSelect?: (node: TreeNode) => void;

    /** Callback when a node is double-clicked */
    onNodeDoubleClick?: (node: TreeNode) => void;

    /** Callback before node creation (return false to prevent) */
    onBeforeCreate?: (parentNode: TreeNode | null, nodeType: NodeType) => boolean | Promise<boolean>;

    /** Callback after node creation */
    onNodeCreate?: (node: TreeNode, parentNode: TreeNode | null) => void;

    /** Callback before node editing (return false to prevent) */
    onBeforeEdit?: (node: TreeNode) => boolean | Promise<boolean>;

    /** Callback after node edit */
    onNodeEdit?: (node: TreeNode, previousName: string) => void;

    /** Callback before node deletion (return false to prevent) */
    onBeforeDelete?: (node: TreeNode) => boolean | Promise<boolean>;

    /** Callback after node deletion */
    onNodeDelete?: (node: TreeNode) => void;

    /** Callback after node move (drag-drop) */
    onNodeMove?: (node: TreeNode, targetNode: TreeNode, position: DropPosition) => void;

    /** Custom node renderer */
    renderNode?: (node: TreeNode, defaultRenderer: React.ReactNode) => React.ReactNode;

    /** Initial expanded node IDs */
    expandedIds?: string[];

    /** Initial selected node IDs */
    selectedIds?: string[];

    /** Show node path on hover */
    showNodePath?: boolean;
}

/**
 * Tree Component
 */
const Tree: React.FC<TreeProps> = ({
                                       data,
                                       onChange,
                                       draggable = false,
                                       multiSelect = false,
                                       allowCreate = false,
                                       allowEdit = false,
                                       allowDelete = false,
                                       onNodeSelect,
                                       onNodeDoubleClick,
                                       onBeforeCreate,
                                       onNodeCreate,
                                       onBeforeEdit,
                                       onNodeEdit,
                                       onBeforeDelete,
                                       onNodeDelete,
                                       onNodeMove,
                                       renderNode,
                                       expandedIds = [],
                                       selectedIds = [],
                                       showNodePath = false
                                   }) => {
    const { t } = useTranslation();
    const [treeData, setTreeData] = useState<TreeNode[]>([]);
    const [draggedNode, setDraggedNode] = useState<TreeNode | null>(null);
    const [dropTargetId, setDropTargetId] = useState<string | null>(null);
    const [dropPosition, setDropPosition] = useState<DropPosition | null>(null);
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
    const [editingNode, setEditingNode] = useState<{
        id: string;
        name: string;
    } | null>(null);
    const [creatingNode, setCreatingNode] = useState<{
        parentId: string | null;
        type: NodeType;
    } | null>(null);

    // Ref to store expanded state separately to prevent collapsing issues
    const expandedNodesRef = useRef<Set<string>>(new Set(expandedIds));

    // Update internal tree data when props change
    useEffect(() => {
        // Mark nodes as expanded and selected based on props
        const processNodes = (nodes: TreeNode[]): TreeNode[] =>
            nodes.map(node => ({
                ...node,
                isExpanded: expandedNodesRef.current.has(node.id),
                isSelected: selectedIds.includes(node.id),
                children: node.children ? processNodes(node.children) : undefined
            }));

        setTreeData(processNodes(data));
    }, [data, selectedIds]);

    // Update expanded nodes ref when expandedIds prop changes
    useEffect(() => {
        expandedNodesRef.current = new Set(expandedIds);
    }, [expandedIds]);

    // Helper function to find a node by ID
    const findNodeById = useCallback(
        (id: string, nodes: TreeNode[] = treeData): TreeNode | null => {
            for (const node of nodes) {
                if (node.id === id) return node;
                if (node.children) {
                    const found = findNodeById(id, node.children);
                    if (found) return found;
                }
            }
            return null;
        },
        [treeData]
    );

    // Helper function to get node path
    const getNodePath = useCallback(
        (nodeId: string, nodes: TreeNode[] = treeData, path: string[] = []): string[] => {
            for (const node of nodes) {
                const currentPath = [...path, node.name];
                if (node.id === nodeId) return currentPath;
                if (node.children) {
                    const found = getNodePath(nodeId, node.children, currentPath);
                    if (found.length) return found;
                }
            }
            return [];
        },
        [treeData]
    );

    // Toggle node expanded state
    const toggleNode = useCallback(
        (id: string) => {
            // Use the ref to track expanded state to prevent collapse issues
            if (expandedNodesRef.current.has(id)) {
                expandedNodesRef.current.delete(id);
            } else {
                expandedNodesRef.current.add(id);
            }

            const updateNodes = (nodes: TreeNode[]): TreeNode[] =>
                nodes.map(node => {
                    if (node.id === id) {
                        return {
                            ...node,
                            isExpanded: expandedNodesRef.current.has(id)
                        };
                    }
                    if (node.children) {
                        return { ...node, children: updateNodes(node.children) };
                    }
                    return node;
                });

            const newTreeData = updateNodes(treeData);
            setTreeData(newTreeData);
            onChange?.(newTreeData);
        },
        [treeData, onChange]
    );

    // Select a node
    const selectNode = useCallback(
        (id: string, multiSelection = false) => {
            const updateNodes = (nodes: TreeNode[]): TreeNode[] =>
                nodes.map(node => {
                    // Only update selection if multi-select is enabled or this is the clicked node
                    const isSelected = node.id === id
                        ? true
                        : multiSelection ? node.isSelected : false;

                    return {
                        ...node,
                        isSelected,
                        children: node.children ? updateNodes(node.children) : undefined
                    };
                });

            const newTreeData = updateNodes(treeData);
            setTreeData(newTreeData);
            onChange?.(newTreeData);

            // Call the onNodeSelect callback with the selected node
            const selectedNode = findNodeById(id);
            if (selectedNode) {
                onNodeSelect?.(selectedNode);
            }
        },
        [treeData, onChange, findNodeById, onNodeSelect]
    );

    // Handle node checkbox toggle (for multi-select)
    const toggleNodeCheckbox = useCallback(
        (id: string) => {
            const updateNodes = (nodes: TreeNode[]): TreeNode[] =>
                nodes.map(node => {
                    if (node.id === id) {
                        return { ...node, isSelected: !node.isSelected };
                    }
                    if (node.children) {
                        return { ...node, children: updateNodes(node.children) };
                    }
                    return node;
                });

            const newTreeData = updateNodes(treeData);
            setTreeData(newTreeData);
            onChange?.(newTreeData);

            // Call the onNodeSelect callback with the selected node
            const selectedNode = findNodeById(id);
            if (selectedNode) {
                onNodeSelect?.(selectedNode);
            }
        },
        [treeData, onChange, findNodeById, onNodeSelect]
    );

    // Handle node double click
    const handleNodeDoubleClick = useCallback(
        (node: TreeNode) => {
            if (node.children) {
                toggleNode(node.id);
            }
            onNodeDoubleClick?.(node);
        },
        [toggleNode, onNodeDoubleClick]
    );

    // Handle node creation
    const createNode = useCallback(
        async (parentId: string | null, type: NodeType) => {
            const parentNode = parentId ? findNodeById(parentId) : null;

            // Check if creation is allowed
            if (onBeforeCreate) {
                const canCreate = await onBeforeCreate(parentNode, type);
                if (!canCreate) return;
            }

            // Set creating state for UI
            setCreatingNode({ parentId, type });
        },
        [findNodeById, onBeforeCreate]
    );

    // Handle new node submission
    const handleCreateNodeSubmit = useCallback(
        (name: string) => {
            if (!creatingNode) return;

            // Create new node
            const newNode: TreeNode = {
                id: `node-${Date.now()}`, // Simple ID generation - replace with your logic
                name,
                type: creatingNode.type,
                parentId: creatingNode.parentId || undefined,
                isExpanded: false,
                isSelected: false,
                children: creatingNode.type === NodeType.Folder ? [] : undefined
            };

            // Update tree data
            const updateNodes = (nodes: TreeNode[]): TreeNode[] =>
                nodes.map(node => {
                    if (node.id === creatingNode.parentId) {
                        const children = node.children || [];
                        // Also expand the parent node
                        expandedNodesRef.current.add(node.id);
                        return {
                            ...node,
                            children: [...children, newNode],
                            isExpanded: true
                        };
                    }
                    if (node.children) {
                        return { ...node, children: updateNodes(node.children) };
                    }
                    return node;
                });

            // If creating a root node, add to top level
            let newTreeData: TreeNode[];
            if (creatingNode.parentId === null) {
                newTreeData = [...treeData, newNode];
            } else {
                newTreeData = updateNodes(treeData);
            }

            setTreeData(newTreeData);
            onChange?.(newTreeData);
            setCreatingNode(null);

            // Log path for the created node
            if (showNodePath) {
                const parentNode = creatingNode.parentId ? findNodeById(creatingNode.parentId) : null;
                const path = parentNode
                    ? [...getNodePath(parentNode.id), name]
                    : [name];
                console.log(`Created node: ${path.join(' / ')}`);
            }

            // Call callback
            const parentNode = creatingNode.parentId ? findNodeById(creatingNode.parentId) : null;
            onNodeCreate?.(newNode, parentNode);
        },
        [
            creatingNode,
            treeData,
            onChange,
            findNodeById,
            getNodePath,
            showNodePath,
            onNodeCreate
        ]
    );

    // Handle node editing
    const editNode = useCallback(
        async (id: string) => {
            const node = findNodeById(id);
            if (!node) return;

            // Check if editing is allowed
            if (onBeforeEdit) {
                const canEdit = await onBeforeEdit(node);
                if (!canEdit) return;
            }

            // Set editing state for UI
            setEditingNode({ id, name: node.name });
        },
        [findNodeById, onBeforeEdit]
    );

    // Handle node edit submission
    const handleEditNodeSubmit = useCallback(
        (id: string, name: string) => {
            const node = findNodeById(id);
            if (!node) return;

            const previousName = node.name;

            // Update tree data
            const updateNodes = (nodes: TreeNode[]): TreeNode[] =>
                nodes.map(node => {
                    if (node.id === id) {
                        return { ...node, name };
                    }
                    if (node.children) {
                        return { ...node, children: updateNodes(node.children) };
                    }
                    return node;
                });

            const newTreeData = updateNodes(treeData);
            setTreeData(newTreeData);
            onChange?.(newTreeData);
            setEditingNode(null);

            // Call callback
            const updatedNode = findNodeById(id, newTreeData);
            if (updatedNode) {
                onNodeEdit?.(updatedNode, previousName);
            }
        },
        [treeData, onChange, findNodeById, onNodeEdit]
    );

    // Handle node deletion
    const deleteNode = useCallback(
        async (id: string) => {
            const node = findNodeById(id);
            if (!node) return;

            // Check if deletion is allowed
            if (onBeforeDelete) {
                const canDelete = await onBeforeDelete(node);
                if (!canDelete) return;
            }

            // Show confirmation dialog
            setConfirmDialog({
                isOpen: true,
                title: t('tree.deleteConfirmTitle'),
                message: t('tree.deleteConfirmMessage', { name: node.name }),
                onConfirm: () => {
                    // Update tree data
                    const deleteFromNodes = (nodes: TreeNode[]): TreeNode[] =>
                        nodes
                            .filter(node => node.id !== id)
                            .map(node => {
                                if (node.children) {
                                    return { ...node, children: deleteFromNodes(node.children) };
                                }
                                return node;
                            });

                    const newTreeData = deleteFromNodes(treeData);
                    setTreeData(newTreeData);
                    onChange?.(newTreeData);

                    // Call callback
                    onNodeDelete?.(node);
                }
            });
        },
        [treeData, onChange, findNodeById, onBeforeDelete, onNodeDelete, t]
    );

    // Helper function to determine drop position
    const getDropPosition = useCallback((y: number, rect: DOMRect): DropPosition => {
        const relativeY = y - rect.top;
        const height = rect.height;

        if (relativeY < height * 0.25) return DropPosition.Above;
        if (relativeY > height * 0.75) return DropPosition.Below;
        return DropPosition.Inside;
    }, []);

    // Get the drop target indicator class based on position
    const getDropIndicatorClass = useCallback((nodeId: string, position: DropPosition | null) => {
        if (nodeId !== dropTargetId || !position) return '';

        switch (position) {
            case DropPosition.Above:
                return 'drop-target-above';
            case DropPosition.Below:
                return 'drop-target-below';
            case DropPosition.Inside:
                return 'drop-target-inside';
            default:
                return '';
        }
    }, [dropTargetId]);

    // Drag-and-drop handlers
    const handleDragStart = useCallback(
        (e: React.DragEvent, node: TreeNode) => {
            if (!draggable || node.isDisabled) return;

            e.stopPropagation();
            e.dataTransfer.setData('text/plain', node.id);
            e.dataTransfer.effectAllowed = 'move';
            setDraggedNode(node);

            // Set drag image (optional)
            const dragPreview = document.createElement('div');
            dragPreview.className = 'tree-drag-preview';
            dragPreview.textContent = node.name;
            document.body.appendChild(dragPreview);
            e.dataTransfer.setDragImage(dragPreview, 0, 0);

            // Remove the preview element after drag starts
            setTimeout(() => {
                document.body.removeChild(dragPreview);
            }, 0);
        },
        [draggable]
    );

    const handleDragOver = useCallback(
        (e: React.DragEvent, node: TreeNode) => {
            e.preventDefault();
            e.stopPropagation();

            if (!draggable || !draggedNode || node.isDisabled) return;

            // Don't allow drop on itself or its children
            if (
                node.id === draggedNode.id ||
                getNodePath(node.id).some(name =>
                    getNodePath(draggedNode.id).includes(name))
            ) {
                return;
            }

            // Set the drop effect
            e.dataTransfer.dropEffect = 'move';

            // Get the drop position
            const rect = e.currentTarget.getBoundingClientRect();
            const position = getDropPosition(e.clientY, rect);

            // Only allow inside drop for folders
            if (position === DropPosition.Inside &&
                node.type !== NodeType.Folder &&
                node.type !== NodeType.Default) {
                return;
            }

            setDropTargetId(node.id);
            setDropPosition(position);
        },
        [draggable, draggedNode, getNodePath, getDropPosition]
    );

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDropTargetId(null);
        setDropPosition(null);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent, targetNode: TreeNode) => {
            e.preventDefault();
            e.stopPropagation();

            if (!draggable || !draggedNode || targetNode.isDisabled || !dropPosition) {
                setDropTargetId(null);
                setDropPosition(null);
                setDraggedNode(null);
                return;
            }

            // Don't allow drop on itself or its children
            if (
                targetNode.id === draggedNode.id ||
                getNodePath(targetNode.id).some(name =>
                    getNodePath(draggedNode.id).includes(name))
            ) {
                setDropTargetId(null);
                setDropPosition(null);
                setDraggedNode(null);
                return;
            }

            // Only allow Inside drop on folders
            if (dropPosition === DropPosition.Inside &&
                targetNode.type !== NodeType.Folder &&
                targetNode.type !== NodeType.Default) {
                setDropTargetId(null);
                setDropPosition(null);
                setDraggedNode(null);
                return;
            }

            // Create a deep copy of the tree data
            const newTreeData = JSON.parse(JSON.stringify(treeData));

            // Find the parent of the dragged node
            let draggedNodeParent: TreeNode | null = null;
            const findParent = (nodes: TreeNode[], nodeId: string): boolean => {
                for (const node of nodes) {
                    if (node.children?.some(child => child.id === nodeId)) {
                        draggedNodeParent = node;
                        return true;
                    }
                    if (node.children && findParent(node.children, nodeId)) {
                        return true;
                    }
                }
                return false;
            };
            findParent(newTreeData, draggedNode.id);

            // Remove the dragged node from its original position
            const removeNode = (nodes: TreeNode[]): { updatedNodes: TreeNode[], removedNode: TreeNode | null } => {
                let removedNode: TreeNode | null = null;

                const updatedNodes = nodes.filter(node => {
                    if (node.id === draggedNode.id) {
                        removedNode = {...node};
                        return false;
                    }
                    return true;
                }).map(node => {
                    if (node.children) {
                        const result = removeNode(node.children);
                        if (result.removedNode) {
                            removedNode = result.removedNode;
                        }
                        return { ...node, children: result.updatedNodes };
                    }
                    return node;
                });

                return { updatedNodes, removedNode };
            };

            const { updatedNodes, removedNode } = removeNode(newTreeData);

            if (!removedNode) {
                console.error("Failed to find the dragged node in the tree");
                setDropTargetId(null);
                setDropPosition(null);
                setDraggedNode(null);
                return;
            }

            // Reset parentId on the removed node
            removedNode.parentId = undefined;

            // Handle different drop positions
            const processDrop = (nodes: TreeNode[]): TreeNode[] => {
                return nodes.map(node => {
                    if (node.id === targetNode.id) {
                        if (dropPosition === DropPosition.Inside) {
                            // Drop inside the node
                            const children = node.children || [];
                            // Also expand the target node when dropping inside
                            expandedNodesRef.current.add(node.id);
                            return {
                                ...node,
                                isExpanded: true,
                                children: [...children, { ...removedNode, parentId: node.id }]
                            };
                        } else if (dropPosition === DropPosition.Above) {
                            // Find the target's parent
                            let targetParent: TreeNode | null = null;
                            findParent(treeData, targetNode.id);
                            targetParent = draggedNodeParent;

                            if (targetParent) {
                                // Special handling needed for the target node's parent
                                // This will be handled in a separate step
                                return node;
                            } else {
                                // Target is at root level
                                // We'll handle this in the outer logic
                                return node;
                            }
                        } else if (dropPosition === DropPosition.Below) {
                            // Similar to Above case
                            // Find the target's parent
                            let targetParent: TreeNode | null = null;
                            findParent(treeData, targetNode.id);
                            targetParent = draggedNodeParent;

                            if (targetParent) {
                                // Special handling needed
                                return node;
                            } else {
                                // Target is at root level
                                return node;
                            }
                        }
                    }

                    if (node.children) {
                        return { ...node, children: processDrop(node.children) };
                    }

                    return node;
                });
            };

            let result = processDrop(updatedNodes);

            // Special handling for Above/Below at root level or for nodes with the same parent
            if (dropPosition === DropPosition.Above || dropPosition === DropPosition.Below) {
                // Find the target's parent
                let targetParent: TreeNode | null = null;
                findParent(treeData, targetNode.id);
                targetParent = draggedNodeParent;

                if (targetParent) {
                    // The target has a parent, insert at the right position in the parent's children
                    result = result.map(node => {
                        if (node.id === targetParent?.id) {
                            const updatedChildren = [...node.children || []];
                            const targetIndex = updatedChildren.findIndex(child => child.id === targetNode.id);

                            if (targetIndex !== -1) {
                                const insertPosition = dropPosition === DropPosition.Above ? targetIndex : targetIndex + 1;
                                updatedChildren.splice(insertPosition, 0, { ...removedNode, parentId: node.id });
                            }

                            return { ...node, children: updatedChildren };
                        }
                        return node;
                    });
                } else {
                    // The target is at root level, insert at the right position in the root array
                    const targetIndex = result.findIndex(node => node.id === targetNode.id);

                    if (targetIndex !== -1) {
                        const insertPosition = dropPosition === DropPosition.Above ? targetIndex : targetIndex + 1;
                        result.splice(insertPosition, 0, removedNode);
                    }
                }
            }

            setTreeData(result);
            onChange?.(result);

            // Reset drag state
            setDropTargetId(null);
            setDropPosition(null);
            setDraggedNode(null);

            // Call callback
            onNodeMove?.(draggedNode, targetNode, dropPosition);
        },
        [
            draggable,
            draggedNode,
            dropPosition,
            treeData,
            getNodePath,
            onChange,
            onNodeMove
        ]
    );

    const handleDragEnd = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDropTargetId(null);
        setDropPosition(null);
        setDraggedNode(null);
    }, []);

    // Node icon based on type
    const getNodeIcon = useCallback((node: TreeNode) => {
        if (node.customIcon) {
            return node.customIcon;
        }

        switch (node.type) {
            case NodeType.Folder:
                return <FolderIcon size={16} className="tree-node-icon folder-icon" />;
            case NodeType.File:
                return <FileIcon size={16} className="tree-node-icon file-icon" />;
            case NodeType.Device:
                return <Smartphone size={16} className="tree-node-icon device-icon" />;
            case NodeType.Layout:
                return <LayoutIcon size={16} className="tree-node-icon layout-icon" />;
            case NodeType.Custom:
                return <UserIcon size={16} className="tree-node-icon custom-icon" />;
            default:
                return <div className="tree-node-icon default-icon" />;
        }
    }, []);

    // Render a tree node
    const renderTreeNode = useCallback(
        (node: TreeNode) => {
            const hasChildren = !!node.children?.length;
            const isCurrentDropTarget = dropTargetId === node.id;
            const dropIndicatorClass = getDropIndicatorClass(node.id, dropPosition);
            const isEditing = editingNode?.id === node.id;
            const isCreatingChild = creatingNode?.parentId === node.id;

            const defaultRenderer = (
                <div
                    className={`
                    tree-node 
                    ${node.isExpanded ? 'expanded' : ''} 
                    ${node.isSelected ? 'selected' : ''} 
                    ${!multiSelect && node.isSelected ? 'single-selected' : ''}
                    ${node.isDisabled ? 'disabled' : ''} 
                    ${isCurrentDropTarget ? 'drop-target' : ''}
                    ${dropIndicatorClass}
                    type-${node.type}
                `}
                    draggable={draggable && !node.isDisabled}
                    onDragStart={(e) => handleDragStart(e, node)}
                    onDragOver={(e) => handleDragOver(e, node)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, node)}
                    onDragEnd={handleDragEnd}
                    data-node-id={node.id}
                    title={showNodePath ? getNodePath(node.id).join(' / ') : undefined}
                >
                    <div
                        className="tree-node-content"
                        onClick={(e) => {
                            e.stopPropagation();
                            selectNode(node.id, e.ctrlKey && multiSelect);
                        }}
                        onDoubleClick={(e) => {
                            e.stopPropagation();
                            handleNodeDoubleClick(node);
                        }}
                    >
                        {/* Toggle button or spacer */}
                        {hasChildren ? (
                            <button
                                type="button"
                                className="toggle-button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleNode(node.id);
                                }}
                                aria-label={node.isExpanded ? "Collapse" : "Expand"}
                            >
                                {node.isExpanded ? (
                                    <ChevronDown size={14} />
                                ) : (
                                    <ChevronRight size={14} />
                                )}
                            </button>
                        ) : (
                            <div className="toggle-spacer" />
                        )}

                        {/* Checkbox for multi-select */}
                        {multiSelect && (
                            <label
                                className="checkbox-container"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <input
                                    type="checkbox"
                                    checked={!!node.isSelected}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        toggleNodeCheckbox(node.id);
                                    }}
                                    disabled={node.isDisabled}
                                />
                                <span className="checkbox-checkmark"></span>
                            </label>
                        )}

                        {/* Node icon */}
                        {getNodeIcon(node)}

                        {/* Node name or edit form */}
                        {isEditing ? (
                            <form
                                className="edit-form"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (editingNode?.name.trim()) {
                                        handleEditNodeSubmit(node.id, editingNode.name);
                                    }
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <input
                                    type="text"
                                    value={editingNode.name}
                                    onChange={(e) => setEditingNode({ ...editingNode, name: e.target.value })}
                                    autoFocus
                                    onBlur={() => {
                                        if (editingNode?.name.trim()) {
                                            handleEditNodeSubmit(node.id, editingNode.name);
                                        } else {
                                            setEditingNode(null);
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Escape') {
                                            setEditingNode(null);
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }
                                    }}
                                />
                            </form>
                        ) : (
                            <span className="node-name">{node.name}</span>
                        )}

                        {/* Node actions */}
                        {!node.isDisabled && (
                            <div className="node-actions">
                                {allowCreate && node.type === NodeType.Folder && (
                                    <button
                                        type="button"
                                        className="action-button create"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            createNode(node.id, NodeType.File);
                                        }}
                                        title={t('tree.create')}
                                    >
                                        <Plus size={14} />
                                    </button>
                                )}

                                {allowEdit && (
                                    <button
                                        type="button"
                                        className="action-button edit"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            editNode(node.id);
                                        }}
                                        title={t('tree.edit')}
                                    >
                                        <Edit size={14} />
                                    </button>
                                )}

                                {allowDelete && (
                                    <button
                                        type="button"
                                        className="action-button delete"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNode(node.id);
                                        }}
                                        title={t('tree.delete')}
                                    >
                                        <Trash size={14} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Child nodes */}
                    {node.isExpanded && node.children && (
                        <div className="tree-children">
                            {node.children.map((child) => (
                                <div key={child.id} className="tree-node-wrapper">
                                    {renderNode ? renderNode(child, renderTreeNode(child)) : renderTreeNode(child)}
                                </div>
                            ))}

                            {/* Node creation form */}
                            {isCreatingChild && (
                                <div className="tree-node-wrapper">
                                    <div className="tree-node creating">
                                        <div className="tree-node-content">
                                            <div className="toggle-spacer" />
                                            {getNodeIcon({
                                                ...creatingNode,
                                                id: '',
                                                name: '',
                                                isExpanded: false
                                            } as TreeNode)}
                                            <form
                                                className="edit-form"
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    const input = e.currentTarget.querySelector('input');
                                                    if (input?.value.trim()) {
                                                        handleCreateNodeSubmit(input.value);
                                                    }
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <input
                                                    type="text"
                                                    placeholder={t('tree.newNodeNamePlaceholder')}
                                                    autoFocus
                                                    onBlur={(e) => {
                                                        if (e.target.value.trim()) {
                                                            handleCreateNodeSubmit(e.target.value);
                                                        } else {
                                                            setCreatingNode(null);
                                                        }
                                                    }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Escape') {
                                                            setCreatingNode(null);
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                        }
                                                    }}
                                                />
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );

            return renderNode ? renderNode(node, defaultRenderer) : defaultRenderer;
        },
        [
            dropTargetId,
            dropPosition,
            getDropIndicatorClass,
            editingNode,
            creatingNode,
            multiSelect,
            draggable,
            handleDragStart,
            handleDragOver,
            handleDragLeave,
            handleDrop,
            handleDragEnd,
            showNodePath,
            getNodePath,
            selectNode,
            handleNodeDoubleClick,
            toggleNode,
            toggleNodeCheckbox,
            getNodeIcon,
            handleEditNodeSubmit,
            allowCreate,
            allowEdit,
            allowDelete,
            createNode,
            editNode,
            deleteNode,
            handleCreateNodeSubmit,
            renderNode,
            t
        ]
    );

    return (
        <div className="tree-component">
            {/* Root level nodes */}
            {treeData.map((node) => (
                <div key={node.id} className="tree-node-wrapper root-node">
                    {renderTreeNode(node)}
                </div>
            ))}

            {/* Creating a root level node */}
            {creatingNode?.parentId === null && (
                <div className="tree-node-wrapper root-node">
                    <div className="tree-node creating">
                        <div className="tree-node-content">
                            <div className="toggle-spacer" />
                            {getNodeIcon({
                                ...creatingNode,
                                id: '',
                                name: '',
                                isExpanded: false
                            } as TreeNode)}
                            <form
                                className="edit-form"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const input = e.currentTarget.querySelector('input');
                                    if (input?.value.trim()) {
                                        handleCreateNodeSubmit(input.value);
                                    }
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <input
                                    type="text"
                                    placeholder={t('tree.newNodeNamePlaceholder')}
                                    autoFocus
                                    onBlur={(e) => {
                                        if ((e.target as HTMLInputElement).value.trim()) {
                                            handleCreateNodeSubmit((e.target as HTMLInputElement).value);
                                        } else {
                                            setCreatingNode(null);
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Escape') {
                                            setCreatingNode(null);
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }
                                    }}
                                />
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* "Add root node" button */}
            {allowCreate && (
                <div className="tree-actions">
                    <button
                        className="add-root-button"
                        type="button"
                        onClick={() => createNode(null, NodeType.Folder)}
                        title={t('tree.addRoot')}
                    >
                        <Plus size={16} />
                        <span>{t('tree.addRoot')}</span>
                    </button>
                </div>
            )}

            {/* Confirmation dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                onConfirm={() => {
                    confirmDialog.onConfirm();
                    setConfirmDialog({ ...confirmDialog, isOpen: false });
                }}
                onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                confirmText={t('tree.confirmButton')}
                cancelText={t('tree.cancelButton')}
            />
        </div>
    );
};

export default Tree;