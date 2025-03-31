import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Avatar from '../ui/Profile/Avatar';
import Banner from '../ui/Profile/Banner';
import Bio from '../ui/Profile/Bio';
import Place from '../ui/Profile/Place';
import Site from '../ui/Profile/Link';
import { apiRequest } from '../lib/api-request';
import { Post } from '../components/Post/Post';
import { timeAgo } from '../lib/utils';

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
    date: string;
    timezone_type: number;
    timezone: string;
  };
  avatar: string | null;
  user_id: number;
  userLiked?: boolean;
  isBlocked: boolean;
}

const defaultAvatar = '../../public/default-avata.webp';
const defaultBanner = '../../public/banner.jpeg';

export default function OtherProfile() {
  const { userName } = useParams<{ userName: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'responses'>('posts'); // Onglet actif
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false); // État pour l'abonnement
  const [followers, setFollowers] = useState<number>(0);
const [following, setFollowing] = useState<number>(0);


useEffect(() => {
  async function fetchUserProfile() {
      try {
          const response = await apiRequest(`/user/username/${userName}`);
          const userData = await response.json();
          setUser(userData);

          const postsResponse = await apiRequest(`/posts/user/${userData.user_id}`);
          const postsData = await postsResponse.json();
          const updatedPosts = postsData.map((post: PostData) => ({
              ...post,
              isBlocked: post.isBlocked, // Ajout de l'état de blocage
          }));
          setPosts(updatedPosts);
      } catch (error) {
          console.error('Error fetching user profile:', error);
      } finally {
          setLoading(false);
      }
  }

  fetchUserProfile();
}, [userName]);

  const handleSubscribe = async () => {
    if (!user) return;

    try {
      const response = await apiRequest(`/subscribe/${user.user_id}`, { method: 'POST' });
      if (response.ok) {
        setIsSubscribed(true);
      } else {
        console.error('Failed to subscribe');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  const handleUnsubscribe = async () => {
    if (!user) return;

    try {
      const response = await apiRequest(`/unsubscribe/${user.user_id}`, { method: 'DELETE' });
      if (response.ok) {
        setIsSubscribed(false);
      } else {
        console.error('Failed to unsubscribe');
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
    }
  };

  useEffect(() => {
    async function fetchSubscriptionCounts() {
      if (!user) return;
  
      try {
        const response = await apiRequest(`/subscriptions/count/${user.user_id}`);
        const data = await response.json();
        setFollowers(data.followers);
        setFollowing(data.following);
      } catch (error) {
        console.error('Error fetching subscription counts:', error);
      }
    }
  
    fetchSubscriptionCounts();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="flex flex-col text-custom bg-custom">
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
        <div className="flex flex-col items-center justify-between gap-5">
        <Avatar avatar={user.avatar || defaultAvatar} className="w-20 aspect-square rounded-full overflow-hidden" />
        <button
              onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
              className={`px-4 py-2 rounded cursor-pointer ${
                isSubscribed ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
              }`}
            >
              {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
            </button>
            </div>
        <div className="flex flex-col w-full max-w-2xl gap-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-bold text-4xl">{user.username}</h1>
              <h2 className="text-custom-light-gray">{user.email}</h2>
            </div>
        
          </div>
          {user.bio && <Bio bio={user.bio} className="flex flex-col italic" />}
          <div>
            {user.place && <Place place={user.place} className="min-w-fit" />}
            {user.link && <Site site={user.link} />}
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-around text-center text-custom-light-gray pt-5">
        <p
          className={`cursor-pointer pb-5 w-half ${activeTab === 'posts' ? 'border-b-4 border-custom-light-gray' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          Posts
        </p>
        <p
          className={`cursor-pointer pb-5 w-half ${activeTab === 'responses' ? 'border-b-4 border-custom-light-gray' : ''}`}
          onClick={() => setActiveTab('responses')}
        >
          Responses
        </p>
      </div>
      <div className="flex flex-col items-center w-full pb-15">
        {activeTab === 'posts' && (
          <div className="w-full">
            {posts.map(post => (
              <Post
                key={post.id}
                username={post.username}
                content={post.content}
                date={timeAgo(new Date(post.created_at.date))}
                avatar={post.avatar ?? undefined}
                user_id={post.user_id}
                post_id={post.id}
                userLiked={post.userLiked ?? false}
                onDelete={() => {}} // Pas de suppression ici
                isBlocked={post.isBlocked} // Passe l'état de blocage
              />
            ))}
          </div>
        )}
        {activeTab === 'responses' && (
          <div className="w-full">
            <p className="text-center text-custom-light-gray">Responses will be displayed here.</p>
          </div>
        )}
      </div>
    </div>
  );
}