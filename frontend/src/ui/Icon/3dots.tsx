import { iconStyles } from '../../lib/utils';

interface dotsIconProps {
    className?: string;
    alt?: string;
    size?: 'small' | 'medium' | 'large' | 'xlarge';
    onClick?: () => void;
}

export function DotsIcon({ className, alt, size, onClick }: dotsIconProps) {
    return (
        <img onClick={onClick} src="/~savary23/SAE401/CycleC/dist/3dots.svg" alt={alt} className={ iconStyles({size, className})} />
    );
};