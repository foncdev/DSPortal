import { TreeNode, DropPosition, NodeType } from '../types';
import { generateNodeId } from '../constants';
import { findNodeById, findParentNode } from './treeNodeFinder';

/**
 * 노드 확장/축소 상태 업데이트
 * @param nodes 트리 노드 배열
 * @param id 업데이트할 노드 ID
 * @param isExpanded 확장 여부
 * @returns 업데이트된 트리 데이터
 */
export const updateNodeExpanded = (nodes: TreeNode[], id: string, isExpanded: boolean): TreeNode[] => nodes.map(node => {
        if (node.id === id) {
            return { ...node, isExpanded };
        }
        if (node.children) {
            return { ...node, children: updateNodeExpanded(node.children, id, isExpanded) };
        }
        return node;
    });

/**
 * 노드 선택 상태 업데이트
 * @param nodes 트리 노드 배열
 * @param id 선택할 노드 ID
 * @param multiSelection 다중 선택 모드인지 여부
 * @returns 업데이트된 트리 데이터
 */
export const updateNodeSelected = (nodes: TreeNode[], id: string, multiSelection: boolean): TreeNode[] => nodes.map(node => {
        // 다중 선택 모드가 아니거나 현재 노드인 경우만 선택 상태 업데이트
        const isSelected = node.id === id
            ? true
            : multiSelection ? node.isSelected : false;

        return {
            ...node,
            isSelected,
            // 확장 상태는 유지
            isExpanded: node.isExpanded,
            children: node.children ? updateNodeSelected(node.children, id, multiSelection) : undefined
        };
    });

/**
 * 체크박스 토글 (다중 선택)
 * @param nodes 트리 노드 배열
 * @param id 토글할 노드 ID
 * @returns 업데이트된 트리 데이터
 */
export const toggleNodeCheckbox = (nodes: TreeNode[], id: string): TreeNode[] => {
    // 먼저 해당 ID를 가진 노드를 찾아 현재 선택 상태 확인
    const nodeToToggle = findNodeById(id, nodes);
    if (!nodeToToggle) {return nodes;}

    // 새로운 선택 상태 값 (반대로 토글)
    const newIsSelected = !nodeToToggle.isSelected;

    // 트리 노드 업데이트
    return nodes.map(node => {
        if (node.id === id) {
            // 선택 상태 토글
            return {
                ...node,
                isSelected: newIsSelected,
                children: node.children ? toggleNodeCheckbox(node.children, id) : undefined
            };
        }
        if (node.children) {
            return {
                ...node,
                children: toggleNodeCheckbox(node.children, id)
            };
        }
        return node;
    });
};


/**
 * 새 노드 생성
 * @param nodes 트리 노드 배열
 * @param parentId 부모 노드 ID (null이면 루트 노드)
 * @param name 노드 이름
 * @param type 노드 타입
 * @returns 생성된 노드와 업데이트된 트리 데이터
 */
export const createNewNode = (
    nodes: TreeNode[],
    parentId: string | null,
    name: string,
    type: NodeType
): { node: TreeNode, updatedTree: TreeNode[] } => {
    // 새 노드 생성
    const newNode: TreeNode = {
        id: generateNodeId(),
        name,
        type,
        parentId: parentId || undefined,
        isExpanded: false,
        isSelected: false,
        children: type === NodeType.Folder ? [] : undefined
    };

    let updatedTree: TreeNode[];

    // 루트 노드인 경우
    if (parentId === null) {
        updatedTree = [...nodes, newNode];
    } else {
        // 부모 노드 하위에 추가
        updatedTree = nodes.map(node => {
            if (node.id === parentId) {
                const children = node.children || [];
                return {
                    ...node,
                    isExpanded: true, // 부모 노드 확장
                    children: [...children, newNode]
                };
            }
            if (node.children) {
                return { ...node, children: createNewNode(node.children, parentId, name, type).updatedTree };
            }
            return node;
        });
    }

    return { node: newNode, updatedTree };
};

/**
 * 노드 이름 업데이트
 * @param nodes 트리 노드 배열
 * @param id 업데이트할 노드 ID
 * @param name 새 노드 이름
 * @returns 업데이트된 트리 데이터
 */
export const updateNodeName = (nodes: TreeNode[], id: string, name: string): TreeNode[] => nodes.map(node => {
        if (node.id === id) {
            return { ...node, name };
        }
        if (node.children) {
            return { ...node, children: updateNodeName(node.children, id, name) };
        }
        return node;
    });

/**
 * 노드 삭제
 * @param nodes 트리 노드 배열
 * @param id 삭제할 노드 ID
 * @returns 업데이트된 트리 데이터
 */
export const deleteNode = (nodes: TreeNode[], id: string): TreeNode[] => nodes
        .filter(node => node.id !== id)
        .map(node => {
            if (node.children) {
                return { ...node, children: deleteNode(node.children, id) };
            }
            return node;
        });

/**
 * 노드 이동 (드래그 앤 드롭)
 * @param nodes 트리 노드 배열
 * @param sourceId 이동할 노드 ID
 * @param targetId 목표 노드 ID
 * @param position 드롭 위치
 * @returns 업데이트된 트리 데이터와 이동된 노드
 */
