import {
    I18nManager,
    I18nOptions,
    LanguageCode,
    TranslationBundle,
} from './types';

// 로컬 스토리지 키
const LANGUAGE_STORAGE_KEY = 'ds_language';

/**
 * 다국어 처리 관리자 클래스
 */
export class I18nManagerImpl implements I18nManager {
    private currentLanguage: LanguageCode;
    private readonly defaultLanguage: LanguageCode;
    private readonly fallbackLanguage: LanguageCode;
    private readonly resources: TranslationBundle;
    private listeners: ((lang: LanguageCode) => void)[] = [];

    /**
     * I18nManager 생성자
     * @param options 다국어 처리 옵션
     */
    constructor(options: I18nOptions) {
        this.defaultLanguage = options.defaultLanguage;
        this.fallbackLanguage = options.fallbackLanguage;
        this.resources = options.resources;

        // 로컬 스토리지에서 언어 설정 읽기 또는 브라우저 언어 감지
        const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as LanguageCode | null;
        const detectedLanguage = this.detectBrowserLanguage();

        this.currentLanguage = savedLanguage || detectedLanguage || this.defaultLanguage;

        // 설정된 언어가 지원되는지 확인
        if (!this.isLanguageSupported(this.currentLanguage)) {
            this.currentLanguage = this.defaultLanguage;
        }

        // 로컬 스토리지에 현재 언어 저장
        localStorage.setItem(LANGUAGE_STORAGE_KEY, this.currentLanguage);
    }

    /**
     * 브라우저 언어 감지
     * @returns 감지된 언어 코드
     */
    private detectBrowserLanguage(): LanguageCode | null {
        if (typeof navigator === 'undefined') {
            return null;
        }

        const browserLang = navigator.language.split('-')[0];

        // 지원되는 언어인지 확인
        if (this.isLanguageSupported(browserLang as LanguageCode)) {
            return browserLang as LanguageCode;
        }

        return null;
    }

    /**
     * 지원되는 언어인지 확인
     * @param lang 확인할 언어 코드
     * @returns 지원 여부
     */
    private isLanguageSupported(lang: LanguageCode): boolean {
        return !!this.resources[lang];
    }

    /**
     * 현재 언어 코드 반환
     * @returns 현재 언어 코드
     */
    getLanguage(): LanguageCode {
        return this.currentLanguage;
    }

    /**
     * 언어 변경
     * @param lang 변경할 언어 코드
     */
    changeLanguage(lang: LanguageCode): void {
        if (!this.isLanguageSupported(lang)) {
            console.warn(`Language ${lang} is not supported, using default language instead.`);
            lang = this.defaultLanguage;
        }

        if (this.currentLanguage !== lang) {
            this.currentLanguage = lang;
            localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);

            // 리스너들에게 언어 변경 알림
            this.notifyListeners();
        }
    }

    /**
     * 모든 리스너에게 언어 변경 알림
     */
    private notifyListeners(): void {
        this.listeners.forEach(listener => listener(this.currentLanguage));
    }

    /**
     * 언어 변경 이벤트 구독
     * @param callback 언어 변경 시 호출할 콜백
     * @returns 구독 해제 함수
     */
    onLanguageChanged(callback: (lang: LanguageCode) => void): () => void {
        this.listeners.push(callback);

        // 현재 언어 즉시 전달
        callback(this.currentLanguage);

        // 구독 해제 함수 반환
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    /**
     * 번역 키에 대한 값 가져오기
     * @param key 번역 키 (점 표기법 지원, 예: 'common.buttons.submit')
     * @param params 대체할 파라미터 객체
     * @returns 번역된 텍스트
     */
    t(key: string, params?: Record<string, string | number>): string {
        // 점 표기법 분석
        const keys = key.split('.');

        // 현재 언어로 번역 데이터 가져오기
        let value = this.getTranslationValue(this.currentLanguage, keys);

        // 번역이 없으면 대체 언어 시도
        if (value === null && this.fallbackLanguage !== this.currentLanguage) {
            value = this.getTranslationValue(this.fallbackLanguage, keys);
        }

        // 대체 언어에도 없으면 기본 언어 시도
        if (value === null && this.defaultLanguage !== this.fallbackLanguage) {
            value = this.getTranslationValue(this.defaultLanguage, keys);
        }

        // 모든 언어에 번역이 없으면 키 그대로 반환
        if (value === null) {
            return key;
        }

        // 파라미터 대체
        return this.replaceParams(value, params || {});
    }

    /**
     * 특정 언어의 번역 데이터에서 값 가져오기
     * @param lang 언어 코드
     * @param keys 키 배열
     * @returns 번역 값 또는 null (번역 없음)
     */
    private getTranslationValue(lang: LanguageCode, keys: string[]): string | null {
        const translations = this.resources[lang];

        if (!translations) {
            return null;
        }

        let current: any = translations;

        // 중첩된 객체 탐색
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];

            if (current[k] === undefined) {
                return null;
            }

            current = current[k];
        }

        // 최종 값이 문자열이 아니면 null 반환
        if (typeof current !== 'string') {
            return null;
        }

        return current;
    }

    /**
     * 번역 텍스트에 파라미터 값 대체
     * @param text 번역 텍스트
     * @param params 파라미터 객체
     * @returns 파라미터가 대체된 텍스트
     */
    private replaceParams(text: string, params: Record<string, string | number>): string {
        return text.replace(/\{\{(\w+)\}\}/g, (_, name) => params[name] !== undefined ? String(params[name]) : `{{${name}}}`);
    }
}

