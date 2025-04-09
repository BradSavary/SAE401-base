import React from 'react';
import PostSkeleton from './PostSkeleton';

interface PostSkeletonListProps {
    count?: number;
    className?: string;
}

export default function PostSkeletonList({ count = 3, className = '' }: PostSkeletonListProps) {
    return (
        <div className={`space-y-4 ${className}`}>
            {Array.from({ length: count }).map((_, index) => (
                <PostSkeleton key={index} />
            ))}
        </div>
    );
} 