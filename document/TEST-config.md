// Demo/vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
plugins: [react()],
test: {
globals: true,
environment: 'happy-dom',
setupFiles: ['./src/test/setup.ts'],
include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
coverage: {
reporter: ['text', 'json', 'html'],
exclude: ['node_modules/', 'dist/', '**/*.d.ts'],
all: true,
lines: 80,
functions: 80,
branches: 80,
statements: 80
},
deps: {
inline: ['@ds/utils']  // 인라인 의존성 모듈 지정
}
},
resolve: {
alias: {
'@': resolve(__dirname, './src'),
},
},
});

// packages/core/src/test/mock-data.ts
// 테스트에서 재사용할 수 있는 모의 데이터 파일

import { User, Document, Project } from '../types';

/**
* 테스트용 모의 사용자 데이터
  */
  export const mockUsers: User[] = [
  {
  id: 'user1',
  name: '테스트 사용자 1',
  email: 'user1@example.com',
  role: 'admin',
  createdAt: new Date(2023, 0, 1),
  updatedAt: new Date(2023, 0, 1)
  },
  {
  id: 'user2',
  name: '테스트 사용자 2',
  email: 'user2@example.com',
  role: 'editor',
  createdAt: new Date(2023, 0, 2),
  updatedAt: new Date(2023, 0, 2)
  },
  {
  id: 'user3',
  name: '테스트 사용자 3',
  email: 'user3@example.com',
  role: 'viewer',
  createdAt: new Date(2023, 0, 3),
  updatedAt: new Date(2023, 0, 3)
  }
  ];

/**
* 테스트용 모의 문서 데이터
  */
  export const mockDocuments: Document[] = [
  {
  id: 'doc1',
  title: '테스트 문서 1',
  content: '이것은 테스트 문서 1의 내용입니다.',
  createdBy: 'user1',
  createdAt: new Date(2023, 1, 1),
  updatedAt: new Date(2023, 1, 1),
  status: 'published',
  tags: ['테스트', '문서']
  },
  {
  id: 'doc2',
  title: '테스트 문서 2',
  content: '이것은 테스트 문서 2의 내용입니다.',
  createdBy: 'user1',
  createdAt: new Date(2023, 1, 2),
  updatedAt: new Date(2023, 1, 2),
  status: 'draft',
  tags: ['테스트', '초안']
  },
  {
  id: 'doc3',
  title: '아카이브 문서',
  content: '이것은 아카이브된 문서입니다.',
  createdBy: 'user2',
  createdAt: new Date(2023, 1, 3),
  updatedAt: new Date(2023, 1, 3),
  status: 'archived',
  tags: ['아카이브']
  }
  ];

/**
* 테스트용 모의 프로젝트 데이터
  */
  export const mockProjects: Project[] = [
  {
  id: 'proj1',
  name: '테스트 프로젝트 1',
  description: '테스트 프로젝트 1 설명',
  ownerId: 'user1',
  members: ['user1', 'user2'],
  createdAt: new Date(2023, 2, 1),
  updatedAt: new Date(2023, 2, 1)
  },
  {
  id: 'proj2',
  name: '테스트 프로젝트 2',
  description: '테스트 프로젝트 2 설명',
  ownerId: 'user2',
  members: ['user2', 'user3'],
  createdAt: new Date(2023, 2, 2),
  updatedAt: new Date(2023, 2, 2)
  }
  ];

// jest.config.js (참고용 - 프로젝트가 Jest 대신 Vitest를 사용하는 경우)
module.exports = {
preset: 'ts-jest',
testEnvironment: 'jsdom',
moduleNameMapper: {
'^@/(.*)node_modules/', 'src/test/'],
},
},
resolve: {
alias: {
'@': resolve(__dirname, './src'),
'@ds/core': resolve(__dirname, '../packages/core/src'),
'@ds/utils': resolve(__dirname, '../packages/utils/src')
},
},
});

// Demo/src/test/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// 전역 모킹 설정
vi.mock('@ds/core', async () => {
const actual = await vi.importActual('@ds/core');
return {
...actual,
// 필요한 경우 특정 함수만 모킹
};
});

