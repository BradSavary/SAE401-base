import React from 'react';
import { iconStyles } from '../../lib/utils';

interface ThumbsDownIconProps {
    filled?: boolean;
    className?: string;
    size?: 'small' | 'medium' | 'large';
}

export function ThumbsDownIcon({ filled = false, className = '', size = 'small' }: ThumbsDownIconProps) {
    return (
        <svg
            className={iconStyles({ size, className })}
            viewBox="0 0 24 24"
            fill={filled ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
            <line x1="23" y1="2" x2="17" y2="2" />
        </svg>
    );
} 