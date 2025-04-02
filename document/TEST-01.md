// Demo/src/features/DocumentManager.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DocumentManager } from './DocumentManager';
import { getDocuments, createDocument, updateDocument, deleteDocument } from '@ds/core';

// 모킹 설정
vi.mock('@ds/core', () => ({
getDocuments: vi.fn(),
getDocumentById: vi.fn(),
createDocument: vi.fn(),
updateDocument: vi.fn(),
deleteDocument: vi.fn()
}));

describe('DocumentManager 통합 테스트', () => {
// 테스트용 문서 데이터
const mockDocuments = [
{
id: 'doc1',
title: '통합 테스트 문서',
content: '통합 테스트를 위한 문서 내용입니다.',
createdBy: 'user1',
createdAt: new Date(2023, 0, 1),
updatedAt: new Date(2023, 0, 1),
status: 'published',
tags: ['테스트', '통합']
},
{
id: 'doc2',
title: '개발 가이드',
content: '개발 프로세스 가이드라인 문서입니다.',
createdBy: 'user1',
createdAt: new Date(2023, 0, 2),
updatedAt: new Date(2023, 0, 2),
status: 'published',
tags: ['가이드', '개발']
}
];

beforeEach(() => {
// 각 테스트 전에 모킹 초기화
vi.clearAllMocks();

    // getDocuments 모킹 설정
    getDocuments.mockReturnValue(mockDocuments);
    
    // createDocument 모킹 설정
    createDocument.mockImplementation((docData) => ({
      id: 'new-doc-id',
      ...docData,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    // updateDocument 모킹 설정
    updateDocument.mockImplementation((id, docData) => ({
      id,
      ...mockDocuments.find(doc => doc.id === id),
      ...docData,
      updatedAt: new Date()
    }));
    
    // deleteDocument 모킹 설정
    deleteDocument.mockReturnValue(true);
});

it('문서 목록을 렌더링해야 함', () => {
render(<DocumentManager />);

    // 문서 목록이 표시되는지 확인
    expect(screen.getByText('통합 테스트 문서')).toBeInTheDocument();
    expect(screen.getByText('개발 가이드')).toBeInTheDocument();
    
    // getDocuments 함수가 호출되었는지 확인
    expect(getDocuments).toHaveBeenCalledTimes(1);
});

it('새 문서 생성 폼을 표시하고 문서를 생성해야 함', async () => {
render(<DocumentManager />);

    // 새 문서 버튼 클릭
    fireEvent.click(screen.getByText('새 문서'));
    
    // 폼이 표시되는지 확인
    expect(screen.getByLabelText('제목')).toBeInTheDocument();
    expect(screen.getByLabelText('내용')).toBeInTheDocument();
    
    // 폼 입력
    fireEvent.change(screen.getByLabelText('제목'), { 
      target: { value: '새로운 테스트 문서' } 
    });
    fireEvent.change(screen.getByLabelText('내용'), { 
      target: { value: '이것은 테스트를 위한 새 문서 내용입니다.' } 
    });
    fireEvent.change(screen.getByLabelText('태그'), { 
      target: { value: '테스트,신규' } 
    });
    
    // 저장 버튼 클릭
    fireEvent.click(screen.getByText('저장'));
    
    // createDocument 함수가 호출되었는지 확인
    await waitFor(() => {
      expect(createDocument).toHaveBeenCalledTimes(1);
      expect(createDocument).toHaveBeenCalledWith({
        title: '새로운 테스트 문서',
        content: '이것은 테스트를 위한 새 문서 내용입니다.',
        createdBy: expect.any(String),
        status: 'draft',
        tags: ['테스트', '신규']
      });
    });
    
    // 성공 메시지가 표시되는지 확인
    expect(screen.getByText('문서가 생성되었습니다.')).toBeInTheDocument();
});

it('문서를 선택하고 내용을 확인해야 함', () => {
render(<DocumentManager />);

    // 문서 선택
    fireEvent.click(screen.getByText('통합 테스트 문서'));
    
    // 선택된 문서의 내용이 표시되는지 확인
    expect(screen.getByText('통합 테스트를 위한 문서 내용입니다.')).toBeInTheDocument();
    
    // 태그가 표시되는지 확인
    expect(screen.getByText('#테스트')).toBeInTheDocument();
    expect(screen.getByText('#통합')).toBeInTheDocument();
});

it('문서를 편집하고 업데이트해야 함', async () => {
render(<DocumentManager />);

    // 문서 선택
    fireEvent.click(screen.getByText('통합 테스트 문서'));
    
    // 편집 버튼 클릭
    fireEvent.click(screen.getByText('편집'));
    
    // 폼이 표시되고 기존 값이 채워져 있는지 확인
    const titleInput = screen.getByLabelText('제목');
    const contentInput = screen.getByLabelText('내용');
    
    expect(titleInput).toHaveValue('통합 테스트 문서');
    expect(contentInput).toHaveValue('통합 테스트를 위한 문서 내용입니다.');
    
    // 내용 수정
    fireEvent.change(titleInput, { 
      target: { value: '수정된 테스트 문서' } 
    });
    fireEvent.change(contentInput, { 
      target: { value: '이 내용은 수정되었습니다.' } 
    });
    
    // 저장 버튼 클릭
    fireEvent.click(screen.getByText('저장'));
    
    // updateDocument 함수가 호출되었는지 확인
    await waitFor(() => {
      expect(updateDocument).toHaveBeenCalledTimes(1);
      expect(updateDocument).toHaveBeenCalledWith('doc1', {
        title: '수정된 테스트 문서',
        content: '이 내용은 수정되었습니다.',
        tags: ['테스트', '통합']
      });
    });
    
    // 성공 메시지가 표시되는지 확인
    expect(screen.getByText('문서가 업데이트되었습니다.')).toBeInTheDocument();
});

it('문서를 삭제해야 함', async () => {
render(<DocumentManager />);

    // 문서 선택
    fireEvent.click(screen.getByText('통합 테스트 문서'));
    
    // 삭제 버튼 클릭
    fireEvent.click(screen.getByText('삭제'));
    
    // 확인 대화상자가 표시되는지 확인
    expect(screen.getByText('이 문서를 삭제하시겠습니까?')).toBeInTheDocument();
    
    // 확인 버튼 클릭
    fireEvent.click(screen.getByText('확인'));
    
    // deleteDocument 함수가 호출되었는지 확인
    await waitFor(() => {
      expect(deleteDocument).toHaveBeenCalledTimes(1);
      expect(deleteDocument).toHaveBeenCalledWith('doc1');
    });
    
    // 성공 메시지가 표시되는지 확인
    expect(screen.getByText('문서가 삭제되었습니다.')).toBeInTheDocument();
    
    // 문서 목록이 업데이트되었는지 확인
    expect(getDocuments).toHaveBeenCalledTimes(2); // 초기 렌더링 + 삭제 후 새로고침
});

it('문서 검색이 작동해야 함', () => {
// getDocuments 모킹 - 검색 결과 반환
getDocuments.mockImplementation((searchTerm) => {
if (!searchTerm) return mockDocuments;
return mockDocuments.filter(doc =>
doc.title.includes(searchTerm) ||
doc.content.includes(searchTerm)
);
});

    render(<DocumentManager />);
    
    // 검색창에 입력
    const searchInput = screen.getByPlaceholderText('문서 검색...');
    fireEvent.change(searchInput, { target: { value: '가이드' } });
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });
    
    // 검색 결과가 표시되는지 확인
    expect(screen.getByText('개발 가이드')).toBeInTheDocument();
    expect(screen.queryByText('통합 테스트 문서')).not.toBeInTheDocument();
    
    // 검색어 지우기
    fireEvent.change(searchInput, { target: { value: '' } });
    fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });
    
    // 모든 문서가 다시 표시되는지 확인
    expect(screen.getByText('통합 테스트 문서')).toBeInTheDocument();
    expect(screen.getByText('개발 가이드')).toBeInTheDocument();
});
});