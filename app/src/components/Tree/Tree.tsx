import React, { useState, useCallback, useEffect } from 'react';
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
    onNodeMove?: (node: TreeNode, targetNode: TreeNode) => void;

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
export const Tree: React.FC<TreeProps> = ({
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

    // Update internal tree data when props change
    useEffect(() => {
        // Mark nodes as expanded based on expandedIds
        const processExpandedNodes = (nodes: TreeNode[]): TreeNode[] => nodes.map(node => ({
                ...node,
                isExpanded: expandedIds.includes(node.id),
                isSelected: selectedIds.includes(node.id),
                children: node.children ? processExpandedNodes(node.children) : undefined
            }));

        setTreeData(processExpandedNodes(data));
    }, [data, expandedIds, selectedIds]);

    // Helper function to find a node by ID
    const findNodeById = useCallback(
        (id: string, nodes: TreeNode[] = treeData): TreeNode | null => {
            for (const node of nodes) {
                if (node.id === id) {return node;}
                if (node.children) {
                    const found = findNodeById(id, node.children);
                    if (found) {return found;}
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
                if (node.id === nodeId) {return currentPath;}
                if (node.children) {
                    const found = getNodePath(nodeId, node.children, currentPath);
                    if (found.length) {return found;}
                }
            }
            return [];
        },
        [treeData]
    );

    // Toggle node expanded state
    const toggleNode = useCallback(
        (id: string) => {
            const updateNodes = (nodes: TreeNode[]): TreeNode[] => nodes.map(node => {
                    if (node.id === id) {
                        return { ...node, isExpanded: !node.isExpanded };
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
            const updateNodes = (nodes: TreeNode[]): TreeNode[] => nodes.map(node => {
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
            const updateNodes = (nodes: TreeNode[]): TreeNode[] => nodes.map(node => {
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
                if (!canCreate) {return;}
            }

            // Set creating state for UI
            setCreatingNode({ parentId, type });
        },
        [findNodeById, onBeforeCreate]
    );

    // Handle new node submission
    const handleCreateNodeSubmit = useCallback(
        (name: string) => {
            if (!creatingNode) {return;}

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
            const updateNodes = (nodes: TreeNode[]): TreeNode[] => nodes.map(node => {
                    if (node.id === creatingNode.parentId) {
                        const children = node.children || [];
                        return {
                            ...node,
                            children: [...children, newNode],
                            isExpanded: true // Expand parent
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
            if (!node) {return;}

            // Check if editing is allowed
            if (onBeforeEdit) {
                const canEdit = await onBeforeEdit(node);
                if (!canEdit) {return;}
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
            if (!node) {return;}

            const previousName = node.name;

            // Update tree data
            const updateNodes = (nodes: TreeNode[]): TreeNode[] => nodes.map(node => {
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
            if (!node) {return;}

            // Check if deletion is allowed
            if (onBeforeDelete) {
                const canDelete = await onBeforeDelete(node);
                if (!canDelete) {return;}
            }

            // Show confirmation dialog
            setConfirmDialog({
                isOpen: true,
                title: t('tree.deleteConfirmTitle'),
                message: t('tree.deleteConfirmMessage', { name: node.name }),
                onConfirm: () => {
                    // Update tree data
                    const deleteFromNodes = (nodes: TreeNode[]): TreeNode[] => nodes
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

    // Drag-and-drop handlers
    const handleDragStart = useCallback(
        (e: React.DragEvent, node: TreeNode) => {
            if (!draggable || node.isDisabled) {return;}

            e.dataTransfer.setData('text/plain', node.id);
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

            if (!draggable || !draggedNode || node.isDisabled) {return;}

            // Don't allow drop on itself or its children
            if (
                node.id === draggedNode.id ||
                getNodePath(node.id).some(name =>
                    getNodePath(draggedNode.id).includes(name))
            ) {
                return;
            }

            // Only allow drop on folders or root
            if (node.type !== NodeType.Folder && node.type !== NodeType.Default) {
                return;
            }

            setDropTargetId(node.id);
        },
        [draggable, draggedNode, getNodePath]
    );

    const handleDragLeave = useCallback(() => {
        setDropTargetId(null);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent, targetNode: TreeNode) => {
            e.preventDefault();
            e.stopPropagation();

            if (!draggable || !draggedNode || targetNode.isDisabled) {return;}

            // Don't allow drop on itself or its children
            if (
                targetNode.id === draggedNode.id ||
                getNodePath(targetNode.id).some(name =>
                    getNodePath(draggedNode.id).includes(name))
            ) {
                return;
            }

            // Only allow drop on folders or root
            if (targetNode.type !== NodeType.Folder && targetNode.type !== NodeType.Default) {
                setDropTargetId(null);
                setDraggedNode(null);
                return;
            }

            // Find draggedNode's parent
            const findParent = (nodes: TreeNode[], nodeId: string): boolean => {
                for (const node of nodes) {
                    if (node.children?.some(child => child.id === nodeId)) {
                        return true;
                    }
                    if (node.children && findParent(node.children, nodeId)) {
                        return true;
                    }
                }
                return false;
            };
            findParent(treeData, draggedNode.id);

            // Create a deep copy of the tree data
            const newTreeData = JSON.parse(JSON.stringify(treeData));

            // Remove the dragged node from its original position
            const removeNode = (nodes: TreeNode[]): TreeNode[] => nodes
                    .filter(node => node.id !== draggedNode.id)
                    .map(node => {
                        if (node.children) {
                            return { ...node, children: removeNode(node.children) };
                        }
                        return node;
                    });

            // Add the dragged node to the target node
            const addNode = (nodes: TreeNode[]): TreeNode[] => nodes.map(node => {
                    if (node.id === targetNode.id) {
                        const children = node.children || [];
                        return {
                            ...node,
                            children: [...children, { ...draggedNode, parentId: node.id }],
                            isExpanded: true // Expand the target node
                        };
                    }
                    if (node.children) {
                        return { ...node, children: addNode(node.children) };
                    }
                    return node;
                });

            let result = removeNode(newTreeData);
            result = addNode(result);

            setTreeData(result);
            onChange?.(result);
            setDropTargetId(null);
            setDraggedNode(null);

            // Call callback
            onNodeMove?.(draggedNode, targetNode);
        },
        [
            draggable,
            draggedNode,
            treeData,
            getNodePath,
            onChange,
            onNodeMove
        ]
    );

    const handleDragEnd = useCallback(() => {
        setDropTargetId(null);
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
            const isDropTarget = dropTargetId === node.id;

            const defaultRenderer = (
                <div
                    className={`
            tree-node 
            ${node.isExpanded ? 'expanded' : ''} 
            ${node.isSelected ? 'selected' : ''} 
            ${node.isDisabled ? 'disabled' : ''} 
            ${isDropTarget ? 'drop-target' : ''}
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
                        onDoubleClick={() => handleNodeDoubleClick(node)}
                    >
                        {hasChildren && (
                            <button
                                className="toggle-button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleNode(node.id);
                                }}
                            >
                                {node.isExpanded ? (
                                    <ChevronDown size={14} />
                                ) : (
                                    <ChevronRight size={14} />
                                )}
                            </button>
                        )}

                        {!hasChildren && <div className="toggle-spacer" />}

                        {multiSelect && (
                            <label className="checkbox-container" onClick={(e) => e.stopPropagation()}>
                                <input
                                    type="checkbox"
                                    checked={!!node.isSelected}
                                    onChange={() => toggleNodeCheckbox(node.id)}
                                    disabled={node.isDisabled}
                                />
                                <span className="checkbox-checkmark"></span>
                            </label>
                        )}

                        {getNodeIcon(node)}

                        {editingNode?.id === node.id ? (
                            <form
                                className="edit-form"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleEditNodeSubmit(node.id, editingNode.name);
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <input
                                    type="text"
                                    value={editingNode.name}
                                    onChange={(e) => setEditingNode({ ...editingNode, name: e.target.value })}
                                    autoFocus
                                    onBlur={() => setEditingNode(null)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Escape') {setEditingNode(null);}
                                    }}
                                />
                                <button type="submit" style={{ display: 'none' }}></button>
                            </form>
                        ) : (
                            <span className="node-name">{node.name}</span>
                        )}

                        {!node.isDisabled && (
                            <div className="node-actions">
                                {allowCreate && node.type === NodeType.Folder && (
                                    <button
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

                    {node.isExpanded && node.children && (
                        <div className="tree-children">
                            {node.children.map((child) => (
                                <div key={child.id} className="tree-node-wrapper">
                                    {renderNode ? renderNode(child, renderTreeNode(child)) : renderTreeNode(child)}
                                </div>
                            ))}

                            {creatingNode?.parentId === node.id && (
                                <div className="tree-node-wrapper">
                                    <div className="tree-node creating">
                                        <div className="tree-node-content">
                                            <div className="toggle-spacer" />
                                            {getNodeIcon({ ...creatingNode, id: '', name: '', isExpanded: false } as TreeNode)}
                                            <form
                                                className="edit-form"
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    const input = e.currentTarget.querySelector('input');
                                                    if (input?.value) {
                                                        handleCreateNodeSubmit(input.value);
                                                    }
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <input
                                                    type="text"
                                                    placeholder={t('tree.newNodeNamePlaceholder')}
                                                    autoFocus
                                                    onBlur={() => setCreatingNode(null)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Escape') {setCreatingNode(null);}
                                                    }}
                                                />
                                                <button type="submit" style={{ display: 'none' }}></button>
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
            draggable,
            handleDragStart,
            handleDragOver,
            handleDragLeave,
            handleDrop,
            handleDragEnd,
            showNodePath,
            getNodePath,
            selectNode,
            multiSelect,
            handleNodeDoubleClick,
            toggleNode,
            toggleNodeCheckbox,
            getNodeIcon,
            editingNode,
            handleEditNodeSubmit,
            allowCreate,
            allowEdit,
            allowDelete,
            createNode,
            editNode,
            deleteNode,
            creatingNode,
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
                            {getNodeIcon({ ...creatingNode, id: '', name: '', isExpanded: false } as TreeNode)}
                            <form
                                className="edit-form"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const input = e.currentTarget.querySelector('input');
                                    if (input?.value) {
                                        handleCreateNodeSubmit(input.value);
                                    }
                                }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <input
                                    type="text"
                                    placeholder={t('tree.newNodeNamePlaceholder')}
                                    autoFocus
                                    onBlur={() => setCreatingNode(null)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Escape') {setCreatingNode(null);}
                                    }}
                                />
                                <button type="submit" style={{ display: 'none' }}></button>
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
                        onClick={() => createNode(null, NodeType.Folder)}
                        title={t('tree.addRoot')}
                    >
                        <Plus size={16} />
                        <span>{t('tree.addRoot')}</span>
                    </button>
                </div>
            )}

            {/* Confirmation dialog */}
            {confirmDialog.isOpen && (
                <ConfirmDialog
                    isOpen={confirmDialog.isOpen}
                    title={confirmDialog.title}
                    message={confirmDialog.message}
                    onConfirm={() => {
                        confirmDialog.onConfirm();
                        setConfirmDialog({ ...confirmDialog, isOpen: false });
                    }}
                    onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                />
            )}
        </div>
    );
};

export default Tree;