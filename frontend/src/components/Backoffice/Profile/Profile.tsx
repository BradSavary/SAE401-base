import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../ui/Button/Button';

interface User {
    username: string;
    user_id: number;
    email: string;
    is_verified: boolean;
}

interface ProfileProps {
    users: User[];
}

const Profile = ({ users }: ProfileProps) => {
    const navigate = useNavigate();

    const handleEditClick = (userId: number) => {
        navigate(`/admin/edit/${userId}`);
    };

    return (
        <div className="bg-custom flex flex-col items-center w-full pt-6">
            {users.map(user => (
                <div key={user.user_id} className='flex flex-row items-center w-full m-1 py-2 border-b border-custom-gray px-4 justify-between'>
                    <img src="../../../public/default-avata.webp" className='rounded-full max-w-8 max-h-8' alt="Post image" />
                    <div className="px-4 w-full">
                        <div className="flex flex-col justify-between mb-2">
                            <span className="font-bold mr-2 text-custom">{user.username}</span>
                            <span className="text-custom-light-gray text-xs">{user.email}</span>
                            {user.is_verified === false && <span className="text-red-500 text-xs">Unverified user</span>}
                        </div>
                    </div>
                    <Button variant={'quaternary'} onClick={() => handleEditClick(user.user_id)}>Edit</Button>
                </div>
            ))}
        </div>
    );
};

export default Profile;