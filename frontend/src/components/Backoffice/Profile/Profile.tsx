import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../ui/Button/Button';
import { apiRequest } from '../../../lib/api-request';

interface User {
    user_id: number;
    username: string;
    email: string;
    avatar: string | null;
    is_blocked: boolean; // Ajout de la propriété is_blocked
}

interface ProfileProps {
    users: User[];
}

const Profile = ({ users }: ProfileProps) => {
    const navigate = useNavigate();
    const [userStates, setUserStates] = useState(users);

    const handleEditClick = (userId: number) => {
        navigate(`/admin/edit/${userId}`);
    };

    const toggleBlockUser = async (userId: number, isBlocked: boolean) => {
        try {
            const endpoint = isBlocked ? `/user/unblock/${userId}` : `/user/block/${userId}`;
            const response = await apiRequest(endpoint, { method: 'POST' });
    
            if (response.ok) {
                setUserStates(prevState =>
                    prevState.map(user =>
                        user.user_id === userId ? { ...user, is_blocked: !isBlocked } : user
                    )
                );
            } else {
                console.error('Failed to toggle block status');
            }
        } catch (error) {
            console.error('Error toggling block status:', error);
        }
    };

    return (
        <div className="bg-custom flex flex-col items-center w-full pt-6 overflow-scroll">
            {userStates.map(user => (
                <div key={user.user_id} className='flex flex-col items-center w-full py-2 border-b border-custom-gray px-4 justify-between'>
                    <div className='flex items-center w-full'>
                    <img
                        src={user.avatar || '../../../public/default-avata.webp'}
                        className='rounded-full max-w-8 max-h-8 aspect-square'
                        alt={`${user.username}'s avatar`}
                    />
                    <div className="px-4 w-full">
                        <div className="flex flex-col justify-between mb-2">
                            <span className="font-bold mr-2 text-custom">{user.username}</span>
                            <span className="text-sm text-custom-light-gray">{user.email}</span>
                            
                        </div>
                    </div>
                    {user.is_blocked && <span className="text-red-500 font-bold">Blocked</span>}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="quaternary" onClick={() => handleEditClick(user.user_id)}>Edit</Button>
                        <Button
                            variant={user.is_blocked ? 'senary' : 'quinary'}
                            onClick={() => toggleBlockUser(user.user_id, user.is_blocked)}
                        >
                            {user.is_blocked ? 'Unblock' : 'Block'}
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Profile;