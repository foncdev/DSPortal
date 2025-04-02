// Demo/cypress/e2e/document-management.cy.ts
describe('문서 관리 시스템 E2E 테스트', () => {
beforeEach(() => {
// 각 테스트 전에 애플리케이션 방문
cy.visit('/');

    // 모의 API 요청 인터셉트 (필요한 경우)
    cy.intercept('GET', '/api/documents', { fixture: 'documents.json' }).as('getDocuments');
    cy.intercept('POST', '/api/documents', { statusCode: 201, body: { success: true } }).as('createDocument');
    cy.intercept('PUT', '/api/documents/*', { statusCode: 200, body: { success: true } }).as('updateDocument');
    cy.intercept('DELETE', '/api/documents/*', { statusCode: 200, body: { success: true } }).as('deleteDocument');
});

it('문서 목록이 표시되어야 함', () => {
// 문서 목록 로딩 대기
cy.wait('@getDocuments');

    // 문서 목록 확인
    cy.get('.document-list').should('be.visible');
    cy.get('.document-item').should('have.length.at.least', 2);
    cy.get('.document-item').first().should('contain', '테스트 문서');
});

it('문서를 선택하면 내용이 표시되어야 함', () => {
// 문서 목록 로딩 대기
cy.wait('@getDocuments');

    // 첫 번째 문서 선택
    cy.get('.document-item').first().click();
    
    // 문서 내용이 표시되는지 확인
    cy.get('.document-viewer').should('be.visible');
    cy.get('.document-viewer h2').should('be.visible');
    cy.get('.document-content').should('be.visible');
});

it('새 문서를 생성할 수 있어야 함', () => {
// 문서 목록 로딩 대기
cy.wait('@getDocuments');

    // 새 문서 버튼 클릭
    cy.get('button').contains('새 문서').click();
    
    // 문서 생성 폼 확인
    cy.get('form').should('be.visible');
    
    // 폼 입력
    cy.get('input[name="title"]').type('E2E 테스트 문서');
    cy.get('textarea[name="content"]').type('이 문서는 E2E 테스트로 생성되었습니다.');
    cy.get('input[name="tags"]').type('e2e,테스트');
    
    // 저장 버튼 클릭
    cy.get('button').contains('저장').click();
    
    // API 요청 확인
    cy.wait('@createDocument');
    
    // 성공 메시지 확인
    cy.get('.toast').should('be.visible').and('contain', '문서가 생성되었습니다');
    
    // 새 문서가 목록에 추가되었는지 확인
    cy.get('.document-item').should('contain', 'E2E 테스트 문서');
});

it('문서를 편집할 수 있어야 함', () => {
// 문서 목록 로딩 대기
cy.wait('@getDocuments');

    // 첫 번째 문서 선택
    cy.get('.document-item').first().click();
    
    // 편집 버튼 클릭
    cy.get('button').contains('편집').click();
    
    // 편집 폼 확인
    cy.get('form').should('be.visible');
    
    // 내용 수정
    cy.get('input[name="title"]').clear().type('수정된 문서 제목');
    cy.get('textarea[name="content"]').clear().type('이 내용은 E2E 테스트에서 수정되었습니다.');
    
    // 저장 버튼 클릭
    cy.get('button').contains('저장').click();
    
    // API 요청 확인
    cy.wait('@updateDocument');
    
    // 성공 메시지 확인
    cy.get('.toast').should('be.visible').and('contain', '문서가 업데이트되었습니다');
    
    // 수정된 내용이 표시되는지 확인
    cy.get('.document-viewer h2').should('contain', '수정된 문서 제목');
    cy.get('.document-content').should('contain', '이 내용은 E2E 테스트에서 수정되었습니다');
});

it('문서를 삭제할 수 있어야 함', () => {
// 문서 목록 로딩 대기
cy.wait('@getDocuments');

    // 첫 번째 문서 선택
    cy.get('.document-item').first().click();
    
    // 삭제 버튼 클릭
    cy.get('button').contains('삭제').click();
    
    // 확인 대화상자 확인
    cy.get('.dialog').should('be.visible').and('contain', '이 문서를 삭제하시겠습니까?');
    
    // 확인 버튼 클릭
    cy.get('.dialog button').contains('확인').click();
    
    // API 요청 확인
    cy.wait('@deleteDocument');
    
    // 성공 메시지 확인
    cy.get('.toast').should('be.visible').and('contain', '문서가 삭제되었습니다');
    
    // 문서가 목록에서 사라졌는지 확인
    cy.get('.document-item').should('have.length', cy.get('.document-item').length - 1);
});

it('문서를 검색할 수 있어야 함', () => {
// 문서 목록 로딩 대기
cy.wait('@getDocuments');

    // 검색어 입력
    cy.get('input[placeholder="문서 검색..."]').type('테스트');
    cy.get('input[placeholder="문서 검색..."]').type('{enter}');
    
    // 검색 결과 확인
    cy.get('.document-item').should('contain', '테스트');
    
    // 검색어 지우기
    cy.get('input[placeholder="문서 검색..."]').clear();
    cy.get('input[placeholder="문서 검색..."]').type('{enter}');
    
    // 모든 문서가 다시 표시되는지 확인
    cy.get('.document-item').should('have.length.at.least', 2);
});
});

// Demo/cypress/fixtures/documents.json
[
{
"id": "doc1",
"title": "테스트 문서 1",
"content": "테스트 문서 1의 내용입니다.",
"createdBy": "user1",
"createdAt": "2023-01-01T00:00:00.000Z",
"updatedAt": "2023-01-01T00:00:00.000Z",
"status": "published",
"tags": ["테스트", "문서"]
},
{
"id": "doc2",
"title": "개발 가이드",
"content": "개발 프로세스 가이드라인 문서입니다.",
"createdBy": "user1",
"createdAt": "2023-01-02T00:00:00.000Z",
"updatedAt": "2023-01-02T00:00:00.000Z",
"status": "published",
"tags": ["가이드", "개발"]
},
{
"id": "doc3",
"title": "API 명세서",
"content": "백엔드 API 명세를 기술합니다.",
"createdBy": "user2",
"createdAt": "2023-01-03T00:00:00.000Z",
"updatedAt": "2023-01-03T00:00:00.000Z",
"status": "draft",
"tags": ["API", "백엔드"]
}
]

// Demo/cypress.config.ts
import { defineConfig } from 'cypress';

export default defineConfig({
e2e: {
baseUrl: 'http://localhost:3000',
supportFile: 'cypress/support/e2e.ts',
viewportWidth: 1280,
viewportHeight: 720,
video: false,
screenshotOnRunFailure: true,
experimentalStudio: true
},
component: {
devServer: {
framework: 'react',
bundler: 'vite'
}
}
});