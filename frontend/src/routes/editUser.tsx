import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../ui/Button/Button';
import Input from '../ui/Input/Input';
import { apiRequest } from '../lib/api-request';
import { ArrowIcon } from "../ui/Icon/arrow";
import { Link } from 'react-router-dom';
import EditUserSkeleton from '../components/Backoffice/Profile/EditUserSkeleton'; // Import the EditUserSkeleton component

interface User {
    user_id: number;
    username: string;
    email: string;
    avatar: string;
}

export function EditUser() {
    const { userId } = useParams<{ userId: string }>();
    const [user, setUser] = useState<User | null>(null);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch user data from API
        const fetchUser = async () => {
            try {
                const response = await apiRequest(`/api/users/${userId}`);
                const data = await response.json();
                setUser(data);
                setUsername(data.username);
                setEmail(data.email);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUser();
    }, [userId]);

    const handleSave = async () => {
        try {
            const response = await apiRequest(`/user/update/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email }),
            });
            if (response.ok) {
                alert('User updated successfully!');
                navigate('/admin');
            } else {
                const errorData = await response.json();
                console.error('Error updating user:', errorData);
                alert('Failed to update user. Please try again.');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Failed to update user. Please try again.');
        }
    };

    if (!user) {
        return <EditUserSkeleton />; // Render the skeleton loader if user data is not loaded
    }

    return (
        <div className="flex flex-col items-center h-screen bg-custom p-4 gap-8">
            <Link to="/admin">
                <ArrowIcon className="absolute top-0 left-0 m-4" alt="Back-arrow" />
            </Link>
            <h2 className='text-custom font-bold text-2xl'>Edit Profile</h2>
            <img src="../../public/default-avata.webp" alt="User avatar" className="rounded-full max-w-16 max-h-16" />
            <div className="w-full flex flex-col justify-center space-y-4">
                <p className="text-custom font-bold">Current Username: <span className='font-normal'>{user.username} </span></p>
                <div>
                    <Input
                        variant="primary"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div>
                    <p className="text-custom font-bold">Current Email: <span className='font-normal'>{user.email} </span></p>
                    <Input
                        variant="primary"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <Button variant="secondary" onClick={handleSave}>Save</Button>
            </div>
        </div>
    );
}