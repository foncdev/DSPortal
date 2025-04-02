# DS Manager 테스트 코드 작성 가이드

## 개요

이 문서는 DS Manager 프로젝트의 테스트 코드 작성 가이드와 모범 사례를 제공합니다. 프로젝트는 주로 Vitest를 테스트 프레임워크로 사용하며, React Testing Library를 사용하여 React 컴포넌트를 테스트합니다.

## 테스트 환경 설정

### 패키지 의존성

테스트에 필요한 주요 패키지는 다음과 같습니다:

- **Vitest**: 테스트 프레임워크 (Jest 호환)
- **React Testing Library**: React 컴포넌트 테스트
- **Happy DOM**: DOM 환경 시뮬레이션

### 테스트 파일 위치

- 모든 테스트 파일은 테스트 대상 파일과 동일한 디렉토리에 위치해야 합니다.
- 테스트 파일 이름은 `[파일명].test.ts` 또는 `[파일명].test.tsx` 형식을 따릅니다.

### 테스트 실행

테스트 실행은 lerna를 통해 모든 패키지 또는 개별 패키지 단위로 수행할 수 있습니다:

```bash
# 모든 패키지 테스트 실행
npm run test

# 개별 패키지 테스트 실행
cd packages/core
npm run test

# 개별 파일 테스트 실행
npm run test -- src/format.test.ts

# 테스트 감시 모드 실행
npm run test:watch
```

## 테스트 작성 가이드

### 기본 테스트 구조

```typescript
import { describe, it, expect } from 'vitest';
// 테스트할 모듈 import

describe('테스트 그룹 이름', () => {
  it('테스트 케이스 설명', () => {
    // 준비 (Arrange)
    const input = '입력 값';
    
    // 실행 (Act)
    const result = functionToTest(input);
    
    // 검증 (Assert)
    expect(result).toEqual('기대 값');
  });
});
```

### 테스트 그룹화 및 명명 규칙

- `describe`로 관련 테스트를 그룹화하세요.
- 테스트 그룹 이름은 테스트 대상 모듈/클래스/함수의 이름을 사용하세요.
- `it` 블록의 설명은 "~해야 한다"(should) 형식으로 작성하세요.

### 유틸리티 함수 테스트

- 입력-출력이 명확한 순수 함수는 다양한 입력 케이스를 테스트하세요.
- 경계값과 예외 케이스를 포함하세요.

```typescript
describe('truncateText', () => {
  it('짧은 텍스트는 변경되지 않아야 함', () => {
    expect(truncateText('짧은 텍스트', 20)).toEqual('짧은 텍스트');
  });
  
  it('최대 길이보다 긴 텍스트는 잘리고 ... 가 추가되어야 함', () => {
    expect(truncateText('이것은 긴 텍스트입니다', 5)).toEqual('이것은...');
  });
});
```

### API 및 비동기 함수 테스트

- 비동기 함수는 `async/await`를 사용하여 테스트하세요.
- Promise 반환 함수는 `resolves/rejects` 매처를 사용하세요.

```typescript
it('사용자 인증이 성공해야 함', async () => {
  const user = await authenticateUser('email@example.com', 'password');
  expect(user).not.toBeNull();
});

it('잘못된 인증 정보로는 실패해야 함', async () => {
  await expect(authenticateUser('', '')).resolves.toBeNull();
});
```

### 모킹 및 스파이

- 외부 의존성이 있는 함수는 모킹하여 테스트하세요.
- 모킹은 최소화하고, 실제 구현체를 사용할 수 있으면 사용하세요.

```typescript
// 모듈 모킹
vi.mock('./apiClient', () => ({
  fetchData: vi.fn().mockResolvedValue({ data: 'mocked data' })
}));

// 함수 스파이
const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
expect(consoleSpy).toHaveBeenCalledWith('expected message');
consoleSpy.mockRestore();
```

### React 컴포넌트 테스트

- React Testing Library를 사용하여 사용자 관점에서 컴포넌트를 테스트하세요.
- 구현 세부사항보다 사용자에게 보이는 동작을 테스트하세요.
- `getBy*`, `findBy*`, `queryBy*` 메소드를 적절히 사용하세요.

