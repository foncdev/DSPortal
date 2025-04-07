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

/**
 * 트리 노드 컨텐츠 컴포넌트
 * 노드의 토글 버튼, 아이콘, 이름, 체크박스 및 액션 버튼 렌더링
 */
const TreeNodeContent: React.FC<TreeNodeContentProps> = ({
                                                             node,
                                                             hasChildren,
                                                             isEditing,
                                                             level,
                                                             multiSelect,
                                                             allowCreate,
                                                             allowEdit,
                                                             allowDelete,
                                                             editingNode,
                                                             creatingChild,
                                                             onToggle,
                                                             onSelect,
                                                             onCheckboxToggle,
                                                             onEdit,
                                                             onDelete,
                                                             onCreate,
                                                             onEditSubmit
                                                         }) => {
    const { t } = useTranslation();

    // 토글 아이콘 컴포넌트
    const ExpandedIcon = TOGGLE_ICONS.expanded;
    const CollapsedIcon = TOGGLE_ICONS.collapsed;

    return (
        <div
            className="tree-node-content"
            onClick={(e) => {
                e.stopPropagation();
                onSelect(node.id, e.ctrlKey && multiSelect);
            }}
            style={{ paddingLeft: `${(level * 8) + 8}px` }} // 레벨에 따른 들여쓰기
        >
            {/* 토글 버튼 또는 공백 */}
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

            {/* 체크박스 (다중 선택 모드) */}
            {multiSelect && (
                <TreeNodeCheckbox
                    id={node.id}
                    checked={!!node.isSelected}
                    disabled={node.isDisabled}
                    onChange={onCheckboxToggle.bind(null, node.id)}
                />
            )}

            {/* 노드 아이콘 */}
            <TreeNodeIcon node={node} />

            {/* 노드 이름 또는 편집 폼 */}
            {isEditing && editingNode ? (
                <NodeForm
                    initialValue={editingNode.name}
                    placeholder={t('tree.newNodeNamePlaceholder')}
                    onSubmit={(name) => onEditSubmit(node.id, name)}
                    onCancel={() => onEditSubmit(node.id, node.name)} // 취소 시 원래 이름으로 되돌림
                />
            ) : (
                <span className="node-name">{node.name}</span>
            )}

            {/* 노드 액션 */}
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