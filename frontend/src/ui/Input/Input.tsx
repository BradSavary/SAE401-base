import React from 'react';
import { cva, VariantProps } from 'class-variance-authority';

const inputStyles = cva(
    'inline-flex items-center justify-center font-medium focus:outline-none transition duration-150 ease-in-out',
    {
        variants: {
            variant: {
                primary: 'bg-custom text-custom border border-custom-gray w-full px-4 py-4 rounded-md focus:ring-2 focus:ring-custom focus:border-transparent',
                secondary: 'bg-custom text-custom w-full h-auto focus:border-none resize-none white-space-pre-wrap',
                quaternary: 'cursor-pointer bg-custom border-2 border-custom-gray w-fit text-custom px-8 py-1 rounded-lg text-sm'
            }
        },
        defaultVariants: {
            variant: 'primary',
        },
    }
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof inputStyles> {
    placeholder?: string;
    type?: string;
}

const Input = ({ variant, className, placeholder, type = 'text', ...props }: InputProps) => {
    return (
        <input className={inputStyles({ variant, className })} placeholder={placeholder} type={type} {...props} />
    );
};

export default Input;
