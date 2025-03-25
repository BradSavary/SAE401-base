import React from 'react';

export function ProfileSkeleton() {
    return (
        <div className="flex flex-col text-custom animate-pulse">
            <div className="w-full max-h-35  bg-gray-300"></div>
            <div className='flex flex-row-reverse p-4 items-start'>
                <div className="w-30 aspect-square rounded-full overflow-hidden bg-gray-300"></div>
                <div className='flex flex-col w-full max-w-2xl gap-3'>
                    <div>
                        <div className='h-8 bg-gray-300 rounded w-3/4 mb-2'></div>
                        <div className='h-6 bg-gray-300 rounded w-1/2'></div>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <div className='h-4 bg-gray-300 rounded w-full'></div>
                        <div className='h-4 bg-gray-300 rounded w-5/6'></div>
                        <div className='h-4 bg-gray-300 rounded w-4/6'></div>
                    </div>
                    <div className='flex gap-2'>
                        <div className='h-4 bg-gray-300 rounded w-1/4'></div>
                        <div className='h-4 bg-gray-300 rounded w-1/4'></div>
                    </div>
                </div>
            </div>
        </div>
    );
}