/**
 * 기본 다국어 처리 관리자 생성
 * @param options 옵션 (기본값 있음)
 * @returns I18nManager 인스턴스
 */
export function createI18nManager(options?: Partial<I18nOptions>): I18nManager {
    const defaultOptions: I18nOptions = {
        defaultLanguage: 'ko',
        fallbackLanguage: 'en',
        resources: {
            ko: {
                common: {
                    buttons: {
                        submit: '제출',
                        cancel: '취소',
                        save: '저장',
                        delete: '삭제',
                        edit: '편집',
                        back: '뒤로',
                        next: '다음',
                        confirm: '확인'
                    },
                    validation: {
                        required: '필수 항목입니다',
                        email: '유효한 이메일 형식이 아닙니다',
                        minLength: '최소 {{min}}자 이상 입력하세요',
                        maxLength: '최대 {{max}}자까지 입력 가능합니다',
                        passwordMatch: '비밀번호가 일치하지 않습니다'
                    },
                    labels: {
                        email: '이메일',
                        password: '비밀번호',
                        confirmPassword: '비밀번호 확인',
                        name: '이름',
                        search: '검색'
                    }
                },
                auth: {
                    login: '로그인',
                    logout: '로그아웃',
                    signup: '회원가입',
                    forgotPassword: '비밀번호 찾기',
                    resetPassword: '비밀번호 재설정',
                    changePassword: '비밀번호 변경',
                    errors: {
                        invalidCredentials: '이메일 또는 비밀번호가 올바르지 않습니다',
                        accountLocked: '계정이 잠겼습니다. 관리자에게 문의하세요',
                        emailNotVerified: '이메일 인증이 필요합니다',
                        sessionExpired: '세션이 만료되었습니다. 다시 로그인해 주세요',
                        networkError: '네트워크 오류가 발생했습니다',
                        unknownError: '오류가 발생했습니다'
                    }
                },
            },
            en: {
                common: {
                    buttons: {
                        submit: 'Submit',
                        cancel: 'Cancel',
                        save: 'Save',
                        delete: 'Delete',
                        edit: 'Edit',
                        back: 'Back',
                        next: 'Next',
                        confirm: 'Confirm'
                    },
                    validation: {
                        required: 'This field is required',
                        email: 'Invalid email format',
                        minLength: 'Please enter at least {{min}} characters',
                        maxLength: 'Please enter no more than {{max}} characters',
                        passwordMatch: 'Passwords do not match'
                    },
                    labels: {
                        email: 'Email',
                        password: 'Password',
                        confirmPassword: 'Confirm Password',
                        name: 'Name',
                        search: 'Search'
                    }
                },
                auth: {
                    login: 'Login',
                    logout: 'Logout',
                    signup: 'Sign Up',
                    forgotPassword: 'Forgot Password',
                    resetPassword: 'Reset Password',
                    changePassword: 'Change Password',
                    errors: {
                        invalidCredentials: 'Invalid email or password',
                        accountLocked: 'Account is locked. Please contact administrator',
                        emailNotVerified: 'Email verification required',
                        sessionExpired: 'Session expired. Please login again',
                        networkError: 'Network error occurred',
                        unknownError: 'An error occurred'
                    }
                },
            }
        }
    };

    // 옵션 병합
    const mergedOptions: I18nOptions = {
        ...defaultOptions,
        ...options,
        resources: {
            ...defaultOptions.resources,
            ...(options?.resources || {})
        }
    };

    return new I18nManagerImpl(mergedOptions);
}

// 싱글톤 인스턴스 생성 및 내보내기
export const i18nManager = createI18nManager();