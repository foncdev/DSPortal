import { FolderIcon, FileIcon, LayoutIcon, UserIcon, Smartphone, ChevronRight, ChevronDown, Plus, Edit, Trash } from 'lucide-react';

/**
 * 노드 타입별 아이콘 매핑
 */
export const NODE_ICONS = {
    folder: FolderIcon,
    file: FileIcon,
    device: Smartphone,
    layout: LayoutIcon,
    custom: UserIcon,
    default: null
};

/**
 * 아이콘 사이즈 (픽셀)
 */
export const ICON_SIZE = 16;

/**
 * 노드 타입별 아이콘 클래스 매핑
 */
export const NODE_ICON_CLASSES = {
    folder: 'tree-node-icon folder-icon',
    file: 'tree-node-icon file-icon',
    device: 'tree-node-icon device-icon',
    layout: 'tree-node-icon layout-icon',
    custom: 'tree-node-icon custom-icon',
    default: 'tree-node-icon default-icon'
};

/**
 * 확장/축소 아이콘 사이즈 (픽셀)
 */
export const TOGGLE_ICON_SIZE = 14;

/**
 * 드롭 위치 감지를 위한 임계값
 */
export const DROP_THRESHOLD = {
    ABOVE: 0.25, // 상단 25% 영역은 위에 드롭
    BELOW: 0.75  // 하단 25% 영역은 아래에 드롭, 나머지는 내부에 드롭
};

/**
 * 드래그 앤 드롭 관련 CSS 클래스
 */
export const DROP_CLASSES = {
    TARGET: 'drop-target',
    ABOVE: 'drop-target-above',
    BELOW: 'drop-target-below',
    INSIDE: 'drop-target-inside'
};

/**
 * 액션 버튼 아이콘 컴포넌트 매핑
 */
export const ACTION_ICONS = {
    create: Plus,
    edit: Edit,
    delete: Trash
};

/**
 * 토글 버튼 아이콘 컴포넌트 매핑
 */
export const TOGGLE_ICONS = {
    expanded: ChevronDown,
    collapsed: ChevronRight
};

/**
 * 노드 상태 관련 CSS 클래스
 */
export const NODE_CLASSES = {
    SELECTED: 'selected',
    SINGLE_SELECTED: 'single-selected',
    DISABLED: 'disabled',
    EXPANDED: 'expanded',
    CREATING: 'creating'
};

/**
 * 임시 노드 ID 생성
 */
export const generateNodeId = (): string => `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`;