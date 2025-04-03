// app/src/pages/documents/DocumentList.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
    FileText,
    Search,
    Plus,
    Filter,
    RefreshCw,
    Download,
    MoreVertical
} from 'lucide-react';
import PageTitle from '../../layouts/components/common/PageTitle';
import { getDocuments, Document } from '@ds/core';
import { formatDate, truncateText } from '@ds/utils';
import styles from './DocumentList.module.scss';

const DocumentList: React.FC = () => {
    const { t } = useTranslation();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Load documents
    useEffect(() => {
        const loadDocuments = () => {
            setIsLoading(true);
            try {
                // In a real app, you might want to add pagination
                const docs = getDocuments();
                setDocuments(docs);
            } catch (error) {
                console.error('Error loading documents:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadDocuments();
    }, []);

    // Filter documents based on search query
    const filteredDocuments = searchQuery.trim() === ''
        ? documents
        : documents.filter(doc =>
            doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.content.toLowerCase().includes(searchQuery.toLowerCase())
        );

    return (
        <div className={styles.documentList}>
            <PageTitle
                title={t('documents.title')}
                description={t('documents.description')}
                actions={
                    <Link to="/documents/create" className="btn btn-primary">
                        <Plus size={16} className="mr-2" />
                        {t('documents.createNew')}
                    </Link>
                }
            />

            <div className={styles.controls}>
                <div className={styles.searchContainer}>
                    <div className={styles.searchInput}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder={t('documents.search')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.search}
                        />
                        {searchQuery && (
                            <button
                                className={styles.clearSearch}
                                onClick={() => setSearchQuery('')}
                                aria-label={t('common.clear')}
                            >
                                &times;
                            </button>
                        )}
                    </div>
                    <button className="btn btn-outline">
                        <Filter size={16} className="mr-2" />
                        {t('common.filter')}
                    </button>
                    <button className="btn btn-outline" onClick={() => window.location.reload()}>
                        <RefreshCw size={16} className="mr-2" />
                        {t('common.refresh')}
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>{t('common.loading')}</p>
                </div>
            ) : filteredDocuments.length === 0 ? (
                <div className={styles.empty}>
                    {searchQuery ? (
                        <>
                            <p>{t('documents.noResults')}</p>
                            <button
                                className="btn btn-outline"
                                onClick={() => setSearchQuery('')}
                            >
                                {t('documents.clearSearch')}
                            </button>
                        </>
                    ) : (
                        <>
                            <p>{t('documents.noDocuments')}</p>
                            <Link to="/documents/create" className="btn btn-primary">
                                {t('documents.createFirst')}
                            </Link>
                        </>
                    )}
                </div>
            ) : (
                <div className={styles.table}>
                    <table>
                        <thead>
                        <tr>
                            <th>{t('documents.name')}</th>
                            <th>{t('documents.createdAt')}</th>
                            <th>{t('documents.updatedAt')}</th>
                            <th>{t('documents.status')}</th>
                            <th>{t('documents.tags')}</th>
                            <th className={styles.actions}>{t('common.actions')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredDocuments.map(doc => (
                            <tr key={doc.id}>
                                <td>
                                    <div className={styles.documentName}>
                                        <div className={styles.documentIcon}>
                                            <FileText size={18} />
                                        </div>
                                        <div className={styles.documentTitle}>
                                            <Link to={`/documents/${doc.id}`}>
                                                {doc.title}
                                            </Link>
                                            <div className={styles.documentPreview}>
                                                {truncateText(doc.content, 60)}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>{formatDate(doc.createdAt)}</td>
                                <td>{formatDate(doc.updatedAt)}</td>
                                <td>
                    <span className={`${styles.status} ${styles[doc.status || 'draft']}`}>
                      {doc.status || 'draft'}
                    </span>
                                </td>
                                <td>
                                    <div className={styles.tags}>
                                        {doc.tags?.map(tag => (
                                            <span key={tag} className={styles.tag}>{tag}</span>
                                        ))}
                                    </div>
                                </td>
                                <td className={styles.actions}>
                                    <div className={styles.actionButtons}>
                                        <button
                                            className={styles.actionButton}
                                            title={t('common.download')}
                                        >
                                            <Download size={16} />
                                        </button>
                                        <div className={styles.dropdown}>
                                            <button className={styles.dropdownToggle}>
                                                <MoreVertical size={16} />
                                            </button>
                                            <div className={styles.dropdownMenu}>
                                                <Link
                                                    to={`/documents/${doc.id}`}
                                                    className={styles.dropdownItem}
                                                >
                                                    {t('common.view')}
                                                </Link>
                                                <Link
                                                    to={`/documents/${doc.id}/edit`}
                                                    className={styles.dropdownItem}
                                                >
                                                    {t('common.edit')}
                                                </Link>
                                                <button className={styles.dropdownItem}>
                                                    {t('common.share')}
                                                </button>
                                                <button className={`${styles.dropdownItem} ${styles.danger}`}>
                                                    {t('common.delete')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DocumentList;