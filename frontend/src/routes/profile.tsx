import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api-request';
import Banner from '../ui/Profile/Banner';
import Avatar from '../ui/Profile/Avatar';
import PostList from '../components/Post/PostList';

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
    const [followers, setFollowers] = useState<number>(0);
    const [following, setFollowing] = useState<number>(0);
    const [activeTab, setActiveTab] = useState<'posts' | 'likes'>('posts'); // Onglet actif
    const user_id = localStorage.getItem('user_id');

    useEffect(() => {
        async function fetchUserProfile() {
            if (user_id) {
                try {
                    const response = await apiRequest(`/user/${user_id}`);
                    const userData = await response.json();
                    setUser(userData);
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                }
            }
        }

        async function fetchSubscriptionCounts() {
            if (user_id) {
                try {
                    const response = await apiRequest(`/subscriptions/count/${user_id}`);
                    const data = await response.json();
                    setFollowers(data.followers || 0);
                    setFollowing(data.following || 0);
                } catch (error) {
                    console.error('Error fetching subscription counts:', error);
                }
            }
        }

        fetchUserProfile();
        fetchSubscriptionCounts();
    }, [user_id]);

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col text-custom bg-custom pb-15">
            <Banner banner={user.banner || defaultBanner} className="w-full overflow-hidden max-h-35" />
            <div className="flex flex-row justify-around text-center text-custom-light-gray pt-5">
                <div className="flex flex-col items-center">
                    <p className="font-bold text-xl text-custom-dark-gray">{followers}</p>
                    <p className="text-sm text-custom-light-gray">Followers</p>
                </div>
                <div className="flex flex-col items-center">
                    <p className="font-bold text-xl text-custom-dark-gray">{following}</p>
                    <p className="text-sm text-custom-light-gray">Following</p>
                </div>
            </div>
            <div className="flex flex-row-reverse p-4 items-start">
                <div className="h-full flex flex-col items-end justify-between gap-5">
                    <Avatar avatar={user.avatar || defaultAvatar} className="w-20 aspect-square rounded-full overflow-hidden" />
                </div>
                <div className="flex flex-col w-full max-w-2xl gap-3">
                    <div>
                        <h1 className="font-bold text-4xl">{user.username}</h1>
                        <h2 className="text-custom-light-gray">{user.email}</h2>
                    </div>
                    {user.bio && <p className="flex flex-col italic">{user.bio}</p>}
                    <div>
                        {user.place && <p className="min-w-fit">{user.place}</p>}
                        {user.link && <a href={user.link}>{user.link}</a>}
                    </div>
                </div>
            </div>
            <div className="flex flex-row justify-around text-center text-custom-light-gray pt-5">
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
            {activeTab === 'posts' ? (
    <PostList endpoint={`/posts/user/${user_id}`} className="mb-5" />
) : (
    <PostList endpoint={`/posts/liked/${user_id}`} className="mb-5" />
)}
        </div>
    );
}