/**
 * 유효성 검사와 관련된 유틸리티 함수들
 */

/**
 * 사용자 아이디 유효성 검사
 * - 알파벳, 숫자, 언더스코어(_), 하이픈(-) 만 허용
 * - 4~20자 제한
 * - 숫자로 시작할 수 없음
 *
 * @param username 검사할 사용자 아이디
 * @returns 유효한 경우 true, 아니면 false
 */
export function isValidUsername(username: string): boolean {
    if (!username) return false;

    // 4~20자, 알파벳으로 시작, 알파벳/숫자/언더스코어/하이픈만 허용
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_-]{3,19}$/;
    return usernameRegex.test(username);
}

/**
 * 유효하지 않은 사용자 아이디의 이유를 반환
 *
 * @param username 검사할 사용자 아이디
 * @returns 유효하지 않은 이유, 유효하면 null
 */
export function getUsernameValidationError(username: string): string | null {
    if (!username) {
        return '아이디를 입력해주세요';
    }

    if (username.length < 4) {
        return '아이디는 최소 4자 이상이어야 합니다';
    }

    if (username.length > 20) {
        return '아이디는 최대 20자까지 가능합니다';
    }

    if (!/^[a-zA-Z]/.test(username)) {
        return '아이디는 알파벳으로 시작해야 합니다';
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return '아이디는 알파벳, 숫자, 언더스코어(_), 하이픈(-)만 포함할 수 있습니다';
    }

    return null;
}

/**
 * 이메일 주소 유효성 검사
 *
 * @param email 검사할 이메일 주소
 * @returns 유효한 경우 true, 아니면 false
 */
export function isValidEmail(email: string): boolean {
    if (!email) return false;

    // RFC 5322 호환 이메일 정규식
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
}

/**
 * 비밀번호 강도 레벨
 */
export enum PasswordStrength {
    NONE = 0,   // 비밀번호 없음
    WEAK = 1,   // 약함
    MEDIUM = 2, // 보통
    STRONG = 3  // 강함
}

/**
 * 비밀번호 유효성 검사 결과 인터페이스
 */
export interface PasswordValidationResult {
    isValid: boolean;          // 유효성 여부
    strength: PasswordStrength; // 비밀번호 강도
    hasLowerCase: boolean;     // 소문자 포함 여부
    hasUpperCase: boolean;     // 대문자 포함 여부
    hasNumber: boolean;        // 숫자 포함 여부
    hasSpecialChar: boolean;   // 특수문자 포함 여부
    isLongEnough: boolean;     // 길이 충족 여부
    errors: string[];          // 오류 메시지 목록
}

/**
 * 비밀번호 유효성 검사
 * - 최소 8자 이상
 * - 소문자, 대문자, 숫자, 특수문자 포함 여부 확인
 *
 * @param password 검사할 비밀번호
 * @param minLength 최소 길이 (기본값: 8)
 * @returns 비밀번호 유효성 검사 결과
 */
export function validatePassword(password: string, minLength: number = 8): PasswordValidationResult {
    const hasLowerCase = /[a-z]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= minLength;

    // 오류 메시지 수집
    const errors: string[] = [];

    if (!password) {
        errors.push('비밀번호를 입력해주세요');
    } else {
        if (!isLongEnough) {
            errors.push(`비밀번호는 최소 ${minLength}자 이상이어야 합니다`);
        }

        if (!hasLowerCase) {
            errors.push('소문자를 포함해야 합니다');
        }

        if (!hasUpperCase) {
            errors.push('대문자를 포함해야 합니다');
        }

        if (!hasNumber) {
            errors.push('숫자를 포함해야 합니다');
        }

        if (!hasSpecialChar) {
            errors.push('특수문자를 포함해야 합니다');
        }
    }

    // 비밀번호 강도 계산
    let strength = PasswordStrength.NONE;

    if (password) {
        const score = [hasLowerCase, hasUpperCase, hasNumber, hasSpecialChar, isLongEnough].filter(Boolean).length;

        if (score <= 2) {
            strength = PasswordStrength.WEAK;
        } else if (score <= 4) {
            strength = PasswordStrength.MEDIUM;
        } else {
            strength = PasswordStrength.STRONG;
        }
    }

    return {
        isValid: errors.length === 0,
        strength,
        hasLowerCase,
        hasUpperCase,
        hasNumber,
        hasSpecialChar,
        isLongEnough,
        errors
    };
}

/**
 * 두 비밀번호가 일치하는지 확인
 *
 * @param password 첫 번째 비밀번호
 * @param confirmPassword 확인용 비밀번호
 * @returns 일치하면 true, 아니면 false
 */
export function doPasswordsMatch(password: string, confirmPassword: string): boolean {
    return password === confirmPassword;
}

/**
 * 전화번호 유효성 검사
 *
 * @param phoneNumber 검사할 전화번호
 * @returns 유효한 경우 true, 아니면 false
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
    if (!phoneNumber) return false;

    // 숫자, 하이픈(-), 플러스(+), 공백만 허용하고 전처리
    const cleanedNumber = phoneNumber.replace(/[^\d\-+\s]/g, '');

    // 국제 전화번호 형식 (한국 기준: +82 10-1234-5678 또는 한국 내 번호: 010-1234-5678)
    // 최소 10자리 숫자가 포함되어야 함
    return /^(?:\+?\d{1,4}[ -]?)?(?:\(?\d{2,}\)?[ -]?)?(?:\d{2,}[ -]?){2,}\d{2,}$/.test(cleanedNumber) &&
        cleanedNumber.replace(/[^\d]/g, '').length >= 10;
}

/**
 * 전화번호 형식 정규화 (하이픈 추가)
 *
 * @param phoneNumber 원본 전화번호
 * @returns 포맷팅된 전화번호
 */
export function formatPhoneNumber(phoneNumber: string): string {
    // 숫자만 추출
    const cleaned = phoneNumber.replace(/\D/g, '');

    // 한국 번호 형식으로 변환 (010-1234-5678)
    if (cleaned.length === 11 && cleaned.startsWith('010')) {
        return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    }

    // 기타 번호는 그대로 반환
    return phoneNumber;
}

/**
 * 이름 유효성 검사
 *
 * @param name 검사할 이름
 * @param minLength 최소 길이 (기본값: 2)
 * @param maxLength 최대 길이 (기본값: 50)
 * @returns 유효한 경우 true, 아니면 false
 */
export function isValidName(name: string, minLength: number = 2, maxLength: number = 50): boolean {
    if (!name) return false;

    const trimmedName = name.trim();
    return trimmedName.length >= minLength && trimmedName.length <= maxLength;
}

/**
 * 회사명 유효성 검사
 *
 * @param companyName 검사할 회사명
 * @param minLength 최소 길이 (기본값: 2)
 * @param maxLength 최대 길이 (기본값: 100)
 * @returns 유효한 경우 true, 아니면 false
 */
export function isValidCompanyName(companyName: string, minLength: number = 2, maxLength: number = 100): boolean {
    if (!companyName) return false;

    const trimmedName = companyName.trim();
    return trimmedName.length >= minLength && trimmedName.length <= maxLength;
}