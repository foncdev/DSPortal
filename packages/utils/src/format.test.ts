import { describe, it, expect } from 'vitest';
import { formatDate, truncateText } from './format';

describe('format 유틸리티', () => {
    describe('formatDate', () => {
        it('날짜를 한국어 형식으로 포맷팅해야 함', () => {
            const date = new Date(2023, 0, 15); // 2023년 1월 15일
            const formattedDate = formatDate(date);
            expect(formattedDate).toEqual('2023년 1월 15일');
        });

        it('다른 날짜도 올바르게 포맷팅해야 함', () => {
            const date = new Date(2023, 11, 31); // 2023년 12월 31일
            const formattedDate = formatDate(date);
            expect(formattedDate).toEqual('2023년 12월 31일');
        });
    });

    describe('truncateText', () => {
        it('최대 길이보다 짧은 텍스트는 변경되지 않아야 함', () => {
            const text = '짧은 텍스트';
            const truncated = truncateText(text, 20);
            expect(truncated).toEqual(text);
        });

        it('최대 길이보다 긴 텍스트는 잘리고 ... 가 추가되어야 함', () => {
            const text = '이것은 매우 긴 텍스트입니다. 잘려야 합니다.';
            const maxLength = 10;
            const truncated = truncateText(text, maxLength);
            expect(truncated).toEqual('이것은 매우 긴 텍...');
            expect(truncated.length).toEqual(maxLength + 3); // maxLength + '...'의 길이
        });

        it('최대 길이가 정확히 텍스트 길이와 같으면 변경되지 않아야 함', () => {
            const text = '정확한 길이';
            const truncated = truncateText(text, text.length);
            expect(truncated).toEqual(text);
        });
    });
});