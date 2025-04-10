import { iconStyles } from '../../lib/utils';

interface CloseIconProps {
    className?: string;
    alt?: string;
    size?: 'small' | 'medium' | 'large' | 'xlarge';
}

export function CloseIcon({ className, alt, size }: CloseIconProps) {
    return (
        <img src="/~savary23/SAE401/CycleC/dist/Close.svg" alt={alt} className={ iconStyles({size, className})} />
    );
};