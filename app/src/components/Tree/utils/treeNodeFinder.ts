import { TreeNode } from '../types';

/**
 * ID로 노드 찾기
 * @param id 찾을 노드 ID
 * @param nodes 검색할 노드 배열
 * @returns 찾은 노드 또는 null
 */
export const findNodeById = (id: string, nodes: TreeNode[] = []): TreeNode | null => {
    for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
            const found = findNodeById(id, node.children);
            if (found) return found;
        }
    }
    return null;
};

/**
 * 노드 경로 가져오기
 * @param nodeId 노드 ID
 * @param nodes 검색할 노드 배열
 * @param path 현재까지의 경로
 * @returns 경로 문자열 배열
 */
export const getNodePath = (nodeId: string, nodes: TreeNode[] = [], path: string[] = []): string[] => {
    for (const node of nodes) {
        const currentPath = [...path, node.name];
        if (node.id === nodeId) return currentPath;
        if (node.children) {
            const found = getNodePath(nodeId, node.children, currentPath);
            if (found.length) return found;
        }
    }
    return [];
};

/**
 * 노드의 부모 찾기
 * @param nodeId 자식 노드 ID
 * @param nodes 검색할 노드 배열
 * @returns 부모 노드 또는 null
 */
export const findParentNode = (nodeId: string, nodes: TreeNode[]): TreeNode | null => {
    for (const node of nodes) {
        if (node.children?.some(child => child.id === nodeId)) {
            return node;
        }
        if (node.children) {
            const found = findParentNode(nodeId, node.children);
            if (found) return found;
        }
    }
    return null;
};

/**
 * 노드가 다른 노드의 자손인지 확인
 * @param nodeId 검사할 노드 ID
 * @param potentialAncestorId 잠재적 조상 노드 ID
 * @param nodes 검색할 노드 배열
 * @returns 자손 여부
 */
export const isDescendantOf = (nodeId: string, potentialAncestorId: string, nodes: TreeNode[]): boolean => {
    const ancestorPath = getNodePath(potentialAncestorId, nodes);
    const nodePath = getNodePath(nodeId, nodes);

    // 자기 자신 체크
    if (nodeId === potentialAncestorId) return false;

    // 조상 노드의 경로가 현재 노드 경로의 부분집합인지 확인
    return ancestorPath.every((name, index) => nodePath[index] === name);
};