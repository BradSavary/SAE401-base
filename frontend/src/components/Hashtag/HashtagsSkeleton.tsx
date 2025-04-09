import React from 'react';

interface HashtagsSkeletonProps {
    columns?: number;
    count?: number;
}

export function HashtagsSkeleton({ columns = 2, count = 10 }: HashtagsSkeletonProps) {
    return (
        <div className={`grid grid-cols-${columns} md:grid-cols-${columns + 1} gap-3 animate-pulse`}>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="bg-custom-dark-gray rounded-lg p-3">
                    <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                </div>
            ))}
        </div>
    );
} 