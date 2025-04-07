import React, { useState, useCallback } from 'react';
import { Tree, TreeNode, NodeType } from '../components/Tree';
import './TreeDemo.scss';

// Sample tree data
const initialTreeData: TreeNode[] = [
    {
        id: 'folder-1',
        name: 'Project Files',
        type: NodeType.Folder,
        children: [
            {
                id: 'file-1',
                name: 'README.md',
                type: NodeType.File
            },
            {
                id: 'folder-2',
                name: 'src',
                type: NodeType.Folder,
                children: [
                    {
                        id: 'file-2',
                        name: 'App.tsx',
                        type: NodeType.File
                    },
                    {
                        id: 'file-3',
                        name: 'index.tsx',
                        type: NodeType.File
                    }
                ]
            },
            {
                id: 'folder-3',
                name: 'assets',
                type: NodeType.Folder,
                children: [
                    {
                        id: 'file-4',
                        name: 'logo.svg',
                        type: NodeType.File
                    },
                    {
                        id: 'file-5',
                        name: 'background.png',
                        type: NodeType.File
                    }
                ]
            }
        ]
    },
    {
        id: 'folder-4',
        name: 'Devices',
        type: NodeType.Folder,
        children: [
            {
                id: 'device-1',
                name: 'Tablet #1',
                type: NodeType.Device
            },
            {
                id: 'device-2',
                name: 'Tablet #2',
                type: NodeType.Device
            }
        ]
    },
    {
        id: 'folder-5',
        name: 'Layouts',
        type: NodeType.Folder,
        children: [
            {
                id: 'layout-1',
                name: 'Main Layout',
                type: NodeType.Layout
            },
            {
                id: 'layout-2',
                name: 'Home Layout',
                type: NodeType.Layout
            }
        ]
    },
    {
        id: 'folder-6',
        name: 'Custom Items',
        type: NodeType.Folder,
        children: [
            {
                id: 'custom-1',
                name: 'Custom Item #1',
                type: NodeType.Custom
            },
            {
                id: 'custom-2',
                name: 'Custom Item #2',
                type: NodeType.Custom,
                isDisabled: true
            }
        ]
    }
];

/**
 * Tree Demo Component
 */
