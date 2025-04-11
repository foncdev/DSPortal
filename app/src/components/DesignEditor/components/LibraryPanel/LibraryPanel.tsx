// src/components/DesignEditor/LibraryPanel/LibraryPanel.tsx
import React, { useState } from 'react';
import {
    Upload,
    Search,
    Plus,
    ChevronDown,
    ChevronRight,
    Layout,
    Image as ImageIcon,
    Square,
    Circle,
    Triangle,
    Type
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDesignEditor, ObjectType } from '../../context/DesignEditorContext';
import styles from './LibraryPanel.module.scss';

interface LibraryPanelProps {
    className?: string;
}

// Library categories
interface LibraryCategory {
    id: string;
    name: string;
    icon: React.ReactNode;
    items: LibraryItem[];
    expanded?: boolean;
}

// Library item
interface LibraryItem {
    id: string;
    name: string;
    type: ObjectType;
    thumbnail: string;
    properties: any;
}

const LibraryPanel: React.FC<LibraryPanelProps> = ({ className }) => {
    const { t } = useTranslation();
    const { addObject } = useDesignEditor();
    const [searchTerm, setSearchTerm] = useState('');

    // Sample placeholder images for our library
    const placeholderImages = [
        '/api/placeholder/200/200?text=Image+1',
        '/api/placeholder/200/200?text=Image+2',
        '/api/placeholder/200/200?text=Image+3',
        '/api/placeholder/200/200?text=Image+4'
    ];

    // Initial categories
    const [categories, setCategories] = useState<LibraryCategory[]>([
        {
            id: 'shapes',
            name: t('editor.shapes'),
            icon: <Square size={16} />,
            expanded: true,
            items: [
                {
                    id: 'rect1',
                    name: 'Square',
                    type: 'rectangle',
                    thumbnail: '/api/placeholder/100/100?text=Square',
                    properties: { width: 100, height: 100, fill: '#3b82f6' }
                },
                {
                    id: 'rect2',
                    name: 'Rectangle',
                    type: 'rectangle',
                    thumbnail: '/api/placeholder/120/80?text=Rectangle',
                    properties: { width: 150, height: 100, fill: '#10b981' }
                },
                {
                    id: 'circle1',
                    name: 'Circle',
                    type: 'circle',
                    thumbnail: '/api/placeholder/100/100?text=Circle',
                    properties: { radius: 50, fill: '#f59e0b' }
                },
                {
                    id: 'triangle1',
                    name: 'Triangle',
                    type: 'triangle',
                    thumbnail: '/api/placeholder/100/100?text=Triangle',
                    properties: { width: 100, height: 100, fill: '#ef4444' }
                }
            ]
        },
        {
            id: 'text',
            name: t('editor.textStyles'),
            icon: <Type size={16} />,
            expanded: false,
            items: [
                {
                    id: 'heading',
                    name: 'Heading',
                    type: 'text',
                    thumbnail: '/api/placeholder/120/80?text=Heading',
                    properties: {
                        text: 'Heading',
                        fontSize: 32,
                        fontWeight: 'bold',
                        fontFamily: 'Arial'
                    }
                },
                {
                    id: 'subheading',
                    name: 'Subheading',
                    type: 'text',
                    thumbnail: '/api/placeholder/120/80?text=Subheading',
                    properties: {
                        text: 'Subheading',
                        fontSize: 24,
                        fontWeight: 'normal',
                        fontFamily: 'Arial'
                    }
                },
                {
                    id: 'paragraph',
                    name: 'Paragraph',
                    type: 'text',
                    thumbnail: '/api/placeholder/120/80?text=Paragraph',
                    properties: {
                        text: 'This is a sample paragraph text. Click to edit.',
                        fontSize: 16,
                        fontWeight: 'normal',
                        fontFamily: 'Arial'
                    }
                }
            ]
        },
        {
            id: 'images',
            name: t('editor.images'),
            icon: <ImageIcon size={16} />,
            expanded: false,
            items: placeholderImages.map((url, index) => ({
                id: `image${index}`,
                name: `Placeholder ${index + 1}`,
                type: 'image' as ObjectType,
                thumbnail: url,
                properties: { src: url }
            }))
        },
        {
            id: 'templates',
            name: t('editor.templates'),
            icon: <Layout size={16} />,
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
        addObject(item.type, item.properties);
    };

    // Handle file upload to add images to the library
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) {return;}

        const newItems: LibraryItem[] = [];
        const reader = new FileReader();

        // Process uploaded files
        const processFile = (index: number) => {
            if (index >= files.length) {
                // All files processed, update the images category
                setCategories(categories.map(category => {
                    if (category.id === 'images') {
                        return {
                            ...category,
                            items: [...category.items, ...newItems],
                            expanded: true
                        };
                    }
                    return category;
                }));
                return;
            }

            const file = files[index];

            // Skip non-image files
            if (!file.type.startsWith('image/')) {
                processFile(index + 1);
                return;
            }

            reader.onload = (e) => {
                const src = e.target?.result as string;

                newItems.push({
                    id: `upload-${Date.now()}-${index}`,
                    name: file.name,
                    type: 'image',
                    thumbnail: src,
                    properties: { src }
                });

                // Process next file
                processFile(index + 1);
            };

            reader.readAsDataURL(file);
        };

        // Start processing files
        processFile(0);
    };

    // Handle creating a new collection/category
    const handleCreateCollection = () => {
        const collectionName = prompt(t('editor.enterCollectionName'));
        if (!collectionName) {return;}

        const newCategory: LibraryCategory = {
            id: `custom-${Date.now()}`,
            name: collectionName,
            icon: <Folder size={16} />,
            expanded: true,
            items: []
        };

        setCategories([...categories, newCategory]);
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
                                <span className={styles.categoryIcon}>{category.icon}</span>
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

                <button className={styles.createCollectionButton} onClick={handleCreateCollection}>
                    <Plus size={16} />
                    <span>{t('editor.newCollection')}</span>
                </button>
            </div>
        </div>
    );
};

// Import necessary icon
const Folder = (props: any) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={props.size || 24}
        height={props.size || 24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
    </svg>
);

export default LibraryPanel;