import React from 'react';
import { cva, VariantProps } from 'class-variance-authority';

const textStyles = cva(
    'inline-flex items-center justify-center font-medium focus:outline-none transition duration-150 ease-in-out',
    {
        variants: {
            variant: {
                primary: 'bg-custom text-custom w-full min-h-96 focus:border-none resize-none white-space-pre-wrap',
            }
        },
        defaultVariants: {
            variant: 'primary',
        },
    }
);

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, VariantProps<typeof textStyles> {
    placeholder?: string;
}

const TextArea = ({ variant, className, placeholder, ...props }: TextAreaProps) => {
    return (
        <textarea className={textStyles({ variant, className })} placeholder={placeholder} {...props} />
    );
};

export default TextArea;
