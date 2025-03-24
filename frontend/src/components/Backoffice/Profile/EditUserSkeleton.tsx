import React from 'react';

const EditUserSkeleton = () => {
    return (
        <div className="flex flex-col items-center h-screen bg-custom p-4 gap-8 animate-pulse">
            <div className="absolute top-0 left-0 m-4 w-8 h-8 bg-gray-300 rounded-full"></div>
            <div className="w-32 h-8 bg-gray-300 rounded"></div>
            <div className="rounded-full bg-gray-300 w-16 h-16"></div>
            <div className="w-full flex flex-col justify-centser space-y-4">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-10 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-10 bg-gray-300 rounded"></div>
                <div className="h-10 bg-gray-300 rounded w-1/2"></div>
            </div>
        </div>
    );
};

export default EditUserSkeleton;