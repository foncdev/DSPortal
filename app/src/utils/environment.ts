// app/src/utils/environment.ts

/**
 * 현재 환경이 개발 모드인지 확인합니다.
 * @returns 개발 환경이면 true, 아니면 false
 */
export const isDevelopment = (): boolean => process.env.NODE_ENV === 'development';

/**
 * 현재 환경이 프로덕션 모드인지 확인합니다.
 * @returns 프로덕션 환경이면 true, 아니면 false
 */
export const isProduction = (): boolean => process.env.NODE_ENV === 'production';

/**
 * 현재 환경이 테스트 모드인지 확인합니다.
 * @returns 테스트 환경이면 true, 아니면 false
 */
export const isTest = (): boolean => process.env.NODE_ENV === 'test';