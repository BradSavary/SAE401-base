import React from 'react';
import { cva, VariantProps } from 'class-variance-authority';

const inputStyles = cva(
    'inline-flex items-center justify-center font-medium focus:outline-none transition duration-150 ease-in-out',
    {
        variants: {
            variant: {
                primary: 'bg-custom text-custom border border-custom-gray w-full px-4 py-4 rounded-md focus:ring-2 focus:ring-custom focus:border-transparent',
            }
        },
        defaultVariants: {
            variant: 'primary',
        },
    }
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof inputStyles> {
    placeholder?: string;
}

const Input: React.FC<InputProps> = ({ variant, className, placeholder, ...props }) => {
    return (
        <input className={inputStyles({ variant, className })} placeholder={placeholder} {...props} />
    );
};

export default Input;
