import React from 'react';

const LoadingIcon = ({ className = '', size = 'medium', alt = 'Loading', isLoading = true }) => {
    const sizeClasses = size === 'xlarge' ? 'w-20 h-20' : 'w-10 h-10';
    const animationClass = isLoading ? 'animate-spin' : '';

    return (
        <div className={`flex items-center justify-center ${className}`} aria-label={alt}>
            <div className={`border-4 border-t-4 border-gray-200 border-t-black rounded-full ${sizeClasses} ${animationClass}`}></div>
        </div>
    );
};

export default LoadingIcon;