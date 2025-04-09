// src/components/DesignEditor/ObjectsPanel/ObjectsPanel.tsx
import React, { useState, useEffect } from 'react';
import {
    Text,
    Image,
    Square,
    Circle,
    Triangle,
    Trash2,
    Copy,
    EyeOff,
    Eye,
    ChevronDown,
    ChevronRight,
    Layers
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDesignEditor, FabricObjectWithId, ObjectType } from '../DesignEditorContext';
import styles from './ObjectsPanel.module.scss';

interface ObjectsPanelProps {
    className?: string;
}

const ObjectsPanel: React.FC<ObjectsPanelProps> = ({ className }) => {
    const { t } = useTranslation();
    const {
        canvas,
        getObjects,
        selectedObject,
        selectObject,
        addObject,
        deleteObject,
        cloneObject,
        updateObject
    } = useDesignEditor();

    const [objects, setObjects] = useState<FabricObjectWithId[]>([]);
    const [objectsExpanded, setObjectsExpanded] = useState(true);

    // Update objects list when canvas changes
    useEffect(() => {
        if (!canvas) return;

        const updateObjectsList = () => {
            // Get objects from canvas and reverse to show top objects first
            const canvasObjects = getObjects().slice().reverse();
            setObjects(canvasObjects);
        };

        // Initial update
        updateObjectsList();

        // Listen for object changes
        const events = [
            'object:added',
            'object:removed',
            'object:modified',
            'selection:created',
            'selection:updated',
            'selection:cleared',
        ];

        const handleCanvasEvent = () => {
            updateObjectsList();
        };

        events.forEach(event => {
            canvas.on(event, handleCanvasEvent);
        });

        return () => {
            if (canvas) {
                events.forEach(event => {
                    canvas.off(event, handleCanvasEvent);
                });
            }
        };
    }, [canvas, getObjects]);

    // Get icon for object type
    const getObjectIcon = (type?: ObjectType) => {
        switch (type) {
            case 'text':
                return <Text size={16} />;
            case 'image':
                return <Image size={16} />;
            case 'rectangle':
                return <Square size={16} />;
            case 'circle':
                return <Circle size={16} />;
            case 'triangle':
                return <Triangle size={16} />;
            default:
                return <Square size={16} />;
        }
    };

    // Add a new object
    const handleAddObject = (type: ObjectType) => {
        addObject(type);
    };

    // Delete selected object
    const handleDeleteObject = (object: FabricObjectWithId, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent selecting the object when deleting
        if (canvas) {
            selectObject(object);
            deleteObject();
        }
    };

    // Duplicate object
    const handleDuplicateObject = (object: FabricObjectWithId, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent selecting the object when duplicating
        if (canvas) {
            selectObject(object);
            cloneObject();
        }
    };

    // Toggle object visibility
    const handleToggleVisibility = (object: FabricObjectWithId, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent selecting the object when toggling visibility
        if (canvas) {
            const isVisible = object.visible !== false;

            // 가시성과 함께 선택 가능성(selectable)도 함께 설정
            object.set({
                'visible': !isVisible,
                'selectable': !isVisible ? true : false, // 보이지 않으면 선택도 불가능하게
                'evented': !isVisible ? true : false     // 보이지 않으면 이벤트도 받지 않게
            });

            canvas.renderAll();

            // 보이지 않게 된 객체가 현재 선택된 상태라면 선택 해제
            if (isVisible && selectedObject && selectedObject.id === object.id) {
                canvas.discardActiveObject();
                canvas.requestRenderAll();
            }

            // 목록 업데이트
            setObjects([...getObjects()].reverse());
        }
    };

    // Toggle objects section expanded state
    const toggleObjectsExpanded = () => {
        setObjectsExpanded(!objectsExpanded);
    };

    // Get object name or default name based on type
    const getObjectName = (object: FabricObjectWithId) => {
        if (object.name) return object.name;

        const type = object.objectType || (
            object.type === 'textbox' ? 'text' :
                object.type === 'rect' ? 'rectangle' :
                    object.type
        );

        return type ? `${type.charAt(0).toUpperCase()}${type.slice(1)}` : 'Object';
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
                                        {getObjectIcon(object.objectType)}
                                    </div>
                                    <span className={styles.objectName}>{getObjectName(object)}</span>
                                </div>

                                <div className={styles.objectActions}>
                                    <button
                                        className={styles.objectAction}
                                        onClick={(e) => handleToggleVisibility(object, e)}
                                        title={t('editor.toggleVisibility')}
                                    >
                                        {object.visible === false ? <Eye size={14} /> : <EyeOff size={14} />}
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
                                        onClick={(e) => handleDeleteObject(object, e)}
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