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
import { apiRequest } from '../lib/api-request';
import { Post } from '../components/Post/Post';
import { timeAgo } from '../lib/utils'; // Import de la fonction timeAgo

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

interface PostData {
    id: number;
    username: string;
    content: string;
    created_at: {
        date: string; // Format de date retourné par l'API
        timezone_type: number;
        timezone: string;
    };
    avatar: string | null;
}

const defaultAvatar = '../../public/default-avata.webp';
const defaultBanner = '../../public/banner.jpeg';

export default function Profile() {
    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<'posts' | 'likes'>('posts'); // État pour l'onglet actif
    const [posts, setPosts] = useState<PostData[]>([]); // État pour les posts de l'utilisateur
    const [loadingPosts, setLoadingPosts] = useState<boolean>(false); // État pour le chargement des posts
    const user_id = localStorage.getItem('user_id');

    useEffect(() => {
        async function fetchUserProfile() {
            if (user_id) {
                const userInfo = await getUserProfile(user_id);
                setUser(userInfo);
            }
        }
        fetchUserProfile();
    }, [user_id]);

    useEffect(() => {
        // Charger les posts de l'utilisateur lorsque l'onglet "Your posts" est actif
        async function fetchUserPosts() {
            if (activeTab === 'posts' && user_id) {
                setLoadingPosts(true);
                try {
                    const response = await apiRequest(`/posts/user/${user_id}`);
                    const data = await response.json();
                    setPosts(data); // Mettre à jour les posts
                } catch (error) {
                    console.error('Error fetching user posts:', error);
                } finally {
                    setLoadingPosts(false);
                }
            }
        }
        fetchUserPosts();
    }, [activeTab, user_id]);

    if (!user) {
        return <Skeleton count={1} />;
    }

    return (
        <div className="flex flex-col text-custom bg-custom">
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
                        <h2 className='text-custom-light-gray'>{user.email}</h2>
                    </div>
                    {user.bio && <Bio bio={user.bio} className='flex flex-col italic' />}
                    <div className=''>
                        {user.place && <Place place={user.place} className='min-w-fit' />}
                        {user.link && <Site site={user.link} />}
                    </div>
                </div>
            </div>
            <div className='flex flex-row justify-around text-center text-custom-light-gray pt-5'>
                <p
                    className={`cursor-pointer pb-5 w-half ${activeTab === 'posts' ? 'border-b-4 border-custom-light-gray' : ''}`}
                    onClick={() => setActiveTab('posts')}
                >
                    Your posts
                </p>
                <p
                    className={`cursor-pointer pb-5 w-half ${activeTab === 'likes' ? 'border-b-4 border-custom-light-gray' : ''}`}
                    onClick={() => setActiveTab('likes')}
                >
                    Your likes
                </p>
            </div>
            <div className="flex flex-col items-center w-full pb-15">
                {activeTab === 'posts' && (
                    <div className="w-full">
                        {loadingPosts ? (
                            <Skeleton count={3} />
                        ) : (
                            posts.map(post => (
                                <Post
                                    key={post.id}
                                    username={post.username}
                                    content={post.content}
                                    date={timeAgo(new Date(post.created_at.date))} // Conversion de la date
                                    avatar={post.avatar ?? undefined}
                                />
                            ))
                        )}
                    </div>
                )}
                {activeTab === 'likes' && (
                    <div className="text-center text-custom-light-gray">
                        <p>Likes feature is not implemented yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}