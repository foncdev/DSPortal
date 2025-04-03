// app/src/pages/documents/DocumentCreate.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Save, X, Plus, Minus } from 'lucide-react';
import PageTitle from '../../layouts/components/common/PageTitle';
import { createDocument, authManager } from '@ds/core';
import styles from './DocumentCreate.module.scss';

const DocumentCreate: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Form state
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState<'draft' | 'published'>('draft');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Add tag to the list
    const addTag = () => {
        if (!tagInput.trim()) return;
        if (!tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
        }
        setTagInput('');
    };

    // Remove tag from the list
    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    // Handle tag input key press
    const handleTagKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            setError(t('documents.titleRequired'));
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const user = authManager.getCurrentUser();
            if (!user) {
                throw new Error(t('auth.notAuthenticated'));
            }

            const newDocument = createDocument({
                title: title.trim(),
                content: content.trim(),
                createdBy: user.id,
                status,
                tags: tags.length > 0 ? tags : undefined
            });

            // Navigate to the new document
            navigate(`/documents/${newDocument.id}`);
        } catch (err: any) {
            console.error('Error creating document:', err);
            setError(err.message || t('documents.createError'));
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.documentCreate}>
            <PageTitle
                title={t('documents.createNew')}
                description={t('documents.createDescription')}
                actions={
                    <div className={styles.actions}>
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => navigate('/documents')}
                            disabled={isSubmitting}
                        >
                            <X size={16} className="mr-2" />
                            {t('common.cancel')}
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className={styles.spinner}></span>
                            ) : (
                                <Save size={16} className="mr-2" />
                            )}
                            {t('common.save')}
                        </button>
                    </div>
                }
            />

            {error && (
                <div className={styles.errorMessage}>
                    {error}
                </div>
            )}

            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.formGrid}>
                    <div className={styles.mainSection}>
                        <div className={styles.formGroup}>
                            <label htmlFor="title" className={styles.formLabel}>
                                {t('documents.title')} <span className={styles.required}>*</span>
                            </label>
                            <input
                                id="title"
                                type="text"
                                className={styles.formControl}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={t('documents.titlePlaceholder')}
                                required
                                autoFocus
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="content" className={styles.formLabel}>
                                {t('documents.content')}
                            </label>
                            <textarea
                                id="content"
                                className={`${styles.formControl} ${styles.textarea}`}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder={t('documents.contentPlaceholder')}
                                rows={12}
                            />
                        </div>
                    </div>

                    <div className={styles.sideSection}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>{t('documents.settings')}</h3>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>{t('documents.status')}</label>
                                <div className={styles.toggleGroup}>
                                    <button
                                        type="button"
                                        className={`${styles.toggleButton} ${status === 'draft' ? styles.active : ''}`}
                                        onClick={() => setStatus('draft')}
                                    >
                                        {t('documents.draft')}
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles.toggleButton} ${status === 'published' ? styles.active : ''}`}
                                        onClick={() => setStatus('published')}
                                    >
                                        {t('documents.publish')}
                                    </button>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="tags" className={styles.formLabel}>
                                    {t('documents.tags')}
                                </label>
                                <div className={styles.tagInput}>
                                    <input
                                        id="tags"
                                        type="text"
                                        className={styles.formControl}
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyPress={handleTagKeyPress}
                                        placeholder={t('documents.tagsPlaceholder')}
                                    />
                                    <button
                                        type="button"
                                        className={styles.addTagButton}
                                        onClick={addTag}
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>

                                {tags.length > 0 && (
                                    <div className={styles.tags}>
                                        {tags.map(tag => (
                                            <div key={tag} className={styles.tag}>
                                                <span>{tag}</span>
                                                <button
                                                    type="button"
                                                    className={styles.removeTagButton}
                                                    onClick={() => removeTag(tag)}
                                                >
                                                    <Minus size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default DocumentCreate;