// src/components/DesignEditor/PropertiesPanel/PropertiesPanel.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Type, Palette, Move, Sliders } from 'lucide-react';
import { useDesignEditor, DesignObject } from '../DesignEditorContext';
import styles from './PropertiesPanel.module.scss';

interface PropertiesPanelProps {
    className?: string;
}

// Property Section component for grouping properties
interface PropertySectionProps {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}

const PropertySection: React.FC<PropertySectionProps> = ({ title, icon, children }) => {
    const [expanded, setExpanded] = React.useState(true);

    return (
        <div className={styles.propertySection}>
            <div
                className={styles.sectionHeader}
                onClick={() => setExpanded(!expanded)}
            >
                {icon && <span className={styles.sectionIcon}>{icon}</span>}
                <span className={styles.sectionTitle}>{title}</span>
                <span className={styles.expandIcon}>
          {expanded ? '−' : '+'}
        </span>
            </div>
            {expanded && <div className={styles.sectionContent}>{children}</div>}
        </div>
    );
};

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ className }) => {
    const { t } = useTranslation();
    const { selectedObject, updateObjectProperty } = useDesignEditor();

    if (!selectedObject) {
        return (
            <div className={`${styles.propertiesPanel} ${className || ''}`}>
                <div className={styles.emptyState}>
                    {t('editor.noSelection')}
                </div>
            </div>
        );
    }

    // Handle property changes
    const handlePropertyChange = (property: string, value: any) => {
        updateObjectProperty(selectedObject.id, property, value);
    };

    // Render different property sections based on object type
    const renderPropertySections = () => {
        const sections = [];

        // Common properties for all objects (position, size, etc.)
        sections.push(
            <PropertySection key="common" title={t('editor.commonProperties')} icon={<Settings size={16} />}>
                <div className={styles.propertyGroup}>
                    <div className={styles.propertyRow}>
                        <label>{t('editor.name')}</label>
                        <input
                            type="text"
                            value={selectedObject.name}
                            onChange={(e) => handlePropertyChange('name', e.target.value)}
                        />
                    </div>
                </div>
            </PropertySection>
        );

        // Object-specific properties
        switch (selectedObject.type) {
            case 'text':
                sections.push(
                    <PropertySection key="text" title={t('editor.textProperties')} icon={<Type size={16} />}>
                        <div className={styles.propertyGroup}>
                            <div className={styles.propertyRow}>
                                <label>{t('editor.text')}</label>
                                <textarea
                                    value={selectedObject.properties.text}
                                    onChange={(e) => handlePropertyChange('text', e.target.value)}
                                    rows={3}
                                />
                            </div>
                            <div className={styles.propertyRow}>
                                <label>{t('editor.fontSize')}</label>
                                <div className={styles.rangeWithValue}>
                                    <input
                                        type="range"
                                        min="8"
                                        max="72"
                                        value={selectedObject.properties.fontSize}
                                        onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value))}
                                    />
                                    <input
                                        type="number"
                                        value={selectedObject.properties.fontSize}
                                        onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value))}
                                        min="8"
                                        max="72"
                                    />
                                </div>
                            </div>
                            <div className={styles.propertyRow}>
                                <label>{t('editor.color')}</label>
                                <input
                                    type="color"
                                    value={selectedObject.properties.color}
                                    onChange={(e) => handlePropertyChange('color', e.target.value)}
                                />
                            </div>
                        </div>
                    </PropertySection>
                );
                break;

            case 'image':
                sections.push(
                    <PropertySection key="image" title={t('editor.imageProperties')} icon={<Palette size={16} />}>
                        <div className={styles.propertyGroup}>
                            <div className={styles.propertyRow}>
                                <label>{t('editor.width')}</label>
                                <input
                                    type="number"
                                    value={selectedObject.properties.width}
                                    onChange={(e) => handlePropertyChange('width', parseInt(e.target.value))}
                                />
                            </div>
                            <div className={styles.propertyRow}>
                                <label>{t('editor.height')}</label>
                                <input
                                    type="number"
                                    value={selectedObject.properties.height}
                                    onChange={(e) => handlePropertyChange('height', parseInt(e.target.value))}
                                />
                            </div>
                            <div className={styles.propertyRow}>
                                <label>{t('editor.imagePreview')}</label>
                                <div className={styles.imagePreview}>
                                    <img src={selectedObject.properties.src} alt="Preview" />
                                </div>
                            </div>
                        </div>
                    </PropertySection>
                );
                break;

            case 'rectangle':
                sections.push(
                    <PropertySection key="rectangle" title={t('editor.shapeProperties')} icon={<Sliders size={16} />}>
                        <div className={styles.propertyGroup}>
                            <div className={styles.propertyRow}>
                                <label>{t('editor.width')}</label>
                                <input
                                    type="number"
                                    value={selectedObject.properties.width}
                                    onChange={(e) => handlePropertyChange('width', parseInt(e.target.value))}
                                />
                            </div>
                            <div className={styles.propertyRow}>
                                <label>{t('editor.height')}</label>
                                <input
                                    type="number"
                                    value={selectedObject.properties.height}
                                    onChange={(e) => handlePropertyChange('height', parseInt(e.target.value))}
                                />
                            </div>
                            <div className={styles.propertyRow}>
                                <label>{t('editor.color')}</label>
                                <input
                                    type="color"
                                    value={selectedObject.properties.color}
                                    onChange={(e) => handlePropertyChange('color', e.target.value)}
                                />
                            </div>
                            <div className={styles.propertyRow}>
                                <label>{t('editor.borderRadius')}</label>
                                <div className={styles.rangeWithValue}>
                                    <input
                                        type="range"
                                        min="0"
                                        max="50"
                                        value={selectedObject.properties.radius}
                                        onChange={(e) => handlePropertyChange('radius', parseInt(e.target.value))}
                                    />
                                    <input
                                        type="number"
                                        value={selectedObject.properties.radius}
                                        onChange={(e) => handlePropertyChange('radius', parseInt(e.target.value))}
                                        min="0"
                                        max="50"
                                    />
                                </div>
                            </div>
                        </div>
                    </PropertySection>
                );
                break;

            case 'circle':
                sections.push(
                    <PropertySection key="circle" title={t('editor.shapeProperties')} icon={<Sliders size={16} />}>
                        <div className={styles.propertyGroup}>
                            <div className={styles.propertyRow}>
                                <label>{t('editor.radius')}</label>
                                <input
                                    type="number"
                                    value={selectedObject.properties.radius}
                                    onChange={(e) => handlePropertyChange('radius', parseInt(e.target.value))}
                                />
                            </div>
                            <div className={styles.propertyRow}>
                                <label>{t('editor.color')}</label>
                                <input
                                    type="color"
                                    value={selectedObject.properties.color}
                                    onChange={(e) => handlePropertyChange('color', e.target.value)}
                                />
                            </div>
                        </div>
                    </PropertySection>
                );
                break;

            case 'triangle':
                sections.push(
                    <PropertySection key="triangle" title={t('editor.shapeProperties')} icon={<Sliders size={16} />}>
                        <div className={styles.propertyGroup}>
                            <div className={styles.propertyRow}>
                                <label>{t('editor.width')}</label>
                                <input
                                    type="number"
                                    value={selectedObject.properties.width}
                                    onChange={(e) => handlePropertyChange('width', parseInt(e.target.value))}
                                />
                            </div>
                            <div className={styles.propertyRow}>
                                <label>{t('editor.height')}</label>
                                <input
                                    type="number"
                                    value={selectedObject.properties.height}
                                    onChange={(e) => handlePropertyChange('height', parseInt(e.target.value))}
                                />
                            </div>
                            <div className={styles.propertyRow}>
                                <label>{t('editor.color')}</label>
                                <input
                                    type="color"
                                    value={selectedObject.properties.color}
                                    onChange={(e) => handlePropertyChange('color', e.target.value)}
                                />
                            </div>
                        </div>
                    </PropertySection>
                );
                break;

            case 'video':
                sections.push(
                    <PropertySection key="video" title={t('editor.videoProperties')} icon={<Palette size={16} />}>
                        <div className={styles.propertyGroup}>
                            <div className={styles.propertyRow}>
                                <label>{t('editor.width')}</label>
                                <input
                                    type="number"
                                    value={selectedObject.properties.width}
                                    onChange={(e) => handlePropertyChange('width', parseInt(e.target.value))}
                                />
                            </div>
                            <div className={styles.propertyRow}>
                                <label>{t('editor.height')}</label>
                                <input
                                    type="number"
                                    value={selectedObject.properties.height}
                                    onChange={(e) => handlePropertyChange('height', parseInt(e.target.value))}
                                />
                            </div>
                            <div className={styles.propertyRow}>
                                <label>{t('editor.source')}</label>
                                <input
                                    type="text"
                                    value={selectedObject.properties.src}
                                    onChange={(e) => handlePropertyChange('src', e.target.value)}
                                />
                            </div>
                        </div>
                    </PropertySection>
                );
                break;
        }

        // Position properties for all objects
        sections.push(
            <PropertySection key="position" title={t('editor.positionProperties')} icon={<Move size={16} />}>
                <div className={styles.propertyGroup}>
                    <div className={styles.propertyGrid}>
                        <div>
                            <label>X</label>
                            <input
                                type="number"
                                value={selectedObject.x || 0}
                                onChange={(e) => handlePropertyChange('x', parseInt(e.target.value))}
                            />
                        </div>
                        <div>
                            <label>Y</label>
                            <input
                                type="number"
                                value={selectedObject.y || 0}
                                onChange={(e) => handlePropertyChange('y', parseInt(e.target.value))}
                            />
                        </div>
                    </div>
                </div>
            </PropertySection>
        );

        return sections;
    };

    return (
        <div className={`${styles.propertiesPanel} ${className || ''}`}>
            <div className={styles.header}>
                <h3>{selectedObject.name}</h3>
                <div className={styles.objectType}>{selectedObject.type}</div>
            </div>
            <div className={styles.propertiesContent}>
                {renderPropertySections()}
            </div>
        </div>
    );
};

export default PropertiesPanel;