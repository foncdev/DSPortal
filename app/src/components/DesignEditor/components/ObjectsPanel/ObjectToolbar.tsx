// src/components/DesignEditor/components/ObjectsPanel/ObjectToolbar.tsx
import React, { useState } from 'react';
import { Text, Image, Square, Circle, Triangle, Plus, Layers, AlertTriangle, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ObjectType, useDesignEditor } from '../../context/DesignEditorContext';
import styles from './ObjectsPanel.module.scss';

interface ObjectToolbarProps {
    onAddObject: (type: ObjectType, options?: any) => void;
}

/**
 * ObjectToolbar component provides buttons for adding various types of objects
 * to the canvas, organized in a toolbar format.
 */
const ObjectToolbar: React.FC<ObjectToolbarProps> = ({ onAddObject }) => {
    const { t } = useTranslation();
    const { createLayoutGroup, activeGroupId, layerGroups, addObjectToGroup } = useDesignEditor();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [warningVisible, setWarningVisible] = useState(false);

    // Handle creating a new layout group
    const handleCreateNewLayoutGroup = () => {
        if (isProcessing) return;

        setIsProcessing(true);
        setErrorMessage(null);

        try {
            // Generate group name based on existing groups count
            const newGroupName = `Layer ${layerGroups.length + 1}`;
            createLayoutGroup(newGroupName);

            // Auto-hide any warning after creation
            setWarningVisible(false);
        } catch (error) {
            console.error('Error creating layout group:', error);
            setErrorMessage('Failed to create new layer');
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle adding an object to the canvas
    const handleAddObject = (type: ObjectType) => {
        if (isProcessing) return;

        setIsProcessing(true);
        setErrorMessage(null);

        try {
            onAddObject(type);
            // Show warning about objects being added to the active layer
            if (!warningVisible && activeGroupId) {
                const activeGroup = layerGroups.find(g => g.id === activeGroupId);
                if (activeGroup) {
                    setWarningVisible(true);

                    // Auto-hide warning after 3 seconds
                    setTimeout(() => {
                        setWarningVisible(false);
                    }, 3000);
                }
            }
        } catch (error) {
            console.error(`Error adding ${type} to canvas:`, error);
            setErrorMessage(`Failed to add ${type} to canvas`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className={styles.objectToolsContainer}>
            {/* Object adding tools */}
            <div className={styles.objectTools}>
                <button
                    className={styles.objectToolButton}
                    onClick={() => handleAddObject('text')}
                    title={t('editor.addText')}
                    disabled={isProcessing}
                >
                    <Text size={18} />
                </button>
                <button
                    className={styles.objectToolButton}
                    onClick={() => handleAddObject('image')}
                    title={t('editor.addImage')}
                    disabled={isProcessing}
                >
                    <Image size={18} />
                </button>
                <button
                    className={styles.objectToolButton}
                    onClick={() => handleAddObject('rectangle')}
                    title={t('editor.addRectangle')}
                    disabled={isProcessing}
                >
                    <Square size={18} />
                </button>
                <button
                    className={styles.objectToolButton}
                    onClick={() => handleAddObject('circle')}
                    title={t('editor.addCircle')}
                    disabled={isProcessing}
                >
                    <Circle size={18} />
                </button>
                <button
                    className={styles.objectToolButton}
                    onClick={() => handleAddObject('triangle')}
                    title={t('editor.addTriangle')}
                    disabled={isProcessing}
                >
                    <Triangle size={18} />
                </button>
                <button
                    className={`${styles.objectToolButton} ${styles.createLayerButton}`}
                    onClick={handleCreateNewLayoutGroup}
                    title={t('editor.addNewLayer')}
                    disabled={isProcessing}
                >
                    <Layers size={18} />
                </button>
            </div>

            {/* Error message */}
            {errorMessage && (
                <div className={styles.errorMessage}>
                    <AlertTriangle size={14} />
                    <span>{errorMessage}</span>
                    <button onClick={() => setErrorMessage(null)}>×</button>
                </div>
            )}

            {/* Layer warning message */}
            {warningVisible && activeGroupId && (
                <div className={styles.warningMessage}>
                    <Info size={14} />
                    <span>
            {t('editor.objectAddedToActiveLayer', {
                layerName: layerGroups.find(g => g.id === activeGroupId)?.name || 'Active Layer'
            })}
          </span>
                    <button onClick={() => setWarningVisible(false)}>×</button>
                </div>
            )}
        </div>
    );
};

export default ObjectToolbar;