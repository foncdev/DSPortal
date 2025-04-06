### 모바일 최적화

모바일 환경에서 테이블을 최적화하기 위한 몇 가지 속성:

```jsx
// 모바일에서 특정 컬럼 숨기기
const columns = [
  {
    key: 'id',
    header: 'ID',
    hideOnMobile: true, // 모바일에서는 이 컬럼이 보이지 않음
  },
  {
    key: 'name',
    header: '이름',
  },
  // 더 많은 컬럼...
];

// 테이블 모바일 설정
<DataTable
  // ...다른 속성들
  hideFilterBarOnMobile={true} // 모바일에서 필터바 숨기기 (기본값: true)
  mobileBreakpoint={640} // 모바일 중단점 설정 (기본값: 768px)
/>
```| `hideOnMobile` | `boolean` | `false` | 모바일에서 컬럼 숨김 여부 || `hideFilterBarOnMobile` | `boolean` | `true` | 모바일에서 헤더 필터 입력창 숨김 여부 |
| `mobileBreakpoint` | `number` | `768` | 모바일 중단점 (px) |# DataTable 컴포넌트

고기능성 데이터 테이블 React 컴포넌트입니다. 필터링, 정렬, 페이지네이션, 컬럼 설정, 테마 지원 등 다양한 기능을 제공합니다.

## 기능

- ✅ 데이터 필터링 - 각 컬럼별 필터 적용
- ✅ 데이터 정렬 - 컬럼 헤더 클릭으로 오름차순/내림차순 정렬
- ✅ 페이지네이션 - 커스텀 가능한 페이지 크기와 네비게이션
- ✅ 컬럼 설정 - 컬럼 표시/숨김 토글
- ✅ 컬럼 크기 조정 - 마우스 드래그로 컬럼 너비 조정
- ✅ 행 선택 - 체크박스로 단일/다중 행 선택
- ✅ 행 확장 - 더블 클릭으로 추가 정보 표시
- ✅ 가로/세로 스크롤 - 토글 가능한 스크롤 설정
- ✅ 다크 모드 - 다크/라이트 테마 지원
- ✅ 커스텀 렌더링 - 셀 데이터 커스텀 렌더링
- ✅ 반응형 디자인 - 모바일 지원

## 설치

```bash
# npm 사용시
npm install datatable-component

# yarn 사용시
yarn add datatable-component
```

## 사용 방법

```jsx
import { DataTable } from 'datatable-component';

// 데이터 예시
const users = [
  {
    id: 1,
    name: '김철수',
    email: 'kim@example.com',
    role: '관리자',
    status: 'active',
  },
  // 더 많은 데이터...
];

// 컬럼 정의
const columns = [
  {
    key: 'id',
    header: 'ID',
    width: 80,
    sortable: true,
    resizable: true,
  },
  {
    key: 'name',
    header: '이름',
    sortable: true,
    filterable: true,
    resizable: true,
  },
  {
    key: 'email',
    header: '이메일',
    sortable: true,
    filterable: true,
    resizable: true,
  },
  {
    key: 'status',
    header: '상태',
    sortable: true,
    filterable: true,
    customRenderer: (user) => (
      <span className={`status-badge status-${user.status}`}>
        {user.status === 'active' ? '활성' : '비활성'}
      </span>
    ),
  },
];

function App() {
  // 선택된 사용자 처리
  const handleSelectionChange = (selectedUsers) => {
    console.log('Selected users:', selectedUsers);
  };

  // 행 클릭 처리
  const handleRowClick = (user) => {
    console.log('Row clicked:', user);
  };

  return (
    <div className="container">
      <h1>사용자 관리</h1>

      <DataTable
        data={users}
        columns={columns}
        uniqueKey="id"
        pagination={true}
        itemsPerPage={10}
        itemsPerPageOptions={[5, 10, 25, 50]}
        maxHeight="500px"
        selectable={true}
        onSelectionChange={handleSelectionChange}
        onRowClick={handleRowClick}
        expandableRows={true}
        expandedRowRenderer={(user) => (
          <div className="expanded-content">
            <h3>{user.name} 상세 정보</h3>
            <p>이메일: {user.email}</p>
            <p>역할: {user.role}</p>
          </div>
        )}
        darkMode={false}
      />
    </div>
  );
}
```

## 속성 (Props)

| 속성 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `data` | `T[]` | (필수) | 테이블에 표시할 데이터 배열 |
| `columns` | `TableColumn<T>[]` | (필수) | 테이블 컬럼 설정 배열 |
| `uniqueKey` | `keyof T` | (필수) | 각 행을 식별하는 고유 키 |
| `pagination` | `boolean` | `true` | 페이지네이션 사용 여부 |
| `itemsPerPage` | `number` | `10` | 페이지당 표시할 항목 수 |
| `itemsPerPageOptions` | `number[]` | `[5, 10, 25, 50, 100]` | 페이지당 항목 수 선택 옵션 |
| `maxHeight` | `string` | `undefined` | 테이블 최대 높이 (스크롤 생성) |
| `selectable` | `boolean` | `false` | 행 선택 체크박스 표시 여부 |
| `onSelectionChange` | `(selectedItems: T[]) => void` | `undefined` | 선택된 항목이 변경될 때 호출되는 함수 |
| `onRowClick` | `(item: T) => void` | `undefined` | 행 클릭 시 호출되는 함수 |
| `onRowDoubleClick` | `(item: T) => void` | `undefined` | 행 더블 클릭 시 호출되는 함수 |
| `expandableRows` | `boolean` | `false` | 행 확장 기능 사용 여부 |
| `expandedRowRenderer` | `(item: T) => ReactNode` | `undefined` | 확장된 행 콘텐츠 렌더링 함수 |
| `className` | `string` | `''` | 테이블 컨테이너에 추가할 CSS 클래스 |
| `rowClassName` | `string \| ((item: T) => string)` | `''` | 행에 추가할 CSS 클래스 |
| `fixed` | `boolean` | `false` | 테이블 레이아웃 고정 여부 |
| `darkMode` | `boolean` | `false` | 다크 모드 사용 여부 |
| `initialHorizontalScroll` | `boolean` | `true` | 초기 가로 스크롤 활성화 여부 |
| `initialVerticalScroll` | `boolean` | `true` | 초기 세로 스크롤 활성화 여부 |
| `customStyles` | `object` | `{}` | 테이블 각 부분의 스타일 커스터마이징 |

