// app/src/pages/documents/DocumentDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Edit, Download, Share, Trash2, ArrowLeft } from 'lucide-react';
import PageTitle from '../../layouts/components/common/PageTitle';
import { getDocumentById, Document } from '@ds/core';
import { formatDate } from '@ds/utils';
import styles from './DocumentDetail.module.scss';

const DocumentDetail: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [document, setDocument] = useState<Document | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadDocument = () => {
            if (!id) {
                setError(t('documents.notFound'));
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const doc = getDocumentById(id);
                if (!doc) {
                    setError(t('documents.notFound'));
                } else {
                    setDocument(doc);
                    setError(null);
                }
            } catch (err) {
                console.error('Error loading document:', err);
                setError(t('documents.loadError'));
            } finally {
                setIsLoading(false);
            }
        };

        loadDocument();
    }, [id, t]);

    if (isLoading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>{t('common.loading')}</p>
            </div>
        );
    }

    if (error || !document) {
        return (
            <div className={styles.error}>
                <h2>{error || t('documents.notFound')}</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate('/documents')}
                >
                    <ArrowLeft size={16} className="mr-2" />
                    {t('documents.backToList')}
                </button>
            </div>
        );
    }

    return (
        <div className={styles.documentDetail}>
            <PageTitle
                title={document.title}
                showBreadcrumbs={true}
                actions={
                    <div className={styles.actions}>
                        <button className="btn btn-outline">
                            <Download size={16} className="mr-2" />
                            {t('common.download')}
                        </button>
                        <button className="btn btn-outline">
                            <Share size={16} className="mr-2" />
                            {t('common.share')}
                        </button>
                        <button className="btn btn-primary">
                            <Edit size={16} className="mr-2" />
                            {t('common.edit')}
                        </button>
                    </div>
                }
            />

            <div className={styles.documentMeta}>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>{t('documents.status')}</span>
                    <span className={`${styles.status} ${styles[document.status || 'draft']}`}>
            {document.status || 'draft'}
          </span>
                </div>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>{t('documents.createdAt')}</span>
                    {formatDate(document.createdAt)}
                </div>
                <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>{t('documents.updatedAt')}</span>
                    {formatDate(document.updatedAt)}
                </div>
                {document.tags && document.tags.length > 0 && (
                    <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>{t('documents.tags')}</span>
                        <div className={styles.tags}>
                            {document.tags.map(tag => (
                                <span key={tag} className={styles.tag}>{tag}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.documentContent}>
                <div className={styles.content}>
                    {document.content}
                </div>
            </div>

            <div className={styles.documentFooter}>
                <button className={`btn btn-outline ${styles.dangerButton}`}>
                    <Trash2 size={16} className="mr-2" />
                    {t('common.delete')}
                </button>
            </div>
        </div>
    );
};

export default DocumentDetail;