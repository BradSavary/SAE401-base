import React from 'react';

export function ProfileSkeleton() {
    return (
        <div className="flex flex-col text-custom bg-custom animate-pulse">
            <div className="w-full overflow-hidden max-h-35 aspect-custom-banner bg-gray-300" />
            <div className="flex flex-row-reverse p-4 items-start">
                <div className="h-full flex flex-col items-end justify-between gap-5">
                    <div className="w-20 aspect-square rounded-full bg-gray-300" />
                    <div className="w-20 h-8 bg-gray-300 rounded" />
                </div>
                <div className="flex flex-col w-full max-w-2xl gap-3">
                    <div>
                        <div className="w-1/2 h-8 bg-gray-300 rounded" />
                        <div className="w-1/3 h-6 bg-gray-300 rounded mt-2" />
                    </div>
                    <div className="w-full h-6 bg-gray-300 rounded" />
                    <div className="flex gap-2">
                        <div className="w-20 h-6 bg-gray-300 rounded" />
                        <div className="w-20 h-6 bg-gray-300 rounded" />
                    </div>
                </div>
            </div>
            <div className="flex flex-row justify-around text-center text-custom-light-gray pt-5">
                <div className="w-1/4 h-6 bg-gray-300 rounded" />
                <div className="w-1/4 h-6 bg-gray-300 rounded" />
            </div>
            <div className="flex flex-col items-center w-full pb-15">
                <div className="w-full">
                    <div className="w-full h-20 bg-gray-300 rounded mb-4" />
                    <div className="w-full h-20 bg-gray-300 rounded mb-4" />
                    <div className="w-full h-20 bg-gray-300 rounded mb-4" />
                </div>
            </div>
        </div>
    );
}