// packages/core/src/document.ts
import { Document } from './types';

// 목업 문서 데이터
const mockDocuments: Document[] = [
    {
        id: '1',
        title: '프로젝트 계획서',
        content: '이 문서는 프로젝트 계획에 관한 내용을 담고 있습니다.',
        createdBy: '1',
        createdAt: new Date(2023, 5, 15),
        updatedAt: new Date(2023, 5, 15),
        status: 'published',
        tags: ['계획', '프로젝트']
    },
    {
        id: '2',
        title: '디자인 가이드',
        content: '이 문서는 프로젝트의 디자인 가이드라인을 정의합니다.',
        createdBy: '1',
        createdAt: new Date(2023, 6, 2),
        updatedAt: new Date(2023, 6, 5),
        status: 'published',
        tags: ['디자인', '가이드라인']
    },
    {
        id: '3',
        title: 'API 명세서',
        content: '이 문서는 백엔드 API의 명세를 기술합니다.',
        createdBy: '1',
        createdAt: new Date(2023, 6, 10),
        updatedAt: new Date(2023, 6, 12),
        status: 'draft',
        tags: ['API', '백엔드']
    }
];

/**
 * 모든 문서를 가져옵니다.
 * @returns {Document[]} 문서 목록
 */
export function getDocuments(): Document[] {
    return [...mockDocuments];
}

/**
 * 특정 ID의 문서를 가져옵니다.
 * @param {string} id 문서 ID
 * @returns {Document | undefined} 문서 객체 또는 undefined
 */
export function getDocumentById(id: string): Document | undefined {
    return mockDocuments.find(doc => doc.id === id);
}

/**
 * 태그로 문서를 필터링합니다.
 * @param {string} tag 검색할 태그
 * @returns {Document[]} 필터링된 문서 목록
 */
export function getDocumentsByTag(tag: string): Document[] {
    return mockDocuments.filter(doc =>
        doc.tags?.some(docTag => docTag.toLowerCase() === tag.toLowerCase())
    );
}

/**
 * 문서를 생성합니다.
 * @param {Omit<Document, 'id' | 'createdAt' | 'updatedAt'>} documentData 문서 데이터
 * @returns {Document} 생성된 문서
 */
export function createDocument(
    documentData: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>
): Document {
    const now = new Date();
    const newDocument: Document = {
        id: Math.random().toString(36).substring(2, 15),
        ...documentData,
        createdAt: now,
        updatedAt: now
    };

    // 실제 구현에서는 저장소에 추가
    mockDocuments.push(newDocument);
    return newDocument;
}

/**
 * 문서를 업데이트합니다.
 * @param {string} id 업데이트할 문서 ID
 * @param {Partial<Document>} documentData 업데이트할 문서 데이터
 * @returns {Document | undefined} 업데이트된 문서 또는 undefined
 */
export function updateDocument(
    id: string,
    documentData: Partial<Omit<Document, 'id' | 'createdAt' | 'createdBy'>>
): Document | undefined {
    const documentIndex = mockDocuments.findIndex(doc => doc.id === id);

    if (documentIndex === -1) {
        return undefined;
    }

    const updatedDocument: Document = {
        ...mockDocuments[documentIndex],
        ...documentData,
        updatedAt: new Date()
    };

    // 실제 구현에서는 저장소 업데이트
    mockDocuments[documentIndex] = updatedDocument;
    return updatedDocument;
}

/**
 * 문서를 삭제합니다.
 * @param {string} id 삭제할 문서 ID
 * @returns {boolean} 삭제 성공 여부
 */
export function deleteDocument(id: string): boolean {
    const initialLength = mockDocuments.length;
    // 실제 구현에서는 저장소에서 삭제
    const mock = mockDocuments.filter(doc => doc.id !== id);
    return mock.length < initialLength;
}

/**
 * 문서 검색 함수
 * @param {string} query 검색어
 * @returns {Document[]} 검색 결과 문서 목록
 */
export function searchDocuments(query: string): Document[] {
    const lowercaseQuery = query.toLowerCase();
    return mockDocuments.filter(doc =>
        doc.title.toLowerCase().includes(lowercaseQuery) ||
        doc.content.toLowerCase().includes(lowercaseQuery) ||
        doc.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
}