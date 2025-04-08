/**
 * 노드 타입 열거형
 */
export enum NodeType {
    Default = 'default',
    Folder = 'folder',
    File = 'file',
    Device = 'device',
    Layout = 'layout',
    Custom = 'custom'
}

/**
 * 드롭 위치 타입
 */
export enum DropPosition {
    Above = 'above',
    Inside = 'inside',
    Below = 'below'
}

/**
 * 트리 노드 인터페이스
 */
export interface TreeNode {
    id: string;
    name: string;
    type: NodeType;
    children?: TreeNode[];
    parentId?: string;
    data?: Record<string, any>; // 추가 노드 데이터
    isExpanded?: boolean;
    isSelected?: boolean;     // Used for checkbox state
    isHighlighted?: boolean;  // Used for node highlighting
    isDisabled?: boolean;
    customIcon?: React.ReactNode;
}

/**
 * 트리 컴포넌트 속성
 */
export interface TreeProps {
    /** 트리 데이터 구조 */
    data: TreeNode[];

    /** 데이터 변경 콜백 */
    onChange?: (data: TreeNode[]) => void;

    /** 드래그 앤 드롭 기능 활성화 */
    draggable?: boolean;

    /** 체크박스로 다중 선택 가능 */
    multiSelect?: boolean;

    /** 노드 생성 허용 */
    allowCreate?: boolean;

    showCheckbox?: boolean;

    /** 노드 편집 허용 */
    allowEdit?: boolean;

    /** 노드 삭제 허용 */
    allowDelete?: boolean;

    /** 노드 선택 시 콜백 */
    onNodeSelect?: (node: TreeNode) => void;

    /** 노드 더블 클릭 시 콜백 */
    onNodeDoubleClick?: (node: TreeNode) => void;

    /** 노드 생성 전 콜백 (false 반환 시 생성 방지) */
    onBeforeCreate?: (parentNode: TreeNode | null, nodeType: NodeType) => boolean | Promise<boolean>;

    /** 노드 생성 후 콜백 */
    onNodeCreate?: (node: TreeNode, parentNode: TreeNode | null) => void;

    /** 노드 편집 전 콜백 (false 반환 시 편집 방지) */
    onBeforeEdit?: (node: TreeNode) => boolean | Promise<boolean>;

    /** 노드 편집 후 콜백 */
    onNodeEdit?: (node: TreeNode, previousName: string) => void;

    /** 노드 삭제 전 콜백 (false 반환 시 삭제 방지) */
    onBeforeDelete?: (node: TreeNode) => boolean | Promise<boolean>;

    /** 노드 삭제 후 콜백 */
    onNodeDelete?: (node: TreeNode) => void;

    /** 노드 이동 후 콜백 */
    onNodeMove?: (node: TreeNode, targetNode: TreeNode, position: DropPosition) => void;

    /** 커스텀 노드 렌더러 */
    renderNode?: (node: TreeNode, defaultRenderer: React.ReactNode) => React.ReactNode;

    /** 초기 확장된 노드 ID */
    expandedIds?: string[];

    /** 초기 선택된 노드 ID */
    selectedIds?: string[];

    /** 호버 시 노드 경로 표시 */
    showNodePath?: boolean;
}

/**
 * 트리 노드 컴포넌트 속성
 */
export interface TreeNodeProps {
    /** 노드 데이터 */
    node: TreeNode;

    /** 트리 노드를 렌더링하는 함수 */
    renderTreeNode: (node: TreeNode) => React.ReactNode;

    /** 노드 구조에서의 레벨 */
    level?: number;

    /** 확장 토글 핸들러 */
    onToggle: (id: string) => void;

    /** 선택 핸들러 */
    onSelect: (id: string, multiSelection?: boolean) => void;

    /** 더블 클릭 핸들러 */
    onDoubleClick: (node: TreeNode) => void;

    /** 체크박스 토글 핸들러 */
    onCheckboxToggle: (id: string) => void;

    /** 드래그 시작 핸들러 */
    onDragStart?: (e: React.DragEvent, node: TreeNode) => void;

    /** 드래그 오버 핸들러 */
    onDragOver?: (e: React.DragEvent, node: TreeNode) => void;

    /** 드래그 리브 핸들러 */
    onDragLeave?: (e: React.DragEvent) => void;

    /** 드롭 핸들러 */
    onDrop?: (e: React.DragEvent, node: TreeNode) => void;

