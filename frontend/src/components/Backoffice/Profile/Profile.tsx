import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../ui/Button/Button';

interface User {
    user_id: number;
    username: string;
    email: string;
    avatar: string | null; // Ajout de l'avatar
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
                    <img
                        src={user.avatar || '../../../public/default-avata.webp'} // Utilisation de l'URL de l'avatar
                        className='rounded-full max-w-8 max-h-8 aspect-square'
                        alt={`${user.username}'s avatar`}
                    />
                    <div className="px-4 w-full">
                        <div className="flex flex-col justify-between mb-2">
                            <span className="font-bold mr-2 text-custom">{user.username}</span>
                            <span className="text-sm text-custom-light-gray">{user.email}</span>
                        </div>
                    </div>
                    <Button variant="quaternary" onClick={() => handleEditClick(user.user_id)}>Edit</Button>
                </div>
            ))}
        </div>
    );
};

export default Profile;