import { FabricObjectWithId } from '../../context/DesignEditorContext';

export interface PropertySectionProps {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    defaultExpanded?: boolean;
}

export interface PropertyPanelProps {
    object: FabricObjectWithId;
    updateProperty: <T extends unknown>(property: string, value: T) => void;
}