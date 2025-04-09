import React from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../../ui/Profile/Avatar';
import Button from '../../ui/Button/Button';
import Card from '../../ui/Card/Card';
import Badge from '../../ui/Badge/Badge';

interface User {
    user_id: number;
    username: string;
    email: string;
    avatar: string | null;
    place: string | null;
    banner: string | null;
    link: string | null;
    bio: string | null;
}

interface UserProfileCardProps {
    user: User;
    followers: number;
    following: number;
    showEditButton?: boolean;
    showBlockedUsersButton?: boolean;
    isCurrentUser?: boolean;
    onSubscribe?: () => void;
    className?: string;
}

const defaultAvatar = '../../public/default-avata.webp';

const UserProfileCard: React.FC<UserProfileCardProps> = ({
    user,
    followers,
    following,
    showEditButton = true,
    showBlockedUsersButton = true,
    isCurrentUser = true,
    onSubscribe,
    className = ''
}) => {
    const navigateTo = useNavigate();

    return (
        <div className={`w-full bg-custom border border-custom-gray rounded-lg p-4 ${className}`}>
            {/* Stats de followers/following */}
            <div className="flex flex-row justify-around text-center mb-4">
                <div className="flex flex-col items-center">
                    <p className="font-bold text-xl text-custom">{followers}</p>
                    <p className="text-sm text-custom-light-gray">Followers</p>
                </div>
                <div className="flex flex-col items-center">
                    <p className="font-bold text-xl text-custom">{following}</p>
                    <p className="text-sm text-custom-light-gray">Following</p>
                </div>
            </div>
            
            {/* Profil utilisateur */}
            <div className="flex flex-row items-start gap-4">
                {/* Informations et bio */}
                <div className="flex flex-col flex-grow gap-3">
                    <div>
                        <h1 className="font-bold text-2xl md:text-3xl text-custom">{user.username}</h1>
                        <h2 className="text-custom-light-gray text-sm">{user.email}</h2>
                    </div>
                    
                    {user.bio && (
                        <p className="text-custom italic text-sm">{user.bio}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                        {user.place && (
                            <Badge variant="secondary" size="sm">{user.place}</Badge>
                        )}
                        
                        {user.link && (
                            <a href={user.link} className="text-custom-blue hover:underline text-sm break-all">
                                {user.link}
                            </a>
                        )}
                    </div>
                </div>
                
                {/* Avatar et boutons */}
                <div className="flex flex-col items-end gap-3">
                    <Avatar 
                        avatar={user.avatar || defaultAvatar} 
                        className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden" 
                    />
                    
                    <div className="flex flex-col gap-2">
                        {isCurrentUser ? (
                            <>
                                {showEditButton && (
                                    <Button
                                        variant="quaternary"
                                        onClick={() => navigateTo('/profile/edit')}
                                    >
                                        Edit Profile
                                    </Button>
                                )}
                                
                                {showBlockedUsersButton && (
                                    <Button
                                        variant="quaternary"
                                        onClick={() => navigateTo('/blocked-users')}
                                    >
                                        Blocked Users
                                    </Button>
                                )}
                            </>
                        ) : (
                            <Button
                                variant="quaternary"
                                onClick={onSubscribe}
                            >
                                {followers > 0 ? 'Unfollow' : 'Follow'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfileCard; 