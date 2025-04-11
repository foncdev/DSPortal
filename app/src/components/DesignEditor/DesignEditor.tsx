import React from 'react';
import { DesignEditorProvider } from './context/DesignEditorContext';
import DesignEditorLayout from './layout/DesignEditorLayout';

/**
 * Main DesignEditor component with Provider
 * This component initializes the DesignEditor context and renders the layout
 */
const DesignEditor: React.FC = () => (
    <DesignEditorProvider>
        <DesignEditorLayout />
    </DesignEditorProvider>
);

export default DesignEditor;