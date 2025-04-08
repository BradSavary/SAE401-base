import React, { useState } from 'react';

interface AvatarProps {
    avatar: string | null;
    className?: string;
}

const defaultAvatar = '/default-avata.webp';

const Avatar = ({ avatar, className }: AvatarProps) => {
    const [avatarError, setAvatarError] = useState(false);

    const handleAvatarError = () => {
        setAvatarError(true);
    };

    return (
        <div className={`rounded-full overflow-hidden ${className}`}>
            {avatar && !avatarError ? (
                <img 
                    src={avatar} 
                    alt="User Avatar" 
                    className="w-full h-full object-cover"
                    onError={handleAvatarError}
                />
            ) : (
                <img 
                    src={defaultAvatar} 
                    alt="Default Avatar" 
                    className="w-full h-full object-cover"
                />
            )}
        </div>
    );
};

export default Avatar;