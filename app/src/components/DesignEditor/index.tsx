// src/components/DesignEditor/index.tsx
import DesignEditor from './DesignEditor';
import { DesignEditorProvider, useDesignEditor } from './DesignEditorContext';

export default DesignEditor;

// Export context and hooks
export { DesignEditorProvider, useDesignEditor };

// Export subcomponents for direct use
export { default as Canvas } from './Canvas/Canvas';
export { default as ObjectsPanel } from './ObjectsPanel/ObjectsPanel';
export { default as PropertiesPanel } from './PropertiesPanel/PropertiesPanel';
export { default as LibraryPanel } from './LibraryPanel/LibraryPanel';