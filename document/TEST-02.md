// Demo/src/hooks/useDocuments.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import { useDocuments } from './useDocuments';
import { getDocuments, createDocument, updateDocument, deleteDocument, searchDocuments } from '@ds/core';
import type { Document } from '@ds/core';

// 모킹 설정
vi.mock('@ds/core', () => ({
getDocuments: vi.fn(),
createDocument: vi.fn(),
updateDocument: vi.fn(),
deleteDocument: vi.fn(),
searchDocuments: vi.fn()
}));

describe('useDocuments 훅', () => {
// 테스트용 문서 데이터
const mockDocuments: Document[] = [
{
id: 'doc1',
title: '테스트 문서 1',
content: '테스트 내용 1',
createdBy: 'user1',
createdAt: new Date(2023, 0, 1),
updatedAt: new Date(2023, 0, 1),
status: 'published',
tags: ['태그1']
},
{
id: 'doc2',
title: '테스트 문서 2',
content: '테스트 내용 2',
createdBy: 'user1',
createdAt: new Date(2023, 0, 2),
updatedAt: new Date(2023, 0, 2),
status: 'draft',
tags: ['태그2']
}
];

beforeEach(() => {
vi.clearAllMocks();

    // getDocuments 모킹
    getDocuments.mockReturnValue(mockDocuments);
    
    // searchDocuments 모킹
    searchDocuments.mockImplementation((query) => 
      mockDocuments.filter(doc => 
        doc.title.includes(query) || 
        doc.content.includes(query) ||
        doc.tags?.some(tag => tag.includes(query))
      )
    );
    
    // createDocument 모킹
    createDocument.mockImplementation((docData) => ({
      id: 'new-doc-id',
      ...docData,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    // updateDocument 모킹
    updateDocument.mockImplementation((id, docData) => ({
      id,
      ...mockDocuments.find(doc => doc.id === id),
      ...docData,
      updatedAt: new Date()
    }));
    
    // deleteDocument 모킹
    deleteDocument.mockReturnValue(true);
});

it('초기 문서 목록을 로드해야 함', async () => {
const { result, waitForNextUpdate } = renderHook(() => useDocuments());

    // 초기 상태 확인
    expect(result.current.loading).toBe(true);
    expect(result.current.documents).toEqual([]);
    
    // 비동기 작업 완료 대기
    await waitForNextUpdate();
    
    // 데이터 로딩 후 상태 확인
    expect(result.current.loading).toBe(false);
    expect(result.current.documents).toEqual(mockDocuments);
    expect(result.current.error).toBeNull();
    
    // getDocuments 함수가 호출되었는지 확인
    expect(getDocuments).toHaveBeenCalledTimes(1);
});

it('문서 검색을 수행해야 함', async () => {
const { result, waitForNextUpdate } = renderHook(() => useDocuments());

    // 초기 로딩 완료 대기
    await waitForNextUpdate();
    
    // 검색 수행
    act(() => {
      result.current.searchDocuments('테스트 문서 1');
    });
    
    // 검색 중 상태 확인
    expect(result.current.loading).toBe(true);
    
    // 비동기 작업 완료 대기
    await waitForNextUpdate();
    
    // 검색 결과 확인
    expect(result.current.loading).toBe(false);
    expect(result.current.documents.length).toBe(1);
    expect(result.current.documents[0].title).toBe('테스트 문서 1');
    
    // searchDocuments 함수가 호출되었는지 확인
    expect(searchDocuments).toHaveBeenCalledTimes(1);
    expect(searchDocuments).toHaveBeenCalledWith('테스트 문서 1');
});

it('새 문서를 생성해야 함', async () => {
const { result, waitForNextUpdate } = renderHook(() => useDocuments());

    // 초기 로딩 완료 대기
    await waitForNextUpdate();
    
    const newDocData = {
      title: '새 문서',
      content: '새 문서 내용',
      createdBy: 'user1',
      status: 'draft' as const,
      tags: ['새태그']
    };
    
    // 문서 생성
    act(() => {
      result.current.createDocument(newDocData);
    });
    
    // 생성 중 상태 확인
    expect(result.current.loading).toBe(true);
    
    // 비동기 작업 완료 대기
    await waitForNextUpdate();
    
    // 생성 후 상태 확인
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    
    // createDocument 함수가 호출되었는지 확인
    expect(createDocument).toHaveBeenCalledTimes(1);
    expect(createDocument).toHaveBeenCalledWith(newDocData);
    
    // getDocuments가 다시 호출되어 목록을 갱신했는지 확인
    expect(getDocuments).toHaveBeenCalledTimes(2);
});

it('문서를 업데이트해야 함', async () => {
const { result, waitForNextUpdate } = renderHook(() => useDocuments());

    // 초기 로딩 완료 대기
    await waitForNextUpdate();
    
    const docId = 'doc1';
    const updates = {
      title: '업데이트된 문서',
      content: '업데이트된 내용'
    };
    
    // 문서 업데이트
    act(() => {
      result.current.updateDocument(docId, updates);
    });
    
    // 업데이트 중 상태 확인
    expect(result.current.loading).toBe(true);
    
    // 비동기 작업 완료 대기
    await waitForNextUpdate();
    
    // 업데이트 후 상태 확인
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    
    // updateDocument 함수가 호출되었는지 확인
    expect(updateDocument).toHaveBeenCalledTimes(1);
    expect(updateDocument).toHaveBeenCalledWith(docId, updates);
    
    // getDocuments가 다시 호출되어 목록을 갱신했는지 확인
    expect(getDocuments).toHaveBeenCalledTimes(2);
});

it('문서를 삭제해야 함', async () => {
const { result, waitForNextUpdate } = renderHook(() => useDocuments());

    // 초기 로딩 완료 대기
    await waitForNextUpdate();
    
    const docId = 'doc1';
    
    // 문서 삭제
    act(() => {
      result.current.deleteDocument(docId);
    });
    
    // 삭제 중 상태 확인
    expect(result.current.loading).toBe(true);
    
    // 비동기 작업 완료 대기
    await waitForNextUpdate();
    
    // 삭제 후 상태 확인
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    
    // deleteDocument 함수가 호출되었는지 확인
    expect(deleteDocument).toHaveBeenCalledTimes(1);
    expect(deleteDocument).toHaveBeenCalledWith(docId);
    
    // getDocuments가 다시 호출되어 목록을 갱신했는지 확인
    expect(getDocuments).toHaveBeenCalledTimes(2);
});

it('에러 처리가 작동해야 함', async () => {
// getDocuments가 에러를 던지도록 설정
getDocuments.mockRejectedValueOnce(new Error('API 오류 발생'));

    const { result, waitForNextUpdate } = renderHook(() => useDocuments());
    
    // 초기 상태 확인
    expect(result.current.loading).toBe(true);
    
    // 비동기 작업 완료 대기
    await waitForNextUpdate();
    
    // 에러 발생 후 상태 확인
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toBe('API 오류 발생');
    expect(result.current.documents).toEqual([]);
});
});