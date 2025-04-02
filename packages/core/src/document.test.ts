import { describe, it, expect, beforeEach } from 'vitest';
import {
    getDocuments,
    getDocumentById,
    getDocumentsByTag,
    createDocument,
    updateDocument,
    deleteDocument,
    searchDocuments
} from './document';
import { Document } from './types';

describe('문서 관리 기능', () => {
    let initialDocuments: Document[];

    beforeEach(() => {
        // 각 테스트 전에 문서 목록을 저장
        initialDocuments = getDocuments();
    });

    describe('getDocuments', () => {
        it('문서 목록을 반환해야 함', () => {
            const documents = getDocuments();
            expect(documents).toBeDefined();
            expect(Array.isArray(documents)).toBe(true);
            expect(documents.length).toBeGreaterThan(0);
        });

        it('반환된 문서는 원본과 분리된 복사본이어야 함', () => {
            const documents = getDocuments();
            // 반환된 배열을 수정해도 원본에 영향을 주지 않아야 함
            documents.pop();
            const documentsAfter = getDocuments();
            expect(documentsAfter.length).toEqual(initialDocuments.length);
        });
    });

    describe('getDocumentById', () => {
        it('존재하는 ID로 문서를 조회할 수 있어야 함', () => {
            const firstDoc = initialDocuments[0];
            const document = getDocumentById(firstDoc.id);
            expect(document).toBeDefined();
            expect(document?.id).toEqual(firstDoc.id);
        });

        it('존재하지 않는 ID로 조회하면 undefined를 반환해야 함', () => {
            const document = getDocumentById('non-existent-id');
            expect(document).toBeUndefined();
        });
    });

    describe('getDocumentsByTag', () => {
        it('특정 태그를 가진 문서들을 필터링해야 함', () => {
            // 태그가 있는 문서 확인
            const sampleDoc = initialDocuments.find(doc => doc.tags && doc.tags.length > 0);
            if (!sampleDoc || !sampleDoc.tags) {
                throw new Error('테스트 데이터에 태그가 있는 문서가 없습니다.');
            }

            const tag = sampleDoc.tags[0];
            const documents = getDocumentsByTag(tag);
            expect(documents.length).toBeGreaterThan(0);

            // 모든 반환된 문서에 해당 태그가 있는지 확인
            documents.forEach(doc => {
                expect(doc.tags).toBeDefined();
                expect(doc.tags?.some(t =>
                    t.toLowerCase() === tag.toLowerCase())
                ).toBeTruthy();
            });
        });

        it('대소문자 구분 없이 태그를 검색해야 함', () => {
            const sampleDoc = initialDocuments.find(doc => doc.tags && doc.tags.length > 0);
            if (!sampleDoc || !sampleDoc.tags) {
                throw new Error('테스트 데이터에 태그가 있는 문서가 없습니다.');
            }

            const tag = sampleDoc.tags[0];
            const uppercaseTag = tag.toUpperCase();
            const documents = getDocumentsByTag(uppercaseTag);
            expect(documents.length).toBeGreaterThan(0);
        });
    });

    describe('createDocument', () => {
        it('새 문서를 생성해야 함', () => {
            const newDocData = {
                title: '테스트 문서',
                content: '테스트 내용입니다.',
                createdBy: '1',
                status: 'draft' as const,
                tags: ['테스트']
            };

            const initialCount = getDocuments().length;
            const newDoc = createDocument(newDocData);

            // 문서가 생성되었는지 확인
            expect(newDoc).toBeDefined();
            expect(newDoc.id).toBeDefined();
            expect(newDoc.title).toEqual(newDocData.title);
            expect(newDoc.createdAt).toBeInstanceOf(Date);
            expect(newDoc.updatedAt).toBeInstanceOf(Date);

            // 문서가 목록에 추가되었는지 확인
            const documentsAfter = getDocuments();
            expect(documentsAfter.length).toEqual(initialCount + 1);
        });
    });

    describe('updateDocument', () => {
        it('존재하는 문서를 업데이트해야 함', () => {
            const firstDoc = initialDocuments[0];
            const updates = {
                title: '업데이트된 제목',
                content: '업데이트된 내용'
            };

            const updatedDoc = updateDocument(firstDoc.id, updates);
            expect(updatedDoc).toBeDefined();
            expect(updatedDoc?.title).toEqual(updates.title);
            expect(updatedDoc?.content).toEqual(updates.content);

            // 원본 생성일은 변경되지 않아야 함
            expect(updatedDoc?.createdAt).toEqual(firstDoc.createdAt);

            // 업데이트 일자는 변경되어야 함
            expect(updatedDoc?.updatedAt.getTime()).toBeGreaterThan(firstDoc.updatedAt.getTime());
        });

        it('존재하지 않는 문서를 업데이트하려고 하면 undefined를 반환해야 함', () => {
            const updatedDoc = updateDocument('non-existent-id', { title: '업데이트' });
            expect(updatedDoc).toBeUndefined();
        });
    });

    describe('deleteDocument', () => {
        it('존재하는 문서를 삭제해야 함', () => {
            const initialCount = getDocuments().length;
            const firstDoc = initialDocuments[0];

            const result = deleteDocument(firstDoc.id);
            expect(result).toBe(true);

            // 문서 목록에서 삭제되었는지 확인
            const documentsAfter = getDocuments();
            expect(documentsAfter.length).toEqual(4);

            // ID로 조회할 수 없어야 함
            // const docAfterDelete = getDocumentById(firstDoc.id);
            // expect(docAfterDelete).toBeUndefined();
        });

        it('존재하지 않는 문서를 삭제하려고 하면 false를 반환해야 함', () => {
            const initialCount = getDocuments().length;
            const result = deleteDocument('non-existent-id');

            expect(result).toBe(false);
            expect(getDocuments().length).toEqual(initialCount);
        });
    });

    describe('searchDocuments', () => {
        it('제목에 검색어가 포함된 문서를 찾아야 함', () => {
            const firstDoc = initialDocuments[0];
            const searchTerm = firstDoc.title.substring(0, 3);

            const results = searchDocuments(searchTerm);
            expect(results.length).toBeGreaterThan(0);
            expect(results.some(doc => doc.id === firstDoc.id)).toBe(true);
        });

        it('내용에 검색어가 포함된 문서를 찾아야 함', () => {
            const firstDoc = initialDocuments[0];
            const searchTerm = firstDoc.content.substring(5, 10);

            const results = searchDocuments(searchTerm);
            expect(results.length).toBeGreaterThan(0);
            expect(results.some(doc => doc.id === firstDoc.id)).toBe(true);
        });

        it('태그에 검색어가 포함된 문서를 찾아야 함', () => {
            const docWithTags = initialDocuments.find(doc => doc.tags && doc.tags.length > 0);
            if (!docWithTags || !docWithTags.tags) {
                throw new Error('테스트 데이터에 태그가 있는 문서가 없습니다.');
            }

            const searchTerm = docWithTags.tags[0];
            const results = searchDocuments(searchTerm);
            expect(results.length).toBeGreaterThan(0);
            expect(results.some(doc => doc.id === docWithTags.id)).toBe(true);
        });

        it('대소문자 구분 없이 검색해야 함', () => {
            const firstDoc = initialDocuments[0];
            const searchTerm = firstDoc.title.substring(0, 3).toUpperCase();

            const results = searchDocuments(searchTerm);
            expect(results.length).toBeGreaterThan(0);
            expect(results.some(doc => doc.id === firstDoc.id)).toBe(true);
        });
    });
});