// src/components/DesignEditor/index.ts
import DesignEditor from './DesignEditor';
import { DesignEditorProvider, useDesignEditor } from './context/DesignEditorContext';

export default DesignEditor;

// Export context and hooks
export { DesignEditorProvider, useDesignEditor };

// Export subcomponents for direct use
export { default as Canvas } from './components/Canvas/Canvas';
export { default as ObjectsPanel } from './components/ObjectsPanel/ObjectsPanel';
export { default as PropertiesPanel } from './components/PropertiesPanel/PropertiesPanel';
export { default as LibraryPanel } from './components/LibraryPanel/LibraryPanel';
export { default as FileManagerPanel } from './components/FileManagerPanel/FileManagerPanel';