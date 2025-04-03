# DSPortal 인증 아키텍처 및 구현 모듈 개요

## 구조적 특징

DSPortal 인증 시스템은 다음과 같은 구조적 특징을 가지고 있습니다:

1. **모듈화된 설계**: 각 기능을 독립적인 모듈로 분리하여 유지보수성과 확장성을 높였습니다.
2. **타입 안전성**: TypeScript를 활용하여 타입 안전성을 보장하고, 개발 생산성을 향상시켰습니다.
3. **계층화된 아키텍처**: 서비스, API, 유틸리티 등을 계층화하여 관심사 분리를 구현했습니다.
4. **싱글톤 패턴**: 인증 관리자, 국제화 관리자 등 주요 서비스를 싱글톤으로 구현하여 일관된 상태 관리를 제공합니다.
5. **인터셉터 패턴**: API 요청/응답에 인터셉터를 적용하여 공통 로직을 처리합니다.

## 주요 모듈

### 1. 인증 모듈 (`packages/core/src/auth`)

- **auth/types.ts**: 로그인, 토큰, 인증 상태 등 인증 관련 타입 정의
- **auth/auth.ts**: 인증 상태 관리, 로그인/로그아웃, 토큰 갱신, 세션 관리 등 핵심 인증 기능 구현
- **auth/index.ts**: 모듈 내보내기

### 2. 국제화 모듈 (`packages/core/src/i18n`)

- **i18n/types.ts**: 다국어 처리 관련 타입 정의
- **i18n/i18n.ts**: 언어 감지, 번역, 언어 변경 등 국제화 기능 구현
- **i18n/index.ts**: 모듈 내보내기

### 3. API 모듈 (`packages/core/src/api`)

- **api/types.ts**: HTTP 클라이언트, 요청/응답, 인터셉터 등 API 관련 타입 정의
- **api/client.ts**: HTTP 요청 처리, 인터셉터 적용, 에러 처리 등 API 클라이언트 구현
- **api/interceptors.ts**: 인증 토큰 추가, 토큰 갱신, 언어 헤더 추가 등 인터셉터 구현
- **api/endpoints.ts**: 인증, 사용자, 문서 등 API 엔드포인트 정의
- **api/index.ts**: 모듈 내보내기

### 4. 서비스 모듈 (`packages/core/src/services`)

- **services/auth/index.ts**: 로그인, 회원가입, 비밀번호 관리 등 인증 서비스
- **services/user/index.ts**: 사용자 관리 서비스
- **services/documents/index.ts**: 문서 관리 서비스
- **services/index.ts**: 모듈 내보내기

### 5. 토큰 유틸리티 (`packages/utils/src/token`)

- **token/index.ts**: 토큰 저장/로드, 토큰 파싱, 만료 확인 등 토큰 관련 유틸리티

## 주요 기능

### 인증 관리

1. **로그인/로그아웃**: 사용자 인증 및 세션 종료
2. **토큰 관리**: 액세스 토큰과 리프레시 토큰 관리
3. **자동 토큰 갱신**: 토큰 만료 전 자동 갱신 처리
4. **인증 상태 유지**: 로컬 스토리지를 활용한 인증 상태 유지
5. **세션 관리**: 인증 세션 검증 및 관리

### API 통신

1. **표준화된 요청/응답**: 일관된 API 요청 및 응답 처리
2. **인터셉터**: 요청/응답 인터셉터를 통한 공통 로직 처리
3. **에러 처리**: 표준화된 에러 처리 및 에러 응답 관리
4. **엔드포인트 관리**: 중앙화된 API 엔드포인트 관리

### 국제화

1. **다국어 지원**: 다양한 언어에 대한 번역 지원
2. **언어 감지**: 브라우저 언어 자동 감지
3. **번역 처리**: 키 기반 번역 처리 및 파라미터 대체
4. **언어 전환**: 사용자 언어 선호도에 따른 언어 전환

