// packages/utils/src/validation.test.ts
import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword, validateUsername } from './validation';

describe('유효성 검사 유틸리티', () => {
describe('validateEmail', () => {
it('유효한 이메일 주소를 검증해야 함', () => {
expect(validateEmail('test@example.com')).toBe(true);
expect(validateEmail('user.name@domain.co.kr')).toBe(true);
expect(validateEmail('user+tag@gmail.com')).toBe(true);
});

    it('유효하지 않은 이메일 주소를 거부해야 함', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('test')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@.com')).toBe(false);
      expect(validateEmail('test@example.')).toBe(false);
    });
});

describe('validatePassword', () => {
it('유효한 비밀번호를 검증해야 함', () => {
// 최소 8자, 대소문자, 숫자, 특수문자 포함
expect(validatePassword('Password123!')).toBe(true);
expect(validatePassword('Abcd1234$')).toBe(true);
expect(validatePassword('V3ryStr0ng#P@ss')).toBe(true);
});

    it('유효하지 않은 비밀번호를 거부해야 함', () => {
      // 길이 부족
      expect(validatePassword('Abc12!')).toBe(false);
      
      // 대문자 없음
      expect(validatePassword('password123!')).toBe(false);
      
      // 소문자 없음
      expect(validatePassword('PASSWORD123!')).toBe(false);
      
      // 숫자 없음
      expect(validatePassword('Password!')).toBe(false);
      
      // 특수문자 없음
      expect(validatePassword('Password123')).toBe(false);
    });
});

describe('validateUsername', () => {
it('유효한 사용자 이름을 검증해야 함', () => {
// 3-20자, 영문자, 숫자, 밑줄, 하이픈 허용
expect(validateUsername('user123')).toBe(true);
expect(validateUsername('user_name')).toBe(true);
expect(validateUsername('user-name')).toBe(true);
expect(validateUsername('u_1')).toBe(true);
});

    it('유효하지 않은 사용자 이름을 거부해야 함', () => {
      // 너무 짧음
      expect(validateUsername('ab')).toBe(false);
      
      // 너무 김
      expect(validateUsername('a'.repeat(21))).toBe(false);
      
      // 특수문자 포함 (밑줄, 하이픈 제외)
      expect(validateUsername('user@name')).toBe(false);
      expect(validateUsername('user.name')).toBe(false);
      
      // 공백 포함
      expect(validateUsername('user name')).toBe(false);
    });
});
});

// packages/utils/src/date.test.ts
import { describe, it, expect, vi } from 'vitest';
import { formatRelativeTime, getDaysDifference, isDateInRange } from './date';

describe('날짜 유틸리티', () => {
describe('formatRelativeTime', () => {
// 테스트를 위한 현재 시간 고정
const now = new Date('2023-05-15T12:00:00Z');

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(now);
    });
    
    afterEach(() => {
      vi.useRealTimers();
    });

    it('방금 전 시간을 포맷해야 함', () => {
      const date = new Date('2023-05-15T11:59:30Z'); // 30초 전
      expect(formatRelativeTime(date)).toBe('방금 전');
    });

    it('분 단위 시간을 포맷해야 함', () => {
      const fiveMinutesAgo = new Date('2023-05-15T11:55:00Z');
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5분 전');
    });

    it('시간 단위 시간을 포맷해야 함', () => {
      const threeHoursAgo = new Date('2023-05-15T09:00:00Z');
      expect(formatRelativeTime(threeHoursAgo)).toBe('3시간 전');
    });

    it('일 단위 시간을 포맷해야 함', () => {
      const twoDaysAgo = new Date('2023-05-13T12:00:00Z');
      expect(formatRelativeTime(twoDaysAgo)).toBe('2일 전');
    });

    it('주 단위 시간을 포맷해야 함', () => {
      const twoWeeksAgo = new Date('2023-05-01T12:00:00Z');
      expect(formatRelativeTime(twoWeeksAgo)).toBe('2주 전');
    });

    it('월 단위 시간을 포맷해야 함', () => {
      const threeMonthsAgo = new Date('2023-02-15T12:00:00Z');
      expect(formatRelativeTime(threeMonthsAgo)).toBe('3개월 전');
    });

    it('년 단위 시간을 포맷해야 함', () => {
      const twoYearsAgo = new Date('2021-05-15T12:00:00Z');
      expect(formatRelativeTime(twoYearsAgo)).toBe('2년 전');
    });
});

describe('getDaysDifference', () => {
it('두 날짜 간의 일수 차이를 계산해야 함', () => {
const date1 = new Date('2023-05-01');
const date2 = new Date('2023-05-10');

      expect(getDaysDifference(date1, date2)).toBe(9);
      expect(getDaysDifference(date2, date1)).toBe(9); // 순서 무관
    });

    it('같은 날짜는 0일 차이를 반환해야 함', () => {
      const date = new Date('2023-05-15');
      expect(getDaysDifference(date, date)).toBe(0);
    });

    it('시간 부분을 무시하고 날짜만 고려해야 함', () => {
      const date1 = new Date('2023-05-01T08:00:00');
      const date2 = new Date('2023-05-02T23:59:59');
      
      expect(getDaysDifference(date1, date2)).toBe(1);
    });
});

describe('isDateInRange', () => {
it('날짜가 범위 내에 있는지 확인해야 함', () => {
const date = new Date('2023-05-15');
const startDate = new Date('2023-05-01');
const endDate = new Date('2023-05-31');

      expect(isDateInRange(date, startDate, endDate)).toBe(true);
    });

    it('시작 날짜와 같은 경우에도 범위 내로 인식해야 함', () => {
      const date = new Date('2023-05-01');
      const startDate = new Date('2023-05-01');
      const endDate = new Date('2023-05-31');
      
      expect(isDateInRange(date, startDate, endDate)).toBe(true);
    });

    it('종료 날짜와 같은 경우에도 범위 내로 인식해야 함', () => {
      const date = new Date('2023-05-31');
      const startDate = new Date('2023-05-01');
      const endDate = new Date('2023-05-31');
      
      expect(isDateInRange(date, startDate, endDate)).toBe(true);
    });

    it('범위 이전 날짜는 거부해야 함', () => {
      const date = new Date('2023-04-30');
      const startDate = new Date('2023-05-01');
      const endDate = new Date('2023-05-31');
      
      expect(isDateInRange(date, startDate, endDate)).toBe(false);
    });

    it('범위 이후 날짜는 거부해야 함', () => {
      const date = new Date('2023-06-01');
      const startDate = new Date('2023-05-01');
      const endDate = new Date('2023-05-31');
      
      expect(isDateInRange(date, startDate, endDate)).toBe(false);
    });
});
});