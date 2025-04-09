import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BlockedUser, getBlockedUsers, toggleBlockUser } from '../lib/block-service';
import Button from '../ui/Button/Button';
import { BlockedUsersSkeleton } from '../components/Profile/BlockedUsersSkeleton';

// Redéfinir l'interface pour corriger la propriété blocked_at
interface BlockedUserDisplay {
  id: number;
  username: string;
  blocked_at: string;
}

export default function BlockedUsers() {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUserDisplay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Charger la liste des utilisateurs bloqués
    const fetchBlockedUsers = async () => {
      try {
        setLoading(true);
        const users = await getBlockedUsers();
        setBlockedUsers(users as BlockedUserDisplay[]);
      } catch (error) {
        console.error('Error fetching blocked users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlockedUsers();
  }, []);

  // Débloquer un utilisateur
  const handleUnblock = async (userId: number) => {
    try {
      await toggleBlockUser(userId);
      // Mettre à jour la liste des utilisateurs bloqués
      setBlockedUsers(blockedUsers.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  };

  // Naviguer vers le profil de l'utilisateur
  const navigateToProfile = (username: string) => {
    navigate(`/profile/${username}`);
  };

  if (loading) {
    return <BlockedUsersSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-custom">Blocked Users</h1>
        <Button variant="quaternary" onClick={() => navigate('/profile')}>
          Back to Profile
        </Button>
      </div>

      {blockedUsers.length === 0 ? (
        <p className="text-center text-gray-500 my-10">You haven't blocked any users yet.</p>
      ) : (
        <ul className="space-y-4">
          {blockedUsers.map(user => (
            <li key={user.id} className="border p-4 rounded-lg flex justify-between items-center">
              <div className="flex flex-col">
                <span className="font-semibold text-custom">{user.username}</span>
                <span className="text-sm text-gray-500">
                  {user.blocked_at 
                    ? `Blocked on: ${new Date(user.blocked_at).toLocaleDateString()}` 
                    : "Recently blocked"}
                </span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="quaternary" 
                  onClick={() => navigateToProfile(user.username)}
                >
                  View Profile
                </Button>
                <Button 
                  variant="senary" 
                  onClick={() => handleUnblock(user.id)}
                >
                  Unblock
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 