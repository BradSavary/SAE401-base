import React from 'react';

interface AvatarProps {
    avatar: string | null;
    className?: string;
}

const Avatar = ({ avatar, className }: AvatarProps) => {
    return (
        <div className={`rounded-full overflow-hidden ${className}`}>
            {avatar ? <img src={avatar} alt="User Avatar" className="w-full h-full object-cover" /> : <div className="default-avatar w-full h-full">No Avatar</div>}
        </div>
    );
};

export default Avatar;