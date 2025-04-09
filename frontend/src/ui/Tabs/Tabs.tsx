import React from 'react';
import { cva, VariantProps } from 'class-variance-authority';

// Style pour le container des onglets
const tabsContainerStyles = cva(
    'flex flex-row text-center w-full',
    {
        variants: {
            justify: {
                around: 'justify-around',
                between: 'justify-between',
                center: 'justify-center',
            },
            spacing: {
                tight: 'gap-2',
                normal: 'gap-4',
                wide: 'gap-8',
            }
        },
        defaultVariants: {
            justify: 'around',
            spacing: 'normal',
        },
    }
);

// Style pour les onglets individuels
const tabStyles = cva(
    'cursor-pointer pb-5 transition-all',
    {
        variants: {
            variant: {
                primary: 'text-custom-light-gray hover:text-custom',
                secondary: 'text-custom-gray hover:text-custom-blue',
                dark: 'text-custom-dark-gray hover:text-custom',
            },
            size: {
                small: 'text-sm',
                medium: 'text-base',
                large: 'text-lg',
            },
            width: {
                auto: 'w-auto',
                half: 'w-half',
                full: 'w-full',
            },
            active: {
                true: 'border-b-4 border-custom-light-gray font-medium',
                false: 'border-b-0',
            }
        },
        defaultVariants: {
            variant: 'primary',
            size: 'medium',
            width: 'auto',
            active: false,
        },
    }
);

interface TabItem {
    id: string;
    label: string;
}

interface TabsProps extends VariantProps<typeof tabsContainerStyles> {
    tabs: TabItem[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    tabVariant?: VariantProps<typeof tabStyles>['variant'];
    tabSize?: VariantProps<typeof tabStyles>['size'];
    tabWidth?: VariantProps<typeof tabStyles>['width'];
    className?: string;
}

const Tabs: React.FC<TabsProps> = ({
    tabs,
    activeTab,
    onTabChange,
    justify,
    spacing,
    tabVariant,
    tabSize,
    tabWidth,
    className = '',
}) => {
    return (
        <div className={`${tabsContainerStyles({ justify, spacing })} ${className}`}>
            {tabs.map((tab) => (
                <div
                    key={tab.id}
                    className={tabStyles({
                        variant: tabVariant,
                        size: tabSize,
                        width: tabWidth,
                        active: activeTab === tab.id,
                    })}
                    onClick={() => onTabChange(tab.id)}
                >
                    {tab.label}
                </div>
            ))}
        </div>
    );
};

export default Tabs; 