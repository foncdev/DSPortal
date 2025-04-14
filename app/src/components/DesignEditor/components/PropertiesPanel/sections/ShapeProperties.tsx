import React from 'react';
import { useTranslation } from 'react-i18next';
import { SquareIcon, Sliders } from 'lucide-react';
import PropertySection from '../PropertySection';
import { PropertyPanelProps } from '../types';
import styles from '../PropertiesPanel.module.scss';
import ColorInput from '../controls/ColorInput';

interface ShapePropertiesProps extends PropertyPanelProps {
    type: string;
}

/**
 * Shape-specific properties section for rectangles, circles, and triangles
 */
const ShapeProperties: React.FC<ShapePropertiesProps> = ({ object, updateProperty, type }) => {
    const { t } = useTranslation();

    const renderRectangleProperties = () => (
        <>
            <div className={styles.propertyRow}>
                <label>{t('editor.color')}</label>
                <ColorInput
                    value={object.fill || '#cccccc'}
                    onChange={(value) => updateProperty('fill', value)}
                />
            </div>
            <div className={styles.propertyRow}>
                <label>{t('editor.borderRadius')}</label>
                <div className={styles.rangeWithValue}>
                    <input
                        type="range"
                        min="0"
                        max="50"
                        value={object.rx || 0}
                        onChange={(e) => {
                            const value = parseInt(e.target.value);
                            updateProperty('rx', value);
                            updateProperty('ry', value);
                        }}
                    />
                    <input
                        type="number"
                        min="0"
                        max="50"
                        value={object.rx || 0}
                        onChange={(e) => {
                            const value = parseInt(e.target.value);
                            updateProperty('rx', value);
                            updateProperty('ry', value);
                        }}
                    />
                </div>
            </div>
        </>
    );

    const renderCircleProperties = () => (
        <>
            <div className={styles.propertyRow}>
                <label>{t('editor.radius')}</label>
                <input
                    type="number"
                    value={object.radius || 50}
                    onChange={(e) => updateProperty('radius', parseInt(e.target.value))}
                />
            </div>
            <div className={styles.propertyRow}>
                <label>{t('editor.color')}</label>
                <ColorInput
                    value={object.fill || '#cccccc'}
                    onChange={(value) => updateProperty('fill', value)}
                />
            </div>
        </>
    );

    const renderTriangleProperties = () => (
        <div className={styles.propertyRow}>
            <label>{t('editor.color')}</label>
            <ColorInput
                value={object.fill || '#cccccc'}
                onChange={(value) => updateProperty('fill', value)}
            />
        </div>
    );

    return (
        <PropertySection
            title={t('editor.shapeProperties')}
            icon={type === 'rectangle' ? <SquareIcon size={16} /> : <Sliders size={16} />}
        >
            <div className={styles.propertyGroup}>
                {type === 'rectangle' && renderRectangleProperties()}
                {type === 'circle' && renderCircleProperties()}
                {type === 'triangle' && renderTriangleProperties()}

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

export default ShapeProperties;