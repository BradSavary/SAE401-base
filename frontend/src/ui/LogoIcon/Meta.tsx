import { iconStyles } from '../../lib/utils';

interface MetaIconProps {
    className?: string;
    alt?: string;
    size?: 'small' | 'medium' | 'large' | 'xlarge';
}

export function MetaIcon({ className, alt, size }: MetaIconProps) {
    return (
        <img src="/~savary23/SAE401/CycleC/dist/Meta.svg" alt={alt} className={ iconStyles({size, className})} />
    );
};