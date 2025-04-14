import React from 'react';
import { useTranslation } from 'react-i18next';
import { Move } from 'lucide-react';
import PropertySection from '../PropertySection';
import { PropertyPanelProps } from '../types';
import styles from '../PropertiesPanel.module.scss';

/**
 * Position and size properties section that applies to all object types
 */
const PositionProperties: React.FC<PropertyPanelProps> = ({ object, updateProperty }) => {
    const { t } = useTranslation();
    const isCircle = object.type === 'circle';

    return (
        <PropertySection title={t('editor.positionProperties')} icon={<Move size={16} />}>
            <div className={styles.propertyGroup}>
                <div className={styles.propertyGrid}>
                    <div>
                        <label>X</label>
                        <input
                            type="number"
                            value={Math.round(object.left || 0)}
                            onChange={(e) => updateProperty('left', parseInt(e.target.value))}
                        />
                    </div>
                    <div>
                        <label>Y</label>
                        <input
                            type="number"
                            value={Math.round(object.top || 0)}
                            onChange={(e) => updateProperty('top', parseInt(e.target.value))}
                        />
                    </div>
                </div>

                {!isCircle && (
                    <div className={styles.propertyGrid}>
                        <div>
                            <label>{t('editor.width')}</label>
                            <input
                                type="number"
                                value={Math.round(object.width || 0)}
                                onChange={(e) => updateProperty('width', parseInt(e.target.value))}
                            />
                        </div>
                        <div>
                            <label>{t('editor.height')}</label>
                            <input
                                type="number"
                                value={Math.round(object.height || 0)}
                                onChange={(e) => updateProperty('height', parseInt(e.target.value))}
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
                            value={Math.round(object.angle || 0)}
                            onChange={(e) => updateProperty('angle', parseInt(e.target.value))}
                        />
                        <input
                            type="number"
                            min="0"
                            max="360"
                            value={Math.round(object.angle || 0)}
                            onChange={(e) => updateProperty('angle', parseInt(e.target.value))}
                        />
                    </div>
                </div>
            </div>
        </PropertySection>
    );
};

export default PositionProperties;