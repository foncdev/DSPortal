// app/src/layouts/components/Header/ThemeToggle.tsx
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Monitor } from 'lucide-react';
import styles from './ThemeToggle.module.scss';

const ThemeToggle: React.FC = () => {
    const { theme, setTheme, isDarkMode } = useTheme();
    const { t } = useTranslation();

    // Cycle through theme modes: light -> dark -> system -> light
    const cycleTheme = () => {
        if (theme === 'light') setTheme('dark');
        else if (theme === 'dark') setTheme('system');
        else setTheme('light');
    };

    // Get the appropriate icon for current theme
    const getThemeIcon = () => {
        switch (theme) {
            case 'light': return <Sun size={20} />;
            case 'dark': return <Moon size={20} />;
            case 'system': return <Monitor size={20} />;
            default: return isDarkMode ? <Moon size={20} /> : <Sun size={20} />;
        }
    };

    return (
        <button
            className={styles.themeToggle}
            onClick={cycleTheme}
            aria-label={t('header.toggleTheme')}
            title={t(`theme.${theme}`)}
        >
            {getThemeIcon()}
        </button>
    );
};

export default ThemeToggle;