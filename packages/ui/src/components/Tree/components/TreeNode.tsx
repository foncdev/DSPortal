import React from 'react';
import { TreeNodeProps } from '../types';
import { NODE_CLASSES } from '../constants';
import TreeNodeContent from './TreeNodeContent';
import NodeForm from './NodeForm';
import { useTranslation } from 'react-i18next';

const TreeNode: React.FC<TreeNodeProps> = ({
                                               node,
                                               renderTreeNode,
                                               level = 0,
                                               onToggle,
                                               onSelect,
                                               onDoubleClick,
                                               onCheckboxToggle,
                                               onDragStart,
                                               onDragOver,
                                               onDragLeave,
                                               onDrop,
                                               onDragEnd,
                                               onEdit,
                                               onDelete,
                                               onCreate,
                                               multiSelect,
                                               showCheckbox, // New prop
                                               draggable,
                                               allowCreate,
                                               allowEdit,
                                               allowDelete,
                                               dropTargetId,
                                               dropPosition,
                                               showNodePath,
                                               getNodePath,
                                               editingNode,
                                               creatingNode,
                                               onEditSubmit,
                                               onCreateSubmit
                                           }) => {
    const { t } = useTranslation();
    const hasChildren = !!node.children?.length;
    const isEditing = editingNode?.id === node.id;
    const isCreatingChild = creatingNode?.parentId === node.id;
    const isCurrentDropTarget = dropTargetId === node.id;

    // Updated node classes with highlight selection separate from checkbox state
    const nodeClasses = [
        'tree-node',
        node.isExpanded ? NODE_CLASSES.EXPANDED : '',
        node.isHighlighted ? NODE_CLASSES.SELECTED : '', // Highlight state
        !multiSelect && node.isHighlighted ? NODE_CLASSES.SINGLE_SELECTED : '',
        node.isDisabled ? NODE_CLASSES.DISABLED : '',
        isCurrentDropTarget ? 'drop-target' : '',
        dropTargetId === node.id && dropPosition ? `drop-target-${dropPosition}` : '',
        `type-${node.type}`
    ].filter(Boolean).join(' ');

    return (
        <div
            className={nodeClasses}
            draggable={draggable && !node.isDisabled}
            onDragStart={onDragStart ? (e) => onDragStart(e, node) : undefined}
            onDragOver={onDragOver ? (e) => onDragOver(e, node) : undefined}
            onDragLeave={onDragLeave}
            onDrop={onDrop ? (e) => onDrop(e, node) : undefined}
            onDragEnd={onDragEnd}
            data-node-id={node.id}
            title={showNodePath ? getNodePath(node.id).join(' / ') : undefined}
            onDoubleClick={(e) => {
                e.stopPropagation();
                onDoubleClick(node);
            }}
        >
            <TreeNodeContent
                node={node}
                hasChildren={hasChildren}
                isEditing={isEditing}
                level={level}
                multiSelect={multiSelect}
                showCheckbox={showCheckbox} // Pass the prop
                allowCreate={allowCreate}
                allowEdit={allowEdit}
                allowDelete={allowDelete}
                editingNode={editingNode}
                creatingChild={isCreatingChild}
                onToggle={onToggle}
                onSelect={onSelect}
                onCheckboxToggle={onCheckboxToggle}
                onEdit={onEdit}
                onDelete={onDelete}
                onCreate={onCreate}
                onEditSubmit={onEditSubmit}
            />

            {/* Children rendering */}
            {node.isExpanded && node.children && (
                <div className="tree-children">
                    {node.children.map((child) => (
                        <div key={child.id} className="tree-node-wrapper">
                            {React.cloneElement(renderTreeNode(child) as React.ReactElement, { level: level + 1 })}
                        </div>
                    ))}

                    {/* New node creation form */}
                    {isCreatingChild && (
                        <div className="tree-node-wrapper">
                            <div className="tree-node creating">
                                <div className="tree-node-content" style={{ paddingLeft: `${((level + 1) * 8) + 8}px` }}>
                                    <div className="toggle-spacer" />
                                    <div className={`tree-node-icon ${creatingNode.type}-icon`} />
                                    <NodeForm
                                        initialValue=""
                                        placeholder={t('tree.newNodeNamePlaceholder')}
                                        onSubmit={onCreateSubmit}
                                        onCancel={() => onCreateSubmit('')}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TreeNode;