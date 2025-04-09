// src/components/DesignEditor/LibraryPanel/LibraryPanel.tsx
import React, { useState } from 'react';
import {
    Upload,
    Search,
    Grid,
    Plus,
    ChevronDown,
    ChevronRight,
    Layout
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styles from './LibraryPanel.module.scss';

interface LibraryPanelProps {
    className?: string;
}

// Library categories
interface LibraryCategory {
    id: string;
    name: string;
    items: LibraryItem[];
    expanded?: boolean;
}

// Library item
interface LibraryItem {
    id: string;
    name: string;
    type: 'text' | 'shape' | 'image' | 'template';
    thumbnail: string;
    properties: any;
}

const LibraryPanel: React.FC<LibraryPanelProps> = ({ className }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState<LibraryCategory[]>([
        {
            id: 'templates',
            name: t('editor.templates'),
            expanded: true,
            items: [
                {
                    id: 'temp1',
                    name: 'Social Media Post',
                    type: 'template',
                    thumbnail: '/api/placeholder/120/80',
                    properties: {}
                },
                {
                    id: 'temp2',
                    name: 'Banner',
                    type: 'template',
                    thumbnail: '/api/placeholder/120/80',
                    properties: {}
                },
            ]
        },
        {
            id: 'shapes',
            name: t('editor.shapes'),
            expanded: false,
            items: [
                {
                    id: 'shape1',
                    name: 'Basic Shapes',
                    type: 'shape',
                    thumbnail: '/api/placeholder/120/80',
                    properties: {}
                }
            ]
        },
        {
            id: 'images',
            name: t('editor.images'),
            expanded: false,
            items: []
        }
    ]);

    // Toggle category expanded state
    const toggleCategory = (categoryId: string) => {
        setCategories(categories.map(category =>
            category.id === categoryId
                ? { ...category, expanded: !category.expanded }
                : category
        ));
    };

    // Filter items based on search term
    const getFilteredCategories = () => {
        if (!searchTerm.trim()) {
            return categories;
        }

        return categories
            .map(category => ({
                ...category,
                items: category.items.filter(item =>
                    item.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
            }))
            .filter(category => category.items.length > 0);
    };

    // Add item to canvas
    const addItemToCanvas = (item: LibraryItem) => {
        // This would be implemented via the DesignEditorContext
        console.log('Add item to canvas:', item);
    };

    // Handle file upload
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        // This would be implemented to upload files to the library
        console.log('Files selected:', e.target.files);
    };

    const filteredCategories = getFilteredCategories();

    return (
        <div className={`${styles.libraryPanel} ${className || ''}`}>
            {/* Search bar */}
            <div className={styles.searchBar}>
                <div className={styles.searchInput}>
                    <Search size={16} className={styles.searchIcon} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder={t('editor.searchLibrary')}
                    />
                    {searchTerm && (
                        <button
                            className={styles.clearSearch}
                            onClick={() => setSearchTerm('')}
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>

            {/* Library content */}
            <div className={styles.libraryContent}>
                {filteredCategories.length === 0 ? (
                    <div className={styles.emptyState}>
                        {t('editor.noLibraryItems')}
                    </div>
                ) : (
                    filteredCategories.map(category => (
                        <div key={category.id} className={styles.category}>
                            <div
                                className={styles.categoryHeader}
                                onClick={() => toggleCategory(category.id)}
                            >
                                {category.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                <Layout size={16} className={styles.categoryIcon} />
                                <span className={styles.categoryName}>{category.name}</span>
                                <span className={styles.itemCount}>{category.items.length}</span>
                            </div>

                            {category.expanded && (
                                <div className={styles.categoryContent}>
                                    {category.items.length === 0 ? (
                                        <div className={styles.emptyCategoryMessage}>
                                            {t('editor.categoryEmpty')}
                                        </div>
                                    ) : (
                                        <div className={styles.itemsGrid}>
                                            {category.items.map(item => (
                                                <div
                                                    key={item.id}
                                                    className={styles.libraryItem}
                                                    onClick={() => addItemToCanvas(item)}
                                                >
                                                    <div className={styles.thumbnail}>
                                                        <img src={item.thumbnail} alt={item.name} />
                                                    </div>
                                                    <div className={styles.itemName}>{item.name}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Upload button */}
            <div className={styles.uploadSection}>
                <input
                    type="file"
                    id="libraryUpload"
                    className={styles.fileInput}
                    onChange={handleFileUpload}
                    multiple
                    accept="image/*"
                />
                <label htmlFor="libraryUpload" className={styles.uploadButton}>
                    <Upload size={16} />
                    <span>{t('editor.uploadToLibrary')}</span>
                </label>

                <button className={styles.createCollectionButton}>
                    <Plus size={16} />
                    <span>{t('editor.newCollection')}</span>
                </button>
            </div>
        </div>
    );
};

export default LibraryPanel;