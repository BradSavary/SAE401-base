import React, { JSX } from 'react';

function PostSkeleton(): JSX.Element {
    return (
        <div className='flex flex-row w-full animate-pulse items-start'>
            <div className='rounded-full bg-gray-300 min-w-8 min-h-8 mt-4 ml-2'></div>
            <div className="p-4 border-b border-custom-gray w-full">
                <div className="flex items-center justify-between mb-2">
                    <div className="bg-gray-300 h-4 w-1/4 rounded"></div>
                    <div className="bg-gray-300 h-4 w-1/6 rounded"></div>
                </div>
                <div className="bg-gray-300 h-4 w-full rounded mb-2"></div>
                <div className="bg-gray-300 h-4 w-5/6 rounded"></div>
            </div>
        </div>
    );
}

export { PostSkeleton };