export const moveNode = (
    nodes: TreeNode[],
    sourceId: string,
    targetId: string,
    position: DropPosition
): { updatedTree: TreeNode[], movedNode: TreeNode | null } => {
    // 원본 트리 데이터의 깊은 복사본 생성
    const treeDataCopy: TreeNode[] = JSON.parse(JSON.stringify(nodes));

    // 이동할 노드 찾기
    const sourceNode = findNodeById(sourceId, treeDataCopy);
    if (!sourceNode) {
        return { updatedTree: treeDataCopy, movedNode: null };
    }

    // 타겟 노드 찾기
    const targetNode = findNodeById(targetId, treeDataCopy);
    if (!targetNode) {
        return { updatedTree: treeDataCopy, movedNode: null };
    }

    // 노드 삭제 및 추출
    const removeNodeAndGet = (nodes: TreeNode[]): { updatedNodes: TreeNode[], removedNode: TreeNode | null } => {
        let removedNode: TreeNode | null = null;

        const updatedNodes = nodes.filter(node => {
            if (node.id === sourceId) {
                removedNode = { ...node };
                return false;
            }
            return true;
        }).map(node => {
            if (node.children) {
                const result = removeNodeAndGet(node.children);
                if (result.removedNode) {
                    removedNode = result.removedNode;
                }
                return { ...node, children: result.updatedNodes };
            }
            return node;
        });

        return { updatedNodes, removedNode };
    };

    // 노드 삭제 및 추출
    const { updatedNodes, removedNode } = removeNodeAndGet(treeDataCopy);
    if (!removedNode) {
        return { updatedTree: treeDataCopy, movedNode: null };
    }

    // removedNode의 parentId 초기화
    removedNode.parentId = undefined;

    // 타겟 노드의 부모 찾기
    const targetParent = findParentNode(targetId, updatedNodes);

    // 노드를 새 위치에 삽입
    let finalTree = updatedNodes;

    if (position === DropPosition.Inside && (targetNode.type === NodeType.Folder || targetNode.type === NodeType.Default)) {
        // 타겟 노드 내부에 삽입
        finalTree = insertNodeInside(updatedNodes, targetId, removedNode);
    } else if (position === DropPosition.Above) {
        if (targetParent) {
            // 부모 내의 타겟 앞에 삽입
            finalTree = insertNodeRelativeToSibling(updatedNodes, targetParent.id, targetId, removedNode, 'before');
        } else {
            // 루트 레벨에서 타겟 앞에 삽입
            finalTree = insertNodeAtRootLevel(updatedNodes, targetId, removedNode, 'before');
        }
    } else if (position === DropPosition.Below) {
        if (targetParent) {
            // 부모 내의 타겟 뒤에 삽입
            finalTree = insertNodeRelativeToSibling(updatedNodes, targetParent.id, targetId, removedNode, 'after');
        } else {
            // 루트 레벨에서 타겟 뒤에 삽입
            finalTree = insertNodeAtRootLevel(updatedNodes, targetId, removedNode, 'after');
        }
    }

    return { updatedTree: finalTree, movedNode: removedNode };
};

/**
 * 노드를 타겟 노드 내부에 삽입
 */
const insertNodeInside = (nodes: TreeNode[], targetId: string, nodeToInsert: TreeNode): TreeNode[] => nodes.map(node => {
        if (node.id === targetId) {
            const children = node.children || [];
            nodeToInsert.parentId = node.id;

            return {
                ...node,
                isExpanded: true, // 타겟 노드 확장
                children: [...children, nodeToInsert]
            };
        }

        if (node.children) {
            return {
                ...node,
                children: insertNodeInside(node.children, targetId, nodeToInsert)
            };
        }

        return node;
    });

/**
 * 형제 노드 기준 삽입 위치 타입
 */
type InsertPosition = 'before' | 'after';

/**
 * 노드를 특정 부모 내의 형제 노드 기준으로 삽입
 */
const insertNodeRelativeToSibling = (
    nodes: TreeNode[],
    parentId: string,
    siblingId: string,
    nodeToInsert: TreeNode,
    position: InsertPosition
): TreeNode[] => nodes.map(node => {
        if (node.id === parentId && node.children) {
            const siblingIndex = node.children.findIndex(child => child.id === siblingId);

            if (siblingIndex !== -1) {
                const newChildren = [...node.children];
                const insertIndex = position === 'before' ? siblingIndex : siblingIndex + 1;

                nodeToInsert.parentId = node.id;
                newChildren.splice(insertIndex, 0, nodeToInsert);

                return {
                    ...node,
                    children: newChildren
                };
            }
        }

        if (node.children) {
            return {
                ...node,
                children: insertNodeRelativeToSibling(node.children, parentId, siblingId, nodeToInsert, position)
            };
        }

        return node;
    });

/**
 * 노드를 루트 레벨에서 특정 노드 기준으로 삽입
 */
const insertNodeAtRootLevel = (
    nodes: TreeNode[],
    siblingId: string,
    nodeToInsert: TreeNode,
    position: InsertPosition
): TreeNode[] => {
    const siblingIndex = nodes.findIndex(node => node.id === siblingId);

    if (siblingIndex === -1) {
        return nodes;
    }

    const newNodes = [...nodes];
    const insertIndex = position === 'before' ? siblingIndex : siblingIndex + 1;

    // 루트 레벨이므로 parentId는 undefined
    nodeToInsert.parentId = undefined;
    newNodes.splice(insertIndex, 0, nodeToInsert);

    return newNodes;
};