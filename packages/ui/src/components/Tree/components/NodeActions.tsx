import React from 'react';
import { useTranslation } from 'react-i18next';
import { NodeActionsProps } from '../types';
import { NodeType } from '../types';
import { ACTION_ICONS } from '../constants';

/**
 * 노드 액션 버튼 컴포넌트
 * 생성, 편집, 삭제 버튼 표시
 */
const NodeActions: React.FC<NodeActionsProps> = ({
                                                     node,
                                                     allowCreate,
                                                     allowEdit,
                                                     allowDelete,
                                                     onEdit,
                                                     onDelete,
                                                     onCreate
                                                 }) => {
    const { t } = useTranslation();

    // 아이콘 컴포넌트
    const CreateIcon = ACTION_ICONS.create;
    const EditIcon = ACTION_ICONS.edit;
    const DeleteIcon = ACTION_ICONS.delete;

    return (
        <div className="node-actions">
            {/* 폴더 내에 새 노드 생성 버튼 */}
            {allowCreate && node.type === NodeType.Folder && (
                <button
                    type="button"
                    className="action-button create"
                    onClick={(e) => {
                        e.stopPropagation();
                        onCreate(node.id, NodeType.File);
                    }}
                    title={t('tree.create')}
                    aria-label={t('tree.create')}
                >
                    <CreateIcon size={14} />
                </button>
            )}

            {/* 노드 편집 버튼 */}
            {allowEdit && (
                <button
                    type="button"
                    className="action-button edit"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(node.id);
                    }}
                    title={t('tree.edit')}
                    aria-label={t('tree.edit')}
                >
                    <EditIcon size={14} />
                </button>
            )}

            {/* 노드 삭제 버튼 */}
            {allowDelete && (
                <button
                    type="button"
                    className="action-button delete"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(node.id);
                    }}
                    title={t('tree.delete')}
                    aria-label={t('tree.delete')}
                >
                    <DeleteIcon size={14} />
                </button>
            )}
        </div>
    );
};

export default NodeActions;