## 사용 예시

### 인증

```typescript
import { authManager } from '@ds/core';

// 로그인
async function handleLogin(email: string, password: string) {
  try {
    const response = await authManager.login({ email, password });
    console.log('로그인 성공:', response.user);
    // 로그인 후 리디렉션 등 처리
  } catch (error) {
    console.error('로그인 실패:', error);
    // 오류 메시지 표시
  }
}

// 로그아웃
async function handleLogout() {
  try {
    await authManager.logout();
    // 로그아웃 후 처리
  } catch (error) {
    console.error('로그아웃 실패:', error);
  }
}

// 인증 상태 구독
const unsubscribe = authManager.subscribe((state) => {
  console.log('인증 상태 변경:', state.isAuthenticated);
  // UI 업데이트 등
});

// 구독 해제
unsubscribe();
```

### API 서비스 사용

```typescript
import { documentService, userService } from '@ds/core';

// 문서 목록 조회
async function fetchDocuments() {
  try {
    const documents = await documentService.getDocuments({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortDirection: 'desc'
    });
    console.log('문서 목록:', documents);
  } catch (error) {
    console.error('문서 조회 실패:', error);
  }
}

// 사용자 프로필 업데이트
async function updateUserProfile(name: string, email: string) {
  try {
    const updatedUser = await userService.updateProfile({ name, email });
    console.log('프로필 업데이트 성공:', updatedUser);
  } catch (error) {
    console.error('프로필 업데이트 실패:', error);
  }
}
```

### 국제화

```typescript
import { i18nManager } from '@ds/core';

// 번역 사용
const welcomeMessage = i18nManager.t('common.welcome', { name: '홍길동' });
console.log(welcomeMessage); // 한국어: '홍길동님, 환영합니다!'

// 언어 변경
i18nManager.changeLanguage('en');
console.log(i18nManager.t('common.welcome', { name: 'John' })); // 영어: 'Welcome, John!'

// 언어 변경 감지
const unsubscribe = i18nManager.onLanguageChanged((lang) => {
  console.log('언어 변경:', lang);
  // UI 업데이트
});

// 구독 해제
unsubscribe();
```

## 주요 데이터 흐름

1. **인증 흐름**:
    - 사용자 로그인 요청 → AuthService → API 호출 → 토큰 수신 → AuthManager에 저장 → 로컬 스토리지 유지

2. **토큰 갱신 흐름**:
    - 토큰 만료 감지 → AuthManager 자동 갱신 → RefreshToken API 호출 → 새 토큰 발급 → 상태 및 스토리지 업데이트

3. **API 요청 흐름**:
    - 서비스 요청 → API 클라이언트 → 인터셉터 적용(인증 토큰, 언어 등) → HTTP 요청 → 응답 인터셉터 → 결과 반환

## 확장 및 사용자화

DSPortal의 인증 시스템은 다양한 방식으로 확장 가능합니다:

1. **추가 인증 방식**: OAuth, SAML, 2FA 등 추가 인증 방식 구현
2. **권한 관리**: RBAC(Role-Based Access Control) 또는 ABAC(Attribute-Based Access Control) 통합
3. **커스텀 인터셉터**: 애플리케이션별 특수 요구사항에 맞는 API 인터셉터 추가
4. **추가 언어**: 다국어 리소스 확장으로 더 많은 언어 지원

## 보안 고려사항

1. **토큰 관리**: JWT 토큰은 안전하게 저장하고 필요할 때만 메모리에 유지
2. **HTTPS**: 모든 API 통신은 HTTPS를 통해 진행
3. **XSS 방지**: 토큰을 JavaScript에서 접근 가능한 저장소에 저장 시 주의
4. **CSRF 방지**: API 요청에 CSRF 토큰 포함 고려
5. **토큰 만료**: 적절한 토큰 수명 설정 및 만료된 토큰 즉시 제거