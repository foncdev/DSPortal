# 테스트 실행 및 자동화 가이드

## 로컬 테스트 실행

### 모든 패키지 테스트 실행

프로젝트 루트 디렉토리에서 다음 명령어를 실행하여 모든 패키지의 테스트를 실행할 수 있습니다:

```bash
# 모든 패키지 테스트 실행
npm run test

# 테스트 실행 + 커버리지 리포트 생성
npm run test:coverage
```

### 특정 패키지 테스트 실행

특정 패키지의 테스트만 실행하려면 해당 패키지 디렉토리로 이동하여 테스트를 실행합니다:

```bash
# core 패키지 테스트 실행
cd packages/core
npm run test

# utils 패키지 테스트 실행
cd packages/utils
npm run test

# Demo 앱 테스트 실행
cd Demo
npm run test
```

### 특정 파일 테스트 실행

특정 테스트 파일만 실행하려면 패키지 디렉토리에서 다음과 같이 실행합니다:

```bash
# 특정 테스트 파일 실행
npm run test -- src/document.test.ts

# 특정 패턴의 파일 실행
npm run test -- "src/**/*.test.ts"
```

### 감시 모드로 테스트 실행

코드 변경 시 자동으로 테스트를 다시 실행하는 감시 모드를 사용할 수 있습니다:

```bash
# 감시 모드로 테스트 실행
npm run test:watch

# 특정 파일만 감시 모드로 실행
npm run test:watch -- src/document.test.ts
```

### UI 모드로 테스트 실행

Vitest UI 모드를 사용하여 테스트 결과를 시각적으로 확인할 수 있습니다:

```bash
# UI 모드로 테스트 실행
npm run test:ui
```

## CI/CD 파이프라인 테스트 자동화

### GitHub Actions 설정

프로젝트에 GitHub Actions를 설정하여 CI/CD 파이프라인에서 테스트를 자동화할 수 있습니다.

`.github/workflows/test.yml` 파일을 다음과 같이 작성합니다:

```yaml
name: Test

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'yarn'
    
    - name: Install dependencies
      run: yarn install --frozen-lockfile
    
    - name: Lint
      run: yarn lint
    
    - name: Type check
      run: yarn typecheck
    
    - name: Run tests
      run: yarn test
    
    - name: Generate coverage report
      run: yarn test:coverage
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        token: ${{ secrets.CODECOV_TOKEN }}
```

### Jenkins 파이프라인 설정

Jenkins를 사용하는 경우 다음과 같이 `Jenkinsfile`을 작성할 수 있습니다:

```groovy
pipeline {
    agent {
        docker {
            image 'node:18-alpine'
        }
    }
    stages {
        stage('Install') {
            steps {
                sh 'yarn install --frozen-lockfile'
            }
        }
        stage('Lint') {
            steps {
                sh 'yarn lint'
            }
        }
        stage('Type Check') {
            steps {
                sh 'yarn typecheck'
            }
        }
        stage('Test') {
            steps {
                sh 'yarn test'
            }
        }
        stage('Coverage') {
            steps {
                sh 'yarn test:coverage'
                publishHTML(target: [
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'coverage/lcov-report',
                    reportFiles: 'index.html',
                    reportName: 'Coverage Report'
                ])
            }
        }
    }
}
```

## 테스트 실패 디버깅

### 디버깅 모드로 테스트 실행

Vitest에서 디버깅 모드로 테스트를 실행하려면 다음과 같이 실행합니다:

```bash
# 디버깅 모드로 특정 테스트 파일 실행
npm run test -- --inspect-brk src/document.test.ts
```

그런 다음 Chrome DevTools를 열고 `chrome://inspect`로 이동하여 연결합니다.

### 테스트 실패 로그 확인

테스트 실패 시 자세한 로그를 확인하려면 다음 명령어를 사용합니다:

```bash
# 자세한 로그 출력
npm run test -- --verbose
```

### 테스트 타임아웃 늘리기

비동기 테스트에서 타임아웃이 발생하는 경우, 타임아웃 시간을 늘릴 수 있습니다:

```bash
# 타임아웃 시간 늘리기 (10초)
npm run test -- --timeout 10000
```

또는 특정 테스트에서만 타임아웃을 조정할 수 있습니다:

```typescript
it('오래 걸리는 테스트', async () => {
  // 이 테스트만 타임아웃 10초로 설정
}, 10000);
```

## 테스트 커버리지 관리

### 커버리지 리포트 생성

테스트 커버리지 리포트를 생성하려면 다음 명령어를 실행합니다:

```bash
# 커버리지 리포트 생성
npm run test:coverage
```

생성된 리포트는 `coverage` 디렉토리에서 확인할 수 있습니다.

### 커버리지 임계값 설정

프로젝트에서 유지해야 할 테스트 커버리지 임계값을 설정할 수 있습니다.
`vitest.config.ts` 파일의 `coverage` 섹션에서 설정합니다:

```typescript
coverage: {
  reporter: ['text', 'json', 'html'],
  exclude: ['node_modules/', 'src/test/', '**/*.d.ts'],
  lines: 80,
  functions: 80,
  branches: 70,
  statements: 80
}
```

### 미충족 커버리지 확인

어떤 부분의 코드가 테스트되지 않았는지 확인하려면 다음 명령어를 사용합니다:

```bash
# 미충족 커버리지 항목 확인
npm run test:coverage -- --verbose
```

## 지속적인 테스트 관리

### 테스트 우선 개발 (TDD)

새로운 기능을 추가하거나 버그를 수정할 때 테스트 우선 개발 방식을 사용하면 좋습니다:

1. 기대되는 동작을 테스트로 먼저 작성합니다.
2. 테스트가 실패하는 것을 확인합니다.
3. 기능을 구현하거나 버그를 수정합니다.
4. 테스트가 통과하는지 확인합니다.
5. 코드를 리팩터링합니다.

### 테스트 리뷰 프로세스

코드 리뷰 과정에서 테스트 코드도 함께 리뷰하는 것이 중요합니다:

- 모든 새로운 코드와 수정된 코드에 대한 적절한 테스트가 있는지 확인합니다.
- 테스트가 단순히 코드 커버리지를 높이기 위한 것이 아닌, 실제 기능을 검증하는지 확인합니다.
- 테스트 코드의 가독성과 유지보수성을 검토합니다.

### 테스트 성능 개선

테스트 실행 시간이 길어지면 개발 효율성이 떨어질 수 있습니다. 다음 방법으로 테스트 성능을 개선할 수 있습니다:

- 통합 테스트와 E2E 테스트보다 단위 테스트를 많이 작성합니다.
- 테스트 간 의존성을 제거하여 병렬 실행이 가능하게 합니다.
- 테스트 환경 설정과 정리 작업을 최적화합니다.
- 자주 변경되는 코드에 대한 테스트는 별도의 그룹으로 분리하여 필요할 때만 실행합니다.

## 결론

효과적인 테스트 자동화는 코드 품질을 높이고 버그를 조기에 발견하여 프로젝트의 안정성을 유지하는 데 중요합니다. 이 가이드를 통해 테스트를 효율적으로 실행하고 자동화하여 개발 워크플로우를 개선하세요.

추가적인 테스트 도구나 기법에 대한 정보는 공식 문서를 참고하세요:
- [Vitest 공식 문서](https://vitest.dev/)
- [React Testing Library 공식 문서](https://testing-library.com/docs/react-testing-library/intro/)
- [TestingJavaScript.com](https://testingjavascript.com/)