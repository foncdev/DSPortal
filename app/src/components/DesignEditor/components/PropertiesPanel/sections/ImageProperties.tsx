import React from 'react';
import { useTranslation } from 'react-i18next';
import { ImageIcon } from 'lucide-react';
import PropertySection from '../PropertySection';
import { PropertyPanelProps } from '../types';
import styles from '../PropertiesPanel.module.scss';

/**
 * Image-specific properties section
 */
const ImageProperties: React.FC<PropertyPanelProps> = ({ object, updateProperty }) => {
    const { t } = useTranslation();

    return (
        <PropertySection title={t('editor.imageProperties')} icon={<ImageIcon size={16} />}>
            <div className={styles.propertyGroup}>
                {object.src && (
                    <div className={styles.propertyRow}>
                        <label>{t('editor.imagePreview')}</label>
                        <div className={styles.imagePreview}>
                            <img src={object.src} alt="Preview" />
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
                            value={object.opacity || 1}
                            onChange={(e) => updateProperty('opacity', parseFloat(e.target.value))}
                        />
                        <input
                            type="number"
                            min="0"
                            max="1"
                            step="0.01"
                            value={object.opacity || 1}
                            onChange={(e) => updateProperty('opacity', parseFloat(e.target.value))}
                        />
                    </div>
                </div>
            </div>
        </PropertySection>
    );
};

export default ImageProperties;