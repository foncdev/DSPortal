# Core 기능


## 핵심 기능

```

DSPortal/
├── packages/
│   ├── core/                  
│   │   └── src/
│   │       ├── auth/          # 인증 관련 모듈
│   │       │   ├── types.ts   # 인증 관련 타입 정의
│   │       │   ├── auth.ts    # 인증 로직
│   │       │   └── index.ts   # 내보내기
│   │       └── i18n/          # 국제화 핵심 모듈
│   │       │    ├── types.ts   # 다국어 관련 타입 정의
│   │       │    ├── i18n.ts    # 다국어 관련 유틸리티
│   │       │    └── index.ts   # 내보내기
│   │       ├── api/
│   │       │   ├── types.ts         # API 관련 타입 정의
│   │       │   ├── client.ts        # 기본 API 클라이언트 
│   │       │   ├── interceptors.ts  # 요청/응답 인터셉터
│   │       │   ├── endpoints.ts     # API 엔드포인트 정의
│   │       │   └── index.ts         # 내보내기
│   │       └── services/
│   │           ├── auth/            # 인증 관련 API 서비스
│   │           ├── documents/       # 문서 관련 API 서비스
│   │           ├── user/            # 사용자 관련 API 서비스
│   │           └── index.ts         # 서비스 내보내기
│   └── utils/
│       └── src/               # 유틸리티 함수들
│           └── token/         # 토큰 관리 유틸리티
```