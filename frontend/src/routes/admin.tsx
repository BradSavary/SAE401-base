import React, { useEffect, useState, JSX } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThreadsIcon } from '../ui/LogoIcon/threads';
import Button from '../ui/Button/Button';
import { apiRequest } from '../lib/api-request';
import Profile from '../components/Backoffice/Profile/Profile';
import Skeleton from '../components/Backoffice/Profile/Skeleton';
import LoadingIcon from '../ui/Loading/LoadingIcon';
import ContentModerationPanel from '../components/Backoffice/Moderation/ContentModerationPanel';

interface User {
    username: string;
    user_id: number;
    email: string;
    is_verified: boolean;
    avatar: string | null;
    is_blocked: boolean;
}

function Admin(): JSX.Element {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'posts' | 'comments'>('users');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const apiToken = localStorage.getItem('accessToken');
        if (!apiToken) {
          throw new Error('API token is missing');
        }
  
        const response = await apiRequest('/api/check-admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            api_token: apiToken,
          }),
        });

        const responseData = await response.json();
  
        if (responseData.is_admin) {
          setIsAdmin(true);
          const usersResponse = await apiRequest('/api/users');
          const usersData = await usersResponse.json();
          setUsers(usersData);
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setError('Failed to load users');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
  
    checkAdmin();
  }, [navigate]);

  if (loading) {
    return (
      <section className='bg-custom pb-15 flex flex-col items-center w-full pt-6'>
        <ThreadsIcon size="large" className='self-center' />        
        <p className='text-custom'>Admin verification...</p>
        <LoadingIcon className="mt-4" size="xlarge" alt="Loading" />
      </section>
    );
  }

  if (!isAdmin) {
    return (
    <section className='bg-custom pb-15 flex flex-col items-center w-full pt-6'>
        <p>Erreur 404: Page non trouvée</p>
        <Link to='/login'>
            <Button>Retour à la page de connexion</Button>
        </Link>
    </section>)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return users.length === 0 ? <Skeleton count={5} /> : <Profile users={users} />;
      case 'posts':
      case 'comments':
        return <ContentModerationPanel type={activeTab} />;
      default:
        return null;
    }
  };

  return (
    <section className='bg-custom pb-15 flex flex-col items-center w-full pt-6'>
      <div className='flex flex-col items-center w-full'>
        <ThreadsIcon size="large" className='self-center' />
        <h1 className='text-custom text-2xl font-bold mt-4 mb-6'>Administration</h1>
      
        {/* Navigation par onglets */}
        <div className="w-full max-w-4xl bg-custom-dark-gray rounded-t-lg overflow-hidden">
          <div className="flex border-b border-custom-gray">
            <button
              className={`flex-1 py-3 px-4 text-center focus:outline-none ${
                activeTab === 'users' ? 'bg-custom-gray text-white font-bold' : 'text-custom-light-gray'
              }`}
              onClick={() => setActiveTab('users')}
            >
              Utilisateurs
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center focus:outline-none ${
                activeTab === 'posts' ? 'bg-custom-gray text-white font-bold' : 'text-custom-light-gray'
              }`}
              onClick={() => setActiveTab('posts')}
            >
              Posts
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center focus:outline-none ${
                activeTab === 'comments' ? 'bg-custom-gray text-white font-bold' : 'text-custom-light-gray'
              }`}
              onClick={() => setActiveTab('comments')}
            >
              Commentaires
            </button>
          </div>
          
          {/* Contenu de l'onglet */}
          <div className="p-4">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </section>
  );
}

export { Admin };