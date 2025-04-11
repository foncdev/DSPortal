// src/components/DesignEditor/components/ObjectsPanel/ObjectToolbar.tsx
import React, { useState } from 'react';
import { Text, Image, Square, Circle, Triangle, Plus, AlertTriangle, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ObjectType } from '../../context/DesignEditorContext';
import styles from './ObjectsPanel.module.scss';

interface ObjectToolbarProps {
    onCreateLayoutGroup: () => void;
    onAddObject: (type: ObjectType, options?: any) => void;
}

/**
 * ObjectToolbar component provides buttons for adding various types of objects
 * to the canvas, organized in a toolbar format.
 */
const ObjectToolbar: React.FC<ObjectToolbarProps> = ({ onCreateLayoutGroup, onAddObject }) => {
    const { t } = useTranslation();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [warningVisible, setWarningVisible] = useState(false);

    // Handle adding an object to the canvas
    const handleAddObject = (type: ObjectType) => {
        if (isProcessing) return;

        setIsProcessing(true);
        setErrorMessage(null);

        try {
            onAddObject(type);
            // Show warning about objects needing to be in layers
            setWarningVisible(true);

            // Auto-hide warning after 3 seconds
            setTimeout(() => {
                setWarningVisible(false);
            }, 3000);
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
                    onClick={onCreateLayoutGroup}
                    title={t('editor.addLayoutGroup')}
                    disabled={isProcessing}
                >
                    <Plus size={18} />
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
            {warningVisible && (
                <div className={styles.warningMessage}>
                    <Info size={14} />
                    <span>{t('editor.objectsNeedLayerWarning', 'Objects must be added to a layer')}</span>
                    <button onClick={() => setWarningVisible(false)}>×</button>
                </div>
            )}
        </div>
    );
};

export default ObjectToolbar;