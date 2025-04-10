import { iconStyles } from '../../lib/utils';

interface settingsIconProps {
    className?: string;
    alt?: string;
    size?: 'small' |'xsmall'| 'medium' | 'large' | 'xlarge';
}

export function SettingsIcon({ className, alt, size }: settingsIconProps) {
    return (
        <img src="/~savary23/SAE401/CycleC/dist/settings.svg" alt={alt} className={ iconStyles({size, className})} />
    );
};