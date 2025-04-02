# DSManager Pro

### 초기설정
```
yarn install
yarn lerna bootstrap
```

### 개발 모드 실행
```
yarn dev  # 모든 프로젝트 개발 모드
# 또는
yarn dev --scope=@your-project/app  # 특정 앱만 개발 모드
```

### 빌드 및 테스트
```
yarn build
yarn test
```


### 디렉토리 구조
```
project-root/
├── packages/
│   ├── core/
│   │   ├── src/
│   │   ├── package.json
│   │   └── README.md
│   ├── utils/
│   │   ├── src/
│   │   ├── package.json
│   │   └── README.md
│   └── ui/
│       ├── src/
│       ├── package.json
│       └── README.md
├── lib/
│   ├── editor/
│   │   ├── src/
│   │   ├── package.json
│   │   └── README.md
│   └── tree/
│       ├── src/
│       ├── package.json
│       └── README.md
├── app/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md
├── demo/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md
├── package.json
├── lerna.json       # For monorepo management
├── tsconfig.json    # Base TypeScript configuration
├── jest.config.js   # Base Jest configuration
└── README.md
```