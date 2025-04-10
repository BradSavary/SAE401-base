import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiRequest } from '../lib/api-request';
import PostList from '../components/Post/PostList';
import Banner from '../ui/Profile/Banner';
import Avatar from '../ui/Profile/Avatar';
import { checkBlockStatus, toggleBlockUser } from '../lib/block-service';

interface User {
  user_id: number;
  username: string;
  email: string;
  avatar: string | null;
  place: string | null;
  banner: string | null;
  link: string | null;
  bio: string | null;
  is_blocked?: boolean; // Utilisateur bloqué par l'administration
}

const defaultAvatar = '../../public/default-avata.webp';
const defaultBanner = '../../public/banner.jpeg';

export default function OtherProfile() {
  const { userName } = useParams<{ userName: string }>();
  const { user_id} = useParams<{ user_id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isBlocked, setIsBlocked] = useState<boolean>(false); // Utilisateur bloqué par l'utilisateur courant
  const [isBlockedBy, setIsBlockedBy] = useState<boolean>(false); // Utilisateur courant bloqué par cet utilisateur
  const [followers, setFollowers] = useState<number>(0);
  const [following, setFollowing] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'posts' | 'responses'>('posts'); // Onglet actif

  const checkSubscriptionStatus = async (userId: number) => {
    try {
      const response = await apiRequest(`/subscriptions/check/${userId}`);
      const data = await response.json();
      setIsSubscribed(data.isSubscribed); // Met à jour l'état en fonction de la réponse
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  // Vérifier le statut de blocage
  const checkBlockingStatus = async (userId: number) => {
    try {
      const blockStatus = await checkBlockStatus(userId);
      setIsBlocked(blockStatus.is_blocked);
      setIsBlockedBy(blockStatus.is_blocked_by);
    } catch (error) {
      console.error('Error checking block status:', error);
    }
  };

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const response = await apiRequest(`/user/username/${userName}`);
        const userData = await response.json();
        setUser(userData);
        await fetchSubscriptionCounts(userData.user_id);
        await checkSubscriptionStatus(userData.user_id);
        await checkBlockingStatus(userData.user_id); // Vérifier le statut de blocage
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    }
  
    fetchUserProfile();
  }, [userName]);

  const fetchSubscriptionCounts = async (userId: number) => {
    try {
      const response = await apiRequest(`/subscriptions/count/${userId}`);
      const data = await response.json();
      setFollowers(data.followers);
      setFollowing(data.following);
    } catch (error) {
      console.error('Error fetching subscription counts:', error);
    }
  };

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

  // Gérer le blocage/déblocage d'un utilisateur
  const handleToggleBlock = async () => {
    if (!user) return;

    try {
      const blocked = await toggleBlockUser(user.user_id);
      setIsBlocked(blocked);
      
      // Si on vient de bloquer l'utilisateur et qu'on était abonné, on se désabonne
      if (blocked && isSubscribed) {
        await handleUnsubscribe();
      }
      
      // Rafraîchir les compteurs d'abonnements
      await fetchSubscriptionCounts(user.user_id);
    } catch (error) {
      console.error('Error toggling block user:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  // Détermine si l'utilisateur est bloqué (soit par admin, soit par le blocage entre utilisateurs)
  const isUserUnavailable = isBlocked || isBlockedBy;
  const isAdminBlocked = user.is_blocked;

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
      <div className="flex flex-row-reverse p-4 items-start justify-between">
      <div className="flex flex-col items-center justify-between gap-5">
        <Avatar avatar={user.avatar || defaultAvatar} className="w-20 aspect-square rounded-full overflow-hidden" />
        
        {/* Bouton d'abonnement - masqué si bloqué par l'administration ou par l'utilisateur */}
        {!isBlockedBy && !isAdminBlocked && (
          <button
            onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
            className={`px-4 py-2 rounded cursor-pointer ${
              isSubscribed ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
            }`}
            disabled={isBlocked}
          >
            {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
          </button>
        )}
        
        {/* Bouton de blocage - toujours visible sauf si bloqué par l'administration */}
        {!isAdminBlocked && (
          <button
            onClick={handleToggleBlock}
            className={`px-4 py-2 rounded cursor-pointer ${
              isBlocked ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
            }`}
          >
            {isBlocked ? 'Unblock' : 'Block'}
          </button>
        )}
        
        {/* Message si bloqué par l'utilisateur */}
        {isBlockedBy && (
          <p className="text-red-500 text-sm">This user has blocked you</p>
        )}
        
        {/* Message si bloqué par l'administration */}
        {isAdminBlocked && (
          <p className="text-red-500 text-sm">This user has been blocked by the administration</p>
        )}
      </div>
      <div className="flex flex-col w-full max-w-2xl gap-3">
        <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-4xl">{user.username}</h1>
          <h2 className="text-custom-light-gray">{user.email}</h2>
        </div>
        </div>
        {user.bio && <p className="flex flex-col italic">{user.bio}</p>}
        <div>
        {user.place && <p className="min-w-fit">{user.place}</p>}
        {user.link && <a href={user.link}>{user.link}</a>}
        </div>
      </div>
      </div>
      
      {/* N'afficher les onglets et le contenu que si l'utilisateur n'est pas bloqué ou n'a pas bloqué */}
      {!isUserUnavailable && !isAdminBlocked && (
        <>
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
          {activeTab === 'posts' ? (
            <PostList endpoint={`/posts/user/${user.user_id}`} className='mb-15'/>
          ) : (
            <PostList endpoint={`/responses/user/${user.user_id}`} className='mb-15'/>
          )}
        </>
      )}
      
      {/* Message si l'utilisateur est bloqué par l'administration */}
      {isAdminBlocked && (
        <div className="flex justify-center items-center p-8 text-center">
          <p className="text-gray-500">
            This user has been blocked by the administration. Their content is not available.
          </p>
        </div>
      )}
      
      {/* Message si l'utilisateur est bloqué ou a bloqué l'utilisateur courant */}
      {isUserUnavailable && !isAdminBlocked && (
        <div className="flex justify-center items-center p-8 text-center">
          <p className="text-gray-500">
            {isBlockedBy 
              ? "You can't see this user's content because they have blocked you." 
              : "You can't see this user's content because you have blocked them."}
          </p>
        </div>
      )}
    </div>
  );
}