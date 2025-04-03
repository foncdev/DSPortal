/**
 * 지원하는 언어 코드 타입
 */
export type LanguageCode = 'ko' | 'en';

/**
 * 다국어 번역 아이템 타입
 */
export type TranslationItem = string | { [key: string]: TranslationItem };

/**
 * 다국어 번역 데이터 타입
 */
export interface TranslationData {
    [key: string]: TranslationItem;
}

/**
 * 다국어 리소스 번들 타입
 */
export interface TranslationBundle {
    [lang: string]: TranslationData;
}

/**
 * 다국어 처리 옵션 인터페이스
 */
export interface I18nOptions {
    defaultLanguage: LanguageCode;
    fallbackLanguage: LanguageCode;
    resources: TranslationBundle;
}

/**
 * 다국어 처리기 인터페이스
 */
export interface I18nManager {
    /**
     * 현재 언어 코드 반환
     */
    getLanguage(): LanguageCode;

    /**
     * 언어 변경
     * @param lang 언어 코드
     */
    changeLanguage(lang: LanguageCode): void;

    /**
     * 번역 키에 해당하는 텍스트 반환
     * @param key 번역 키
     * @param params 대체 파라미터
     */
    t(key: string, params?: Record<string, string | number>): string;

    /**
     * 언어 변경 이벤트 구독
     * @param callback 언어 변경 시 호출할 콜백
     */
    onLanguageChanged(callback: (lang: LanguageCode) => void): () => void;
}