```typescript
it('문서를 선택하면 내용이 표시되어야 함', () => {
  render(<DocumentViewer />);
  
  // 초기 상태 확인
  expect(screen.getByText('문서를 선택하세요')).toBeInTheDocument();
  
  // 문서 선택 
  fireEvent.click(screen.getByText('문서 제목'));
  
  // 내용 표시 확인
  expect(screen.getByText('문서 내용')).toBeInTheDocument();
});
```

## 모범 사례 및 팁

### 1. 테스트는 명확하고 간결하게 작성하세요

- 각 테스트는 하나의 동작만 검증해야 합니다.
- 테스트 설명은 명확하게 작성하여 실패 시 무엇이 잘못되었는지 쉽게 파악할 수 있어야 합니다.

### 2. AAA(Arrange-Act-Assert) 패턴을 따르세요

```typescript
it('사용자 정보를 업데이트해야 함', () => {
  // Arrange (준비)
  const originalUser = getUserInfo();
  const updates = { name: '새 이름' };
  
  // Act (실행)
  const updatedUser = updateUserInfo(updates);
  
  // Assert (검증)
  expect(updatedUser.name).toEqual('새 이름');
});
```

### 3. 테스트 전후 환경 설정 및 정리

- `beforeEach`, `afterEach`, `beforeAll`, `afterAll` 훅을 사용하여 테스트 환경을 설정하고 정리하세요.
- 각 테스트는 이전 테스트의 영향을 받지 않도록 격리되어야 합니다.

```typescript
describe('문서 관리', () => {
  beforeEach(() => {
    // 테스트 전에 문서 데이터 초기화
    resetDocuments();
  });
  
  afterEach(() => {
    // 모든 모의 함수 초기화
    vi.clearAllMocks();
  });
});
```

### 4. 테스트 커버리지 관리

- 핵심 비즈니스 로직은 높은 테스트 커버리지(80% 이상)를 유지하세요.
- 테스트 커버리지 리포트를 주기적으로 확인하세요.

```bash
# 커버리지 리포트 생성
npm run test:coverage
```

### 5. 스냅샷 테스트 활용

- UI 컴포넌트의 스타일 변경을 감지하기 위해 스냅샷 테스트를 활용하세요.
- 단, 스냅샷 테스트에 지나치게 의존하지 마세요.

```typescript
it('컴포넌트 렌더링이 일관되어야 함', () => {
  const { container } = render(<MyComponent />);
  expect(container).toMatchSnapshot();
});
```

## 패키지별 테스트 전략

### Core 패키지 테스트

- 핵심 비즈니스 로직은 단위 테스트로 철저히 검증하세요.
- API 통신, 데이터 처리 등 모든 기능은 테스트 케이스를 작성하세요.
- 모킹을 최소화하고 실제 로직을 테스트하세요.

### Utils 패키지 테스트

- 모든 유틸리티 함수는 100%에 가까운 테스트 커버리지를 목표로 하세요.
- 다양한 입력 케이스와 예외 상황을 테스트하세요.

### Demo 앱 테스트

- 핵심 컴포넌트와 페이지는 통합 테스트를 작성하세요.
- 사용자 시나리오를 중심으로 테스트하세요.
- 외부 의존성(Core, Utils)은 모킹하여 테스트하세요.

## 자주 발생하는 문제 해결

### 테스트 환경 설정 문제

- **TypeError: window is not defined**: `happy-dom` 환경 설정 확인
- **Cannot find module**: 경로 별칭(@ds/core 등) 설정 확인
- **SyntaxError**: TypeScript 설정 및 바벨 설정 확인

### 비동기 테스트 문제

- 비동기 함수 테스트 시 `await` 누락 여부 확인
- `findBy*` 메소드 대신 `getBy*` 사용 시 비동기 요소가 없을 수 있음

### 모킹 관련 문제

- 모듈 모킹 시 `vi.mock()` 선언 위치는 import문 전이어야 함
- 잘못된 모킹 설정으로 인한 타입 오류는 타입 단언(as any) 사용 고려

## 결론

효과적인 테스트 코드 작성은 코드 품질 향상과 버그 감소에 직접적으로 기여합니다. 이 가이드를 따라 일관된 테스트 전략을 구축하고, 프로젝트의 안정성을 높이세요.


# DS Manager 테스트 전략 요약

## 테스트 계층 구성

DS Manager 프로젝트는 다음과 같은 테스트 계층을 통해 코드 품질을 보장합니다:

