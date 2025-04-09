import React from 'react';

export function BlockedUsersSkeleton() {
    return (
        <div className="max-w-4xl mx-auto p-4 animate-pulse">
            <div className="flex justify-between items-center mb-6">
                <div className="h-8 bg-gray-300 rounded w-32"></div>
                <div className="h-10 bg-gray-300 rounded w-24"></div>
            </div>

            <ul className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                    <li key={index} className="border p-4 rounded-lg flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gray-300"></div>
                            <div className="flex flex-col">
                                <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                                <div className="h-3 bg-gray-300 rounded w-32"></div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="h-8 bg-gray-300 rounded w-20"></div>
                            <div className="h-8 bg-gray-300 rounded w-16"></div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
} 