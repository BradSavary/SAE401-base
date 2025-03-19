import { iconStyles } from '../../lib/utils';

interface CloseIconProps {
    className?: string;
    alt?: string;
    size?: 'small' |'xsmall'| 'medium' | 'large' | 'xlarge';
}

export function CloseIcon({ className, alt, size }: CloseIconProps) {
    return (
        <img src='../../../public/Close.svg' alt={alt} className={ iconStyles({size, className})} />
    );
};