// src/components/DesignEditor/ObjectsPanel/ObjectsPanel.tsx
import React, { useState } from 'react';
import {
    Text,
    Image,
    Video,
    Square,
    Circle,
    Triangle,
    Trash2,
    Copy,
    EyeOff,
    ChevronDown,
    ChevronRight,
    Layers
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDesignEditor, DesignObject } from '../DesignEditorContext';
import styles from './ObjectsPanel.module.scss';

interface ObjectsPanelProps {
    className?: string;
}

const ObjectsPanel: React.FC<ObjectsPanelProps> = ({ className }) => {
    const { t } = useTranslation();
    const {
        objects,
        selectedObject,
        selectObject,
        addObject,
        deleteObject
    } = useDesignEditor();

    const [objectsExpanded, setObjectsExpanded] = useState(true);

    // Get icon for object type
    const getObjectIcon = (type: DesignObject['type']) => {
        switch (type) {
            case 'text':
                return <Text size={16} />;
            case 'image':
                return <Image size={16} />;
            case 'video':
                return <Video size={16} />;
            case 'rectangle':
                return <Square size={16} />;
            case 'circle':
                return <Circle size={16} />;
            case 'triangle':
                return <Triangle size={16} />;
            default:
                return null;
        }
    };

    // Add a new object
    const handleAddObject = (type: DesignObject['type']) => {
        addObject(type);
    };

    // Delete selected object
    const handleDeleteObject = (id: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent selecting the object when deleting
        deleteObject(id);
    };

    // Duplicate object (not yet implemented in context)
    const handleDuplicateObject = (object: DesignObject, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent selecting the object when duplicating
        // This would need to be implemented in the context
        console.log('Duplicate object:', object);
    };

    // Toggle object visibility (not yet implemented in context)
    const handleToggleVisibility = (id: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent selecting the object when toggling visibility
        // This would need to be implemented in the context
        console.log('Toggle visibility for object ID:', id);
    };

    // Toggle objects section expanded state
    const toggleObjectsExpanded = () => {
        setObjectsExpanded(!objectsExpanded);
    };

    return (
        <div className={`${styles.objectsPanel} ${className || ''}`}>
            {/* Object tools */}
            <div className={styles.objectTools}>
                <button
                    className={styles.objectToolButton}
                    onClick={() => handleAddObject('text')}
                    title={t('editor.addText')}
                >
                    <Text size={18} />
                </button>
                <button
                    className={styles.objectToolButton}
                    onClick={() => handleAddObject('image')}
                    title={t('editor.addImage')}
                >
                    <Image size={18} />
                </button>
                <button
                    className={styles.objectToolButton}
                    onClick={() => handleAddObject('video')}
                    title={t('editor.addVideo')}
                >
                    <Video size={18} />
                </button>
                <button
                    className={styles.objectToolButton}
                    onClick={() => handleAddObject('rectangle')}
                    title={t('editor.addRectangle')}
                >
                    <Square size={18} />
                </button>
                <button
                    className={styles.objectToolButton}
                    onClick={() => handleAddObject('circle')}
                    title={t('editor.addCircle')}
                >
                    <Circle size={18} />
                </button>
                <button
                    className={styles.objectToolButton}
                    onClick={() => handleAddObject('triangle')}
                    title={t('editor.addTriangle')}
                >
                    <Triangle size={18} />
                </button>
            </div>

            {/* Objects list section */}
            <div className={styles.sectionHeader} onClick={toggleObjectsExpanded}>
                <div className={styles.sectionTitle}>
                    {objectsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <Layers size={16} className={styles.sectionIcon} />
                    <span>{t('editor.objects')}</span>
                </div>
                <div className={styles.objectCount}>{objects.length}</div>
            </div>

            {objectsExpanded && (
                <div className={styles.objectsList}>
                    {objects.length === 0 ? (
                        <div className={styles.emptyState}>
                            {t('editor.noObjects')}
                        </div>
                    ) : (
                        objects.map((object) => (
                            <div
                                key={object.id}
                                className={`${styles.objectItem} ${selectedObject?.id === object.id ? styles.selected : ''}`}
                                onClick={() => selectObject(object)}
                            >
                                <div className={styles.objectInfo}>
                                    <div className={styles.objectIcon}>
                                        {getObjectIcon(object.type)}
                                    </div>
                                    <span className={styles.objectName}>{object.name}</span>
                                </div>

                                <div className={styles.objectActions}>
                                    <button
                                        className={styles.objectAction}
                                        onClick={(e) => handleToggleVisibility(object.id, e)}
                                        title={t('editor.toggleVisibility')}
                                    >
                                        <EyeOff size={14} />
                                    </button>
                                    <button
                                        className={styles.objectAction}
                                        onClick={(e) => handleDuplicateObject(object, e)}
                                        title={t('editor.duplicate')}
                                    >
                                        <Copy size={14} />
                                    </button>
                                    <button
                                        className={`${styles.objectAction} ${styles.deleteAction}`}
                                        onClick={(e) => handleDeleteObject(object.id, e)}
                                        title={t('editor.delete')}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default ObjectsPanel;