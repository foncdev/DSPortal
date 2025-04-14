import React, { useState } from 'react';
import { PropertySectionProps } from './types';
import styles from './PropertiesPanel.module.scss';

/**
 * Reusable section component for grouping properties
 */
const PropertySection: React.FC<PropertySectionProps> = ({
                                                             title,
                                                             icon,
                                                             children,
                                                             defaultExpanded = true
                                                         }) => {
    const [expanded, setExpanded] = useState(defaultExpanded);

    return (
        <div className={styles.propertySection}>
            <div
                className={styles.sectionHeader}
                onClick={() => setExpanded(!expanded)}
            >
                {icon && <span className={styles.sectionIcon}>{icon}</span>}
                <span className={styles.sectionTitle}>{title}</span>
                <span className={styles.expandIcon}>
          {expanded ? '−' : '+'}
        </span>
            </div>
            {expanded && <div className={styles.sectionContent}>{children}</div>}
        </div>
    );
};

export default PropertySection;