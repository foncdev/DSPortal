// src/components/DesignEditor/FileManagerPanel/FileManagerPanel.tsx
import React, { useState, useEffect } from 'react';
import {
    Folder,
    File,
    Image as ImageIcon,
    Video,
    Type,
    Layout,
    Search,
    Plus,
    Upload,
    ChevronDown,
    ChevronRight,
    ChevronUp
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styles from './FileManagerPanel.module.scss';

// 컴포넌트 유형 정의
export type ComponentType = 'image' | 'video' | 'text' | 'layout' | 'folder';

// 컴포넌트 인터페이스
export interface Component {
    id: string;
    name: string;
    type: ComponentType;
    url?: string;
    thumbnail?: string;
    content?: string;
    children?: Component[];
    parentId?: string;
    width?: number;
    height?: number;
    backgroundColor?: string;
}

// 카테고리 인터페이스
export interface Category {
    id: string;
    name: string;
    expanded: boolean;
    items: Component[];
}

interface FileManagerPanelProps {
    onAddComponent?: (component: Component) => void;
}

const FileManagerPanel: React.FC<FileManagerPanelProps> = ({ onAddComponent }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [newComponentModal, setNewComponentModal] = useState(false);
    const [newComponentType, setNewComponentType] = useState<ComponentType>('text');
    const [newComponentName, setNewComponentName] = useState('');
    const [newComponentContent, setNewComponentContent] = useState('');

    // 샘플 컴포넌트 데이터 로드
    useEffect(() => {
        const sampleComponents: Component[] = [
            {
                id: 'img1',
                name: 'Banner Image',
                type: 'image',
                url: '/api/placeholder/800/200?text=Banner+Image',
                thumbnail: '/api/placeholder/120/80?text=Banner'
            },
            {
                id: 'img2',
                name: 'Logo Image',
                type: 'image',
                url: '/api/placeholder/200/200?text=Logo',
                thumbnail: '/api/placeholder/120/80?text=Logo'
            },
            {
                id: 'vid1',
                name: 'Product Video',
                type: 'video',
                url: '/api/placeholder/320/240?text=Product+Video',
                thumbnail: '/api/placeholder/120/80?text=Video'
            },
            {
                id: 'text1',
                name: 'Welcome Text',
                type: 'text',
                content: 'Welcome to our website!'
            },
            {
                id: 'text2',
                name: 'Copyright Text',
                type: 'text',
                content: '© 2025 Your Company. All rights reserved.'
            },
            {
                id: 'layout1',
                name: 'Header Layout',
                type: 'layout',
                width: 800,
                height: 100,
                backgroundColor: '#f0f0f0',
                children: [
                    {
                        id: 'layout1_1',
                        name: 'Header Title',
                        type: 'text',
                        content: 'Header Title'
                    }
                ]
            },
            {
                id: 'layout2',
                name: 'Footer Layout',
                type: 'layout',
                width: 800,
                height: 100,
                backgroundColor: '#e0e0e0',
                children: [
                    {
                        id: 'layout2_1',
                        name: 'Footer Text',
                        type: 'text',
                        content: 'Footer Information'
                    }
                ]
            }
        ];

        // 컴포넌트 유형별 카테고리 생성
        const imageComponents = sampleComponents.filter(c => c.type === 'image');
        const videoComponents = sampleComponents.filter(c => c.type === 'video');
        const textComponents = sampleComponents.filter(c => c.type === 'text');
        const layoutComponents = sampleComponents.filter(c => c.type === 'layout');

        // 카테고리 설정
        setCategories([
            {
                id: 'image-components',
                name: t('editor.images'),
                expanded: true,
                items: imageComponents
            },
            {
                id: 'video-components',
                name: 'Videos',
                expanded: false,
                items: videoComponents
            },
            {
                id: 'text-components',
                name: 'Text Elements',
                expanded: false,
                items: textComponents
            },
            {
                id: 'layout-components',
                name: t('editor.layoutElements'),
                expanded: false,
                items: layoutComponents
            }
        ]);
    }, [t]);

    // 카테고리 확장/축소 토글
    const toggleCategory = (categoryId: string) => {
        setCategories(prevCategories =>
            prevCategories.map(category =>
                category.id === categoryId
                    ? { ...category, expanded: !category.expanded }
                    : category
            )
        );
    };

    // 컴포넌트 추가 (캔버스에)
    const handleAddComponent = (component: Component) => {
        if (onAddComponent) {
            onAddComponent(component);
        }
    };

    // 컴포넌트 미리보기
    const handlePreviewComponent = (component: Component) => {
        setSelectedComponent(component);
        setShowPreview(true);
    };

    // 컴포넌트 유형에 따른 아이콘 렌더링
    const renderComponentIcon = (type: ComponentType) => {
        switch (type) {
            case 'image':
                return <ImageIcon size={16} />;
            case 'video':
                return <Video size={16} />;
            case 'text':
                return <Type size={16} />;
            case 'layout':
                return <Layout size={16} />;
            case 'folder':
                return <Folder size={16} />;
            default:
                return <File size={16} />;
        }
    };

    // 검색어에 따른 필터링된 카테고리 가져오기
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

    // 새 컴포넌트 추가 모달 열기
    const openNewComponentModal = (type: ComponentType) => {
        setNewComponentType(type);
        setNewComponentName(`New ${type.charAt(0).toUpperCase() + type.slice(1)}`);
        setNewComponentContent('');
        setNewComponentModal(true);
    };

    // 새 컴포넌트 생성 및 추가
    const handleCreateNewComponent = () => {
        if (!newComponentName.trim()) return;

        const newComponent: Component = {
            id: `comp_${Date.now()}`,
            name: newComponentName,
            type: newComponentType,
        };

        // 컴포넌트 유형에 따른 추가 속성 설정
        if (newComponentType === 'text') {
            newComponent.content = newComponentContent || 'Sample Text';
        } else if (newComponentType === 'image') {
            newComponent.url = '/api/placeholder/400/300?text=' + encodeURIComponent(newComponentName);
            newComponent.thumbnail = '/api/placeholder/120/80?text=' + encodeURIComponent(newComponentName);
        } else if (newComponentType === 'video') {
            newComponent.url = '/api/placeholder/400/300?text=' + encodeURIComponent(newComponentName);
            newComponent.thumbnail = '/api/placeholder/120/80?text=' + encodeURIComponent(newComponentName);
        } else if (newComponentType === 'layout') {
            newComponent.width = 500;
            newComponent.height = 300;
            newComponent.backgroundColor = '#f0f0f0';
            newComponent.children = [];
        }

        // 해당 카테고리에 새 컴포넌트 추가
        setCategories(prevCategories =>
            prevCategories.map(category => {
                if (
                    (newComponentType === 'image' && category.id === 'image-components') ||
                    (newComponentType === 'video' && category.id === 'video-components') ||
                    (newComponentType === 'text' && category.id === 'text-components') ||
                    (newComponentType === 'layout' && category.id === 'layout-components')
                ) {
                    return {
                        ...category,
                        expanded: true,
                        items: [...category.items, newComponent]
                    };
                }
                return category;
            })
        );

        // 모달 닫기
        setNewComponentModal(false);
    };

    // 컴포넌트 파일 업로드 처리
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        Array.from(files).forEach(file => {
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');

            if (!isImage && !isVideo) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const fileUrl = e.target?.result as string;

                const newComponent: Component = {
                    id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    name: file.name,
                    type: isImage ? 'image' : 'video',
                    url: fileUrl,
                    thumbnail: isImage ? fileUrl : '/api/placeholder/120/80?text=' + encodeURIComponent(file.name)
                };

                // 해당 카테고리에 새 컴포넌트 추가
                setCategories(prevCategories =>
                    prevCategories.map(category => {
                        if ((isImage && category.id === 'image-components') ||
                            (isVideo && category.id === 'video-components')) {
                            return {
                                ...category,
                                expanded: true,
                                items: [...category.items, newComponent]
                            };
                        }
                        return category;
                    })
                );
            };
            reader.readAsDataURL(file);
        });
    };

    const filteredCategories = getFilteredCategories();

    return (
        <div className={styles.fileManagerPanel}>
            {/* 검색 바 */}
            <div className={styles.searchBar}>
                <div className={styles.searchInput}>
                    <Search size={16} className={styles.searchIcon} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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

            {/* 컴포넌트 목록 */}
            <div className={styles.componentsList}>
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
                                        <div className={styles.componentsGrid}>
                                            {category.items.map(component => (
                                                <div key={component.id} className={styles.componentItem}>
                                                    <div
                                                        className={styles.componentThumbnail}
                                                        onClick={() => handlePreviewComponent(component)}
                                                    >
                                                        {component.thumbnail ? (
                                                            <img src={component.thumbnail} alt={component.name} />
                                                        ) : (
                                                            <div className={styles.componentIcon}>
                                                                {renderComponentIcon(component.type)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className={styles.componentInfo}>
                                                        <div className={styles.componentName}>{component.name}</div>
                                                        <button
                                                            className={styles.addButton}
                                                            onClick={() => handleAddComponent(component)}
                                                            title={t('editor.addComponent')}
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
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

            {/* 액션 버튼 - 새 컴포넌트 추가, 파일 업로드 등 */}
            <div className={styles.actionButtons}>
                <input
                    type="file"
                    id="fileUpload"
                    multiple
                    accept="image/*,video/*"
                    className={styles.fileInput}
                    onChange={handleFileUpload}
                />
                <label htmlFor="fileUpload" className={styles.uploadButton}>
                    <Upload size={16} />
                    <span>{t('editor.uploadToLibrary')}</span>
                </label>

                <div className={styles.newComponentButtons}>
                    <button
                        className={styles.newComponentButton}
                        onClick={() => openNewComponentModal('text')}
                    >
                        <Type size={16} />
                        <span>Text</span>
                    </button>
                    <button
                        className={styles.newComponentButton}
                        onClick={() => openNewComponentModal('layout')}
                    >
                        <Layout size={16} />
                        <span>Layout</span>
                    </button>
                </div>
            </div>

            {/* 컴포넌트 미리보기 모달 */}
            {showPreview && selectedComponent && (
                <div className={styles.previewOverlay} onClick={() => setShowPreview(false)}>
                    <div className={styles.previewModal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.previewHeader}>
                            <h3>{selectedComponent.name}</h3>
                            <button onClick={() => setShowPreview(false)}>×</button>
                        </div>

                        <div className={styles.previewContent}>
                            {selectedComponent.type === 'image' && selectedComponent.url && (
                                <img src={selectedComponent.url} alt={selectedComponent.name} className={styles.previewImage} />
                            )}
                            {selectedComponent.type === 'video' && selectedComponent.url && (
                                <div className={styles.previewVideo}>
                                    <div className={styles.videoPlaceholder}>
                                        <Video size={48} />
                                        <span>Video Preview</span>
                                    </div>
                                </div>
                            )}
                            {selectedComponent.type === 'text' && (
                                <div className={styles.previewText}>
                                    {selectedComponent.content || 'Text Content'}
                                </div>
                            )}
                            {selectedComponent.type === 'layout' && (
                                <div
                                    className={styles.previewLayout}
                                    style={{
                                        width: `${selectedComponent.width || 500}px`,
                                        height: `${selectedComponent.height || 300}px`,
                                        backgroundColor: selectedComponent.backgroundColor || '#f0f0f0'
                                    }}
                                >
                                    <div className={styles.layoutLabel}>
                                        Layout: {selectedComponent.name}
                                    </div>
                                    {selectedComponent.children && selectedComponent.children.length > 0 && (
                                        <div className={styles.layoutChildren}>
                                            {selectedComponent.children.length} child elements
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className={styles.previewActions}>
                            <button
                                className={styles.addToCanvasButton}
                                onClick={() => {
                                    handleAddComponent(selectedComponent);
                                    setShowPreview(false);
                                }}
                            >
                                <Plus size={16} />
                                <span>{t('editor.addComponent')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 새 컴포넌트 생성 모달 */}
            {newComponentModal && (
                <div className={styles.modalOverlay} onClick={() => setNewComponentModal(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Create New {newComponentType.charAt(0).toUpperCase() + newComponentType.slice(1)}</h3>
                            <button onClick={() => setNewComponentModal(false)}>×</button>
                        </div>

                        <div className={styles.modalContent}>
                            <div className={styles.formGroup}>
                                <label>Name:</label>
                                <input
                                    type="text"
                                    value={newComponentName}
                                    onChange={(e) => setNewComponentName(e.target.value)}
                                    placeholder="Component name"
                                />
                            </div>

                            {newComponentType === 'text' && (
                                <div className={styles.formGroup}>
                                    <label>Content:</label>
                                    <textarea
                                        value={newComponentContent}
                                        onChange={(e) => setNewComponentContent(e.target.value)}
                                        placeholder="Enter text content..."
                                        rows={4}
                                    />
                                </div>
                            )}
                        </div>

                        <div className={styles.modalActions}>
                            <button
                                className={styles.cancelButton}
                                onClick={() => setNewComponentModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.createButton}
                                onClick={handleCreateNewComponent}
                                disabled={!newComponentName.trim()}
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileManagerPanel;