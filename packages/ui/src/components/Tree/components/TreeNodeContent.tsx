import React from 'react';
import { useTranslation } from 'react-i18next';
import { TreeNode, NodeType } from '../types';
import { TOGGLE_ICONS, TOGGLE_ICON_SIZE } from '../constants';
import TreeNodeIcon from './TreeNodeIcon';
import TreeNodeCheckbox from './TreeNodeCheckbox';
import NodeActions from './NodeActions';
import NodeForm from './NodeForm';

interface TreeNodeContentProps {
    node: TreeNode;
    hasChildren: boolean;
    isEditing: boolean;
    level: number;
    multiSelect: boolean;
    showCheckbox: boolean; // New prop to control checkbox visibility
    allowCreate: boolean;
    allowEdit: boolean;
    allowDelete: boolean;
    editingNode: { id: string; name: string } | null;
    creatingChild: boolean;
    onToggle: (id: string) => void;
    onSelect: (id: string, multiSelection: boolean) => void;
    onCheckboxToggle: (id: string) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onCreate: (parentId: string, type: NodeType) => void;
    onEditSubmit: (id: string, name: string) => void;
}

const TreeNodeContent: React.FC<TreeNodeContentProps> = ({
                                                             node,
                                                             hasChildren,
                                                             isEditing,
                                                             level,
                                                             multiSelect,
                                                             showCheckbox, // New prop
                                                             allowCreate,
                                                             allowEdit,
                                                             allowDelete,
                                                             editingNode,
                                                             onToggle,
                                                             onSelect,
                                                             onCheckboxToggle,
                                                             onEdit,
                                                             onDelete,
                                                             onCreate,
                                                             onEditSubmit
                                                         }) => {
    const { t } = useTranslation();

    // Toggle icon components
    const ExpandedIcon = TOGGLE_ICONS.expanded;
    const CollapsedIcon = TOGGLE_ICONS.collapsed;

    return (
        <div
            className="tree-node-content"
            onClick={(e) => {
                e.stopPropagation();
                // Only handle node selection here, not checkbox toggling
                onSelect(node.id, e.ctrlKey && multiSelect);
            }}
            style={{ paddingLeft: `${(level * 8) + 8}px` }}
        >
            {/* Toggle button or spacer */}
            {hasChildren ? (
                <button
                    type="button"
                    className="toggle-button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle(node.id);
                    }}
                    aria-label={node.isExpanded ? "Collapse" : "Expand"}
                >
                    {node.isExpanded ? (
                        <ExpandedIcon size={TOGGLE_ICON_SIZE} />
                    ) : (
                        <CollapsedIcon size={TOGGLE_ICON_SIZE} />
                    )}
                </button>
            ) : (
                <div className="toggle-spacer" />
            )}

            {/* Checkbox - only show if configured */}
            {showCheckbox && (
                <TreeNodeCheckbox
                    id={node.id}
                    checked={!!node.isSelected}
                    disabled={node.isDisabled}
                    onChange={() => {
                        // This callback is now isolated from node selection
                        onCheckboxToggle(node.id);
                    }}
                />
            )}

            {/* Node icon */}
            <TreeNodeIcon node={node} />

            {/* Node name or edit form */}
            {isEditing && editingNode ? (
                <NodeForm
                    initialValue={editingNode.name}
                    placeholder={t('tree.newNodeNamePlaceholder')}
                    onSubmit={(name) => onEditSubmit(node.id, name)}
                    onCancel={() => onEditSubmit(node.id, node.name)}
                />
            ) : (
                <span className="node-name">{node.name}</span>
            )}

            {/* Node actions */}
            {!node.isDisabled && (
                <NodeActions
                    node={node}
                    allowCreate={allowCreate}
                    allowEdit={allowEdit}
                    allowDelete={allowDelete}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onCreate={onCreate}
                />
            )}
        </div>
    );
};

export default TreeNodeContent;