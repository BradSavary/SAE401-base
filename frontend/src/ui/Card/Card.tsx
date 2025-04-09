import React, { ReactNode } from 'react';
import { cva, VariantProps } from 'class-variance-authority';

const cardStyles = cva(
    'overflow-hidden transition-all',
    {
        variants: {
            variant: {
                primary: 'bg-custom border border-custom-gray',
                secondary: 'bg-custom-dark-gray',
                outlined: 'bg-transparent border border-custom-gray',
                elevated: 'bg-custom shadow-md',
            },
            radius: {
                none: 'rounded-none',
                sm: 'rounded-sm',
                md: 'rounded-md',
                lg: 'rounded-lg',
                xl: 'rounded-xl',
                full: 'rounded-full',
            },
            padding: {
                none: 'p-0',
                sm: 'p-2',
                md: 'p-4',
                lg: 'p-6',
                xl: 'p-8',
            },
            hover: {
                none: '',
                lift: 'hover:-translate-y-1 hover:shadow-lg',
                glow: 'hover:shadow-custom-blue/20 hover:border-custom-blue',
                scale: 'hover:scale-105',
                highlight: 'hover:bg-custom-gray/10',
            },
            width: {
                auto: 'w-auto',
                full: 'w-full',
                half: 'w-1/2',
            }
        },
        defaultVariants: {
            variant: 'primary',
            radius: 'lg',
            padding: 'md',
            hover: 'none',
            width: 'full',
        },
    }
);

interface CardProps extends VariantProps<typeof cardStyles> {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
    children,
    variant,
    radius,
    padding,
    hover,
    width,
    className = '',
    onClick,
}) => {
    return (
        <div 
            className={`${cardStyles({ variant, radius, padding, hover, width })} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default Card; 