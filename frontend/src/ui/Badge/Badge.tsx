import React, { ReactNode } from 'react';
import { cva, VariantProps } from 'class-variance-authority';

const badgeStyles = cva(
    'inline-flex items-center justify-center font-medium',
    {
        variants: {
            variant: {
                primary: 'bg-custom-blue text-white',
                secondary: 'bg-custom-dark-gray text-custom-light-gray',
                success: 'bg-green-600 text-white',
                danger: 'bg-custom-red text-white',
                warning: 'bg-yellow-500 text-black',
                info: 'bg-blue-500 text-white',
                outline: 'bg-transparent border border-current',
            },
            size: {
                sm: 'text-xs px-1.5 py-0.5',
                md: 'text-sm px-2 py-1',
                lg: 'text-base px-3 py-1.5',
            },
            shape: {
                square: 'rounded-sm',
                rounded: 'rounded-md',
                pill: 'rounded-full',
            },
            position: {
                inline: '',
                topRight: 'absolute -top-2 -right-2',
                topLeft: 'absolute -top-2 -left-2',
                bottomRight: 'absolute -bottom-2 -right-2',
                bottomLeft: 'absolute -bottom-2 -left-2',
            }
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
            shape: 'pill',
            position: 'inline',
        },
    }
);

interface BadgeProps extends VariantProps<typeof badgeStyles> {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}

const Badge: React.FC<BadgeProps> = ({
    children,
    variant,
    size,
    shape,
    position,
    className = '',
    onClick,
}) => {
    return (
        <span 
            className={`${badgeStyles({ variant, size, shape, position })} ${className}`}
            onClick={onClick}
        >
            {children}
        </span>
    );
};

export default Badge; 