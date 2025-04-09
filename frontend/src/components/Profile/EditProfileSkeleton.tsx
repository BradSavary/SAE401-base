import React from 'react';

export function EditProfileSkeleton() {
    return (
        <div className="flex flex-col items-center h-screen bg-custom py-4 pb-12 gap-8 overflow-scroll animate-pulse">
            <div className="w-32 h-8 bg-gray-300 rounded"></div>
            <div className="absolute top-0 left-0 m-4 w-8 h-8 bg-gray-300 rounded-full"></div>
            
            {/* Banner skeleton */}
            <div className='flex flex-col w-full justify-center items-center'>
                <div className="w-full h-32 bg-gray-300 rounded overflow-hidden aspect-custom-banner" />
                <div className='text-custom font-medium self-start pl-5 w-24 h-4 bg-gray-300 rounded mt-2'></div>
                <div className="w-full mt-2 h-10 bg-gray-300 rounded"></div>
            </div>
            
            {/* Avatar skeleton */}
            <div className='w-full flex flex-col p-4 items-center justify-between'>
                <div className="w-20 h-20 rounded-full bg-gray-300 overflow-hidden" />
                <div className='text-custom font-medium self-start pl-5 w-24 h-4 bg-gray-300 rounded mt-2'></div>
                <div className="w-full mt-2 h-10 bg-gray-300 rounded"></div>
            </div>
            
            {/* Form fields skeleton */}
            <div className="w-full flex flex-col justify-center space-y-4 px-4">
                <div className="h-12 bg-gray-300 rounded"></div>
                <div className="h-12 bg-gray-300 rounded"></div>
                <div className="h-12 bg-gray-300 rounded"></div>
                <div className="h-12 bg-gray-300 rounded"></div>
                <div className="h-12 bg-gray-300 rounded"></div>
                
                {/* Toggle switch skeleton */}
                <div className="flex items-center justify-between h-10 px-3">
                    <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-300 rounded w-3/4 mt-2"></div>
                    </div>
                    <div className="w-12 h-6 bg-gray-300 rounded-full"></div>
                </div>
                
                <div className="h-12 bg-gray-300 rounded"></div>
            </div>
        </div>
    );
} 