import { iconStyles } from '../../lib/utils';

interface ArrowIconProps {
    className?: string;
    alt?: string;
    size?: 'small' | 'medium' | 'large' | 'xlarge';
}

export function ArrowIcon({ className, alt, size }: ArrowIconProps) {
    return (
        <img src="/~savary23/SAE401/CycleC/dist/arrow.svg" alt={alt} className={ iconStyles({size, className})} />
    );
};