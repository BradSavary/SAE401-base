import { iconStyles } from '../../lib/utils';

interface ThreadsIconProps {
    className?: string;
    alt?: string;
    size?: 'small' | 'medium' | 'large' | 'xlarge';
}

export function ThreadsIcon({ className, alt, size }: ThreadsIconProps) {
    return (
        <img src='../../../public/threads-logo.svg' alt={alt} className={ iconStyles({size, className})} />
    );
};