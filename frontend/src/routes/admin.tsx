import React, { useEffect, useState, JSX } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThreadsIcon } from '../ui/LogoIcon/threads';
import Button from '../ui/Button/Button';
import { apiRequest } from '../lib/api-request';
import Profile from '../components/Backoffice/Profile/Profile';
import Skeleton from '../components/Backoffice/Profile/Skeleton'; // Import the Skeleton component
import LoadingIcon from '../ui/Loading/LoadingIcon'; // Import the LoadingIcon component

interface User {
    username: string;
    user_id: number;
    email: string;
    is_verified: boolean;
    avatar: string | null; // Add the avatar property to match the Profile User interface
}

function Admin(): JSX.Element {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
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

  return (
    <section className='bg-custom pb-15 flex flex-col items-center w-full pt-6'>
        <div className='flex flex-col items-center'>
      <ThreadsIcon size="large" className='self-center' />
      <p className='text-custom'>Admin</p>
      </div>
        {users.length === 0 ? (
          <Skeleton count={5} /> // Render the skeleton loader if users are not loaded
        ) : (
          <Profile users={users} />
        )}
    </section>
  );
}

export { Admin };