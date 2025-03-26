import React, { useState, useEffect } from 'react';
import { getUserProfile } from '../../data/userProfile';
import Avatar from '../ui/Profile/Avatar';
import Banner from '../ui/Profile/Banner';
import Input from '../ui/Input/Input';
import Button from '../ui/Button/Button';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api-request';
import { Link } from 'react-router-dom';
import { ArrowIcon } from '../ui/Icon/arrow';

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

const defaultAvatar = '../../public/default-avata.webp';
const defaultBanner = '../../public/banner.jpeg';

export default function EditProfile() {
    const [user, setUser] = useState<User | null>(null);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [bio, setBio] = useState('');
    const [place, setPlace] = useState('');
    const [link, setLink] = useState('');
    const navigate = useNavigate();
    const user_id = localStorage.getItem('user_id');

    useEffect(() => {
        async function fetchUserProfile() {
            if (user_id) {
                const userInfo = await getUserProfile(user_id);
                setUser(userInfo);
                setUsername(userInfo.username);
                setEmail(userInfo.email);
                setBio(userInfo.bio || '');
                setPlace(userInfo.place || '');
                setLink(userInfo.link || '');
            }
        }
        fetchUserProfile();
    }, [user_id]);

    const handleSave = async () => {
        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('email', email);
            formData.append('bio', bio);
            formData.append('place', place);
            formData.append('link', link);
    
            // Ajoutez les fichiers si sélectionnés
            const avatarInput = document.querySelector<HTMLInputElement>('input[name="avatar"]');
            const bannerInput = document.querySelector<HTMLInputElement>('input[name="banner"]');
            if (avatarInput?.files?.[0]) {
                formData.append('avatar', avatarInput.files[0]);
            }
            if (bannerInput?.files?.[0]) {
                formData.append('banner', bannerInput.files[0]);
            }
    
            // Utilisation de apiRequest
            const response = await apiRequest(`/user/updateprofile/${user_id}`, {
                method: 'POST',
                body: formData,
            });
    
            if (response.ok) {
                alert('Profile updated successfully!');
                navigate('/profile');
            } else {
                const errorData = await response.json();
                console.error('Error updating profile:', errorData);
                alert('Failed to update profile. Please try again.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        }
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col items-center h-screen bg-custom py-4 pb-12 gap-8 overflow-scroll">
            <h2 className='text-custom font-bold text-2xl'>Edit Profile</h2>
            <Link to="/profile">
                <ArrowIcon className="absolute top-0 left-0 m-4" alt="Back-arrow" />
            </Link>
            <div className='flex flex-col w-full justify-center items-center'>
                <Banner banner={user.banner || defaultBanner} className="w-full overflow-hidden aspect-custom-banner" />
                <p className='text-custom font-medium self-start pl-5'>Edit Banner:</p>
                <Input type='file' name="banner" variant="quaternary" />
            </div>
            <div className='w-full flex flex-col p-4 items-center justify-between'>
                <Avatar avatar={user.avatar || defaultAvatar} className="w-20 h-20 rounded-full overflow-hidden" />
                <p className='text-custom font-medium self-start pl-5'>Edit Avatar:</p>
                <Input type='file' name="avatar" variant="quaternary" />
            </div>
            <div className="w-full flex flex-col justify-center space-y-4">
                <Input
                    variant="primary"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <Input
                    variant="primary"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                    variant="primary"
                    placeholder="Bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                />
                <Input
                    variant="primary"
                    placeholder="Place"
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                />
                <Input
                    variant="primary"
                    placeholder="Link"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                />
                <Button variant="secondary" onClick={handleSave}>Save</Button>
            </div>
        </div>
    );
}