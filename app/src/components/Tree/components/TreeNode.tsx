import React from 'react';
import { TreeNodeProps, NodeType } from '../types';
import { NODE_CLASSES } from '../constants';
import TreeNodeContent from './TreeNodeContent';
import NodeForm from './NodeForm';
import { useTranslation } from 'react-i18next';

/**
 * 트리 노드 컴포넌트
 * 단일 트리 노드와 그 자식 노드들을 재귀적으로 렌더링
 */
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

    // 노드 클래스 계산
    const nodeClasses = [
        'tree-node',
        node.isExpanded ? NODE_CLASSES.EXPANDED : '',
        node.isSelected ? NODE_CLASSES.SELECTED : '',
        !multiSelect && node.isSelected ? NODE_CLASSES.SINGLE_SELECTED : '',
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

            {/* 자식 노드 렌더링 */}
            {node.isExpanded && node.children && (
                <div className="tree-children">
                    {node.children.map((child) => (
                        <div key={child.id} className="tree-node-wrapper">
                            {React.cloneElement(renderTreeNode(child) as React.ReactElement, { level: level + 1 })}
                        </div>
                    ))}

                    {/* 새 노드 생성 폼 */}
                    {isCreatingChild && (
                        <div className="tree-node-wrapper">
                            <div className="tree-node creating">
                                <div className="tree-node-content" style={{ paddingLeft: `${((level + 1) * 8) + 8}px` }}>
                                    <div className="toggle-spacer" />
                                    {/* 생성 중인 노드 타입에 맞는 아이콘 */}
                                    {React.createElement(
                                        'div',
                                        { className: `tree-node-icon ${creatingNode.type}-icon` }
                                    )}
                                    <NodeForm
                                        initialValue=""
                                        placeholder={t('tree.newNodeNamePlaceholder')}
                                        onSubmit={onCreateSubmit}
                                        onCancel={() => onCreateSubmit('')} // 빈 문자열 전달하여 취소
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