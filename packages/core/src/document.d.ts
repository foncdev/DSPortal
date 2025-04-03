import { Document } from './types';
/**
 * 모든 문서를 가져옵니다.
 * @returns {Document[]} 문서 목록
 */
export declare function getDocuments(): Document[];
/**
 * 특정 ID의 문서를 가져옵니다.
 * @param {string} id 문서 ID
 * @returns {Document | undefined} 문서 객체 또는 undefined
 */
export declare function getDocumentById(id: string): Document | undefined;
/**
 * 태그로 문서를 필터링합니다.
 * @param {string} tag 검색할 태그
 * @returns {Document[]} 필터링된 문서 목록
 */
export declare function getDocumentsByTag(tag: string): Document[];
/**
 * 문서를 생성합니다.
 * @param {Omit<Document, 'id' | 'createdAt' | 'updatedAt'>} documentData 문서 데이터
 * @returns {Document} 생성된 문서
 */
export declare function createDocument(documentData: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Document;
/**
 * 문서를 업데이트합니다.
 * @param {string} id 업데이트할 문서 ID
 * @param {Partial<Document>} documentData 업데이트할 문서 데이터
 * @returns {Document | undefined} 업데이트된 문서 또는 undefined
 */
export declare function updateDocument(id: string, documentData: Partial<Omit<Document, 'id' | 'createdAt' | 'createdBy'>>): Document | undefined;
/**
 * 문서를 삭제합니다.
 * @param {string} id 삭제할 문서 ID
 * @returns {boolean} 삭제 성공 여부
 */
export declare function deleteDocument(id: string): boolean;
/**
 * 문서 검색 함수
 * @param {string} query 검색어
 * @returns {Document[]} 검색 결과 문서 목록
 */
export declare function searchDocuments(query: string): Document[];
