import React, { useState, useEffect } from 'react';
import { Tree, NodeType, TreeNode } from '../components/Tree';

// Initial data for the tree
const initialData: TreeNode[] = [
    {
        id: 'root1',
        name: 'Documents',
        type: NodeType.Folder,
        isExpanded: true,
        children: [
            {
                id: 'folder1',
                name: 'Work Documents',
                type: NodeType.Folder,
                parentId: 'root1',
                children: [
                    {
                        id: 'doc1',
                        name: 'Project Plan.pdf',
                        type: NodeType.File,
                        parentId: 'folder1'
                    },
                    {
                        id: 'doc2',
                        name: 'Meeting Notes.txt',
                        type: NodeType.File,
                        parentId: 'folder1'
                    }
                ]
            },
            {
                id: 'folder2',
                name: 'Personal Documents',
                type: NodeType.Folder,
                parentId: 'root1',
                children: [
                    {
                        id: 'doc3',
                        name: 'Vacation Photos',
                        type: NodeType.Folder,
                        parentId: 'folder2',
                        children: [
                            {
                                id: 'img1',
                                name: 'Beach.jpg',
                                type: NodeType.File,
                                parentId: 'doc3'
                            },
                            {
                                id: 'img2',
                                name: 'Mountains.jpg',
                                type: NodeType.File,
                                parentId: 'doc3'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'root2',
        name: 'Projects',
        type: NodeType.Folder,
        children: [
            {
                id: 'project1',
                name: 'Website Redesign',
                type: NodeType.Folder,
                parentId: 'root2',
                children: []
            },
            {
                id: 'project2',
                name: 'Mobile App',
                type: NodeType.Folder,
                parentId: 'root2',
                children: []
            }
        ]
    }
];

const TreeDemo: React.FC = () => {
    const [treeData, setTreeData] = useState<TreeNode[]>(initialData);
    const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
    const [expandedIds, setExpandedIds] = useState<string[]>(['root1', 'folder1']);
    const [selectedNodes, setSelectedNodes] = useState<TreeNode[]>([]);

    // Handler for tree data changes
    const handleTreeChange = (newData: TreeNode[]) => {
        setTreeData(newData);

        // Update expanded IDs
        const newExpandedIds: string[] = [];
        const findExpandedNodes = (nodes: TreeNode[]) => {
            nodes.forEach(node => {
                if (node.isExpanded) {
                    newExpandedIds.push(node.id);
                }
                if (node.children) {
                    findExpandedNodes(node.children);
                }
            });
        };

        findExpandedNodes(newData);
        setExpandedIds(newExpandedIds);

        // Update selected nodes list for display in the UI
        const newSelectedNodes: TreeNode[] = [];
        const findSelectedNodes = (nodes: TreeNode[]) => {
            nodes.forEach(node => {
                if (node.isSelected) {
                    newSelectedNodes.push(node);
                }
                if (node.children) {
                    findSelectedNodes(node.children);
                }
            });
        };

        findSelectedNodes(newData);
        setSelectedNodes(newSelectedNodes);
    };

    // Handler for node selection
    const handleNodeSelect = (node: TreeNode) => {
        setSelectedNode(node);
        console.log('Selected node:', node.name, 'Selected state:', node.isSelected);
    };

    // Handler for node move
    const handleNodeMove = (node: TreeNode, targetNode: TreeNode, position: string) => {
        console.log(`Moved node ${node.name} to ${position} of ${targetNode.name}`);
    };

    // Handler for node creation
    const handleNodeCreate = (node: TreeNode, parentNode: TreeNode | null) => {
        console.log('Created node:', node, 'under parent:', parentNode);
    };

    // Handler for node edit
    const handleNodeEdit = (node: TreeNode, previousName: string) => {
        console.log('Edited node from', previousName, 'to', node.name);
    };

    // Handler for node delete
    const handleNodeDelete = (node: TreeNode) => {
        console.log('Deleted node:', node);
    };

    return (
        <div className="page-container">
            <h1 className="page-title">Tree Component Demo</h1>

            <div className="tree-demo-container">
                <div className="tree-panel">
                    <h2>File Explorer</h2>
                    <Tree
                        data={treeData}
                        onChange={handleTreeChange}
                        onNodeSelect={handleNodeSelect}
                        onNodeMove={handleNodeMove}
                        onNodeCreate={handleNodeCreate}
                        onNodeEdit={handleNodeEdit}
                        onNodeDelete={handleNodeDelete}
                        draggable={true}
                        multiSelect={true}
                        allowCreate={true}
                        allowEdit={true}
                        allowDelete={true}
                        showCheckbox={true}
                        expandedIds={expandedIds}
                        showNodePath={true}
                    />
                </div>

                <div className="info-panel">
                    <h2>Selected Node</h2>
                    {selectedNode ? (
                        <div className="selected-node-info">
                            <p><strong>Name:</strong> {selectedNode.name}</p>
                            <p><strong>Type:</strong> {selectedNode.type}</p>
                            <p><strong>ID:</strong> {selectedNode.id}</p>
                            {selectedNode.parentId && (
                                <p><strong>Parent ID:</strong> {selectedNode.parentId}</p>
                            )}
                            <p><strong>Selected:</strong> {selectedNode.isSelected ? 'Yes' : 'No'}</p>
                        </div>
                    ) : (
                        <p>No node selected</p>
                    )}

                    <h2>Checked Nodes</h2>
                    {selectedNodes.length > 0 ? (
                        <div className="checked-nodes-list">
                            <ul>
                                {selectedNodes.map(node => (
                                    <li key={node.id}>{node.name} ({node.type})</li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p>No nodes checked</p>
                    )}
                </div>
            </div>

            <style jsx>{`
        .page-container {
          padding: 20px;
        }
        
        .page-title {
          margin-bottom: 20px;
        }
        
        .tree-demo-container {
          display: flex;
          gap: 30px;
        }
        
        .tree-panel {
          flex: 1;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 20px;
          background-color: var(--color-bg-secondary);
        }
        
        .info-panel {
          width: 300px;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 20px;
          background-color: var(--color-bg-secondary);
        }
        
        .selected-node-info {
          padding: 10px;
          background-color: var(--color-bg-tertiary);
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .checked-nodes-list {
          padding: 10px;
          background-color: var(--color-bg-tertiary);
          border-radius: 4px;
        }
        
        .checked-nodes-list ul {
          list-style-type: none;
          padding: 0;
          margin: 0;
        }
        
        .checked-nodes-list li {
          padding: 4px 0;
          border-bottom: 1px dashed var(--color-border);
        }
        
        .checked-nodes-list li:last-child {
          border-bottom: none;
        }
        
        h2 {
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 1.2rem;
        }
      `}</style>
        </div>
    );
};

export default TreeDemo;