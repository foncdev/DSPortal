// src/components/DesignEditor/ObjectsPanel/ObjectToolbar.tsx
import React from 'react';
import { Text, Image, Square, Circle, Triangle, Monitor } from 'lucide-react';
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
            {/* 레이어 추가 버튼 제거 - 별도의 "새 레이어 추가" 버튼으로 대체 */}
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