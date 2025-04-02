import React, { useState, useEffect } from 'react';
import { RefreshIcon } from '../../ui/Icon/refresh';

interface RefreshButtonProps {
    onRefresh: () => void;
}

const RefreshButton = ({ onRefresh }: RefreshButtonProps) => {
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowButton(true);
        }, 5000); // 5000ms = 5 seconds

        return () => clearTimeout(timer); // Cleanup the timer on component unmount
    }, []);

    return (
        <div
            className={`fixed self-center z-20 transition-opacity transition-transform duration-300 ${
                showButton ? 'opacity-100 translate-y-25' : 'top-0 opacity-0 pointer-events-none'
            }`}
        >
            <button
                onClick={onRefresh}
                className="flex  bg-custom-blue text-white px-4 py-2 rounded-full shadow-md hover:bg-custom-dark-blue cursor-pointer"
            >
                <RefreshIcon size='xsmall'/>
                Refresh
            </button>
        </div>
    );
};

export default RefreshButton;