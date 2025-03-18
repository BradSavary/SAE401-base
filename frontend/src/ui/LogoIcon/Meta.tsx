import { iconStyles } from '../../lib/utils';

interface MetaIconProps {
    className?: string;
    alt?: string;
    size?: 'small' | 'medium' | 'large' | 'xlarge';
}

export function MetaIcon({ className, alt, size }: MetaIconProps) {
    return (
        <img src='../../../public/Meta.svg' alt={alt} className={ iconStyles({size, className})} />
    );
};