## 컬럼 설정

각 컬럼은 다음 속성을 가질 수 있습니다:

| 속성 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `key` | `string` | (필수) | 데이터 객체의 속성명 |
| `header` | `string` | (필수) | 컬럼 헤더 텍스트 |
| `visible` | `boolean` | `true` | 컬럼 표시 여부 |
| `width` | `string \| number` | `undefined` | 컬럼 너비 |
| `sortable` | `boolean` | `false` | 정렬 가능 여부 |
| `filterable` | `boolean` | `false` | 필터링 가능 여부 |
| `customRenderer` | `(item: T, key: string) => ReactNode` | `undefined` | 커스텀 셀 렌더링 함수 |
| `resizable` | `boolean` | `false` | 크기 조정 가능 여부 |

## 스타일 커스터마이징

`customStyles` 속성을 통해 테이블의 다양한 부분을 스타일링할 수 있습니다:

```jsx
const customStyles = {
  table: 'rounded-xl overflow-hidden',
  header: 'text-sm',
  headerCell: 'font-semibold',
  row: 'transition-colors duration-150',
  cell: 'align-middle',
  footer: 'bg-gray-50',
  pagination: 'font-medium'
};

<DataTable
  // ...다른 속성들...
  customStyles={customStyles}
/>
```

## 파일 구조

이 컴포넌트 라이브러리는 다음과 같은 파일 구조로 구성되어 있습니다:

```
src/
├── DataTable/
│   ├── index.ts           - 진입점
│   ├── DataTable.tsx      - 메인 컴포넌트
│   ├── components.tsx     - 하위 컴포넌트 모음
│   ├── hooks.ts           - 비즈니스 로직 (커스텀 훅)
│   ├── styles.ts          - 스타일 유틸리티 함수
│   └── types.ts           - TypeScript 타입 정의
```

## 확장 및 사용자 정의

DataTable 컴포넌트는 다양한 방식으로 확장하고 사용자 정의할 수 있습니다:

### 커스텀 셀 렌더링

`customRenderer` 속성을 사용하여 각 셀의 렌더링 방식을 커스터마이징할 수 있습니다:

```jsx
const columns = [
  {
    key: 'status',
    header: '상태',
    customRenderer: (user) => (
      <Badge color={user.status === 'active' ? 'green' : 'red'}>
        {user.status === 'active' ? '활성' : '비활성'}
      </Badge>
    ),
  },
  {
    key: 'actions',
    header: '작업',
    customRenderer: (user) => (
      <div className="flex space-x-2">
        <button onClick={() => handleEdit(user)}>편집</button>
        <button onClick={() => handleDelete(user)}>삭제</button>
      </div>
    ),
  },
];
```

### 동적 행 스타일링

`rowClassName` 함수를 사용하여 데이터에 따라 행 스타일을 동적으로 적용할 수 있습니다:

```jsx
<DataTable
  // ...다른 속성들...
  rowClassName={(user) => {
    if (user.status === 'inactive') return 'opacity-60';
    if (user.role === 'admin') return 'bg-yellow-50';
    return '';
  }}
/>
```

### 확장된 행 콘텐츠

`expandableRows`와 `expandedRowRenderer` 속성을 사용하여 행을 확장하고 추가 정보를 표시할 수 있습니다:

```jsx
<DataTable
  // ...다른 속성들...
  expandableRows={true}
  expandedRowRenderer={(user) => (
    <div className="p-4 grid grid-cols-2 gap-4">
      <div>
        <h3 className="text-lg font-bold">프로필 정보</h3>
        <p>가입일: {new Date(user.createdAt).toLocaleDateString()}</p>
        <p>최근 활동: {new Date(user.lastActivity).toLocaleDateString()}</p>
      </div>
      <div>
        <h3 className="text-lg font-bold">통계</h3>
        <p>작성 게시물: {user.postCount}</p>
        <p>댓글: {user.commentCount}</p>
      </div>
    </div>
  )}
/>
```

## 성능 최적화

큰 데이터셋을 다룰 때 성능을 최적화하기 위한 몇 가지 팁:

- 필요한 컬럼만 표시하도록 설정
- 데이터가 매우 많은 경우 서버 측 필터링, 정렬, 페이지네이션 구현 고려
- 불필요한 컬럼의 `filterable`과 `sortable` 속성을 `false`로 설정
- `maxHeight` 속성을 설정하여 수직 스크롤 활성화

## 접근성

이 컴포넌트는 다음과 같은 접근성 기능을 제공합니다:

- 키보드 탐색 지원
- ARIA 속성 적용
- 고대비 모드 지원 (다크/라이트 테마)
- 스크린 리더 호환성

## 더 많은 예제

다양한 사용 사례에 대한 더 많은 예제는 [예제 폴더](./examples)를 참조하세요.

## 라이선스

MIT 라이선스로 배포됩니다. 자세한 내용은 [LICENSE](./LICENSE) 파일을 참조하세요.