const TreeDemo: React.FC = () => {
    const [treeData, setTreeData] = useState<TreeNode[]>(initialTreeData);
    const [logs, setLogs] = useState<string[]>([]);
    const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
    const [demoOptions, setDemoOptions] = useState({
        draggable: true,
        multiSelect: false,
        allowCreate: true,
        allowEdit: true,
        allowDelete: true,
        showNodePath: true
    });

    // Function to add a log entry
    const addLog = (message: string) => {
        setLogs(prev => [message, ...prev.slice(0, 19)]); // Keep last 20 logs
    };

    // Clear logs
    const clearLogs = () => {
        setLogs([]);
    };

    // Handle tree data changes
    const handleTreeChange = useCallback((newData: TreeNode[]) => {
        setTreeData(newData);
    }, []);

    // Handle node selection
    const handleNodeSelect = useCallback((node: TreeNode) => {
        setSelectedNode(node);
        addLog(`Selected: ${node.name} (${node.type})`);
    }, []);

    // Handle node double click
    const handleNodeDoubleClick = useCallback((node: TreeNode) => {
        addLog(`Double-clicked: ${node.name} (${node.type})`);
    }, []);

    // Handle before node creation
    const handleBeforeCreate = useCallback((parentNode: TreeNode | null, nodeType: NodeType) => {
        const parentPath = parentNode
            ? getNodePath(parentNode).join(' / ')
            : 'Root';

        addLog(`Creating new ${nodeType} node under: ${parentPath}`);
        return true; // Allow creation
    }, []);

    // Handle node creation
    const handleNodeCreate = useCallback((node: TreeNode, parentNode: TreeNode | null) => {
        const parentPath = parentNode
            ? getNodePath(parentNode).join(' / ')
            : 'Root';

        addLog(`Created: ${node.name} (${node.type}) under ${parentPath}`);
    }, []);

    // Handle before node edit
    const handleBeforeEdit = useCallback((node: TreeNode) => {
        addLog(`Editing: ${node.name} (${node.type})`);
        return true; // Allow editing
    }, []);

    // Handle node edit
    const handleNodeEdit = useCallback((node: TreeNode, previousName: string) => {
        addLog(`Renamed: ${previousName} -> ${node.name}`);
    }, []);

    // Handle before node deletion
    const handleBeforeDelete = useCallback((node: TreeNode) => {
        addLog(`Deleting: ${node.name} (${node.type})`);
        return true; // Allow deletion
    }, []);

    // Handle node deletion
    const handleNodeDelete = useCallback((node: TreeNode) => {
        addLog(`Deleted: ${node.name} (${node.type})`);
    }, []);

    // Handle node movement
    const handleNodeMove = useCallback((node: TreeNode, targetNode: TreeNode) => {
        addLog(`Moved: ${node.name} to ${targetNode.name}`);
    }, []);

    // Helper function to get node path
    const getNodePath = (node: TreeNode, nodes = treeData, path: string[] = []): string[] => {
        for (const n of nodes) {
            const currentPath = [...path, n.name];
            if (n.id === node.id) {return currentPath;}
            if (n.children) {
                const found = getNodePath(node, n.children, currentPath);
                if (found.length) {return found;}
            }
        }
        return [];
    };

    // Toggle demo options
    const toggleOption = (option: keyof typeof demoOptions) => {
        setDemoOptions(prev => ({
            ...prev,
            [option]: !prev[option]
        }));
    };

    return (
        <div className="tree-demo">
            <h1>Tree Component Demo</h1>

            <div className="demo-controls">
                <h3>Options</h3>
                <div className="controls">
                    <label>
                        <input
                            type="checkbox"
                            checked={demoOptions.draggable}
                            onChange={() => toggleOption('draggable')}
                        />
                        Draggable
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            checked={demoOptions.multiSelect}
                            onChange={() => toggleOption('multiSelect')}
                        />
                        Multi-select
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            checked={demoOptions.allowCreate}
                            onChange={() => toggleOption('allowCreate')}
                        />
                        Allow Create
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            checked={demoOptions.allowEdit}
                            onChange={() => toggleOption('allowEdit')}
                        />
                        Allow Edit
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            checked={demoOptions.allowDelete}
                            onChange={() => toggleOption('allowDelete')}
                        />
                        Allow Delete
                    </label>

                    <label>
                        <input
                            type="checkbox"
                            checked={demoOptions.showNodePath}
                            onChange={() => toggleOption('showNodePath')}
                        />
                        Show Node Path
                    </label>
                </div>
            </div>

            <div className="demo-container">
                <div className="tree-container">
                    <h3>File Explorer</h3>
                    <Tree
                        data={treeData}
                        onChange={handleTreeChange}
                        draggable={demoOptions.draggable}
                        multiSelect={demoOptions.multiSelect}
                        allowCreate={demoOptions.allowCreate}
                        allowEdit={demoOptions.allowEdit}
                        allowDelete={demoOptions.allowDelete}
                        showNodePath={demoOptions.showNodePath}
                        onNodeSelect={handleNodeSelect}
                        onNodeDoubleClick={handleNodeDoubleClick}
                        onBeforeCreate={handleBeforeCreate}
                        onNodeCreate={handleNodeCreate}
                        onBeforeEdit={handleBeforeEdit}
                        onNodeEdit={handleNodeEdit}
                        onBeforeDelete={handleBeforeDelete}
                        onNodeDelete={handleNodeDelete}
                        onNodeMove={handleNodeMove}
                        expandedIds={['folder-1', 'folder-2']} // Initially expanded nodes
                    />
                </div>

                <div className="side-panel">
                    <div className="selected-node">
                        <h3>Selected Node</h3>
                        {selectedNode ? (
                            <div className="node-details">
                                <p><strong>ID:</strong> {selectedNode.id}</p>
                                <p><strong>Name:</strong> {selectedNode.name}</p>
                                <p><strong>Type:</strong> {selectedNode.type}</p>
                                <p><strong>Path:</strong> {getNodePath(selectedNode).join(' / ')}</p>
                            </div>
                        ) : (
                            <p className="no-selection">No node selected</p>
                        )}
                    </div>

                    <div className="logs-panel">
                        <div className="logs-header">
                            <h3>Activity Logs</h3>
                            <button className="clear-logs" onClick={clearLogs}>Clear</button>
                        </div>
                        <div className="logs">
                            {logs.length > 0 ? (
                                <ul>
                                    {logs.map((log, index) => (
                                        <li key={index}>{log}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="no-logs">No activity yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TreeDemo;