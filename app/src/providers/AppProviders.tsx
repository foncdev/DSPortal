// app/src/providers/AppProviders.tsx
import React, { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../layouts/context/ThemeContext';
import { ViewportProvider } from '../layouts/context/ViewportContext';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

interface AppProvidersProps {
    children: ReactNode;
}

/**
 * Wraps the application with all required providers
 */
const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
    return (
        <BrowserRouter>
            <I18nextProvider i18n={i18n}>
                <ThemeProvider>
                    <ViewportProvider>
                        {children}
                    </ViewportProvider>
                </ThemeProvider>
            </I18nextProvider>
        </BrowserRouter>
    );
};

export default AppProviders;