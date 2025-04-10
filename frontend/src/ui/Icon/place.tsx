import { iconStyles } from '../../lib/utils';

interface placeIconProps {
    className?: string;
    alt?: string;
    size?: 'small' | 'medium' | 'large' | 'xlarge';
}

export function placeIcon({ className, alt, size }: placeIconProps) {
    return (
        <img src="/~savary23/SAE401/CycleC/dist/placeicon.svg" alt={alt} className={ iconStyles({size, className})} />
    );
};