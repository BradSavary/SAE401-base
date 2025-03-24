import { iconStyles } from '../../lib/utils';

interface siteIconProps {
    className?: string;
    alt?: string;
    size?: 'small' | 'medium' | 'large' | 'xlarge';
}

export function siteIcon({ className, alt, size }: siteIconProps) {
    return (
        <img src='../../../public/siteicon.svg' alt={alt} className={ iconStyles({size, className})} />
    );
};