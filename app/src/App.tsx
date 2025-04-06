import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes';
import { ThemeProvider } from './contexts/ThemeContext';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import ErrorBoundary from './layouts/components/common/ErrorBoundary';
import { ToastProvider } from '@ds/ui'; // Import ToastProvider from UI library

// Import styles
import './styles/main.scss';
import {I18nProvider} from "./contexts/I18nContext";
import SessionExpiryAlert from "./components/SessionExpiryAlert";

const App: React.FC = () => (
        <ErrorBoundary>
            <I18nextProvider i18n={i18n}>
                <I18nProvider>
                    <ThemeProvider>
                        <ToastProvider position="top-right">
                            <Router>
                                <SessionExpiryAlert />
                                <AppRoutes />
                            </Router>
                        </ToastProvider>
                    </ThemeProvider>
                </I18nProvider>
            </I18nextProvider>
        </ErrorBoundary>
    );

export default App;
