import React from 'react';
import { useTranslation } from 'react-i18next';
import { Type } from 'lucide-react';
import PropertySection from '../PropertySection';
import { PropertyPanelProps } from '../types';
import styles from '../PropertiesPanel.module.scss';
import ColorInput from '../controls/ColorInput';

/**
 * Text-specific properties section
 */
const TextProperties: React.FC<PropertyPanelProps> = ({ object, updateProperty }) => {
    const { t } = useTranslation();

    return (
        <PropertySection title={t('editor.textProperties')} icon={<Type size={16} />}>
            <div className={styles.propertyGroup}>
                <div className={styles.propertyRow}>
                    <label>{t('editor.text')}</label>
                    <textarea
                        value={object.text || ''}
                        onChange={(e) => updateProperty('text', e.target.value)}
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
                            value={object.fontSize || 24}
                            onChange={(e) => updateProperty('fontSize', parseInt(e.target.value))}
                        />
                        <input
                            type="number"
                            value={object.fontSize || 24}
                            onChange={(e) => updateProperty('fontSize', parseInt(e.target.value))}
                            min="8"
                            max="72"
                        />
                    </div>
                </div>
                <div className={styles.propertyRow}>
                    <label>{t('editor.fontFamily')}</label>
                    <select
                        value={object.fontFamily || 'Arial'}
                        onChange={(e) => updateProperty('fontFamily', e.target.value)}
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
                        value={object.textAlign || 'left'}
                        onChange={(e) => updateProperty('textAlign', e.target.value)}
                    >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                        <option value="justify">Justify</option>
                    </select>
                </div>
                <div className={styles.propertyRow}>
                    <label>{t('editor.color')}</label>
                    <ColorInput
                        value={object.fill || '#000000'}
                        onChange={(value) => updateProperty('fill', value)}
                    />
                </div>
                <div className={styles.propertyGrid}>
                    <div>
                        <label>{t('editor.bold')}</label>
                        <input
                            type="checkbox"
                            checked={object.fontWeight === 'bold'}
                            onChange={(e) => updateProperty('fontWeight', e.target.checked ? 'bold' : 'normal')}
                        />
                    </div>
                    <div>
                        <label>{t('editor.italic')}</label>
                        <input
                            type="checkbox"
                            checked={object.fontStyle === 'italic'}
                            onChange={(e) => updateProperty('fontStyle', e.target.checked ? 'italic' : 'normal')}
                        />
                    </div>
                    <div>
                        <label>{t('editor.underline')}</label>
                        <input
                            type="checkbox"
                            checked={object.underline}
                            onChange={(e) => updateProperty('underline', e.target.checked)}
                        />
                    </div>
                </div>
            </div>
        </PropertySection>
    );
};

export default TextProperties;