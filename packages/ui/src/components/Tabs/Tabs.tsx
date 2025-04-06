import React, { Children, isValidElement, useEffect, useRef, useState } from 'react';

import { TabItemProps, TabsProps } from '../../types';
import { cn, getSizeClass } from '../../utils';
import './Tabs.scss';

// Extended TabItemProps for internal use with the active state
interface ExtendedTabItemProps extends TabItemProps {
    active?: boolean;
    onClick?: () => void;
    size?: 'sm' | 'md' | 'lg';
    key: string;
}

export const Tabs: React.FC<TabsProps> = ({
                                              children,
                                              value,
                                              onChange,
                                              variant = 'default',
                                              size = 'md',
                                              fullWidth = false,
                                              className,
                                              ...props
                                          }) => {
    const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
    const [indicatorStyle, setIndicatorStyle] = useState({});
    const tabsListRef = useRef<HTMLDivElement>(null);
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

    // Get all valid tab children
    const tabs = Children.toArray(children).filter(
        (child): child is React.ReactElement<TabItemProps> =>
            isValidElement(child) && child.props.value !== undefined
    );

    // Find index of currently active tab
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const activeIndex = tabs.findIndex((tab) => tab.props.value === value);
        if (activeIndex !== -1) {
            setActiveTabIndex(activeIndex);
        }
    }, [value, tabs]);

    // Update indicator position
    useEffect(() => {
        updateIndicator(activeTabIndex);
    }, [activeTabIndex]);

    const updateIndicator = (index: number) => {
        const currentTab = tabRefs.current[index];

        if (!currentTab || !tabsListRef.current) {return;}

        const tabRect = currentTab.getBoundingClientRect();
        const listRect = tabsListRef.current.getBoundingClientRect();

        setIndicatorStyle({
            left: `${tabRect.left - listRect.left}px`,
            width: `${tabRect.width}px`,
        });
    };

    const handleTabClick = (index: number) => {
        const tabProps = tabs[index].props;

        if (tabProps.disabled) {return;}

        setActiveTabIndex(index);
        onChange(tabProps.value);
    };

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            updateIndicator(activeTabIndex);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [activeTabIndex]);

    return (
        <div
            className={cn(
                'ds-tabs',
                getSizeClass(size, 'ds-tabs'),
                `ds-tabs-${variant}`,
                fullWidth && 'ds-tabs-full',
                className
            )}
            {...props}
        >
            <div className="ds-tabs-list" ref={tabsListRef}>
                {tabs.map((tab, index) => {
                    // Create props for the tab item
                    const tabItemProps: ExtendedTabItemProps = {
                        ...tab.props,
                        key: tab.props.value,
                        active: index === activeTabIndex,
                        onClick: () => handleTabClick(index),
                        size,
                    };

                    // Store the ref separately
                    const refCallback = (el: HTMLButtonElement) => {
                        tabRefs.current[index] = el;
                    };

                    // Clone element with correct typings
                    return React.cloneElement(tab as React.ReactElement<any>, {
                        ...tabItemProps,
                        ref: refCallback,
                    });
                })}
                {variant !== 'pills' && (
                    <div className="ds-tabs-indicator" style={indicatorStyle} />
                )}
            </div>
        </div>
    );
};

export const TabItem = React.forwardRef<HTMLButtonElement, ExtendedTabItemProps>(({
                                                                                      label,
                                                                                      disabled = false,
                                                                                      icon,
                                                                                      active = false,
                                                                                      size = 'md',
                                                                                      onClick,
                                                                                      className,
                                                                                      ...props
                                                                                  }, ref) => (
    <button
        ref={ref}
        role="tab"
        aria-selected={active}
        aria-disabled={disabled}
        disabled={disabled}
        className={cn(
            'ds-tab-item',
            getSizeClass(size, 'ds-tab-item'),
            active && 'ds-tab-item-active',
            disabled && 'ds-tab-item-disabled',
            className
        )}
        onClick={onClick}
        {...props}
    >
        {icon && <span className="ds-tab-item-icon">{icon}</span>}
        {label}
    </button>
));

TabItem.displayName = 'TabItem';
Tabs.displayName = 'Tabs';