// 테스트 타이머 모킹 (필요한 경우)
vi.useFakeTimers();

// 콘솔 경고 억제 (필요한 경우)
// eslint-disable-next-line
console.warn = vi.fn();

// MSW 모킹 설정 (필요한 경우)
// 서비스 워커 설정
// ...

// packages/core/vitest.config.ts
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
test: {
globals: true,
environment: 'node',
include: ['src/**/*.test.ts'],
coverage: {
reporter: ['text', 'json', 'html'],
exclude: [': '<rootDir>/src/$1',
'^@ds/corenode_modules/', 'src/test/'],
},
},
resolve: {
alias: {
'@': resolve(__dirname, './src'),
'@ds/core': resolve(__dirname, '../packages/core/src'),
'@ds/utils': resolve(__dirname, '../packages/utils/src')
},
},
});

// Demo/src/test/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// 전역 모킹 설정
vi.mock('@ds/core', async () => {
const actual = await vi.importActual('@ds/core');
return {
...actual,
// 필요한 경우 특정 함수만 모킹
};
});

// 테스트 타이머 모킹 (필요한 경우)
vi.useFakeTimers();

// 콘솔 경고 억제 (필요한 경우)
// eslint-disable-next-line
console.warn = vi.fn();

// MSW 모킹 설정 (필요한 경우)
// 서비스 워커 설정
// ...

// packages/core/vitest.config.ts
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
test: {
globals: true,
environment: 'node',
include: ['src/**/*.test.ts'],
coverage: {
reporter: ['text', 'json', 'html'],
exclude: [': '<rootDir>/../packages/core/src',
'^@ds/utilsnode_modules/', 'src/test/'],
},
},
resolve: {
alias: {
'@': resolve(__dirname, './src'),
'@ds/core': resolve(__dirname, '../packages/core/src'),
'@ds/utils': resolve(__dirname, '../packages/utils/src')
},
},
});

// Demo/src/test/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// 전역 모킹 설정
vi.mock('@ds/core', async () => {
const actual = await vi.importActual('@ds/core');
return {
...actual,
// 필요한 경우 특정 함수만 모킹
};
});

// 테스트 타이머 모킹 (필요한 경우)
vi.useFakeTimers();

// 콘솔 경고 억제 (필요한 경우)
// eslint-disable-next-line
console.warn = vi.fn();

// MSW 모킹 설정 (필요한 경우)
// 서비스 워커 설정
// ...

// packages/core/vitest.config.ts
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
test: {
globals: true,
environment: 'node',
include: ['src/**/*.test.ts'],
coverage: {
reporter: ['text', 'json', 'html'],
exclude: [': '<rootDir>/../packages/utils/src'
},
setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
collectCoverageFrom: [
'src/**/*.{ts,tsx}',
'!src/**/*.d.ts',
'!src/test/**/*'
],
coverageThreshold: {
global: {
branches: 80,
functions: 80,
lines: 80,
statements: 80
}
}
};node_modules/', 'src/test/'],
},
},
resolve: {
alias: {
'@': resolve(__dirname, './src'),
'@ds/core': resolve(__dirname, '../packages/core/src'),
'@ds/utils': resolve(__dirname, '../packages/utils/src')
},
},
});

// Demo/src/test/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// 전역 모킹 설정
vi.mock('@ds/core', async () => {
const actual = await vi.importActual('@ds/core');
return {
...actual,
// 필요한 경우 특정 함수만 모킹
};
});

// 테스트 타이머 모킹 (필요한 경우)
vi.useFakeTimers();

// 콘솔 경고 억제 (필요한 경우)
// eslint-disable-next-line
console.warn = vi.fn();

// MSW 모킹 설정 (필요한 경우)
// 서비스 워커 설정
// ...

// packages/core/vitest.config.ts
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
test: {
globals: true,
environment: 'node',
include: ['src/**/*.test.ts'],
coverage: {
reporter: ['text', 'json', 'html'],
exclude: ['