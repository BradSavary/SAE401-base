import React from 'react';
import { iconStyles } from '../../lib/utils';
import { VariantProps } from 'class-variance-authority';

interface RetweetIconProps extends VariantProps<typeof iconStyles> {
  className?: string;
  alt?: string;
}

export function RetweetIcon({ size, className, alt = "Retweet" }: RetweetIconProps) {
  return (
    <svg
      className={iconStyles({ size, className })}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={alt}
    >
      <path
        d="M18 7L15 4V6H5V8H15V10L18 7ZM6 17L9 20V18H19V16H9V14L6 17Z"
        fillOpacity="0.87"
        fill="currentColor"
      />
    </svg>
  );
} 