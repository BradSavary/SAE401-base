import React, { useState, useEffect } from 'react';
import { getUserProfile } from '../../data/userProfile';
import Avatar from '../ui/Profile/Avatar';
import Banner from '../ui/Profile/Banner';
import Bio from '../ui/Profile/Bio';
import Place from '../ui/Profile/Place';
import Site from '../ui/Profile/Link';
import Skeleton from '../components/Backoffice/Profile/Skeleton';
import Button from '../ui/Button/Button';
import { Link } from 'react-router-dom';

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

export default function Profile() {
    const [user, setUser] = useState<User | null>(null);
    const user_id = localStorage.getItem('user_id');

    useEffect(() => {
        async function fetchUserProfile() {
            if (user_id) {
                const userInfo = await getUserProfile(user_id);
                console.log(userInfo);
                setUser(userInfo);
            }
        }
        fetchUserProfile();
    }, [user_id]);

    if (!user ) {
        return <Skeleton count={1} />;
    }

    return (
        <div className="flex flex-col  text-custom">
            <Banner banner={user.banner || defaultBanner} className="w-full overflow-hidden max-h-35 aspect-custom-banner" />
            <div className='flex flex-row-reverse p-4 items-start'>
                <div className='h-full flex flex-col items-end justify-between gap-5'>
            <Avatar avatar={user.avatar || defaultAvatar} className="w-20 aspect-square rounded-full overflow-hidden" />
            <Link to="/profile/edit">
            <Button variant="quaternary">Edit</Button>
            </Link>
            </div>
            <div className='flex flex-col w-full max-w-2xl gap-3'>
            <div>
            <h1 className='font-bold text-4xl'>{user.username}</h1>
            <h2 className='text-custom-light-gray '>{user.email}</h2>
            </div>
                {user.bio && <Bio bio={user.bio} className='flex flex-col' />}
                <div className=''>
                {user.place && 
                <Place place={user.place} className='min-w-fit'
                />}
                {user.link && 
                <Site site={user.link} />
                }
                </div>
            </div>
            </div>
        </div>
        
    );
}