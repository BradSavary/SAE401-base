import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api-request';
import Banner from '../ui/Profile/Banner';
import PostList from '../components/Post/PostList';
import Post from '../components/Post/Post';
import Tabs from '../ui/Tabs/Tabs';
import Badge from '../ui/Badge/Badge';
import UserProfileCard from '../components/Profile/UserProfileCard';
import { ProfileSkeleton } from '../components/Profile/Skeleton';

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

const defaultBanner = '../../public/banner.jpeg';

export default function Profile() {
    const [user, setUser] = useState<User | null>(null);
    const [followers, setFollowers] = useState<number>(0);
    const [following, setFollowing] = useState<number>(0);
    const [activeTab, setActiveTab] = useState<string>('posts');
    const [pinnedPost, setPinnedPost] = useState<any>(null);
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

        async function fetchPinnedPost() {
            if (user_id) {
                try {
                    const response = await apiRequest(`/posts/user/${user_id}`);
                    const data = await response.json();
                    const pinned = data.posts.find((post: any) => post.is_pinned);
                    if (pinned) {
                        setPinnedPost(pinned);
                    }
                } catch (error) {
                    console.error('Error fetching posts:', error);
                }
            }
        }

        fetchUserProfile();
        fetchSubscriptionCounts();
        fetchPinnedPost();
    }, [user_id]);

    // Configuration des onglets
    const tabs = [
        { id: 'posts', label: 'Your posts' },
        { id: 'likes', label: 'Your likes' },
        { id: 'retweets', label: 'Your retweets' }
    ];

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
    };

    if (!user) {
        return <ProfileSkeleton />;
    }

    return (
        <div className="flex flex-col text-custom bg-custom">
            <Banner banner={user.banner || defaultBanner} className="w-full overflow-hidden max-h-35" />
            
            <div className="w-full md:max-w-2xl md:mx-auto px-4">
                <UserProfileCard
                    user={user}
                    followers={followers}
                    following={following}
                    isCurrentUser={true}
                    showEditButton={true}
                    showBlockedUsersButton={true}
                    className="mt-4 mb-4"
                />
                
                <div className="mb-4">
                    <Tabs 
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                        tabWidth="half"
                        className="pt-2"
                    />
                </div>
                
                {/* Post épinglé affiché séparément */}
                {activeTab === 'posts' && pinnedPost && (
                    <div className="mb-4">
                        <div className="border border-custom-gray border-dashed rounded-lg p-3 mb-2 bg-custom-dark-gray bg-opacity-20">
                            <h3 className="text-custom-light-gray text-sm mb-2 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                                <Badge variant="secondary" size="sm" shape="pill">Pinned Post</Badge>
                            </h3>
                            <Post post={pinnedPost} onDelete={() => {}} />
                        </div>
                    </div>
                )}
                
                {/* Liste des posts selon l'onglet actif */}
                {activeTab === 'posts' ? (
                    <PostList endpoint={`/posts/user/${user_id}`} className="mb-16" />
                ) : activeTab === 'likes' ? (
                    <PostList endpoint={`/posts/liked/${user_id}`} className="mb-16" />
                ) : (
                    <PostList endpoint={`/user/${user_id}/retweets`} className="mb-16" />
                )}
            </div>
        </div>
    );
}