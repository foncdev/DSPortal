import React from 'react';
import { useTranslation } from 'react-i18next';
import { Settings } from 'lucide-react';
import PropertySection from '../PropertySection';
import { PropertyPanelProps } from '../types';
import styles from '../PropertiesPanel.module.scss';

/**
 * Common properties section that applies to all object types
 */
const CommonProperties: React.FC<PropertyPanelProps> = ({ object, updateProperty }) => {
    const { t } = useTranslation();

    return (
        <PropertySection title={t('editor.commonProperties')} icon={<Settings size={16} />}>
            <div className={styles.propertyGroup}>
                <div className={styles.propertyRow}>
                    <label>{t('editor.name')}</label>
                    <input
                        type="text"
                        value={object.name || ''}
                        onChange={(e) => updateProperty('name', e.target.value)}
                    />
                </div>
            </div>
        </PropertySection>
    );
};

export default CommonProperties;