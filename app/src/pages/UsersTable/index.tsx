import React from 'react';
import { DataTable } from '@/components/DataTable';

// 데이터 예시
const users = [
  { id: 1, name: '김철수', email: 'kim1@example.com', role: '관리자', status: 'active' },
  { id: 2, name: '홍길동', email: 'hong2@example.com', role: '사용자', status: 'inactive' },
  { id: 3, name: '이영희', email: 'lee3@example.com', role: '관리자', status: 'active' },
  { id: 4, name: '박민수', email: 'park4@example.com', role: '사용자', status: 'active' },
  { id: 5, name: '최지우', email: 'choi5@example.com', role: '관리자', status: 'inactive' },
  { id: 6, name: '정우성', email: 'jung6@example.com', role: '사용자', status: 'active' },
  { id: 7, name: '강호동', email: 'kang7@example.com', role: '관리자', status: 'active' },
  { id: 8, name: '하하준', email: 'ha8@example.com', role: '사용자', status: 'inactive' },
  { id: 9, name: '윤도현', email: 'yoon9@example.com', role: '관리자', status: 'active' },
  { id: 10, name: '장나라', email: 'jang10@example.com', role: '사용자', status: 'active' },
  { id: 11, name: '서강준', email: 'seo11@example.com', role: '관리자', status: 'inactive' },
  { id: 12, name: '노홍철', email: 'noh12@example.com', role: '사용자', status: 'active' },
  { id: 13, name: '문근영', email: 'moon13@example.com', role: '관리자', status: 'active' },
  { id: 14, name: '신세경', email: 'shin14@example.com', role: '사용자', status: 'inactive' },
  { id: 15, name: '배수지', email: 'bae15@example.com', role: '관리자', status: 'active' },
  { id: 16, name: '유재석', email: 'yoo16@example.com', role: '사용자', status: 'active' },
  { id: 17, name: '김종국', email: 'kim17@example.com', role: '관리자', status: 'inactive' },
  { id: 18, name: '이광수', email: 'lee18@example.com', role: '사용자', status: 'active' },
  { id: 19, name: '송지효', email: 'song19@example.com', role: '관리자', status: 'active' },
  { id: 20, name: '차은우', email: 'cha20@example.com', role: '사용자', status: 'inactive' },
  { id: 21, name: '공유', email: 'gong21@example.com', role: '관리자', status: 'active' },
  { id: 22, name: '조인성', email: 'jo22@example.com', role: '사용자', status: 'active' },
  { id: 23, name: '한지민', email: 'han23@example.com', role: '관리자', status: 'inactive' },
  { id: 24, name: '이준기', email: 'lee24@example.com', role: '사용자', status: 'active' },
  { id: 25, name: '김혜수', email: 'kim25@example.com', role: '관리자', status: 'active' },
  { id: 26, name: '서현진', email: 'seo26@example.com', role: '사용자', status: 'inactive' },
  { id: 27, name: '정해인', email: 'jung27@example.com', role: '관리자', status: 'active' },
  { id: 28, name: '김소현', email: 'kim28@example.com', role: '사용자', status: 'active' },
  { id: 29, name: '류준열', email: 'ryu29@example.com', role: '관리자', status: 'inactive' },
  { id: 30, name: '박보검', email: 'park30@example.com', role: '사용자', status: 'active' },
  { id: 31, name: '정지훈', email: 'jung31@example.com', role: '관리자', status: 'active' },
  { id: 32, name: '이성경', email: 'lee32@example.com', role: '사용자', status: 'inactive' },
  { id: 33, name: '손예진', email: 'son33@example.com', role: '관리자', status: 'active' },
  { id: 34, name: '김태희', email: 'kim34@example.com', role: '사용자', status: 'active' },
  { id: 35, name: '송강호', email: 'song35@example.com', role: '관리자', status: 'inactive' },
  { id: 36, name: '하정우', email: 'ha36@example.com', role: '사용자', status: 'active' },
  { id: 37, name: '김우빈', email: 'kim37@example.com', role: '관리자', status: 'active' },
  { id: 38, name: '유아인', email: 'yoo38@example.com', role: '사용자', status: 'inactive' },
  { id: 39, name: '이병헌', email: 'lee39@example.com', role: '관리자', status: 'active' },
  { id: 40, name: '전지현', email: 'jeon40@example.com', role: '사용자', status: 'active' },
  { id: 41, name: '박신혜', email: 'park41@example.com', role: '관리자', status: 'inactive' },
  { id: 42, name: '정유미', email: 'jung42@example.com', role: '사용자', status: 'active' },
  { id: 43, name: '김남길', email: 'kim43@example.com', role: '관리자', status: 'active' },
  { id: 44, name: '한가인', email: 'han44@example.com', role: '사용자', status: 'inactive' },
  { id: 45, name: '이준호', email: 'lee45@example.com', role: '관리자', status: 'active' },
  { id: 46, name: '장동건', email: 'jang46@example.com', role: '사용자', status: 'active' },
  { id: 47, name: '원빈', email: 'won47@example.com', role: '관리자', status: 'inactive' },
  { id: 48, name: '수지', email: 'suzy48@example.com', role: '사용자', status: 'active' },
  { id: 49, name: '이선균', email: 'lee49@example.com', role: '관리자', status: 'active' },
  { id: 50, name: '엄정화', email: 'um50@example.com', role: '사용자', status: 'inactive' }
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
    hideOnMobile: true,
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

const customStyles = {
  table: 'rounded-xl overflow-hidden',
  header: 'text-sm',
  headerCell: 'font-semibold',
  row: 'transition-colors duration-150',
  cell: 'align-middle',
  footer: 'bg-gray-50',
  pagination: 'font-medium',
};

const UsersTable: React.FC = () => {
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
        customStyles={customStyles}
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
};

export default UsersTable;
