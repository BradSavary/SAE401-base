import React from 'react';
import { HashtagsSkeleton } from '../Hashtag/HashtagsSkeleton';
import PostSkeletonList from '../Post/PostSkeletonList';

export function SearchSkeleton() {
    return (
        <div className="px-4 bg-custom pb-15">
            {/* Hashtag results skeleton */}
            <div className="mb-6">
                <div className="h-8 bg-gray-300 rounded w-32 mb-3 animate-pulse"></div>
                <HashtagsSkeleton columns={2} count={6} />
            </div>
            
            {/* User results skeleton */}
            <div className="mb-6">
                <div className="h-8 bg-gray-300 rounded w-24 mb-3 animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-pulse">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div 
                            key={index}
                            className="bg-custom-dark-gray rounded-lg p-3 flex items-center gap-3"
                        >
                            <div className="w-12 h-12 rounded-full bg-gray-300"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                                <div className="h-3 bg-gray-300 rounded w-16"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Posts results skeleton */}
            <div className="mb-6">
                <div className="h-8 bg-gray-300 rounded w-24 mb-3 animate-pulse"></div>
                <PostSkeletonList count={3} />
            </div>
        </div>
    );
} 