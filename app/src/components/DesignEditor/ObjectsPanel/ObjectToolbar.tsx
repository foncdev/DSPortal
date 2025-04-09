// src/components/DesignEditor/ObjectsPanel/ObjectToolbar.tsx
import React from 'react';
import { Text, Image, Square, Circle, Triangle, Monitor, Film } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ObjectType } from '../DesignEditorContext';
import styles from './ObjectsPanel.module.scss';

interface ObjectToolbarProps {
    onCreateLayoutGroup: () => void;
    onAddObject: (type: ObjectType, options?: any) => void;
}

const ObjectToolbar: React.FC<ObjectToolbarProps> = ({ onCreateLayoutGroup, onAddObject }) => {
    const { t } = useTranslation();

    return (
        <div className={styles.objectTools}>
            <button
                className={styles.objectToolButton}
                onClick={onCreateLayoutGroup}
                title={t('editor.addLayoutGroup')}
            >
                <Monitor size={18} />
            </button>
            <button
                className={styles.objectToolButton}
                onClick={() => onAddObject('text')}
                title={t('editor.addText')}
            >
                <Text size={18} />
            </button>
            <button
                className={styles.objectToolButton}
                onClick={() => onAddObject('image')}
                title={t('editor.addImage')}
            >
                <Image size={18} />
            </button>
            <button
                className={styles.objectToolButton}
                onClick={() => onAddObject('rectangle')}
                title={t('editor.addRectangle')}
            >
                <Square size={18} />
            </button>
            <button
                className={styles.objectToolButton}
                onClick={() => onAddObject('circle')}
                title={t('editor.addCircle')}
            >
                <Circle size={18} />
            </button>
            <button
                className={styles.objectToolButton}
                onClick={() => onAddObject('triangle')}
                title={t('editor.addTriangle')}
            >
                <Triangle size={18} />
            </button>
        </div>
    );
};

export default ObjectToolbar;