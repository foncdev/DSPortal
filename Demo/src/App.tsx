import { useState, useEffect } from 'react';
import { getDocuments, User, Document } from '@ds/core';
import { truncateText } from '@ds/utils';
import './App.css';

function App(): JSX.Element {
    const [users, setUsers] = useState<User[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

    useEffect(() => {
        // 사용자 데이터 로드
        setUsers([]);

        // 문서 데이터 로드
        const documentData = getDocuments();
        setDocuments(documentData);
    }, []);

    const handleSelectDocument = (doc: Document): void => {
        setSelectedDocument(doc);
    };

    const handleKeyDown = (event: React.KeyboardEvent, doc: Document): void => {
        if (event.key === 'Enter' || event.key === ' ') {
            setSelectedDocument(doc);
        }
    };

    return (
        <div className="app">
            <header className="app-header">
                <h1>문서 관리 시스템</h1>
                <div className="user-info">
                    {users.length > 0 && (
                        <span>
                          로그인 사용자: {users[0].name} ({users[0].email})
                        </span>
                    )}
                </div>
            </header>

            <main className="app-content">
                <div className="document-list">
                    <h2>문서 목록</h2>
                    {documents.map(doc => (
                        <div
                            key={doc.id}
                            className={`document-item ${selectedDocument?.id === doc.id ? 'selected' : ''}`}
                            onClick={() => handleSelectDocument(doc)}
                            onKeyDown={(e) => handleKeyDown(e, doc)}
                            tabIndex={0}
                            role="button"
                            aria-pressed={selectedDocument?.id === doc.id}
                        >
                            <h3>{doc.title}</h3>
                            <p>{truncateText(doc.content, 50)}</p>
                        </div>
                    ))}
                </div>

                <div className="document-viewer">
                    {selectedDocument ? (
                        <>
                            <h2>{selectedDocument.title}</h2>
                            <div className="document-content">
                                {selectedDocument.content}
                            </div>
                        </>
                    ) : (
                        <div className="empty-state">
                            왼쪽 목록에서 문서를 선택하세요.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default App;