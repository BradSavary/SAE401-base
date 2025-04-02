import React, { useRef, useEffect } from 'react';
import { cva, VariantProps } from 'class-variance-authority';

const textStyles = cva(
    'inline-flex items-center justify-center font-medium focus:outline-none transition duration-150 ease-in-out',
    {
        variants: {
            variant: {
                primary: 'bg-custom text-custom w-full min-h-20 focus:border-none resize-none white-space-pre-wrap',
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

function TextArea({ variant, className, placeholder, value, ...props }: TextAreaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Fonction pour ajuster la hauteur
    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            // Réinitialiser d'abord la hauteur pour obtenir la bonne valeur de scrollHeight
            textarea.style.height = 'auto';
            // Définir la hauteur basée sur le contenu
            textarea.style.height = `${Math.max(80, textarea.scrollHeight)}px`; // 80px est la hauteur minimale
        }
    };

    // Ajuster la hauteur lors des changements de valeur
    useEffect(() => {
        adjustHeight();
    }, [value]);

    // Ajuster la hauteur après le rendu initial
    useEffect(() => {
        adjustHeight();
    }, []);

    return (
        <textarea 
            ref={textareaRef}
            className={textStyles({ variant, className })} 
            placeholder={placeholder}
            value={value}
            onChange={(e) => {
                if (props.onChange) {
                    props.onChange(e);
                }
                // La hauteur sera ajustée via l'effet useEffect déclenché par le changement de valeur
            }}
            {...props} 
        />
    );
}

export default TextArea;
