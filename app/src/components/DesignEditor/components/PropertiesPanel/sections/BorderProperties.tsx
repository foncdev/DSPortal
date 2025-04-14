import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sliders } from 'lucide-react';
import PropertySection from '../PropertySection';
import { PropertyPanelProps } from '../types';
import styles from '../PropertiesPanel.module.scss';
import ColorInput from '../controls/ColorInput';

/**
 * Border properties section that applies to all object types
 */
const BorderProperties: React.FC<PropertyPanelProps> = ({ object, updateProperty }) => {
    const { t } = useTranslation();

    return (
        <PropertySection title={t('editor.border')} icon={<Sliders size={16} />} defaultExpanded={false}>
            <div className={styles.propertyGroup}>
                <div className={styles.propertyRow}>
                    <label>{t('editor.borderColor')}</label>
                    <ColorInput
                        value={object.stroke || '#000000'}
                        onChange={(value) => updateProperty('stroke', value)}
                    />
                </div>
                <div className={styles.propertyRow}>
                    <label>{t('editor.borderWidth')}</label>
                    <input
                        type="number"
                        min="0"
                        max="20"
                        value={object.strokeWidth || 0}
                        onChange={(e) => updateProperty('strokeWidth', parseInt(e.target.value))}
                    />
                </div>
                {object.stroke && object.strokeWidth > 0 && (
                    <div className={styles.propertyRow}>
                        <label>{t('editor.borderStyle')}</label>
                        <select
                            value={object.strokeDashArray ? 'dashed' : 'solid'}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === 'dashed') {
                                    updateProperty('strokeDashArray', [5, 5]);
                                } else {
                                    updateProperty('strokeDashArray', null);
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
};

export default BorderProperties;