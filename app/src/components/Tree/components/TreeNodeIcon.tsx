import React from 'react';
import { NodeIconProps } from '../types';
import { NODE_ICONS, ICON_SIZE, NODE_ICON_CLASSES } from '../constants';

/**
 * 트리 노드 아이콘 컴포넌트
 * 노드 타입에 따라 다른 아이콘 표시
 */
const TreeNodeIcon: React.FC<NodeIconProps> = ({ node }) => {
    // 사용자 정의 아이콘이 있는 경우
    if (node.customIcon) {
        return <>{node.customIcon}</>;
    }

    // 노드 타입에 따른 아이콘 컴포넌트 선택
    const IconComponent = NODE_ICONS[node.type] || null;

    // 노드 타입에 따른 CSS 클래스 선택
    const iconClass = NODE_ICON_CLASSES[node.type] || NODE_ICON_CLASSES.default;

    if (IconComponent) {
        return <IconComponent size={ICON_SIZE} className={iconClass} />;
    }

    // 기본 아이콘이 없는 경우 빈 div 반환
    return <div className={iconClass} />;
};

export default TreeNodeIcon;