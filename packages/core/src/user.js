/**
 * 사용자 정보를 가져옵니다. (현재는 목업 데이터 반환)
 * @returns {User} 사용자 정보 객체
 */
export function getUserInfo() {
    // 실제 구현에서는 API 호출이나 저장소에서 정보를 가져올 수 있음
    return {
        id: '1',
        name: '테스트 유저',
        email: 'test@example.com',
        role: 'editor',
        createdAt: new Date(),
        updatedAt: new Date()
    };
}
/**
 * 사용자 정보를 업데이트합니다.
 * @param {Partial<User>} userData 업데이트할 사용자 데이터
 * @returns {User} 업데이트된 사용자 정보
 */
export function updateUserInfo(userData) {
    const currentUser = getUserInfo();
    // 실제 구현에서는 API 호출이나 저장소에 업데이트
    return {
        ...currentUser,
        ...userData,
        updatedAt: new Date()
    };
}
/**
 * 사용자 인증을 수행합니다.
 * @param {string} email 사용자 이메일
 * @param {string} password 사용자 비밀번호
 * @returns {Promise<User | null>} 인증 성공 시 사용자 정보, 실패 시 null
 */
export async function authenticateUser(email, password) {
    // 실제 구현에서는 인증 서비스 API 호출
    // 예시 구현이므로 항상 성공하는 것으로 가정
    if (email && password) {
        return {
            id: '1',
            name: '테스트 유저',
            email,
            role: 'editor',
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
    return null;
}
/**
 * 새 사용자를 생성합니다.
 * @param {string} name 사용자 이름
 * @param {string} email 사용자 이메일
 * @param {string} password 사용자 비밀번호
 * @param {'admin' | 'editor' | 'viewer'} role 사용자 권한
 * @returns {Promise<User>} 생성된 사용자 정보
 */
export async function createUser(name, email, password, role = 'viewer') {
    // 실제 구현에서는 API 호출하여 사용자 생성
    const now = new Date();
    console.log('pwd', password);
    return {
        id: Math.random().toString(36).substring(2, 15),
        name,
        email,
        role,
        createdAt: now,
        updatedAt: now
    };
}
/**
 * 사용자 세션을 검증합니다.
 * @returns {boolean} 세션이 유효하면 true, 아니면 false
 */
export function validateUserSession() {
    // 실제 구현에서는 세션/토큰 검증 로직
    return true;
}
/**
 * 사용자를 로그아웃합니다.
 * @returns {Promise<void>}
 */
export async function logoutUser() {
    // 실제 구현에서는 세션/토큰 제거 및 서버 API 호출
    return Promise.resolve();
}
//# sourceMappingURL=user.js.map