### 1. 단위 테스트 (Unit Tests)
- **대상**: 개별 함수, 클래스, 컴포넌트
- **도구**: Vitest, React Testing Library
- **목표**: 개별 코드 단위의 정확한 동작 검증
- **커버리지 기준**: 80% 이상

### 2. 통합 테스트 (Integration Tests)
- **대상**: 여러 컴포넌트, 기능 간 상호작용
- **도구**: Vitest, React Testing Library
- **목표**: 모듈 간 상호작용 검증
- **커버리지 기준**: 70% 이상

### 3. E2E 테스트 (End-to-End Tests)
- **대상**: 전체 애플리케이션 흐름
- **도구**: Cypress
- **목표**: 사용자 관점에서 주요 기능 동작 검증
- **커버리지 기준**: 주요 사용자 시나리오

## 테스트 원칙

1. **테스트 가능한 코드 설계**: 모듈화, 의존성 주입, 단일 책임 원칙 준수
2. **테스트 우선 개발(TDD)**: 가능한 경우 테스트를 먼저 작성하고 코드 구현
3. **실제 사용자 관점의 테스트**: 내부 구현보다 사용자 경험에 초점
4. **자동화된 테스트 실행**: CI/CD 파이프라인에 테스트 통합
5. **빠른 피드백 루프**: 빠르게 실행되는 테스트로 개발 속도 향상

## 패키지별 테스트 전략

### Core 패키지
- 모든 핵심 비즈니스 로직에 대한 철저한 단위 테스트
- 외부 의존성이 있는 코드는 모킹하여 테스트
- 핵심 함수의 경계 조건 및 예외 케이스 테스트

### Utils 패키지
- 순수 함수에 대한 광범위한 테스트 케이스
- 다양한 입력값과 경계 조건에 대한 테스트
- 100%에 가까운 테스트 커버리지 목표

### Demo 앱
- 주요 컴포넌트에 대한 단위 테스트
- 사용자 시나리오 기반의 통합 테스트
- 핵심 기능에 대한 E2E 테스트

## 테스트 유형별 가이드라인

### 단위 테스트
- 가능한 한 빠르게 실행되도록 설계
- 외부 의존성 최소화
- 하나의 테스트는 하나의 동작만 검증
- AAA(Arrange-Act-Assert) 패턴 사용

### 통합 테스트
- 실제 모듈 간 상호작용 테스트
- 모킹은 외부 서비스나 API로 제한
- 사용자 관점에서 기능 동작 검증

### 스냅샷 테스트
- UI 변경 감지를 위한 보조 수단으로만 사용
- 테스트 실패 시 변경이 의도적인지 확인
- 너무 큰 컴포넌트는 스냅샷 테스트 지양

### E2E 테스트
- 주요 사용자 흐름에 집중
- 실제 환경과 유사한 조건에서 테스트
- 테스트 안정성을 위해 데이터 설정 및 정리 자동화

## 모범 사례 및 권장사항

1. **테스트 코드 품질 관리**: 테스트 코드도 제품 코드와 같은 품질 기준 적용
2. **모킹 최소화**: 실제 구현을 사용할 수 있으면 모킹 대신 실제 구현 사용
3. **테스트 격리**: 각 테스트는 다른 테스트와 독립적으로 실행 가능해야 함
4. **적절한 단언문**: 명확하고 구체적인 단언문 사용
5. **코드 리팩터링 시 테스트 유지**: 코드 변경 시 테스트도 함께 업데이트
6. **지속적인 테스트 개선**: 버그 발견 시 해당 케이스에 대한 테스트 추가

## 테스트 자동화 및 CI/CD 통합

1. **PR 전 테스트 실행**: 코드 병합 전 모든 테스트 통과 확인
2. **자동화된 코드 품질 검사**: 테스트 커버리지, 린팅, 타입 체크 자동화
3. **테스트 결과 가시화**: 테스트 결과 및 커버리지 리포트 공유
4. **성능 모니터링**: 테스트 실행 시간 모니터링 및 최적화

## 결론

효과적인 테스트 전략은 코드 품질 향상, 버그 감소, 개발 속도 향상에 기여합니다. 다양한 테스트 계층을 통해 애플리케이션의 안정성을 보장하고, 지속적인 테스트 개선으로 제품의 품질을 높일 수 있습니다.

이 문서에 제시된 테스트 전략과 가이드라인을 따라 DS Manager 프로젝트의 코드 품질과 안정성을 향상시키세요.