import React from 'react';
import { cva, VariantProps } from 'class-variance-authority';

const buttonStyles = cva(
    'inline-flex items-center justify-center font-medium focus:outline-none transition duration-150 ease-in-out',
    {
        variants: {
            variant: {
                primary: 'cursor-pointer bg-custom-inverse text-custom-inverse w-full px-4 py-2 rounded-full',
                secondary: 'cursor-pointer bg-custom-blue text-custom w-full px-4 py-3 rounded-full',
                tertiary: 'cursor-pointer bg-custom-inverse w-fit text-custom-inverse px-5 py-2 rounded-full',
                quaternary: 'cursor-pointer bg-custom border-2 border-custom-gray w-fit text-custom px-8 py-1 rounded-lg text-sm',
            }
        },
        defaultVariants: {
            variant: 'primary',
        },
    }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonStyles> {}

const Button = ({ variant, className, ...props }: ButtonProps) => {
    return (
        <button className={buttonStyles({ variant, className })} {...props}>
            {props.children}
        </button>
    );
};

export default Button;