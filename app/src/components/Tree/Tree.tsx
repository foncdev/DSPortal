import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { TreeProps, TreeNode, NodeType } from './types';
import { generateNodeId } from './constants';
import { TreeNode as TreeNodeComponent } from './components';
import { useTreeState, useTreeDragDrop } from './hooks';
import { getNodePath } from './utils';
import { ConfirmDialog } from './Dialog';
import './Tree.scss';

/**
 * Tree 컴포넌트
 * 계층적 데이터 구조를 트리 형태로 시각화
 */
const Tree: React.FC<TreeProps> = (props) => {
    const {
        draggable = false,
        multiSelect = false,
        allowCreate = false,
        allowEdit = false,
        allowDelete = false,
        renderNode,
        showNodePath = false,
        onNodeDoubleClick,
    } = props;

    const { t } = useTranslation();

    // 트리 상태 관리 훅
    const {
        treeData,
        expandedNodesRef,
        editingNode,
        creatingNode,
        confirmDialog,
        setCreatingNode,
        setConfirmDialog,
        toggleNode,
        selectNode,
        toggleNodeCheckbox,
        createNode,
        handleCreateNodeSubmit,
        editNode,
        handleEditNodeSubmit,
        deleteNode,
        setTreeData
    } = useTreeState(props);

    // 드래그 앤 드롭 훅
    const {
        dropTargetId,
        dropPosition,
        handleDragStart,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        handleDragEnd,
        getDropIndicatorClass,
    } = useTreeDragDrop(props, treeData, setTreeData);

    // 노드 더블 클릭 핸들러
    const handleNodeDoubleClick = useCallback((node: TreeNode) => {
        if (node.children) {
            toggleNode(node.id);
        }
        onNodeDoubleClick?.(node);
    }, [toggleNode, onNodeDoubleClick]);

    // 트리 노드 렌더링 함수
    const renderTreeNode = useCallback((node: TreeNode, level: number = 0) => {
        // 노드에 key 설정
        const nodeKey = `tree-node-${node.id}`;

        const nodeComponent = (
            <TreeNodeComponent
                key={nodeKey}
                node={node}
                renderTreeNode={(childNode) => renderTreeNode(childNode, level + 1)}
                level={level}
                onToggle={toggleNode}
                onSelect={selectNode}
                onDoubleClick={handleNodeDoubleClick}
                onCheckboxToggle={toggleNodeCheckbox}
                onDragStart={draggable ? handleDragStart : undefined}
                onDragOver={draggable ? handleDragOver : undefined}
                onDragLeave={draggable ? handleDragLeave : undefined}
                onDrop={draggable ? handleDrop : undefined}
                onDragEnd={draggable ? handleDragEnd : undefined}
                onEdit={editNode}
                onDelete={deleteNode}
                onCreate={createNode}
                multiSelect={multiSelect}
                draggable={draggable}
                allowCreate={allowCreate}
                allowEdit={allowEdit}
                allowDelete={allowDelete}
                dropTargetId={dropTargetId}
                dropPosition={dropPosition}
                showNodePath={showNodePath}
                getNodePath={(id) => getNodePath(id, treeData)}
                editingNode={editingNode}
                creatingNode={creatingNode}
                onEditSubmit={handleEditNodeSubmit}
                onCreateSubmit={handleCreateNodeSubmit}
            />
        );

        return renderNode ? renderNode(node, nodeComponent) : nodeComponent;
    }, [
        toggleNode,
        selectNode,
        handleNodeDoubleClick,
        toggleNodeCheckbox,
        handleDragStart,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        handleDragEnd,
        editNode,
        deleteNode,
        createNode,
        multiSelect,
        draggable,
        allowCreate,
        allowEdit,
        allowDelete,
        dropTargetId,
        dropPosition,
        showNodePath,
        treeData,
        editingNode,
        creatingNode,
        handleEditNodeSubmit,
        handleCreateNodeSubmit,
        renderNode
    ]);

// 루트 노드 생성 중인지 확인
const isCreatingRootNode = creatingNode?.parentId === null;

return (
    <div className="tree-component">
        {/* 루트 레벨 노드 */}
        {treeData.map((node) => (
            <div key={node.id} className="tree-node-wrapper root-node">
                {renderTreeNode(node)}
            </div>
        ))}

        {/* 루트 레벨 노드 생성 폼 */}
        {isCreatingRootNode && (
            <div className="tree-node-wrapper root-node">
                <div className="tree-node creating">
                    <div className="tree-node-content">
                        <div className="toggle-spacer" />
                        <div className={`tree-node-icon ${creatingNode.type}-icon`} />
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

        {/* "루트 노드 추가" 버튼 */}
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

        {/* 확인 다이얼로그 */}
        <ConfirmDialog
            isOpen={confirmDialog.isOpen}
            title={confirmDialog.title}
            message={confirmDialog.message}
            onConfirm={() => {
                confirmDialog.onConfirm();
                setConfirmDialog({ ...confirmDialog, isOpen: false });
            }}
            onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
            confirmText="tree.confirmButton"
            cancelText="tree.cancelButton"
        />
    </div>
);
};

export default Tree;