import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { getDocuments } from '@ds/core';

// @ds/core의 getDocuments 함수 모킹
vi.mocked(getDocuments).mockReturnValue([
    {
        id: 'test1',
        title: '테스트 문서 1',
        content: '테스트 문서 1의 내용입니다.',
        createdBy: '1',
        createdAt: new Date(2023, 0, 1),
        updatedAt: new Date(2023, 0, 1),
        status: 'published',
        tags: ['테스트']
    },
    {
        id: 'test2',
        title: '테스트 문서 2',
        content: '테스트 문서 2의 내용입니다. 이 내용은 더 깁니다.',
        createdBy: '1',
        createdAt: new Date(2023, 0, 2),
        updatedAt: new Date(2023, 0, 2),
        status: 'draft',
        tags: ['테스트', '임시']
    }
]);

describe('App 컴포넌트', () => {
    beforeEach(() => {
        // 테스트 전에 모든 모의 함수 호출 정보 초기화
        vi.clearAllMocks();
    });

    it('문서 관리 시스템 헤더가 표시되어야 함', () => {
        render(<App />);
        expect(screen.getByText('문서 관리 시스템')).toBeInTheDocument();
    });

    it('문서 목록이 표시되어야 함', () => {
        render(<App />);

        // 문서 목록 헤더 확인
        expect(screen.getByText('문서 목록')).toBeInTheDocument();

        // getDocuments 함수가 호출되었는지 확인
        expect(getDocuments).toHaveBeenCalledTimes(1);

        // 문서 제목 확인
        expect(screen.getByText('테스트 문서 1')).toBeInTheDocument();
        expect(screen.getByText('테스트 문서 2')).toBeInTheDocument();
    });

    it('문서를 선택하면 해당 문서의 내용이 표시되어야 함', () => {
        render(<App />);

        // 초기에는 문서가 선택되지 않은 상태여야 함
        expect(screen.getByText('왼쪽 목록에서 문서를 선택하세요.')).toBeInTheDocument();

        // 첫 번째 문서 선택
        fireEvent.click(screen.getByText('테스트 문서 1'));

        // 문서 제목과 내용이 표시되는지 확인
        expect(screen.getByText('테스트 문서 1의 내용입니다.')).toBeInTheDocument();

        // 두 번째 문서 선택
        fireEvent.click(screen.getByText('테스트 문서 2'));

        // 두 번째 문서의 내용이 표시되는지 확인
        expect(screen.getByText('테스트 문서 2의 내용입니다. 이 내용은 더 깁니다.')).toBeInTheDocument();
    });
});