import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDesignEditor, FabricObjectWithId } from '../../context/DesignEditorContext';
import styles from './PropertiesPanel.module.scss';

// Import property sections
import CommonProperties from './sections/CommonProperties';
import PositionProperties from './sections/PositionProperties';
import TextProperties from './sections/TextProperties';
import ImageProperties from './sections/ImageProperties';
import ShapeProperties from './sections/ShapeProperties';
import BorderProperties from './sections/BorderProperties';

interface PropertiesPanelProps {
    className?: string;
}

/**
 * Properties panel displays and allows editing of the selected object's properties
 */
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
        if (obj.objectType) return obj.objectType;

        if (obj.type === 'textbox' || obj.type === 'text') return 'text';
        if (obj.type === 'image') return 'image';
        if (obj.type === 'rect') return 'rectangle';
        if (obj.type === 'circle') return 'circle';
        if (obj.type === 'triangle') return 'triangle';

        return obj.type || 'unknown';
    };

    const objectType = getObjectType(selectedObject);

    // Render properties based on object type
    const renderObjectProperties = () => {
        // Common properties for all objects
        return (
            <>
                <CommonProperties object={selectedObject} updateProperty={handlePropertyChange} />
                <PositionProperties object={selectedObject} updateProperty={handlePropertyChange} />

                {/* Object-specific properties */}
                {objectType === 'text' && (
                    <TextProperties object={selectedObject} updateProperty={handlePropertyChange} />
                )}

                {objectType === 'image' && (
                    <ImageProperties object={selectedObject} updateProperty={handlePropertyChange} />
                )}

                {(objectType === 'rectangle' || objectType === 'circle' || objectType === 'triangle') && (
                    <ShapeProperties object={selectedObject} updateProperty={handlePropertyChange} type={objectType} />
                )}

                {/* Border properties for all objects */}
                <BorderProperties object={selectedObject} updateProperty={handlePropertyChange} />
            </>
        );
    };

    return (
        <div className={`${styles.propertiesPanel} ${className || ''}`}>
            <div className={styles.header}>
                <h3>{selectedObject.name || getObjectType(selectedObject)}</h3>
                <div className={styles.objectType}>{getObjectType(selectedObject)}</div>
            </div>
            <div className={styles.propertiesContent}>
                {renderObjectProperties()}
            </div>
        </div>
    );
};

export default PropertiesPanel;