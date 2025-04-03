import { User } from './types';
/**
 * 사용자 정보를 가져옵니다. (현재는 목업 데이터 반환)
 * @returns {User} 사용자 정보 객체
 */
export declare function getUserInfo(): User;
/**
 * 사용자 정보를 업데이트합니다.
 * @param {Partial<User>} userData 업데이트할 사용자 데이터
 * @returns {User} 업데이트된 사용자 정보
 */
export declare function updateUserInfo(userData: Partial<User>): User;
/**
 * 사용자 인증을 수행합니다.
 * @param {string} email 사용자 이메일
 * @param {string} password 사용자 비밀번호
 * @returns {Promise<User | null>} 인증 성공 시 사용자 정보, 실패 시 null
 */
export declare function authenticateUser(email: string, password: string): Promise<User | null>;
/**
 * 새 사용자를 생성합니다.
 * @param {string} name 사용자 이름
 * @param {string} email 사용자 이메일
 * @param {string} password 사용자 비밀번호
 * @param {'admin' | 'editor' | 'viewer'} role 사용자 권한
 * @returns {Promise<User>} 생성된 사용자 정보
 */
export declare function createUser(name: string, email: string, password: string, role?: 'admin' | 'editor' | 'viewer'): Promise<User>;
/**
 * 사용자 세션을 검증합니다.
 * @returns {boolean} 세션이 유효하면 true, 아니면 false
 */
export declare function validateUserSession(): boolean;
/**
 * 사용자를 로그아웃합니다.
 * @returns {Promise<void>}
 */
export declare function logoutUser(): Promise<void>;
