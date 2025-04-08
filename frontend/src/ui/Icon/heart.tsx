import React from 'react';
import { iconStyles } from '../../lib/utils';

interface HeartIconProps {
    filled?: boolean;
    className?: string;
    size?: 'small' | 'medium' | 'large';
}

export function HeartIcon({ filled = false, className = '', size = 'small' }: HeartIconProps) {
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
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
    );
} 