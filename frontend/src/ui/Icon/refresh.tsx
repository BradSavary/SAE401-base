import { iconStyles } from '../../lib/utils';

interface refreshIconProps {
    className?: string;
    alt?: string;
    size?: 'small' |'xsmall'| 'medium' | 'large' | 'xlarge';
}

export function RefreshIcon({ className, alt, size }: refreshIconProps) {
    return (
        <img src='../../../public/refresh.svg' alt={alt} className={ iconStyles({size, className})} />
    );
};