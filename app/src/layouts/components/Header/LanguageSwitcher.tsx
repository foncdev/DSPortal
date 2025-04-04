import React from 'react';
import { Globe } from 'lucide-react';
import { useI18n } from '../../../contexts/I18nContext';
import styles from './LanguageSwitcher.module.scss'; // 분리된 스타일 파일 사용

const LanguageSwitcher: React.FC = () => {
    // const { t } = useTranslation();
    const { currentLanguage, changeLanguage } = useI18n();

    return (
        <div className={styles.languageMenu}>
            <div className={styles.languageButton}>
                <Globe size={20} />
                <span className={styles.currentLang}>{currentLanguage === 'ko' ? 'KO' : 'EN'}</span>
            </div>
            <div className={styles.dropdown}>
                <ul className={styles.dropdownMenu}>
                    <li>
                        <button
                            className={`${styles.dropdownItem} ${currentLanguage === 'ko' ? styles.active : ''}`}
                            onClick={() => changeLanguage('ko')}
                        >
                            한국어
                        </button>
                    </li>
                    <li>
                        <button
                            className={`${styles.dropdownItem} ${currentLanguage === 'en' ? styles.active : ''}`}
                            onClick={() => changeLanguage('en')}
                        >
                            English
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default LanguageSwitcher;