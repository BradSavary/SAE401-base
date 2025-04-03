import React from 'react';
import { iconStyles } from '../../lib/utils';
import { VariantProps } from 'class-variance-authority';

interface CommentIconProps extends VariantProps<typeof iconStyles> {
  className?: string;
  alt?: string;
}

export function CommentIcon({ size, className, alt = "Comment" }: CommentIconProps) {
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
        d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 18H4V8L12 13L20 8V18ZM12 11L4 6H20L12 11Z"
        fillOpacity="0.87"
        fill="currentColor"
      />
    </svg>
  );
} 