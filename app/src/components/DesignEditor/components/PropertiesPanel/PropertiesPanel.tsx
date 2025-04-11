// src/components/DesignEditor/components/PropertiesPanel/PropertiesPanel.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Type, Palette, Move, Sliders, ImageIcon, SquareIcon } from 'lucide-react';
import { useDesignEditor, FabricObjectWithId } from '../../context/DesignEditorContext';
import styles from './PropertiesPanel.module.scss';

interface PropertiesPanelProps {
    className?: string;
}

// Property Section component for grouping properties
interface PropertySectionProps {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    defaultExpanded?: boolean;
}

/**
 * Section component for grouping properties in the properties panel
 */
const PropertySection: React.FC<PropertySectionProps> = ({
                                                             title,
                                                             icon,
                                                             children,
                                                             defaultExpanded = true
                                                         }) => {
    const [expanded, setExpanded] = React.useState(defaultExpanded);

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
    const { selectedObject, updateObjectProperty, canvas } = useDesignEditor();

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
    const handlePropertyChange = <T extends unknown>(property: string, value: T) => {
        updateObjectProperty(property, value);

        if (canvas) {
            canvas.renderAll();
        }
    };

    // Get object type
    const getObjectType = (obj: FabricObjectWithId) => {
        if (obj.objectType) {return obj.objectType;}

        if (obj.type === 'textbox' || obj.type === 'text') {return 'text';}
        if (obj.type === 'image') {return 'image';}
        if (obj.type === 'rect') {return 'rectangle';}
        if (obj.type === 'circle') {return 'circle';}
        if (obj.type === 'triangle') {return 'triangle';}

        return obj.type || 'unknown';
    };

    const objectType = getObjectType(selectedObject);

    // Render different property sections based on object type
    const renderPropertySections = () => {
        const sections = [];

        // Common properties for all objects (name)
        sections.push(
            <PropertySection key="common" title={t('editor.commonProperties')} icon={<Settings size={16} />}>
                <div className={styles.propertyGroup}>
                    <div className={styles.propertyRow}>
                        <label>{t('editor.name')}</label>
                        <input
                            type="text"
                            value={selectedObject.name || ''}
                            onChange={(e) => handlePropertyChange('name', e.target.value)}
                        />
                    </div>
                </div>
            </PropertySection>
        );

        // Position and size properties for all objects
        sections.push(
            <PropertySection key="position" title={t('editor.positionProperties')} icon={<Move size={16} />}>
                <div className={styles.propertyGroup}>
                    <div className={styles.propertyGrid}>
                        <div>
                            <label>X</label>
                            <input
                                type="number"
                                value={Math.round(selectedObject.left || 0)}
                                onChange={(e) => handlePropertyChange('left', parseInt(e.target.value))}
                            />
                        </div>
                        <div>
                            <label>Y</label>
                            <input
                                type="number"
                                value={Math.round(selectedObject.top || 0)}
                                onChange={(e) => handlePropertyChange('top', parseInt(e.target.value))}
                            />
                        </div>
                    </div>

                    {(objectType !== 'circle') && (
                        <div className={styles.propertyGrid}>
                            <div>
                                <label>{t('editor.width')}</label>
                                <input
                                    type="number"
                                    value={Math.round(selectedObject.width || 0)}
                                    onChange={(e) => handlePropertyChange('width', parseInt(e.target.value))}
                                />
                            </div>
                            <div>
                                <label>{t('editor.height')}</label>
                                <input
                                    type="number"
                                    value={Math.round(selectedObject.height || 0)}
                                    onChange={(e) => handlePropertyChange('height', parseInt(e.target.value))}
                                />
                            </div>
                        </div>
                    )}

                    <div className={styles.propertyRow}>
                        <label>{t('editor.angle')}</label>
                        <div className={styles.rangeWithValue}>
                            <input
                                type="range"
                                min="0"
                                max="360"
                                value={Math.round(selectedObject.angle || 0)}
                                onChange={(e) => handlePropertyChange('angle', parseInt(e.target.value))}
                            />
                            <input
                                type="number"
                                min="0"
                                max="360"
                                value={Math.round(selectedObject.angle || 0)}
                                onChange={(e) => handlePropertyChange('angle', parseInt(e.target.value))}
                            />
                        </div>
                    </div>
                </div>
            </PropertySection>
        );

        // Object-specific properties
        switch (objectType) {
            case 'text':
                sections.push(
                    <PropertySection key="text" title={t('editor.textProperties')} icon={<Type size={16} />}>
                        <div className={styles.propertyGroup}>
                            <div className={styles.propertyRow}>
                                <label>{t('editor.text')}</label>
                                <textarea
                                    value={selectedObject.text || ''}
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
                                        value={selectedObject.fontSize || 24}
                                        onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value))}
                                    />
                                    <input
                                        type="number"
                                        value={selectedObject.fontSize || 24}
                                        onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value))}
                                        min="8"
                                        max="72"
                                    />
                                </div>
                            </div>
                            <div className={styles.propertyRow}>
                                <label>{t('editor.fontFamily')}</label>
                                <select
                                    value={selectedObject.fontFamily || 'Arial'}
                                    onChange={(e) => handlePropertyChange('fontFamily', e.target.value)}
                                >
                                    <option value="Arial">Arial</option>
                                    <option value="Helvetica">Helvetica</option>
                                    <option value="Times New Roman">Times New Roman</option>
                                    <option value="Courier New">Courier New</option>
                                    <option value="Georgia">Georgia</option>
                                    <option value="Verdana">Verdana</option>
                                    <option value="Tahoma">Tahoma</option>
                                </select>
                            </div>
                            <div className={styles.propertyRow}>
                                <label>{t('editor.textAlign')}</label>
                                <select
                                    value={selectedObject.textAlign || 'left'}
                                    onChange={(e) => handlePropertyChange('textAlign', e.target.value)}
                                >
                                    <option value="left">Left</option>
                                    <option value="center">Center</option>
                                    <option value="right">Right</option>
                                    <option value="justify">Justify</option>
                                </select>
                            </div>
                            <div className={styles.propertyRow}>
                                <label>{t('editor.color')}</label>
                                <input
                                    type="color"
                                    value={selectedObject.fill || '#000000'}
                                    onChange={(e) => handlePropertyChange('fill', e.target.value)}
                                />
                            </div>
                            <div className={styles.propertyGrid}>
                                <div>
                                    <label>{t('editor.bold')}</label>
                                    <input
                                        type="checkbox"
                                        checked={selectedObject.fontWeight === 'bold'}
                                        onChange={(e) => handlePropertyChange('fontWeight', e.target.checked ? 'bold' : 'normal')}
                                    />
                                </div>
                                <div>
                                    <label>{t('editor.italic')}</label>
                                    <input
                                        type="checkbox"
                                        checked={selectedObject.fontStyle === 'italic'}
                                        onChange={(e) => handlePropertyChange('fontStyle', e.target.checked ? 'italic' : 'normal')}
                                    />
                                </div>
                                <div>
                                    <label>{t('editor.underline')}</label>
                                    <input
                                        type="checkbox"
                                        checked={selectedObject.underline}
                                        onChange={(e) => handlePropertyChange('underline', e.target.checked)}
                                    />
                                </div>
                            </div>
                        </div>
                    </PropertySection>
                );
                break;

            case 'image':
                sections.push(
                    <PropertySection key="image" title={t('editor.imageProperties')} icon={<ImageIcon size={16} />}>
                        <div className={styles.propertyGroup}>
                            {selectedObject.src && (
                                <div className={styles.propertyRow}>
                                    <label>{t('editor.imagePreview')}</label>
                                    <div className={styles.imagePreview}>
                                        <img src={selectedObject.src} alt="Preview" />
                                    </div>
                                </div>
                            )}
                            <div className={styles.propertyRow}>
                                <label>{t('editor.opacity')}</label>
                                <div className={styles.rangeWithValue}>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={selectedObject.opacity || 1}
                                        onChange={(e) => handlePropertyChange('opacity', parseFloat(e.target.value))}
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={selectedObject.opacity || 1}
                                        onChange={(e) => handlePropertyChange('opacity', parseFloat(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>
                    </PropertySection>
                );
                break;

            case 'rectangle':
                sections.push(
                    <PropertySection key="rectangle" title={t('editor.shapeProperties')} icon={<SquareIcon size={16} />}>
                        <div className={styles.propertyGroup}>
                            <div className={styles.propertyRow}>
                                <label>{t('editor.color')}</label>
                                <input
                                    type="color"
                                    value={selectedObject.fill || '#cccccc'}
                                    onChange={(e) => handlePropertyChange('fill', e.target.value)}
                                />
                            </div>
                            <div className={styles.propertyRow}>
                                <label>{t('editor.borderRadius')}</label>
                                <div className={styles.rangeWithValue}>
                                    <input
                                        type="range"
                                        min="0"
                                        max="50"
                                        value={selectedObject.rx || 0}
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value);
                                            handlePropertyChange('rx', value);
                                            handlePropertyChange('ry', value);
                                        }}
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        max="50"
                                        value={selectedObject.rx || 0}
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value);
                                            handlePropertyChange('rx', value);
                                            handlePropertyChange('ry', value);
                                        }}
                                    />
                                </div>
                            </div>
                            <div className={styles.propertyRow}>
                                <label>{t('editor.opacity')}</label>
                                <div className={styles.rangeWithValue}>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={selectedObject.opacity || 1}
                                        onChange={(e) => handlePropertyChange('opacity', parseFloat(e.target.value))}
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={selectedObject.opacity || 1}
                                        onChange={(e) => handlePropertyChange('opacity', parseFloat(e.target.value))}
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
                                    value={selectedObject.radius || 50}
                                    onChange={(e) => handlePropertyChange('radius', parseInt(e.target.value))}
                                />
                            </div>
                            <div className={styles.propertyRow}>
                                <label>{t('editor.color')}</label>
                                <input
                                    type="color"
                                    value={selectedObject.fill || '#cccccc'}
                                    onChange={(e) => handlePropertyChange('fill', e.target.value)}
                                />
                            </div>
                            <div className={styles.propertyRow}>
                                <label>{t('editor.opacity')}</label>
                                <div className={styles.rangeWithValue}>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={selectedObject.opacity || 1}
                                        onChange={(e) => handlePropertyChange('opacity', parseFloat(e.target.value))}
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={selectedObject.opacity || 1}
                                        onChange={(e) => handlePropertyChange('opacity', parseFloat(e.target.value))}
                                    />
                                </div>
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
                                <label>{t('editor.color')}</label>
                                <input
                                    type="color"
                                    value={selectedObject.fill || '#cccccc'}
                                    onChange={(e) => handlePropertyChange('fill', e.target.value)}
                                />
                            </div>
                            <div className={styles.propertyRow}>
                                <label>{t('editor.opacity')}</label>
                                <div className={styles.rangeWithValue}>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={selectedObject.opacity || 1}
                                        onChange={(e) => handlePropertyChange('opacity', parseFloat(e.target.value))}
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={selectedObject.opacity || 1}
                                        onChange={(e) => handlePropertyChange('opacity', parseFloat(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>
                    </PropertySection>
                );
                break;

            default:
                // For other object types
                sections.push(
                    <PropertySection key="appearance" title={t('editor.appearance')} icon={<Palette size={16} />}>
                        <div className={styles.propertyGroup}>
                            <div className={styles.propertyRow}>
                                <label>{t('editor.color')}</label>
                                <input
                                    type="color"
                                    value={selectedObject.fill || '#cccccc'}
                                    onChange={(e) => handlePropertyChange('fill', e.target.value)}
                                />
                            </div>
                            <div className={styles.propertyRow}>
                                <label>{t('editor.opacity')}</label>
                                <div className={styles.rangeWithValue}>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={selectedObject.opacity || 1}
                                        onChange={(e) => handlePropertyChange('opacity', parseFloat(e.target.value))}
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={selectedObject.opacity || 1}
                                        onChange={(e) => handlePropertyChange('opacity', parseFloat(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>
                    </PropertySection>
                );
                break;
        }

        // Border properties for all objects
        sections.push(
            <PropertySection key="border" title={t('editor.border')} icon={<Sliders size={16} />} defaultExpanded={false}>
                <div className={styles.propertyGroup}>
                    <div className={styles.propertyRow}>
                        <label>{t('editor.borderColor')}</label>
                        <input
                            type="color"
                            value={selectedObject.stroke || '#000000'}
                            onChange={(e) => handlePropertyChange('stroke', e.target.value)}
                        />
                    </div>
                    <div className={styles.propertyRow}>
                        <label>{t('editor.borderWidth')}</label>
                        <input
                            type="number"
                            min="0"
                            max="20"
                            value={selectedObject.strokeWidth || 0}
                            onChange={(e) => handlePropertyChange('strokeWidth', parseInt(e.target.value))}
                        />
                    </div>
                    {selectedObject.stroke && selectedObject.strokeWidth > 0 && (
                        <div className={styles.propertyRow}>
                            <label>{t('editor.borderStyle')}</label>
                            <select
                                value={selectedObject.strokeDashArray ? 'dashed' : 'solid'}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === 'dashed') {
                                        handlePropertyChange('strokeDashArray', [5, 5]);
                                    } else {
                                        handlePropertyChange('strokeDashArray', null);
                                    }
                                }}
                            >
                                <option value="solid">Solid</option>
                                <option value="dashed">Dashed</option>
                            </select>
                        </div>
                    )}
                </div>
            </PropertySection>
        );

        return sections;
    };

    return (
        <div className={`${styles.propertiesPanel} ${className || ''}`}>
            <div className={styles.header}>
                <h3>{selectedObject.name || getObjectType(selectedObject)}</h3>
                <div className={styles.objectType}>{getObjectType(selectedObject)}</div>
            </div>
            <div className={styles.propertiesContent}>
                {renderPropertySections()}
            </div>
        </div>
    );
};

export default PropertiesPanel;