    /** 드래그 종료 핸들러 */
    onDragEnd?: (e: React.DragEvent) => void;

    /** 노드 편집 핸들러 */
    onEdit: (id: string) => void;

    /** 노드 삭제 핸들러 */
    onDelete: (id: string) => void;

    /** 노드 생성 핸들러 */
    onCreate: (parentId: string, type: NodeType) => void;

    /** 다중 선택 모드 */
    multiSelect: boolean;

    /** 체크박스 모드 */
    showCheckbox?: boolean;

    /** 드래그 가능 여부 */
    draggable: boolean;

    /** 생성 가능 여부 */
    allowCreate: boolean;

    /** 편집 가능 여부 */
    allowEdit: boolean;

    /** 삭제 가능 여부 */
    allowDelete: boolean;

    /** 현재 드롭 대상 ID */
    dropTargetId: string | null;

    /** 현재 드롭 위치 */
    dropPosition: DropPosition | null;

    /** 경로 표시 여부 */
    showNodePath: boolean;

    /** 노드 경로 가져오기 함수 */
    getNodePath: (id: string) => string[];

    /** 현재 편집 중인 노드 */
    editingNode: { id: string; name: string } | null;

    /** 현재 생성 중인 노드 */
    creatingNode: { parentId: string | null; type: NodeType } | null;

    /** 편집 폼 제출 핸들러 */
    onEditSubmit: (id: string, name: string) => void;

    /** 생성 폼 제출 핸들러 */
    onCreateSubmit: (name: string) => void;
}

/**
 * 노드 아이콘 속성
 */
export interface NodeIconProps {
    node: TreeNode;
}

/**
 * 노드 액션 버튼 속성
 */
export interface NodeActionsProps {
    node: TreeNode;
    allowCreate: boolean;
    allowEdit: boolean;
    allowDelete: boolean;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onCreate: (parentId: string, type: NodeType) => void;
}

/**
 * 노드 폼 속성
 */
export interface NodeFormProps {
    initialValue: string;
    placeholder?: string;
    autoFocus?: boolean;
    onSubmit: (value: string) => void;
    onCancel: () => void;
}

/**
 * 다이얼로그 속성
 */
export interface DialogProps {
    /** 다이얼로그 제목 */
    title: string;
    /** 다이얼로그 내용 */
    children?: React.ReactNode;
    /** 다이얼로그 열림 여부 */
    isOpen: boolean;
    /** 닫기 콜백 */
    onClose: () => void;
    /** 다이얼로그 너비 */
    width?: string;
}

/**
 * 확인 다이얼로그 속성
 */
export interface ConfirmDialogProps {
    /** 다이얼로그 제목 */
    title: string;
    /** 다이얼로그 메시지 */
    message: string;
    /** 다이얼로그 열림 여부 */
    isOpen: boolean;
    /** 확인 콜백 */
    onConfirm: () => void;
    /** 취소 콜백 */
    onCancel: () => void;
    /** 확인 버튼 텍스트 */
    confirmText?: string;
    /** 취소 버튼 텍스트 */
    cancelText?: string;
}

/**
 * 트리 상태 훅 반환 타입
 */
export interface TreeState {
    treeData: TreeNode[];
    expandedNodesRef: React.MutableRefObject<Set<string>>;
    editingNode: { id: string; name: string } | null;
    creatingNode: { parentId: string | null; type: NodeType } | null;
    confirmDialog: {
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    };
    setTreeData: React.Dispatch<React.SetStateAction<TreeNode[]>>;
    setEditingNode: React.Dispatch<React.SetStateAction<{ id: string; name: string } | null>>;
    setCreatingNode: React.Dispatch<React.SetStateAction<{ parentId: string | null; type: NodeType } | null>>;
    setConfirmDialog: React.Dispatch<React.SetStateAction<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>>;
}

/**
 * 드래그 앤 드롭 훅 반환 타입
 */
export interface TreeDragDropState {
    draggedNode: TreeNode | null;
    dropTargetId: string | null;
    dropPosition: DropPosition | null;
    handleDragStart: (e: React.DragEvent, node: TreeNode) => void;
    handleDragOver: (e: React.DragEvent, node: TreeNode) => void;
    handleDragLeave: (e: React.DragEvent) => void;
    handleDrop: (e: React.DragEvent, node: TreeNode) => void;
    handleDragEnd: (e: React.DragEvent) => void;
    getDropIndicatorClass: (nodeId: string, position: DropPosition | null) => string;
}