import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes';
import { ThemeProvider } from './contexts/ThemeContext';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import ErrorBoundary from './layouts/components/common/ErrorBoundary';

// Import styles
import './styles/main.scss';

const App: React.FC = () => (
        <ErrorBoundary>
            <I18nextProvider i18n={i18n}>
                <ThemeProvider>
                    <Router>
                        <AppRoutes />
                    </Router>
                </ThemeProvider>
            </I18nextProvider>
        </ErrorBoundary>
    );

export default App;
