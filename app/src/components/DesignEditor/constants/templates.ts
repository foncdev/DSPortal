// src/components/DesignEditor/constants/templates.ts
import { ObjectType } from '../context/DesignEditorContext';

interface TemplateObject {
    type: ObjectType;
    name: string;
    properties: Record<string, any>;
}

export interface Template {
    id: string;
    name: string;
    objects: TemplateObject[];
}

/**
 * Predefined layout templates
 */
export const TEMPLATES: Template[] = [
    {
        id: 'template-basic',
        name: 'Basic Layout',
        objects: [
            {
                type: 'rectangle',
                name: 'Background',
                properties: { width: 800, height: 600, fill: '#ffffff', selectable: true }
            },
            {
                type: 'text',
                name: 'Title',
                properties: { text: 'Title', fontSize: 32, top: 50, left: 400, textAlign: 'center', originX: 'center' }
            },
            {
                type: 'text',
                name: 'Subtitle',
                properties: { text: 'Subtitle', fontSize: 24, top: 100, left: 400, textAlign: 'center', originX: 'center' }
            }
        ]
    },
    {
        id: 'template-banner',
        name: 'Banner Layout',
        objects: [
            {
                type: 'rectangle',
                name: 'Background',
                properties: { width: 800, height: 600, fill: '#f2f2f2', selectable: true }
            },
            {
                type: 'rectangle',
                name: 'Header',
                properties: { width: 800, height: 100, fill: '#3b82f6', top: 0, left: 0 }
            },
            {
                type: 'text',
                name: 'Header Text',
                properties: {
                    text: 'Header Text',
                    fontSize: 28,
                    top: 50,
                    left: 400,
                    fill: '#ffffff',
                    textAlign: 'center',
                    originX: 'center',
                    originY: 'center'
                }
            }
        ]
    }
];